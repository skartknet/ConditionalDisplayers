import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, PropertyValues } from "lit";
import { toggleElements } from "../sharedLogic";
import style from '../cd.css';
import { UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";

export abstract class CdElement extends UmbElementMixin(LitElement) {
    protected datasetHostElement?: HTMLElement;

    #hasFirstUpdated = false;
    #hasBootstrapped = false;

    constructor() {
        super();

        this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (instance) => {            
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
        if (this.datasetHostElement) {
            //Elements to show
            toggleElements(showAliases, true, this.datasetHostElement);
            toggleElements(hideAliases, false, this.datasetHostElement);
        }
    }
}