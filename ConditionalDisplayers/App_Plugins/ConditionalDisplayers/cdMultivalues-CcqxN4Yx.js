import { repeat as I, html as m, property as f, state as d, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as _ } from "@umbraco-cms/backoffice/property-editor";
import { t as g } from "./backoffice-entrypoint-DsMPxxPY.js";
import { UmbLitElement as E } from "@umbraco-cms/backoffice/lit-element";
var $ = Object.defineProperty, V = Object.getOwnPropertyDescriptor, c = (e) => {
  throw TypeError(e);
}, n = (e, t, i, l) => {
  for (var u = l > 1 ? void 0 : l ? V(t, i) : t, o = e.length - 1, h; o >= 0; o--)
    (h = e[o]) && (u = (l ? h(t, i, u) : h(u)) || u);
  return l && u && $(t, i, u), u;
}, O = (e, t, i) => t.has(e) || c("Cannot " + i), x = (e, t, i) => t.has(e) ? c("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), r = (e, t, i) => (O(e, t, "access private method"), i), a, p, v, b, w;
const C = `${g}-multivalues`;
let s = class extends E {
  constructor() {
    super(...arguments), x(this, a), this._items = [];
  }
  get items() {
    return this._items;
  }
  set items(e) {
    this._items = e;
    const t = this._items.map((i) => ({ value: i.value, show: i.show, hide: i.hide }));
    this.value = t, this.dispatchEvent(new _());
  }
  connectedCallback() {
    super.connectedCallback(), setTimeout(() => {
      this.initValue();
    }, 0);
  }
  initValue() {
    let e = [];
    if (this.value) {
      for (let t = 0; t < this.value.length; t++) {
        const i = this.value[t], l = { id: t, sortOrder: t, ...i };
        e.push(l);
      }
      this.augmentItemValues(e), e = e.sort((t, i) => t.sortOrder > i.sortOrder ? 1 : i.sortOrder > t.sortOrder ? -1 : 0), this.items = e;
    }
    this.liveItem = this.getEmptyItem();
  }
  augmentItemValues(e) {
    e = e || this.items;
    for (let t = 0; t < e.length; t++)
      e[t].id = t, e[t].sortOrder = t;
    return e;
  }
  getEmptyItem() {
    return {
      value: "",
      show: "",
      hide: ""
    };
  }
  getItemValueFromRow(e) {
    const t = {};
    return e.querySelectorAll("uui-input").forEach((l) => {
      const u = l.name;
      t[u] = l.value;
    }), t.id = parseInt(e.dataset.id), t.sortOrder = parseInt(e.dataset.sort), t;
  }
  render() {
    if (this.liveItem)
      return m`
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
                <uui-table-row id="liveItemRow" @input=${r(this, a, v)}>
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
                        <uui-button label="Add" @click=${r(this, a, b)}></uui-button>
                    </uui-table-cell>
                </uui-table-row>
                ${I(this.items, (e) => e.id, (e) => m`
                <uui-table-row data-id=${e.id} data-sort=${e.sortOrder} @input=${r(this, a, p)} style="background: #f3f3f5;">
                    <uui-table-cell>
                        <uui-input name="value" type="text" .value=${e.value} ></uui-input>
                    </uui-table-cell>
                    <uui-table-cell>
                        <uui-input name="show" type="text" placeholder="Properties' aliases" .value=${e.show}></uui-input>
                    </uui-table-cell>
                    <uui-table-cell>
                        <uui-input name="hide" type="text" placeholder="Properties' aliases" .value=${e.hide}></uui-input>
                    </uui-table-cell>
                    <uui-table-cell>
                        <uui-button label="Remove" @click=${r(this, a, w)}></uui-button>
                    </uui-table-cell>
                </uui-table-row>
                `)}
            </uui-table>
        </uui-box>
        `;
  }
};
a = /* @__PURE__ */ new WeakSet();
p = function(e) {
  const t = e.target.closest("[data-id]"), i = parseInt(t.dataset.id), l = this.getItemValueFromRow(t), u = this.items.findIndex((o) => o.id === i);
  this.items[u] = { ...this.items[u], ...l };
};
v = function(e) {
  const t = e.target.closest("#liveItemRow"), i = this.getItemValueFromRow(t);
  this.liveItem = { value: i.value, show: i.show, hide: i.hide };
};
b = function() {
  this.items.push({ id: 0, sortOrder: 0, ...this.liveItem }), this.augmentItemValues(), this.items = this.items, this.liveItem = this.getEmptyItem();
};
w = function(e) {
  const t = e.target.closest("[data-id]"), i = this.getItemValueFromRow(t), l = this.items.findIndex((u) => u.id === i.id);
  this.items.splice(l, 1), this.items = this.items;
};
n([
  f({ type: Array, attribute: !1 })
], s.prototype, "value", 2);
n([
  d()
], s.prototype, "items", 1);
n([
  d()
], s.prototype, "liveItem", 2);
s = n([
  y(C)
], s);
const M = s;
export {
  s as CdMultivaluesElement,
  M as default,
  C as elementName
};
//# sourceMappingURL=cdMultivalues-CcqxN4Yx.js.map
