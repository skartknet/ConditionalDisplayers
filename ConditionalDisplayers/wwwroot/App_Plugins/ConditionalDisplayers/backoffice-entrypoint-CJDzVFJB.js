var be = (i) => {
  throw TypeError(i);
};
var et = (i, e, t) => e.has(i) || be("Cannot " + t);
var Ae = (i, e, t) => e.has(i) ? be("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t);
var Ee = (i, e, t) => (et(i, e, "access private method"), t);
import { nothing as we, html as $, property as k, state as p, customElement as ne, repeat as Se } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as he } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin as tt } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_DATASET_CONTEXT as it } from "@umbraco-cms/backoffice/property";
const ce = "our-conditionaldisplayers";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const F = globalThis, de = F.ShadowRoot && (F.ShadyCSS === void 0 || F.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, pe = Symbol(), Ce = /* @__PURE__ */ new WeakMap();
let ze = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== pe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (de && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = Ce.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && Ce.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const st = (i) => new ze(typeof i == "string" ? i : i + "", void 0, pe), ot = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((s, o, a) => s + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + i[a + 1], i[0]);
  return new ze(t, i, pe);
}, rt = (i, e) => {
  if (de) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const s = document.createElement("style"), o = F.litNonce;
    o !== void 0 && s.setAttribute("nonce", o), s.textContent = t.cssText, i.appendChild(s);
  }
}, Pe = de ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const s of e.cssRules) t += s.cssText;
  return st(t);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: at, defineProperty: lt, getOwnPropertyDescriptor: nt, getOwnPropertyNames: ht, getOwnPropertySymbols: ct, getPrototypeOf: dt } = Object, S = globalThis, xe = S.trustedTypes, pt = xe ? xe.emptyScript : "", ee = S.reactiveElementPolyfillSupport, R = (i, e) => i, oe = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? pt : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, e) {
  let t = i;
  switch (e) {
    case Boolean:
      t = i !== null;
      break;
    case Number:
      t = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(i);
      } catch {
        t = null;
      }
  }
  return t;
} }, We = (i, e) => !at(i, e), Ue = { attribute: !0, type: String, converter: oe, reflect: !1, useDefault: !1, hasChanged: We };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), S.litPropertyMetadata ?? (S.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class D extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Ue) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = Symbol(), o = this.getPropertyDescriptor(e, s, t);
      o !== void 0 && lt(this.prototype, e, o);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: o, set: a } = nt(this.prototype, e) ?? { get() {
      return this[t];
    }, set(r) {
      this[t] = r;
    } };
    return { get: o, set(r) {
      const n = o == null ? void 0 : o.call(this);
      a == null || a.call(this, r), this.requestUpdate(e, n, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ue;
  }
  static _$Ei() {
    if (this.hasOwnProperty(R("elementProperties"))) return;
    const e = dt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(R("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(R("properties"))) {
      const t = this.properties, s = [...ht(t), ...ct(t)];
      for (const o of s) this.createProperty(o, t[o]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [s, o] of t) this.elementProperties.set(s, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, s] of this.elementProperties) {
      const o = this._$Eu(t, s);
      o !== void 0 && this._$Eh.set(o, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const o of s) t.unshift(Pe(o));
    } else e !== void 0 && t.push(Pe(e));
    return t;
  }
  static _$Eu(e, t) {
    const s = t.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const s of t.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return rt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var s;
      return (s = t.hostConnected) == null ? void 0 : s.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var s;
      return (s = t.hostDisconnected) == null ? void 0 : s.call(t);
    });
  }
  attributeChangedCallback(e, t, s) {
    this._$AK(e, s);
  }
  _$ET(e, t) {
    var a;
    const s = this.constructor.elementProperties.get(e), o = this.constructor._$Eu(e, s);
    if (o !== void 0 && s.reflect === !0) {
      const r = (((a = s.converter) == null ? void 0 : a.toAttribute) !== void 0 ? s.converter : oe).toAttribute(t, s.type);
      this._$Em = e, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var a, r;
    const s = this.constructor, o = s._$Eh.get(e);
    if (o !== void 0 && this._$Em !== o) {
      const n = s.getPropertyOptions(o), l = typeof n.converter == "function" ? { fromAttribute: n.converter } : ((a = n.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? n.converter : oe;
      this._$Em = o;
      const c = l.fromAttribute(t, n.type);
      this[o] = c ?? ((r = this._$Ej) == null ? void 0 : r.get(o)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, s) {
    var o;
    if (e !== void 0) {
      const a = this.constructor, r = this[e];
      if (s ?? (s = a.getPropertyOptions(e)), !((s.hasChanged ?? We)(r, t) || s.useDefault && s.reflect && r === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(a._$Eu(e, s)))) return;
      this.C(e, t, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: s, reflect: o, wrapped: a }, r) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, r ?? t ?? this[e]), a !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (t = void 0), this._$AL.set(e, t)), o === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [a, r] of this._$Ep) this[a] = r;
        this._$Ep = void 0;
      }
      const o = this.constructor.elementProperties;
      if (o.size > 0) for (const [a, r] of o) {
        const { wrapped: n } = r, l = this[a];
        n !== !0 || this._$AL.has(a) || l === void 0 || this.C(a, void 0, r, l);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (s = this._$EO) == null || s.forEach((o) => {
        var a;
        return (a = o.hostUpdate) == null ? void 0 : a.call(o);
      }), this.update(t)) : this._$EM();
    } catch (o) {
      throw e = !1, this._$EM(), o;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((s) => {
      var o;
      return (o = s.hostUpdated) == null ? void 0 : o.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
}
D.elementStyles = [], D.shadowRootOptions = { mode: "open" }, D[R("elementProperties")] = /* @__PURE__ */ new Map(), D[R("finalized")] = /* @__PURE__ */ new Map(), ee == null || ee({ ReactiveElement: D }), (S.reactiveElementVersions ?? (S.reactiveElementVersions = [])).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const H = globalThis, Z = H.trustedTypes, Oe = Z ? Z.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, je = "$lit$", E = `lit$${Math.random().toFixed(9).slice(2)}$`, Fe = "?" + E, ut = `<${Fe}>`, U = document, L = () => U.createComment(""), B = (i) => i === null || typeof i != "object" && typeof i != "function", ue = Array.isArray, ft = (i) => ue(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", te = `[ 	
\f\r]`, M = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, De = /-->/g, Ve = />/g, C = RegExp(`>|${te}(?:([^\\s"'>=/]+)(${te}*=${te}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Te = /'/g, ke = /"/g, Ge = /^(?:script|style|textarea|title)$/i, V = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), Me = /* @__PURE__ */ new WeakMap(), P = U.createTreeWalker(U, 129);
function qe(i, e) {
  if (!ue(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Oe !== void 0 ? Oe.createHTML(e) : e;
}
const gt = (i, e) => {
  const t = i.length - 1, s = [];
  let o, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = M;
  for (let n = 0; n < t; n++) {
    const l = i[n];
    let c, u, h = -1, y = 0;
    for (; y < l.length && (r.lastIndex = y, u = r.exec(l), u !== null); ) y = r.lastIndex, r === M ? u[1] === "!--" ? r = De : u[1] !== void 0 ? r = Ve : u[2] !== void 0 ? (Ge.test(u[2]) && (o = RegExp("</" + u[2], "g")), r = C) : u[3] !== void 0 && (r = C) : r === C ? u[0] === ">" ? (r = o ?? M, h = -1) : u[1] === void 0 ? h = -2 : (h = r.lastIndex - u[2].length, c = u[1], r = u[3] === void 0 ? C : u[3] === '"' ? ke : Te) : r === ke || r === Te ? r = C : r === De || r === Ve ? r = M : (r = C, o = void 0);
    const b = r === C && i[n + 1].startsWith("/>") ? " " : "";
    a += r === M ? l + ut : h >= 0 ? (s.push(c), l.slice(0, h) + je + l.slice(h) + E + b) : l + E + (h === -2 ? n : b);
  }
  return [qe(i, a + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class N {
  constructor({ strings: e, _$litType$: t }, s) {
    let o;
    this.parts = [];
    let a = 0, r = 0;
    const n = e.length - 1, l = this.parts, [c, u] = gt(e, t);
    if (this.el = N.createElement(c, s), P.currentNode = this.el.content, t === 2 || t === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (o = P.nextNode()) !== null && l.length < n; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const h of o.getAttributeNames()) if (h.endsWith(je)) {
          const y = u[r++], b = o.getAttribute(h).split(E), j = /([.?@])?(.*)/.exec(y);
          l.push({ type: 1, index: a, name: j[2], strings: b, ctor: j[1] === "." ? _t : j[1] === "?" ? yt : j[1] === "@" ? $t : Y }), o.removeAttribute(h);
        } else h.startsWith(E) && (l.push({ type: 6, index: a }), o.removeAttribute(h));
        if (Ge.test(o.tagName)) {
          const h = o.textContent.split(E), y = h.length - 1;
          if (y > 0) {
            o.textContent = Z ? Z.emptyScript : "";
            for (let b = 0; b < y; b++) o.append(h[b], L()), P.nextNode(), l.push({ type: 2, index: ++a });
            o.append(h[y], L());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Fe) l.push({ type: 2, index: a });
      else {
        let h = -1;
        for (; (h = o.data.indexOf(E, h + 1)) !== -1; ) l.push({ type: 7, index: a }), h += E.length - 1;
      }
      a++;
    }
  }
  static createElement(e, t) {
    const s = U.createElement("template");
    return s.innerHTML = e, s;
  }
}
function T(i, e, t = i, s) {
  var r, n;
  if (e === V) return e;
  let o = s !== void 0 ? (r = t._$Co) == null ? void 0 : r[s] : t._$Cl;
  const a = B(e) ? void 0 : e._$litDirective$;
  return (o == null ? void 0 : o.constructor) !== a && ((n = o == null ? void 0 : o._$AO) == null || n.call(o, !1), a === void 0 ? o = void 0 : (o = new a(i), o._$AT(i, t, s)), s !== void 0 ? (t._$Co ?? (t._$Co = []))[s] = o : t._$Cl = o), o !== void 0 && (e = T(i, o._$AS(i, e.values), o, s)), e;
}
class mt {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: s } = this._$AD, o = ((e == null ? void 0 : e.creationScope) ?? U).importNode(t, !0);
    P.currentNode = o;
    let a = P.nextNode(), r = 0, n = 0, l = s[0];
    for (; l !== void 0; ) {
      if (r === l.index) {
        let c;
        l.type === 2 ? c = new W(a, a.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(a, l.name, l.strings, this, e) : l.type === 6 && (c = new vt(a, this, e)), this._$AV.push(c), l = s[++n];
      }
      r !== (l == null ? void 0 : l.index) && (a = P.nextNode(), r++);
    }
    return P.currentNode = U, o;
  }
  p(e) {
    let t = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, t), t += s.strings.length - 2) : s._$AI(e[t])), t++;
  }
}
class W {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, s, o) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = s, this.options = o, this._$Cv = (o == null ? void 0 : o.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = T(this, e, t), B(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== V && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : ft(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && B(this._$AH) ? this._$AA.nextSibling.data = e : this.T(U.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var a;
    const { values: t, _$litType$: s } = e, o = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = N.createElement(qe(s.h, s.h[0]), this.options)), s);
    if (((a = this._$AH) == null ? void 0 : a._$AD) === o) this._$AH.p(t);
    else {
      const r = new mt(o, this), n = r.u(this.options);
      r.p(t), this.T(n), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = Me.get(e.strings);
    return t === void 0 && Me.set(e.strings, t = new N(e)), t;
  }
  k(e) {
    ue(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let s, o = 0;
    for (const a of e) o === t.length ? t.push(s = new W(this.O(L()), this.O(L()), this, this.options)) : s = t[o], s._$AI(a), o++;
    o < t.length && (this._$AR(s && s._$AB.nextSibling, o), t.length = o);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, t); e !== this._$AB; ) {
      const o = e.nextSibling;
      e.remove(), e = o;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class Y {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, s, o, a) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = t, this._$AM = o, this.options = a, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = d;
  }
  _$AI(e, t = this, s, o) {
    const a = this.strings;
    let r = !1;
    if (a === void 0) e = T(this, e, t, 0), r = !B(e) || e !== this._$AH && e !== V, r && (this._$AH = e);
    else {
      const n = e;
      let l, c;
      for (e = a[0], l = 0; l < a.length - 1; l++) c = T(this, n[s + l], t, l), c === V && (c = this._$AH[l]), r || (r = !B(c) || c !== this._$AH[l]), c === d ? e = d : e !== d && (e += (c ?? "") + a[l + 1]), this._$AH[l] = c;
    }
    r && !o && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class _t extends Y {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class yt extends Y {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class $t extends Y {
  constructor(e, t, s, o, a) {
    super(e, t, s, o, a), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = T(this, e, t, 0) ?? d) === V) return;
    const s = this._$AH, o = e === d && s !== d || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, a = e !== d && (s === d || o);
    o && this.element.removeEventListener(this.name, this, s), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class vt {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    T(this, e);
  }
}
const ie = H.litHtmlPolyfillSupport;
ie == null || ie(N, W), (H.litHtmlVersions ?? (H.litHtmlVersions = [])).push("3.3.1");
const bt = (i, e, t) => {
  const s = (t == null ? void 0 : t.renderBefore) ?? e;
  let o = s._$litPart$;
  if (o === void 0) {
    const a = (t == null ? void 0 : t.renderBefore) ?? null;
    s._$litPart$ = o = new W(e.insertBefore(L(), a), a, void 0, t ?? {});
  }
  return o._$AI(i), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const x = globalThis;
class I extends D {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = bt(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return V;
  }
}
var Ne;
I._$litElement$ = !0, I.finalized = !0, (Ne = x.litElementHydrateSupport) == null || Ne.call(x, { LitElement: I });
const se = x.litElementPolyfillSupport;
se == null || se({ LitElement: I });
(x.litElementVersions ?? (x.litElementVersions = [])).push("4.2.1");
const Re = (i, e, t) => {
  if (!i)
    return;
  const s = i.split(",");
  if (s && s.length > 0) {
    const o = At(s);
    Et(o, t, !1).forEach((r) => {
      e ? r.style.removeProperty("display") : r.style.display = "none";
    });
  }
}, At = (i) => {
  let e = "";
  for (let t = 0; t < i.length; t++) {
    e !== "" && (e += ",");
    const s = i[t].trim();
    e += `umb-property[data-mark="property:${s}"]`;
  }
  return e;
}, Et = (i, e = document.body, t = !1) => {
  const s = [], o = (a) => {
    if (a.nodeType !== Node.ELEMENT_NODE || a.matches(i) && (s.push(a), t))
      return;
    const r = a.children;
    if (r.length)
      for (const l of r)
        o(l);
    const n = a.shadowRoot;
    if (n) {
      const l = n.children;
      for (const c of l)
        o(c);
    }
  };
  return o(e), t ? s.slice(0, 1) : s;
}, wt = ot`
.cd-conditional-group {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    align-items: flex-start;
    gap: 12px;

    label {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: flex-start;
        align-content: flex-start;
        gap: 5px;

        > input[type="radio"] {
            margin: 0.3em 0;
        }
    }

    .horizontal {
        flex-direction: row;
    }

    /* radio position changes */
    &.labelpos-Top label, &.labelpos-Bottom label {
        > input[type="radio"] {
            margin: 0;
        }
    }
    &.labelpos-Top label {
        flex-direction: column-reverse;
    }
    &.labelpos-Right label {
        flex-direction: row;
    }
    &.labelpos-Bottom label {
        flex-direction: column;
    }
    &.labelpos-Left label {
        flex-direction: row-reverse;
    }
}
`;
var X, Je;
const ve = class ve extends tt(I) {
  constructor() {
    super();
    Ae(this, X);
    this.consumeContext(it, (t) => {
      this.datasetHostElement = t.getHostElement();
    });
  }
  firstUpdated(t) {
    setTimeout(() => {
      Ee(this, X, Je).call(this);
    }, 50);
  }
  displayProps(t, s) {
    this.datasetHostElement && (Re(t, !0, this.datasetHostElement), Re(s, !1, this.datasetHostElement));
  }
};
X = new WeakSet(), Je = function() {
  this.initDefaults(), this.bootstrap();
}, ve.styles = wt;
let z = ve;
var St = Object.defineProperty, Ct = Object.getOwnPropertyDescriptor, Ke = (i) => {
  throw TypeError(i);
}, _ = (i, e, t, s) => {
  for (var o = s > 1 ? void 0 : s ? Ct(e, t) : e, a = i.length - 1, r; a >= 0; a--)
    (r = i[a]) && (o = (s ? r(e, t, o) : r(o)) || o);
  return s && o && St(e, t, o), o;
}, fe = (i, e, t) => e.has(i) || Ke("Cannot " + t), Pt = (i, e, t) => (fe(i, e, "read from private field"), t ? t.call(i) : e.get(i)), He = (i, e, t) => e.has(i) ? Ke("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t), xt = (i, e, t, s) => (fe(i, e, "write to private field"), e.set(i, t), t), Ut = (i, e, t) => (fe(i, e, "access private method"), t), G, re, Ze;
const ge = `${ce}-checkbox`;
let f = class extends z {
  constructor() {
    super(...arguments), He(this, re), He(this, G, !1);
  }
  set config(i) {
    this.configDefaultValue = i.getValueByAlias(A.default.alias), this.configShowIfChecked = i.getValueByAlias(A.showIfChecked.alias), this.configShowIfUnchecked = i.getValueByAlias(A.showIfUnchecked.alias), this.configIsShowLabels = i.getValueByAlias(A.showLabels.alias), this.configLabelOn = i.getValueByAlias(A.labelOn.alias), this.configLabelOff = i.getValueByAlias(A.labelOff.alias);
  }
  get toggleValue() {
    return Pt(this, G);
  }
  set toggleValue(i) {
    i = i || !1, xt(this, G, i), this.value = i ? "1" : "0", this.dispatchEvent(new he());
  }
  bootstrap() {
    this.runDisplayLogic();
  }
  initDefaults() {
    this.value ? this.toggleValue = this.value === "1" : this.configDefaultValue && (this.toggleValue = this.configDefaultValue);
  }
  runDisplayLogic() {
    this.toggleValue ? this.displayProps(this.configShowIfChecked, this.configShowIfUnchecked) : this.displayProps(this.configShowIfUnchecked, this.configShowIfChecked);
  }
  render() {
    return $`
        <div class="umb-property-editor umb-boolean">
            <uui-toggle .checked=${this.toggleValue} @change=${Ut(this, re, Ze)}
                    label="${(this.configIsShowLabels ? this.toggleValue ? this.configLabelOn : this.configLabelOff : we) ?? we}"
                    labelPosition="right"></uui-toggle>
        </div>
        `;
  }
};
G = /* @__PURE__ */ new WeakMap();
re = /* @__PURE__ */ new WeakSet();
Ze = function(i) {
  i.stopPropagation(), this.toggleValue = i.target.checked, this.runDisplayLogic();
};
_([
  k({ type: String, attribute: !0 })
], f.prototype, "value", 2);
_([
  k({ attribute: !1 })
], f.prototype, "config", 1);
_([
  p()
], f.prototype, "configDefaultValue", 2);
_([
  p()
], f.prototype, "configShowIfChecked", 2);
_([
  p()
], f.prototype, "configShowIfUnchecked", 2);
_([
  p()
], f.prototype, "configIsShowLabels", 2);
_([
  p()
], f.prototype, "configLabelOn", 2);
_([
  p()
], f.prototype, "configLabelOff", 2);
_([
  p()
], f.prototype, "toggleValue", 1);
f = _([
  ne(ge)
], f);
const Ot = f, Dt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CdCheckboxElement() {
    return f;
  },
  default: Ot,
  elementName: ge
}, Symbol.toStringTag, { value: "Module" }));
var Vt = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, Qe = (i) => {
  throw TypeError(i);
}, v = (i, e, t, s) => {
  for (var o = s > 1 ? void 0 : s ? Tt(e, t) : e, a = i.length - 1, r; a >= 0; a--)
    (r = i[a]) && (o = (s ? r(e, t, o) : r(o)) || o);
  return s && o && Vt(e, t, o), o;
}, me = (i, e, t) => e.has(i) || Qe("Cannot " + t), kt = (i, e, t) => (me(i, e, "read from private field"), t ? t.call(i) : e.get(i)), Ie = (i, e, t) => e.has(i) ? Qe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t), Mt = (i, e, t, s) => (me(i, e, "write to private field"), e.set(i, t), t), Le = (i, e, t) => (me(i, e, "access private method"), t), q, J, ae;
const _e = `${ce}-radio`;
let g = class extends z {
  constructor() {
    super(...arguments), Ie(this, J), this.availableValues = [], Ie(this, q, "");
  }
  set config(i) {
    this.assignValuesFromConfig(i);
  }
  get selectedValue() {
    return kt(this, q);
  }
  set selectedValue(i) {
    if (!i)
      throw new Error("value not set");
    Mt(this, q, i), this.selectedItem = this.availableValues.find((e) => e.value === i), this.value = i, this.dispatchEvent(new he());
  }
  bootstrap() {
    this.runDisplayLogic();
  }
  initDefaults() {
    this.value ? this.selectedValue = this.value : this.selectedValue = this.configDefaultValue && this.isValidSelection(this.configDefaultValue) ? this.configDefaultValue : (console.warn("configuration is missing a valid default value"), this.availableValues[0].value);
  }
  runDisplayLogic() {
    this.selectedItem && this.displayProps(this.selectedItem.show, this.selectedItem.hide);
  }
  assignValuesFromConfig(i) {
    this.configItems = i.getValueByAlias(w.items.alias), this.configDefaultValue = i.getValueByAlias(w.default.alias), this.configAlignHorizontal = i.getValueByAlias(w.alignHrz.alias), this.configLabelPosition = i.getValueByAlias(w.labelsPos.alias), this.configAsButton = i.getValueByAlias(w.asBtn.alias), this.availableValues = this.configItems;
  }
  isValidSelection(i) {
    return !!this.availableValues.find((e) => e.value === i);
  }
  render() {
    return this.availableValues.length === 0 ? $`<p>No conditional items configured</p>` : $`
        ${this.configAsButton ? this.renderButtonGroup() : this.renderRadioGroup()}
        `;
  }
  renderRadioGroup() {
    return $`
        <div class="cd-conditional-group ${this.configAlignHorizontal ? "horizontal" : ""} labelpos-${this.configLabelPosition}" @change=${Le(this, J, ae)}>
            ${Se(this.availableValues, (i) => $`
                <label><input type="radio" name="radioGroup" value="${i.value}" .checked=${this.selectedValue === i.value} /><span class="label">${i.value}</span></label>
            `)}

            </div>
        `;
  }
  renderButtonGroup() {
    return $`
        <div class="cd-conditional-group ${this.configAlignHorizontal ? "horizontal" : ""}" @click=${Le(this, J, ae)}>
            ${Se(this.availableValues, (i) => $`
            <uui-button label="${i.value}" value="${i.value}" look="${this.selectedValue === i.value ? "primary" : "secondary"}"></uui-button>
            `)}
        </div>
        `;
  }
};
q = /* @__PURE__ */ new WeakMap();
J = /* @__PURE__ */ new WeakSet();
ae = function(i) {
  i.stopPropagation();
  const e = i.target.value;
  this.selectedValue = e, this.runDisplayLogic();
};
v([
  k({ type: String, attribute: !1 })
], g.prototype, "value", 2);
v([
  k({ attribute: !1 })
], g.prototype, "config", 1);
v([
  p()
], g.prototype, "configDefaultValue", 2);
v([
  p()
], g.prototype, "configItems", 2);
v([
  p()
], g.prototype, "configAlignHorizontal", 2);
v([
  p()
], g.prototype, "configLabelPosition", 2);
v([
  p()
], g.prototype, "configAsButton", 2);
v([
  p()
], g.prototype, "selectedValue", 1);
g = v([
  ne(_e)
], g);
const Rt = g, Ht = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CdRadioElement() {
    return g;
  },
  default: Rt,
  elementName: _e
}, Symbol.toStringTag, { value: "Module" }));
var It = Object.defineProperty, Lt = Object.getOwnPropertyDescriptor, Xe = (i) => {
  throw TypeError(i);
}, O = (i, e, t, s) => {
  for (var o = s > 1 ? void 0 : s ? Lt(e, t) : e, a = i.length - 1, r; a >= 0; a--)
    (r = i[a]) && (o = (s ? r(e, t, o) : r(o)) || o);
  return s && o && It(e, t, o), o;
}, ye = (i, e, t) => e.has(i) || Xe("Cannot " + t), Bt = (i, e, t) => (ye(i, e, "read from private field"), t ? t.call(i) : e.get(i)), Be = (i, e, t) => e.has(i) ? Xe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t), Nt = (i, e, t, s) => (ye(i, e, "write to private field"), e.set(i, t), t), zt = (i, e, t) => (ye(i, e, "access private method"), t), K, le, Ye;
const $e = `${ce}-dropdown`;
let m = class extends z {
  constructor() {
    super(...arguments), Be(this, le), this.availableValues = [], this.viewModelSelectOptions = [], Be(this, K, "");
  }
  set config(i) {
    this.assignValuesFromConfig(i);
  }
  get selectedValue() {
    return Bt(this, K);
  }
  set selectedValue(i) {
    if (!i)
      throw new Error("value not set");
    Nt(this, K, i);
    const e = this.availableValues.find((t) => t.value === i);
    e && (this.selectedItem = e), this.value = i, this.dispatchEvent(new he());
  }
  bootstrap() {
    this.runDisplayLogic();
  }
  initDefaults() {
    this.value ? this.selectedValue = this.value : this.selectedValue = this.configDefaultValue && this.isValidSelection(this.configDefaultValue) ? this.configDefaultValue : (console.warn("configuration is missing a valid default value"), this.availableValues[0].value);
  }
  runDisplayLogic() {
    this.viewModelSelectOptions = this.availableValues.map((i) => ({
      name: i.value,
      value: i.value,
      selected: i.value === this.selectedValue
    })), this.selectedItem && this.displayProps(this.selectedItem.show, this.selectedItem.hide);
  }
  assignValuesFromConfig(i) {
    this.configItems = i.getValueByAlias(Q.items.alias), this.configDefaultValue = i.getValueByAlias(Q.default.alias), this.availableValues = this.configItems;
  }
  isValidSelection(i) {
    return !!this.availableValues.find((e) => e.value === i);
  }
  render() {
    return this.availableValues.length === 0 ? $`<p>No conditional items configured</p>` : $`
        <uui-select @change=${zt(this, le, Ye)} required .options=${this.viewModelSelectOptions} placeholder="Pick One"></uui-select>
        `;
  }
};
K = /* @__PURE__ */ new WeakMap();
le = /* @__PURE__ */ new WeakSet();
Ye = function(i) {
  i.stopPropagation();
  const e = i.target.value;
  this.selectedValue = e, this.runDisplayLogic();
};
O([
  k({ type: String, attribute: !1 })
], m.prototype, "value", 2);
O([
  k({ attribute: !1 })
], m.prototype, "config", 1);
O([
  p()
], m.prototype, "configDefaultValue", 2);
O([
  p()
], m.prototype, "configItems", 2);
O([
  p()
], m.prototype, "viewModelSelectOptions", 2);
O([
  p()
], m.prototype, "selectedValue", 1);
m = O([
  ne($e)
], m);
const Wt = m, jt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CdDropDownFlexibleElement() {
    return m;
  },
  default: Wt,
  elementName: $e
}, Symbol.toStringTag, { value: "Module" })), A = {
  default: {
    label: "Initial state",
    description: "The initial state for the checkbox for new items and before the editor changes it.",
    alias: "default",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.Toggle"
  },
  showIfChecked: {
    label: "Show if checked",
    description: "Aliases of the properties to show when the checkbox is checked.<br />*Multiple aliases must be comma separated.*",
    alias: "showIfChecked",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
  },
  showIfUnchecked: {
    label: "Show if unchecked",
    description: "Aliases of the properties to show when the checkbox is unchecked.<br />*Multiple aliases must be comma separated.*",
    alias: "showIfUnchecked",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
  },
  showLabels: {
    label: "Show toggle labels",
    description: "Show labels next to toggle button.",
    alias: "showLabels",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.Toggle"
  },
  labelOn: {
    label: "Label On",
    description: "Label text when enabled.",
    alias: "labelOn",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
  },
  labelOff: {
    label: "Label Off",
    description: "Label text when disabled.",
    alias: "labelOff",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
  }
}, w = {
  items: {
    label: "Add prevalue",
    description: "Add, remove or sort values for the conditional list.<br />*Multiple aliases must be comma separated.*",
    alias: "items",
    propertyEditorUiAlias: "Our.Umbraco.CdMultivalues"
  },
  default: {
    label: "Default value",
    description: "Type the value name from the list created above to be the initial default selection.<br/>*(Optional)*",
    alias: "default",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
  },
  alignHrz: {
    label: "Align Horizontally",
    description: "Radio button are stacked vertically by default. Toggle this to align them horizontally",
    alias: "alignHrz",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.Toggle"
  },
  labelsPos: {
    label: "Labels Position",
    description: "Works with horizontally aligned list only and not with standard buttons. Default is 'Right'",
    alias: "labelsPos",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.RadioButtonList",
    config: [
      {
        alias: "items",
        value: ["Top", "Bottom", "Left", "Right"]
      }
    ]
  },
  asBtn: {
    label: "As Standard Buttons",
    description: "To display as standard buttons instead of radio buttons. Horizontally aligned by default.",
    alias: "asBtn",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.Toggle"
  }
}, Q = {
  items: {
    label: "Add prevalue",
    description: "Add, remove or sort values for the conditional list.<br />*Multiple aliases must be comma separated.*",
    alias: "items",
    propertyEditorUiAlias: "Our.Umbraco.CdMultivalues"
  },
  default: {
    label: "Default value",
    description: "Type the value name from the list created above to be the initial default selection.<br/>*(Optional)*",
    alias: "default",
    propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
  }
}, Ft = Object.keys(A).map((i) => A[i]), Gt = Object.keys(w).map((i) => w[i]), qt = Object.keys(Q).map((i) => Q[i]), Jt = [
  // custom view for prevalues (will not be displayed in backoffice)
  {
    type: "propertyEditorUi",
    alias: "Our.Umbraco.CdMultivalues",
    name: "[Conditional] Multivalues Displayer",
    element: () => import("./cdMultivalues-D98HZN59.js"),
    meta: {
      label: "[Conditional] Multivalues Displayer",
      icon: "icon-autofill",
      group: "common"
    }
  },
  // Conditional Checkbox
  {
    type: "propertyEditorUi",
    alias: "Our.Umbraco.CdCheckbox",
    name: "[Conditional] Checkbox Displayer",
    element: () => Promise.resolve().then(() => Dt),
    elementName: ge,
    meta: {
      label: "[Conditional] Checkbox Displayer",
      icon: "icon-checkbox-dotted-active",
      group: "Conditional Displayers",
      propertyEditorSchemaAlias: "Umbraco.Plain.String",
      settings: {
        properties: Ft
      }
    }
  },
  // Conditional Radio
  {
    type: "propertyEditorUi",
    alias: "Our.Umbraco.CdRadio",
    name: "[Conditional] Radio Displayer",
    element: () => Promise.resolve().then(() => Ht),
    elementName: _e,
    meta: {
      label: "[Conditional] Radio Displayer",
      icon: "icon-circle-dotted-active",
      group: "Conditional Displayers",
      propertyEditorSchemaAlias: "Umbraco.Plain.String",
      settings: {
        properties: Gt,
        defaultData: [
          {
            alias: w.labelsPos.alias,
            value: "Right"
          }
        ]
      }
    }
  },
  // Conditional Dropdown
  {
    type: "propertyEditorUi",
    alias: "Our.Umbraco.CdDropdownFlexible",
    name: "[Conditional] Dropdown Displayer",
    element: () => Promise.resolve().then(() => jt),
    elementName: $e,
    meta: {
      label: "[Conditional] Dropdown Displayer",
      icon: "icon-filter-arrows",
      group: "Conditional Displayers",
      propertyEditorSchemaAlias: "Umbraco.Plain.String",
      settings: {
        properties: qt
      }
    }
  }
], Kt = (i, e) => {
  const t = [...Jt];
  e.registerMany(t);
}, Zt = (i, e) => {
}, si = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  onInit: Kt,
  onUnload: Zt
}, Symbol.toStringTag, { value: "Module" }));
export {
  si as b,
  ce as t
};
//# sourceMappingURL=backoffice-entrypoint-CJDzVFJB.js.map
