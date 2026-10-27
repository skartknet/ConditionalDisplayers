import { UmbControllerBase } from '@umbraco-cms/backoffice/class-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { map, of } from '@umbraco-cms/backoffice/external/rxjs';
import type { Observable } from '@umbraco-cms/backoffice/observable-api';
import type { UmbVariantId } from '@umbraco-cms/backoffice/variant';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
import { CdOwnerRuntime, type RuleOwner, type VariantInfo } from './owner-runtime';

const invariant: VariantInfo[] = [{ culture: null, segment: null }];

type WorkspaceLike = Partial<RuleOwner> & {
    splitView?: { activeVariantsInfo: Observable<VariantInfo[]> };
    /** Block workspace: the content and settings element managers. */
    content?: Partial<RuleOwner>;
    settings?: Partial<RuleOwner>;
    variantId?: Observable<UmbVariantId | undefined>;
};

const isOwner = <T extends Partial<RuleOwner>>(x?: T): x is T & RuleOwner => !!x?.structure && !!x.propertyViewGuard;

/**
 * Attached to the document, blueprint, media, member and block workspaces. One evaluator runs per
 * owner: the workspace itself, or a block's content and settings (each evaluates independently).
 */
export class CdRuntimeContext extends UmbControllerBase {
    #runtimes: CdOwnerRuntime[] = [];

    constructor(host: UmbControllerHost) {
        super(host);
        this.consumeContext(UMB_WORKSPACE_CONTEXT, (workspace) => {
            this.#runtimes.forEach((r) => r.destroy());
            this.#runtimes = [];
            if (workspace) this.#attach(workspace as unknown as WorkspaceLike);
        });
    }

    #attach(ws: WorkspaceLike) {
        if (isOwner(ws)) {
            this.#add(ws, ws.splitView?.activeVariantsInfo ?? of(invariant));
            return;
        }
        // Block workspace: both element managers use the block's own variant.
        const variants = ws.variantId
            ? ws.variantId.pipe(map((v): VariantInfo[] => (v ? [{ culture: v.culture, segment: v.segment }] : invariant)))
            : of(invariant);
        [ws.content, ws.settings].filter(isOwner).forEach((owner) => this.#add(owner, variants));
    }

    #add(owner: RuleOwner, variants: Observable<VariantInfo[]>) {
        this.#runtimes.push(new CdOwnerRuntime(this, owner, variants, () => (this.getHostElement() as HTMLElement) ?? document.body));
    }
}

export { CdRuntimeContext as api };
