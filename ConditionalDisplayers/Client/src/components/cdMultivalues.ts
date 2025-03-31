import { customElement, html, nothing, property, repeat, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyEditorUiElement, UmbPropertyValueChangeEvent } from "@umbraco-cms/backoffice/property-editor";
import { tagPrefix } from "../constants";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";

export type CdMultiValueModelDto = {
    value: string,
    show: string,
    hide: string,
}
export type CdMultiValueModel = CdMultiValueModelDto & {
    sortOrder: number,
    id: number
}

export const elementName = `${tagPrefix}-multivalues`;

@customElement(elementName)
export class CdMultivaluesElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    @property({ type: Array, attribute: false })
    public value?: Array<CdMultiValueModelDto> | undefined;

    private _items: Array<CdMultiValueModel> = [];
    @state()
    private get items(): Array<CdMultiValueModel> {
        return this._items;
    }
    private set items(value: Array<CdMultiValueModel>) {
        this._items = value;

        const dtoItems: Array<CdMultiValueModelDto> = this._items.map(x => ({ value: x.value, show: x.show, hide: x.hide }));
        this.value = dtoItems;
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    @state()
    private liveItem!: CdMultiValueModelDto;

    override connectedCallback(): void {
        super.connectedCallback();
        setTimeout(() => {
            this.initValue();
        }, 0);
    }

    private initValue() {
        let items: Array<CdMultiValueModel> = [];
        if (this.value) {
            for (let i = 0; i < this.value.length; i++) {
                const dtoItem = this.value[i] as unknown as CdMultiValueModelDto;
                const item: CdMultiValueModel = { id: i, sortOrder: i, ...dtoItem };
                items.push(item);
            }
            this.augmentItemValues(items);

            // sort items by stored value
            items = items.sort((a, b) => a.sortOrder > b.sortOrder ? 1 : ((b.sortOrder > a.sortOrder) ? -1 : 0));

            // update editor value
            this.items = items;
        }

        this.liveItem = this.getEmptyItem();
    }

    private augmentItemValues(items?: Array<CdMultiValueModel>) {
        items = items || this.items;
        for (let i = 0; i < items.length; i++) {
            items[i].id = i;
            items[i].sortOrder = i;
        }

        return items;
    }

    #onItemInput(event: InputEvent) {
        const rowEl = (event.target as HTMLElement).closest('[data-id]') as HTMLElement;
        const itemId = parseInt(rowEl.dataset.id!);
        const itemValue = this.getItemValueFromRow(rowEl);
        const index = this.items.findIndex(x => x.id === itemId);
        this.items[index] = { ...this.items[index], ...itemValue };
    }
    #onLiveItemInput(event: InputEvent) {
        const rowEl = (event.target as HTMLElement).closest('#liveItemRow') as HTMLElement;
        const itemValue = this.getItemValueFromRow(rowEl);
        this.liveItem = { value: itemValue.value, show: itemValue.show, hide: itemValue.hide };
    }
    #onAdd() {
        // TODO: validate
        this.items.push({ id: 0, sortOrder: 0, ...this.liveItem });
        this.augmentItemValues();
        this.items = this.items;    // trigger set action
        this.liveItem = this.getEmptyItem();
    }
    #onRemove(event: Event) {
        const rowEl = (event.target as HTMLElement).closest('[data-id]') as HTMLElement;
        const itemValue = this.getItemValueFromRow(rowEl);
        const index = this.items.findIndex(x => x.id === itemValue.id);
        this.items.splice(index, 1);
        this.items = this.items;    // trigger set action
    }

    private getEmptyItem(): CdMultiValueModelDto {
        return {
            value: "",
            show: "",
            hide: ""
        };
    }
    private getItemValueFromRow(el: HTMLElement): CdMultiValueModel {
        const val: Partial<CdMultiValueModel> = {};
        const inputEls = el.querySelectorAll('uui-input');
        inputEls.forEach(inputEl => {
            const name = inputEl.name;
            // @ts-ignore
            val[name] = inputEl.value;
        });

        // parseInt is 'null' if passed 'undefined'
        val.id = parseInt(el.dataset.id!);
        val.sortOrder = parseInt(el.dataset.sort!);

        return val as Required<CdMultiValueModel>;
    }

    render() {
        if (!this.liveItem) {
            return nothing;
        }

        return html`
        <uui-box style="--uui-box-default-padding: 0;">
            <uui-table>
                <uui-table-column style="width: 30%;"></uui-table-column>
                <uui-table-column style="width: 30%;"></uui-table-column>
                <uui-table-column style="width: 30%;"></uui-table-column>
                <uui-table-column style="width: 10%;"></uui-table-column>
                <uui-table-head>
                    <uui-table-head-cell>Value</uui-table-head-cell>
                    <uui-table-head-cell>Show when selected</uui-table-head-cell>
                    <uui-table-head-cell>Hide when selected</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                <uui-table-row id="liveItemRow" @input=${this.#onLiveItemInput}>
                    <uui-table-cell>
                        <uui-input name="value" type="text" .value=${this.liveItem.value}></uui-input>
                    </uui-table-cell>
                    <uui-table-cell>
                        <uui-input name="show" type="text" placeholder="Properties' aliases" .value=${this.liveItem.show}></uui-input>
                    </uui-table-cell>
                    <uui-table-cell>
                        <uui-input name="hide" type="text" placeholder="Properties' aliases" .value=${this.liveItem.hide}></uui-input>
                    </uui-table-cell>
                    <uui-table-cell>
                        <uui-button label="Add" @click=${this.#onAdd}></uui-button>
                    </uui-table-cell>
                </uui-table-row>
                ${repeat(this.items, x => x.id, x => html`
                <uui-table-row data-id=${x.id} data-sort=${x.sortOrder} @input=${this.#onItemInput} style="background: #f3f3f5;">
                    <uui-table-cell>
                        <uui-input name="value" type="text" .value=${x.value} ></uui-input>
                    </uui-table-cell>
                    <uui-table-cell>
                        <uui-input name="show" type="text" placeholder="Properties' aliases" .value=${x.show}></uui-input>
                    </uui-table-cell>
                    <uui-table-cell>
                        <uui-input name="hide" type="text" placeholder="Properties' aliases" .value=${x.hide}></uui-input>
                    </uui-table-cell>
                    <uui-table-cell>
                        <uui-button label="Remove" @click=${this.#onRemove}></uui-button>
                    </uui-table-cell>
                </uui-table-row>
                `)}
            </uui-table>
        </uui-box>
        `;
    }
}

export default CdMultivaluesElement;

declare global {
    interface HTMLElementTagNameMap {
        [elementName]: CdMultivaluesElement;
    }
}
