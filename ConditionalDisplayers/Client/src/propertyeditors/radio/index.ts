import { customElement, html, property, repeat, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyEditorConfigCollection } from "@umbraco-cms/backoffice/property-editor";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { cdRadioPropertyInfo } from "../manifest";
import { tagPrefix } from "../../constants";
import { UUIBooleanInputEvent } from "@umbraco-cms/backoffice/external/uui";
import { CdElement } from "../../abstractions/CdElement";
import { CdMultiValueModelDto } from "../../components/cdMultivalues";

type LabelPositions = "Top" | "Bottom" | "Left" | "Right";

export const elementName = `${tagPrefix}-radio`;

@customElement(elementName)
export class CdRadioElement extends CdElement {
    @property({ type: String, attribute: false })
    public value?: string;

    @property({ attribute: false })
    public set config(config: UmbPropertyEditorConfigCollection) {
        this.assignValuesFromConfig(config);
    }

    private availableValues: Array<CdMultiValueModelDto> = [];

    @state()
    private configDefaultValue?: string;

    @state()
    private configItems?: string;

    @state()
    private configAlignHorizontal?: boolean;

    @state()
    private configLabelPosition?: LabelPositions;

    @state()
    private configAsButton?: boolean;

    #__selectedValue: string = "";
    @state()
    public get selectedValue() {
        return this.#__selectedValue;
    }
    private set selectedValue(newValue: string) {
        if (!newValue) {
            throw new Error("value not set");
        }
        this.#__selectedValue = newValue;
        this.selectedItem = this.availableValues.find(x => x.value === newValue);
        this.value = newValue;
        this.dispatchEvent(new UmbChangeEvent());
    }

    private selectedItem?: CdMultiValueModelDto;

    protected override bootstrap() {
        this.runDisplayLogic();
    }

    protected override initDefaults() {
        if (this.value) {
            this.selectedValue = this.value;
        } else {
            this.selectedValue = this.configDefaultValue && this.isValidSelection(this.configDefaultValue)
                ? this.configDefaultValue
                : (() => {
                    console.warn("configuration is missing a valid default value");
                    return this.availableValues[0].value;
                })();
        }
    }

    protected override runDisplayLogic() {
        if (this.selectedItem) {
            this.displayProps(this.selectedItem.show, this.selectedItem.hide);
        }
    }

    private assignValuesFromConfig(config: UmbPropertyEditorConfigCollection) {
        this.configItems = config.getValueByAlias(cdRadioPropertyInfo.items.alias);
        this.configDefaultValue = config.getValueByAlias(cdRadioPropertyInfo.default.alias);
        this.configAlignHorizontal = config.getValueByAlias(cdRadioPropertyInfo.alignHrz.alias);
        this.configLabelPosition = config.getValueByAlias(cdRadioPropertyInfo.labelsPos.alias);
        this.configAsButton = config.getValueByAlias(cdRadioPropertyInfo.asBtn.alias);

        // convert values
        this.availableValues = this.configItems as unknown as Array<CdMultiValueModelDto>;
    }

    private isValidSelection(value: string): boolean {
        return !!this.availableValues.find(x => x.value === value);
    }

    #onChange(event: UUIBooleanInputEvent) {
        event.stopPropagation();
        const value = event.target.value;
        this.selectedValue = value;

        this.runDisplayLogic();
    }

    render() {
        if (this.availableValues.length === 0) {
            return html`<p>No conditional items configured</p>`;
        }

        return html`
        ${this.configAsButton ? this.renderButtonGroup() : this.renderRadioGroup()}
        `;
    }

    private renderRadioGroup() {
        return html`
        <div class="cd-conditional-group ${this.configAlignHorizontal ? "horizontal" : ""} labelpos-${this.configLabelPosition}" @change=${this.#onChange}>
            ${repeat(this.availableValues, x => html`
                <label><input type="radio" name="radioGroup" value="${x.value}" .checked=${this.selectedValue === x.value} /><span class="label">${x.value}</span></label>
            `)}

            </div>
        `;
    }
    private renderButtonGroup() {
        return html`
        <div class="cd-conditional-group ${this.configAlignHorizontal ? "horizontal" : ""}" @click=${this.#onChange}>
            ${repeat(this.availableValues, x => html`
            <uui-button label="${x.value}" value="${x.value}" look="${this.selectedValue === x.value ? 'primary' : 'secondary'}"></uui-button>
            `)}
        </div>
        `;
    }
}

export default CdRadioElement;

declare global {
    interface HTMLElementTagNameMap {
        [elementName]: CdRadioElement;
    }
}
