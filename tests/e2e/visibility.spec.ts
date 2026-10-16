import { expect, test, type Locator, type Page } from '@playwright/test';

// Keys come from TestWebV17/uSync/v17: the 'Page' document type and its 'Test Page' content node.
const DOC_TYPE = '/umbraco/section/settings/workspace/document-type/edit/5c216a5f-0e5f-4f12-b3e6-86c586ceb2ce/tab/properties';
const CONTENT = '/umbraco/section/content/workspace/document/edit/e811fcaf-77cf-444c-9727-e2e6b99d8c05/invariant';

const rulesPuts = (page: Page) => {
    const bodies: unknown[] = [];
    page.on('request', (r) => {
        if (r.method() === 'PUT' && r.url().includes('/conditionaldisplayers/rules/')) bodies.push(JSON.parse(r.postData() ?? 'null'));
    });
    return bodies;
};

async function openVisibility(page: Page, propertyName: string) {
    await page.goto(DOC_TYPE);
    await page.locator(`umb-content-type-design-editor-property[data-mark="property-type:${propertyName}"]`).first()
        .locator('uui-button[data-mark="action:editor-settings"]').first().click();
    await page.locator('umb-property-type-workspace-editor uui-tab').filter({ hasText: 'Visibility' }).click();
    await expect(page.locator('[data-ready="true"]')).toBeVisible(); // stored rules have loaded
}

/** uui-select renders padded option text, so match on the trimmed text. */
async function choose(select: Locator, text: string) {
    const value = await select.locator('option').evaluateAll(
        (opts, t) => (opts as HTMLOptionElement[]).find((o) => o.textContent?.trim() === t)?.value, text);
    expect(value, `option '${text}'`).toBeTruthy();
    await select.locator('select').selectOption(value!);
}

async function clearConditions(page: Page) {
    const remove = page.getByRole('button', { name: 'Remove condition' });
    while (await remove.count()) await remove.first().click();
}

const save = async (page: Page) => {
    // Rules are written only after the content type save succeeds, so a 200 here proves the whole chain.
    const put = page.waitForResponse((r) => r.request().method() === 'PUT' && r.url().includes('/conditionaldisplayers/rules/'));
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    expect((await put).status()).toBe(200);
};

test('Visibility tab offers operators that match the source type', async ({ page }) => {
    await openVisibility(page, 'CD Checkbox');
    await expect(page.getByTestId('on-page-load')).toBeVisible();

    await page.getByTestId('add-show').click();
    const row = page.getByTestId('condition').first();
    const operators = () => row.getByTestId('operator').locator('option').allTextContents().then((o) => o.map((t) => t.trim()).filter(Boolean));

    await choose(row.getByTestId('source'), 'Show A'); // Textstring
    expect(await operators()).toEqual(['equals', 'does not equal', 'contains', 'is empty', 'is not empty']);

    await choose(row.getByTestId('source'), 'CD dropdown'); // our list editor
    expect(await operators()).toEqual(['is any of', 'is none of']);
});

test('Close discards the edit, so Save does not write rules', async ({ page }) => {
    const puts = rulesPuts(page);
    await openVisibility(page, 'CD Checkbox');
    await page.getByTestId('add-hide').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click().catch(() => { /* Save may be disabled when nothing changed */ });
    await page.waitForTimeout(1500);
    expect(puts).toEqual([]);
});

