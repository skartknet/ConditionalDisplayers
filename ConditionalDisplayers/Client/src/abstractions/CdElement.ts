import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement } from "lit";
import { toggleElements } from "../sharedLogic";
import style from '../cd.css';
import { UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";

export abstract class CdElement extends UmbElementMixin(LitElement) {
    protected datasetHostElement?: HTMLElement;

    constructor() {
        super();

        this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (instance) => {
            // @ts-ignore - 'getHostElement' not in TS definition yet
            this.datasetHostElement = instance.getHostElement() as HTMLElement;
        });
    }

    static override styles = style;

    override connectedCallback(): void {
        super.connectedCallback();
        setTimeout(() => {
            // setTimeout allows 'value' to be assigned (not perfect)
            this.#bootstrap();
        }, 50);    // TODO: this needs better solution (from 50)(fails at '0')
    }

    #bootstrap() {
        this.initDefaults();
        this.bootstrap();
    }

    protected abstract bootstrap(): void;
    protected abstract runDisplayLogic(): void;
    protected abstract initDefaults(): void;

    protected displayProps(showAliases: string, hideAliases: string) {
        if (this.datasetHostElement) {
            //Elements to show
            toggleElements(showAliases, true, this.datasetHostElement);
            toggleElements(hideAliases, false, this.datasetHostElement);
        }
    }
}