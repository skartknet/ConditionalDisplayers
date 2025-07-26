import { nothing as I, repeat as f, html as m, property as y, state as d, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as g } from "@umbraco-cms/backoffice/property-editor";
import { t as E } from "./backoffice-entrypoint-CJDzVFJB.js";
import { UmbLitElement as $ } from "@umbraco-cms/backoffice/lit-element";
var V = Object.defineProperty, O = Object.getOwnPropertyDescriptor, c = (e) => {
  throw TypeError(e);
}, r = (e, t, i, l) => {
  for (var u = l > 1 ? void 0 : l ? O(t, i) : t, o = e.length - 1, h; o >= 0; o--)
    (h = e[o]) && (u = (l ? h(t, i, u) : h(u)) || u);
  return l && u && V(t, i, u), u;
}, x = (e, t, i) => t.has(e) || c("Cannot " + i), C = (e, t, i) => t.has(e) ? c("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), n = (e, t, i) => (x(e, t, "access private method"), i), a, p, v, b, w;
const P = `${E}-multivalues`;
let s = class extends $ {
  constructor() {
    super(...arguments), C(this, a), this._items = [];
  }
  get items() {
    return this._items;
  }
  set items(e) {
    this._items = e;
    const t = this._items.map((i) => ({ value: i.value, show: i.show, hide: i.hide }));
    this.value = t, this.dispatchEvent(new g());
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
    return this.liveItem ? m`
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
                <uui-table-row id="liveItemRow" @input=${n(this, a, v)}>
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
                        <uui-button label="Add" @click=${n(this, a, b)}></uui-button>
                    </uui-table-cell>
                </uui-table-row>
                ${f(this.items, (e) => e.id, (e) => m`
                <uui-table-row data-id=${e.id} data-sort=${e.sortOrder} @input=${n(this, a, p)} style="background: #f3f3f5;">
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
                        <uui-button label="Remove" @click=${n(this, a, w)}></uui-button>
                    </uui-table-cell>
                </uui-table-row>
                `)}
            </uui-table>
        </uui-box>
        ` : I;
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
r([
  y({ type: Array, attribute: !1 })
], s.prototype, "value", 2);
r([
  d()
], s.prototype, "items", 1);
r([
  d()
], s.prototype, "liveItem", 2);
s = r([
  _(P)
], s);
const S = s;
export {
  s as CdMultivaluesElement,
  S as default,
  P as elementName
};
//# sourceMappingURL=cdMultivalues-D98HZN59.js.map