test('a saved rule hides the property on content, and removing it shows it again', async ({ page }) => {
    const puts = rulesPuts(page);
    const target = 'umb-property[data-mark="property:cdCheckbox"]';

    // Hide 'CD Checkbox' when 'Show A' is empty OR not empty: always true, which also exercises OR.
    await openVisibility(page, 'CD Checkbox');
    await clearConditions(page); // self-heal after an aborted run
    await page.getByTestId('add-hide').click();
    await page.getByTestId('add-hide').click();
    const rows = page.getByTestId('group-hide').getByTestId('condition');
    await choose(rows.nth(0).getByTestId('source'), 'Show A');
    await choose(rows.nth(0).getByTestId('operator'), 'is empty');
    await choose(rows.nth(1).getByTestId('source'), 'Show A');
    await choose(rows.nth(1).getByTestId('operator'), 'is not empty');
    await choose(page.getByTestId('group-hide').getByTestId('connector'), 'OR');
    await page.getByRole('button', { name: 'Submit' }).click();
    const eye = page.locator('umb-content-type-design-editor-property[data-mark="property-type:CD Checkbox"] [data-cd-rules]');
    await expect(eye).toHaveCount(1); // staged rules already show the indicator
    await save(page);
    await expect(eye).toHaveCount(1);

    expect(puts).toHaveLength(1);
    expect(puts[0]).toMatchObject([{ rules: { show: [], hide: [{ operator: 'isEmpty' }, { connector: 'or', operator: 'isNotEmpty' }] } }]);

    try {
        await page.goto(CONTENT);
        await expect(page.locator('umb-property[data-mark="property:cdDropdown"]')).toBeVisible();
        await expect(page.locator(target)).toHaveCount(0);
    } finally {
        // Clean up so the test site is left as found.
        await openVisibility(page, 'CD Checkbox');
        await clearConditions(page);
        await page.getByRole('button', { name: 'Submit' }).click();
        await save(page);
        await expect(eye).toHaveCount(0);
    }

    await page.goto(CONTENT);
    await expect(page.locator(target)).toBeVisible();
});

type Prop = [name: string, nth: number];

/** On the doc type design page: gives a property an always-true Hide rule (or clears its rules), then Submit. */
async function setAlwaysHide(page: Page, [propertyName, nth]: Prop, on: boolean) {
    // The same name can appear in several groups, so pick by position.
    const property = page.locator(`umb-content-type-design-editor-property[data-mark="property-type:${propertyName}"]`).nth(nth);
    await property.waitFor();
    await property
        .locator('uui-button[data-mark="action:editor-settings"]').first().click();
    await page.locator('umb-property-type-workspace-editor uui-tab').filter({ hasText: 'Visibility' }).click();
    await expect(page.locator('[data-ready="true"]')).toBeVisible();
    await clearConditions(page);
    if (on) {
        // Any source works for is empty / is not empty. A property can't use itself.
        const source = propertyName === 'PropertyA' ? 'PropertyB' : 'PropertyA';
        await page.getByTestId('add-hide').click();
        await page.getByTestId('add-hide').click();
        const rows = page.getByTestId('group-hide').getByTestId('condition');
        await choose(rows.nth(0).getByTestId('source'), source);
        await choose(rows.nth(0).getByTestId('operator'), 'is empty');
        await choose(rows.nth(1).getByTestId('source'), source);
        await choose(rows.nth(1).getByTestId('operator'), 'is not empty');
        await choose(page.getByTestId('group-hide').getByTestId('connector'), 'OR');
    }
    await page.getByRole('button', { name: 'Submit' }).click();
}

const containerDisplay = (page: Page, selector: string, headline: string) =>
    page.locator(selector).evaluateAll((els, h) => els
        .filter((e) => (e as HTMLElement & { headline?: string; label?: string }).headline === h || (e as HTMLElement & { label?: string }).label === h)
        .map((e) => getComputedStyle(e.shadowRoot?.querySelector('#button') ?? e).display), headline);

/** Hides every property of a container, checks the container disappears on content, then restores. */
async function autoHides(page: Page, props: Prop[], selector: string, headline: string, tabPath = DOC_TYPE) {
    const apply = async (on: boolean) => {
        await page.goto(tabPath);
        for (const p of props) await setAlwaysHide(page, p, on);
        await save(page);
    };
    await apply(true);
    try {
        await page.goto(CONTENT);
        await expect.poll(() => containerDisplay(page, selector, headline), { timeout: 15_000 }).toEqual(['none']);
    } finally {
        await apply(false);
    }
    await page.goto(CONTENT);
    await expect.poll(() => containerDisplay(page, selector, headline), { timeout: 15_000 }).toEqual([expect.not.stringMatching(/^none$/)]);
}

test('a group is hidden when all its properties are hidden', async ({ page }) => {
    // The 'CD Dropdown' group holds cdDropdown and the second 'Show A' / 'Show B' on the page.
    await autoHides(page, [['CD dropdown', 0], ['Show A', 1], ['Show B', 1]], 'uui-box', 'CD Dropdown');
});

test('a tab is hidden when everything in it is hidden', async ({ page }) => {
    await autoHides(page, [['BlockGridA', 0], ['BlockListA', 0], ['PropertyA', 0], ['PropertyB', 0]], 'uui-tab', 'Block grid', DOC_TYPE.replace('/tab/properties', '/tab/block-grid'));
});
