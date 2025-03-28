import { UMB_CONTENT_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/content";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement } from "lit";
import { toggleElements } from "../sharedLogic";
import style from '../cd.css';

export abstract class CdElement extends UmbElementMixin(LitElement) {
    protected datasetHostElement?: HTMLElement;

    constructor() {
        super();

        this.consumeContext(UMB_CONTENT_PROPERTY_DATASET_CONTEXT, (instance) => {
            this.datasetHostElement = instance.getHostElement() as HTMLElement;
        });
    }

    static styles = style;

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