import { customElement, html, nothing, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyEditorConfigCollection } from "@umbraco-cms/backoffice/property-editor";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { cdCheckboxPropertyInfo } from "../manifest";
import { tagPrefix } from "../../constants";
import { UUIBooleanInputEvent } from "@umbraco-cms/backoffice/external/uui";
import { CdElement } from "../../abstractions/CdElement";

export const elementName = `${tagPrefix}-checkbox`;

@customElement(elementName)
export class CdCheckboxElement extends CdElement {
    @property({ type: String, attribute: true })
    public value?: string;

    @property({ attribute: false })
    public set config(config: UmbPropertyEditorConfigCollection) {
        this.configDefaultValue = config.getValueByAlias(cdCheckboxPropertyInfo.default.alias);
        this.configShowIfChecked = config.getValueByAlias(cdCheckboxPropertyInfo.showIfChecked.alias);
        this.configShowIfUnchecked = config.getValueByAlias(cdCheckboxPropertyInfo.showIfUnchecked.alias);
        this.configIsShowLabels = config.getValueByAlias(cdCheckboxPropertyInfo.showLabels.alias);
        this.configLabelOn = config.getValueByAlias(cdCheckboxPropertyInfo.labelOn.alias);
        this.configLabelOff = config.getValueByAlias(cdCheckboxPropertyInfo.labelOff.alias);
    }

    @state()
    private configDefaultValue?: boolean;

    @state()
    private configShowIfChecked?: string;

    @state()
    private configShowIfUnchecked?: string;

    @state()
    private configIsShowLabels?: boolean;

    @state()
    private configLabelOn?: string;

    @state()
    private configLabelOff?: string;

    #__toggleValue: boolean = false;
    @state()
    public get toggleValue() {
        return this.#__toggleValue;
    }
    private set toggleValue(newValue: boolean) {
        newValue = newValue || false;
        this.#__toggleValue = newValue;
        this.value = newValue ? "1" : "0";
        this.dispatchEvent(new UmbChangeEvent());
    }

    protected override bootstrap() {
        this.runDisplayLogic();
    }

    protected override initDefaults() {
        // Only treat as "no saved value" when truly empty/undefined/null
        const hasSaved = this.value !== undefined && this.value !== null && this.value !== "";

        const toBool = (x: unknown): boolean => {
            if (typeof x === "boolean") return x;
            if (typeof x === "number") return x === 1;
            if (typeof x === "string") {
                const s = x.trim().toLowerCase();
                return s === "1" || s === "true";
            }
            return false;
        };

        if (hasSaved) {
            // Respect the saved value
            this.toggleValue = toBool(this.value as unknown);
        } else if (this.configDefaultValue !== undefined && this.configDefaultValue !== null) {
            // Apply Initial value only when there's no saved value yet
            this.toggleValue = toBool(this.configDefaultValue as unknown);
        }
    }

    protected override runDisplayLogic() {
        if (this.toggleValue) {
            this.displayProps(this.configShowIfChecked!, this.configShowIfUnchecked!);
        } else {
            this.displayProps(this.configShowIfUnchecked!, this.configShowIfChecked!);
        }
    }

    #onChange(event: UUIBooleanInputEvent) {
        event.stopPropagation();
        this.toggleValue = event.target.checked;
        this.runDisplayLogic();
    }

    render() {
        return html`
        <div class="umb-property-editor umb-boolean">
            <uui-toggle .checked=${this.toggleValue} @change=${this.#onChange}
                    label="${(this.configIsShowLabels ? (this.toggleValue ? this.configLabelOn : this.configLabelOff) : nothing) ?? nothing}"
                    labelPosition="right"></uui-toggle>
        </div>
        `;
    }
}

export default CdCheckboxElement;

declare global {
    interface HTMLElementTagNameMap {
        [elementName]: CdCheckboxElement;
    }
}
