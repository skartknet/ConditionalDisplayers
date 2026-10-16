import { test as setup } from '@playwright/test';

// Credentials come from TestWebV17/appsettings.json (unattended install).
setup('log in to the backoffice', async ({ page }) => {
    await page.goto('/umbraco');
    await page.getByLabel('E-mail').fill('admin@admin.com');
    await page.locator('input[name="password"]').fill('Password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/\/umbraco\/section\//);
    await page.context().storageState({ path: 'tests/e2e/.auth/state.json' });
});
