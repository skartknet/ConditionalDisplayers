import { UmbControllerBase } from '@umbraco-cms/backoffice/class-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import type { UmbContentTypeStructureManager } from '@umbraco-cms/backoffice/content-type';
import type { Observable } from '@umbraco-cms/backoffice/observable-api';
import type { UmbVariantPropertyGuardManager } from '@umbraco-cms/backoffice/property';
import { UmbVariantId } from '@umbraco-cms/backoffice/variant';
import { fetchRules } from '../rules/api';
import { isVisible } from '../rules/evaluate';
import { CdContainerHider } from './auto-hide';
import { emptyContainers, type ContainerInfo } from './containers';
import type { RuleRow } from '../rules/types';

/**
 * The public surface shared by the document, media and member workspaces and by
 * UmbBlockElementManager (a block's content or settings).
 */
export interface RuleOwner {
    structure: UmbContentTypeStructureManager;
    propertyViewGuard: UmbVariantPropertyGuardManager;
    getPropertyValue(alias: string, variantId?: UmbVariantId): unknown;
    propertyValueByAlias(alias: string, variantId?: UmbVariantId): Promise<Observable<unknown> | undefined>;
}

export type VariantInfo = { culture: string | null; segment: string | null };

type PropertyInfo = {
    unique: string;
    alias: string;
    variesByCulture: boolean;
    variesBySegment: boolean;
    validation?: { mandatory?: boolean };
    container?: { id: string } | null;
};

const ruleId = (propertyKey: string, variant: UmbVariantId) => `our-conditionaldisplayers:${propertyKey}:${variant.toString()}`;

/**
 * Evaluates the stored rules for one owner and hides properties through its propertyViewGuard.
 * Each workspace pane (variant) is evaluated against its own values.
 */
export class CdOwnerRuntime extends UmbControllerBase {
    #owner: RuleOwner;
    #variants: UmbVariantId[] = [];
    #props: PropertyInfo[] = [];
    #rows: RuleRow[] = [];
    #loadedFor = '';
    #sourceObservers: Array<{ destroy(): void }> = [];
    #applied = new Map<string, unknown>();
    #refreshQueued = false;
    #evaluateQueued = false;
    #containers: ContainerInfo[] = [];
    #hider: CdContainerHider;

    constructor(host: UmbControllerHost, owner: RuleOwner, variants: Observable<VariantInfo[]>, root: () => HTMLElement) {
        super(host);
        this.#owner = owner;
        this.#hider = new CdContainerHider(root);

        this.observe(owner.structure.contentTypeUniques, (uniques) => this.#load(uniques), 'cdUniques');
        this.observe(owner.structure.contentTypeProperties, (props) => {
            this.#props = props as PropertyInfo[];
            this.#refresh();
        }, 'cdProperties');
        this.observe(owner.structure.contentTypes, (types) => {
            this.#containers = (types as Array<{ containers?: ContainerInfo[] }>).flatMap((t) => t.containers ?? []);
            this.#refresh();
        }, 'cdContainers');
        this.observe(variants, (infos) => {
            this.#variants = infos.length ? infos.map((i) => UmbVariantId.Create(i)) : [UmbVariantId.CreateInvariant()];
            this.#refresh();
        }, 'cdVariants');
    }

    async #load(uniques: string[]) {
        const id = [...uniques].sort().join(',');
        if (!uniques.length || id === this.#loadedFor) return;
        this.#loadedFor = id;
        const rows = await fetchRules(this, uniques);
        if (this.#loadedFor !== id) return;
        this.#rows = rows;
        this.#refresh();
    }

    #sourceVariant(prop: PropertyInfo, pane: UmbVariantId) {
        return UmbVariantId.Create({
            culture: prop.variesByCulture ? pane.culture : null,
            segment: prop.variesBySegment ? pane.segment : null,
        });
    }

    /** Re-subscribe to the source values, then evaluate. Coalesced, as structure and variants emit in bursts. */
    #refresh() {
        if (this.#refreshQueued) return;
        this.#refreshQueued = true;
        queueMicrotask(async () => {
            this.#refreshQueued = false;
            await this.#subscribeToSources();
            this.#evaluate();
        });
    }

    #queueEvaluate() {
        if (this.#evaluateQueued) return;
        this.#evaluateQueued = true;
        queueMicrotask(() => {
            this.#evaluateQueued = false;
            this.#evaluate();
        });
    }

    async #subscribeToSources() {
        this.#sourceObservers.forEach((o) => o.destroy());
        this.#sourceObservers = [];

        const byKey = new Map(this.#props.map((p) => [p.unique, p]));
        const sources = new Set(this.#rows.flatMap((r) => [...r.rules.show, ...r.rules.hide].map((c) => c.propertyKey)));

        for (const key of sources) {
            const prop = byKey.get(key);
            if (!prop) continue;
            for (const pane of this.#variants) {
                const variant = this.#sourceVariant(prop, pane);
                const values = await this.#owner.propertyValueByAlias(prop.alias, variant);
                if (!values) continue;
                this.#sourceObservers.push(this.observe(values, () => this.#queueEvaluate(), `cdSource:${key}:${variant.toString()}`));
            }
        }
    }

    #evaluate() {
        const byKey = new Map(this.#props.map((p) => [p.unique, p]));
        const hidden = new Map<string, { propertyKey: string; pane: UmbVariantId }>();

        for (const pane of this.#variants) {
            const read = (key: string) => {
                const prop = byKey.get(key);
                return prop
                    ? { exists: true, value: this.#owner.getPropertyValue(prop.alias, this.#sourceVariant(prop, pane)) }
                    : { exists: false };
            };

            for (const row of this.#rows) {
                const target = byKey.get(row.propertyTypeKey);
                // Rules on a Mandatory property are ignored (stored, but not applied).
                if (!target || target.validation?.mandatory) continue;
                if (!isVisible(row.rules, read)) {
                    hidden.set(ruleId(target.unique, pane), { propertyKey: target.unique, pane });
                }
            }
        }

        // A property is hidden for container purposes only when hidden in every pane.
        const paneCounts = new Map<string, number>();
        for (const { propertyKey } of hidden.values()) paneCounts.set(propertyKey, (paneCounts.get(propertyKey) ?? 0) + 1);
        const hiddenEverywhere = new Set([...paneCounts].filter(([, n]) => n === this.#variants.length).map(([k]) => k));
        this.#hider.set(emptyContainers(this.#containers, this.#props, hiddenEverywhere));

        const guard = this.#owner.propertyViewGuard;
        for (const id of [...this.#applied.keys()]) {
            if (!hidden.has(id)) {
                guard.removeRule(id);
                this.#applied.delete(id);
            }
        }
        for (const [id, { propertyKey, pane }] of hidden) {
            if (this.#applied.has(id)) continue;
            guard.addRule({
                unique: id,
                permitted: false,
                propertyType: { unique: propertyKey },
                datasetVariantId: pane,
            });
            this.#applied.set(id, true);
        }
    }

    override destroy() {
        this.#sourceObservers.forEach((o) => o.destroy());
        this.#hider.destroy();
        this.#owner.propertyViewGuard.removeRules([...this.#applied.keys()]);
        this.#applied.clear();
        super.destroy();
    }
}
