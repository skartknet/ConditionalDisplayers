import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, PropertyValues } from "lit";
import { toggleElements } from "../sharedLogic";
import style from '../cd.css';
import { UMB_PROPERTY_DATASET_CONTEXT, UmbPropertyDatasetContext, UmbVariantPropertyGuardManager } from "@umbraco-cms/backoffice/property";

/**
 * The workspace (document, media, member) or block element manager behind the property dataset.
 * Its propertyViewGuard hides properties across every tab, including tabs that aren't rendered yet.
 */
type CdDataOwner = {
    propertyViewGuard?: UmbVariantPropertyGuardManager;
    structure?: { getPropertyStructureByAlias(alias: string): Promise<{ unique: string } | undefined> };
};

const isTabOrGroup = (alias: string) => alias.startsWith("tab:") || alias.startsWith("group:");

export abstract class CdElement extends UmbElementMixin(LitElement) {
    protected datasetHostElement?: HTMLElement;
    #dataset?: UmbPropertyDatasetContext;

    #hasFirstUpdated = false;
    #hasBootstrapped = false;

    constructor() {
        super();

        this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (instance) => {
            this.#dataset = instance;
            this.datasetHostElement = instance?.getHostElement() as HTMLElement | undefined;
            this.#tryBootstrap();
        });
    }

    static override styles = style;

    protected override firstUpdated(_changedProperties: PropertyValues): void {
        this.#hasFirstUpdated = true;
        this.#tryBootstrap();
    }

    #tryBootstrap() {
        if (this.#hasFirstUpdated && this.datasetHostElement && !this.#hasBootstrapped) {
            this.#hasBootstrapped = true;
            this.initDefaults();
            this.bootstrap();
        }
    }

    protected abstract bootstrap(): void;
    protected abstract runDisplayLogic(): void;
    protected abstract initDefaults(): void;

    protected displayProps(showAliases: string, hideAliases: string) {
        if (!this.datasetHostElement) {
            return;
        }

        // ponytail: _dataOwner is protected on UmbElementPropertyDatasetContext (Umbraco 16/17); without it we fall back to DOM hiding, which only reaches the current tab
        const owner = (this.#dataset as unknown as { _dataOwner?: CdDataOwner } | undefined)?._dataOwner;
        const useGuard = !!owner?.propertyViewGuard && !!owner.structure;

        const split = (aliases: string) => {
            const list = (aliases ?? "").split(",").map(x => x.trim()).filter(Boolean);
            return {
                dom: list.filter(x => !useGuard || isTabOrGroup(x)).join(","),
                props: useGuard ? list.filter(x => !isTabOrGroup(x)).map(x => x.startsWith("property:") ? x.substring(9) : x) : []
            };
        };
        const show = split(showAliases);
        const hide = split(hideAliases);

        toggleElements(show.dom, true, this.datasetHostElement);
        toggleElements(hide.dom, false, this.datasetHostElement);

        if (useGuard) {
            this.#applyViewGuard(owner!, show.props, hide.props);
        }
    }

    async #applyViewGuard(owner: CdDataOwner, showAliases: string[], hideAliases: string[]) {
        const guard = owner.propertyViewGuard!;
        const datasetVariantId = this.#dataset!.getVariantId();
        // One rule per target property and variant, so the last editor to act wins (same as the DOM behaviour)
        const ruleKey = (alias: string) => `our-conditionaldisplayers:${alias}:${datasetVariantId.toString()}`;

        // Resolve first, then apply show and hide together so quick toggles can't apply out of order
        const hideTypes = await Promise.all(hideAliases.map(alias => owner.structure!.getPropertyStructureByAlias(alias)));

        guard.removeRules(showAliases.map(ruleKey));
        hideAliases.forEach((alias, i) => {
            const propertyType = hideTypes[i];
            if (!propertyType) {
                return;
            }
            guard.removeRule(ruleKey(alias));
            guard.addRule({
                unique: ruleKey(alias),
                permitted: false,
                propertyType: { unique: propertyType.unique },
                datasetVariantId,
            });
        });
    }
}
