import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import { UmbControllerBase } from '@umbraco-cms/backoffice/class-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UMB_ACTION_EVENT_CONTEXT } from '@umbraco-cms/backoffice/action';
import { UmbRequestReloadStructureForEntityEvent } from '@umbraco-cms/backoffice/entity-action';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
import type { Observable } from '@umbraco-cms/backoffice/observable-api';
import { UMB_CONTENT_TYPE_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/content-type';
import { fetchRules, saveRules } from '../rules/api';
import type { RuleSet, RuleUpdate } from '../rules/types';
import { CdRuleIndicator } from './rule-indicator';

type ContentTypeWorkspaceLike = { getUnique(): string | undefined; isNew: Observable<boolean | undefined> };

const hasConditions = (r?: RuleSet | null) => !!r && r.show.length + r.hide.length > 0;

/**
 * Lives as long as the content type workspace. Holds rule edits made in the 'Edit property' modal
 * and writes them once the content type save has succeeded. Leaving the workspace drops them.
 */
export class CdStagingContext extends UmbControllerBase {
    #workspace?: ContentTypeWorkspaceLike;
    /** Committed on modal Submit, flushed on content type save. Null rules means delete. */
    #staged = new Map<string, RuleSet | null>();
    /** Edits in an open modal, promoted on Submit and dropped on Cancel. */
    #drafts = new Map<string, RuleSet | null>();
    #tracked = new Set<string>();
    #wasNew?: boolean;
    /** Properties that have stored rules, for the design view indicator. */
    #stored = new Set<string>();
    #uniques: string[] = [];
    #indicator = new CdRuleIndicator(() => this.getHostElement() as HTMLElement | undefined, (key) => this.#hasRules(key));

    constructor(host: UmbControllerHost) {
        super(host);
        this.provideContext(CD_STAGING_CONTEXT, this);

        this.consumeContext(UMB_CONTENT_TYPE_WORKSPACE_CONTEXT, (ws) => {
            if (!ws) return;
            this.observe(ws.structure.contentTypeUniques, (uniques) => {
                this.#uniques = uniques;
                void this.#loadStored();
            }, 'cdIndicatorUniques');
        });

        this.consumeContext(UMB_WORKSPACE_CONTEXT, (ws) => {
            this.#workspace = ws as unknown as ContentTypeWorkspaceLike;
            // Create: setIsNew(false) runs only after structure.create() succeeded.
            this.observe(this.#workspace.isNew, (isNew) => {
                if (this.#wasNew === true && isNew === false) void this.flush();
                this.#wasNew = isNew;
            }, 'cdIsNew');
        });

        // Update: dispatched only after structure.save() succeeded.
        this.consumeContext(UMB_ACTION_EVENT_CONTEXT, (events) => {
            events?.removeEventListener(UmbRequestReloadStructureForEntityEvent.TYPE, this.#onReload);
            events?.addEventListener(UmbRequestReloadStructureForEntityEvent.TYPE, this.#onReload);
        });
    }

    #onReload = (event: Event) => {
        const unique = (event as unknown as { getUnique(): string | undefined }).getUnique?.();
        if (unique && unique === this.#workspace?.getUnique()) void this.flush();
    };

    #hasRules(propertyKey: string) {
        return this.#staged.has(propertyKey) ? hasConditions(this.#staged.get(propertyKey)) : this.#stored.has(propertyKey);
    }

    async #loadStored() {
        const rows = await fetchRules(this, this.#uniques);
        this.#stored = new Set(rows.filter((r) => hasConditions(r.rules)).map((r) => r.propertyTypeKey));
    }

    /** The edited rules for a property, or undefined when nothing was staged (read it from the server instead). */
    get(propertyKey: string): RuleSet | null | undefined {
        return this.#drafts.has(propertyKey) ? this.#drafts.get(propertyKey) : this.#staged.get(propertyKey);
    }

    setDraft(propertyKey: string, rules: RuleSet | null) {
        this.#drafts.set(propertyKey, rules);
    }

    /**
     * Ties a property's drafts to the modal outcome. The tab element is destroyed when the user
     * switches tabs, so the modal promise is tracked here instead. Idempotent per property.
     */
    track(propertyKey: string, modalSubmit: Promise<unknown>) {
        if (this.#tracked.has(propertyKey)) return;
        this.#tracked.add(propertyKey);
        const done = () => this.#tracked.delete(propertyKey);
        modalSubmit.then(
            () => {
                if (this.#drafts.has(propertyKey)) this.#staged.set(propertyKey, this.#drafts.get(propertyKey)!);
                this.#drafts.delete(propertyKey);
                done();
            },
            () => {
                this.#drafts.delete(propertyKey);
                done();
            },
        );
    }

    async flush() {
        const unique = this.#workspace?.getUnique();
        if (!unique || this.#staged.size === 0) return;
        const batch = new Map(this.#staged);
        this.#staged.clear();
        const updates: RuleUpdate[] = [...batch].map(([propertyTypeKey, rules]) => ({ propertyTypeKey, rules }));
        if (await saveRules(this, unique, updates)) {
            await this.#loadStored(); // saveRules cleared the rules cache
            return;
        }
        // Put failed edits back, unless the user has staged something newer meanwhile.
        for (const [key, rules] of batch) if (!this.#staged.has(key)) this.#staged.set(key, rules);
        console.error('Conditional Displayers: could not save visibility rules.');
    }

    override destroy() {
        this.#indicator.destroy();
        this.#drafts.clear();
        this.#staged.clear();
        super.destroy();
    }
}

export const CD_STAGING_CONTEXT = new UmbContextToken<CdStagingContext>('CdStagingContext');

export { CdStagingContext as api };
