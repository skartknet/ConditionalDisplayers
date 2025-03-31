var ve = (i) => {
  throw TypeError(i);
};
var Ye = (i, e, t) => e.has(i) || ve("Cannot " + t);
var be = (i, e, t) => e.has(i) ? ve("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t);
var Ae = (i, e, t) => (Ye(i, e, "access private method"), t);
import { nothing as Ee, html as $, property as T, state as p, customElement as le, repeat as we } from "@umbraco-cms/backoffice/external/lit";
import { UmbPropertyValueChangeEvent as ne } from "@umbraco-cms/backoffice/property-editor";
import { UmbElementMixin as et } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_DATASET_CONTEXT as tt } from "@umbraco-cms/backoffice/property";
const he = "our-conditionaldisplayers";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const j = globalThis, ce = j.ShadowRoot && (j.ShadyCSS === void 0 || j.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, de = Symbol(), Se = /* @__PURE__ */ new WeakMap();
let Ne = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== de) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (ce && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = Se.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && Se.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const it = (i) => new Ne(typeof i == "string" ? i : i + "", void 0, de), st = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((s, o, a) => s + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + i[a + 1], i[0]);
  return new Ne(t, i, de);
}, ot = (i, e) => {
  if (ce) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const s = document.createElement("style"), o = j.litNonce;
    o !== void 0 && s.setAttribute("nonce", o), s.textContent = t.cssText, i.appendChild(s);
  }
}, Ce = ce ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const s of e.cssRules) t += s.cssText;
  return it(t);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: rt, defineProperty: at, getOwnPropertyDescriptor: lt, getOwnPropertyNames: nt, getOwnPropertySymbols: ht, getPrototypeOf: ct } = Object, S = globalThis, Pe = S.trustedTypes, dt = Pe ? Pe.emptyScript : "", Y = S.reactiveElementPolyfillSupport, M = (i, e) => i, se = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? dt : null;
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
} }, ze = (i, e) => !rt(i, e), Ue = { attribute: !0, type: String, converter: se, reflect: !1, hasChanged: ze };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), S.litPropertyMetadata ?? (S.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class O extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Ue) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = Symbol(), o = this.getPropertyDescriptor(e, s, t);
      o !== void 0 && at(this.prototype, e, o);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: o, set: a } = lt(this.prototype, e) ?? { get() {
      return this[t];
    }, set(r) {
      this[t] = r;
    } };
    return { get() {
      return o == null ? void 0 : o.call(this);
    }, set(r) {
      const h = o == null ? void 0 : o.call(this);
      a.call(this, r), this.requestUpdate(e, h, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ue;
  }
  static _$Ei() {
    if (this.hasOwnProperty(M("elementProperties"))) return;
    const e = ct(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(M("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(M("properties"))) {
      const t = this.properties, s = [...nt(t), ...ht(t)];
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
      for (const o of s) t.unshift(Ce(o));
    } else e !== void 0 && t.push(Ce(e));
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
    return ot(e, this.constructor.elementStyles), e;
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
  _$EC(e, t) {
    var a;
    const s = this.constructor.elementProperties.get(e), o = this.constructor._$Eu(e, s);
    if (o !== void 0 && s.reflect === !0) {
      const r = (((a = s.converter) == null ? void 0 : a.toAttribute) !== void 0 ? s.converter : se).toAttribute(t, s.type);
      this._$Em = e, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var a;
    const s = this.constructor, o = s._$Eh.get(e);
    if (o !== void 0 && this._$Em !== o) {
      const r = s.getPropertyOptions(o), h = typeof r.converter == "function" ? { fromAttribute: r.converter } : ((a = r.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? r.converter : se;
      this._$Em = o, this[o] = h.fromAttribute(t, r.type), this._$Em = null;
    }
  }
  requestUpdate(e, t, s) {
    if (e !== void 0) {
      if (s ?? (s = this.constructor.getPropertyOptions(e)), !(s.hasChanged ?? ze)(this[e], t)) return;
      this.P(e, t, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$ET());
  }
  P(e, t, s) {
    this._$AL.has(e) || this._$AL.set(e, t), s.reflect === !0 && this._$Em !== e && (this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Set())).add(e);
  }
  async _$ET() {
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
      if (o.size > 0) for (const [a, r] of o) r.wrapped !== !0 || this._$AL.has(a) || this[a] === void 0 || this.P(a, this[a], r);
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (s = this._$EO) == null || s.forEach((o) => {
        var a;
        return (a = o.hostUpdate) == null ? void 0 : a.call(o);
      }), this.update(t)) : this._$EU();
    } catch (o) {
      throw e = !1, this._$EU(), o;
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
  _$EU() {
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
    this._$Ej && (this._$Ej = this._$Ej.forEach((t) => this._$EC(t, this[t]))), this._$EU();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
}
O.elementStyles = [], O.shadowRootOptions = { mode: "open" }, O[M("elementProperties")] = /* @__PURE__ */ new Map(), O[M("finalized")] = /* @__PURE__ */ new Map(), Y == null || Y({ ReactiveElement: O }), (S.reactiveElementVersions ?? (S.reactiveElementVersions = [])).push("2.0.4");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = globalThis, K = R.trustedTypes, xe = K ? K.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, We = "$lit$", E = `lit$${Math.random().toFixed(9).slice(2)}$`, je = "?" + E, pt = `<${je}>`, U = document, I = () => U.createComment(""), L = (i) => i === null || typeof i != "object" && typeof i != "function", pe = Array.isArray, ut = (i) => pe(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", ee = `[ 	
\f\r]`, k = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Oe = /-->/g, Ve = />/g, C = RegExp(`>|${ee}(?:([^\\s"'>=/]+)(${ee}*=${ee}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), De = /'/g, Te = /"/g, Fe = /^(?:script|style|textarea|title)$/i, V = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), ke = /* @__PURE__ */ new WeakMap(), P = U.createTreeWalker(U, 129);
function Ge(i, e) {
  if (!pe(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return xe !== void 0 ? xe.createHTML(e) : e;
}
const ft = (i, e) => {
  const t = i.length - 1, s = [];
  let o, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = k;
  for (let h = 0; h < t; h++) {
    const l = i[h];
    let c, u, n = -1, _ = 0;
    for (; _ < l.length && (r.lastIndex = _, u = r.exec(l), u !== null); ) _ = r.lastIndex, r === k ? u[1] === "!--" ? r = Oe : u[1] !== void 0 ? r = Ve : u[2] !== void 0 ? (Fe.test(u[2]) && (o = RegExp("</" + u[2], "g")), r = C) : u[3] !== void 0 && (r = C) : r === C ? u[0] === ">" ? (r = o ?? k, n = -1) : u[1] === void 0 ? n = -2 : (n = r.lastIndex - u[2].length, c = u[1], r = u[3] === void 0 ? C : u[3] === '"' ? Te : De) : r === Te || r === De ? r = C : r === Oe || r === Ve ? r = k : (r = C, o = void 0);
    const b = r === C && i[h + 1].startsWith("/>") ? " " : "";
    a += r === k ? l + pt : n >= 0 ? (s.push(c), l.slice(0, n) + We + l.slice(n) + E + b) : l + E + (n === -2 ? h : b);
  }
  return [Ge(i, a + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class B {
  constructor({ strings: e, _$litType$: t }, s) {
    let o;
    this.parts = [];
    let a = 0, r = 0;
    const h = e.length - 1, l = this.parts, [c, u] = ft(e, t);
    if (this.el = B.createElement(c, s), P.currentNode = this.el.content, t === 2 || t === 3) {
      const n = this.el.content.firstChild;
      n.replaceWith(...n.childNodes);
    }
    for (; (o = P.nextNode()) !== null && l.length < h; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const n of o.getAttributeNames()) if (n.endsWith(We)) {
          const _ = u[r++], b = o.getAttribute(n).split(E), W = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: a, name: W[2], strings: b, ctor: W[1] === "." ? mt : W[1] === "?" ? yt : W[1] === "@" ? _t : X }), o.removeAttribute(n);
        } else n.startsWith(E) && (l.push({ type: 6, index: a }), o.removeAttribute(n));
        if (Fe.test(o.tagName)) {
          const n = o.textContent.split(E), _ = n.length - 1;
          if (_ > 0) {
            o.textContent = K ? K.emptyScript : "";
            for (let b = 0; b < _; b++) o.append(n[b], I()), P.nextNode(), l.push({ type: 2, index: ++a });
            o.append(n[_], I());
          }
        }
      } else if (o.nodeType === 8) if (o.data === je) l.push({ type: 2, index: a });
      else {
        let n = -1;
        for (; (n = o.data.indexOf(E, n + 1)) !== -1; ) l.push({ type: 7, index: a }), n += E.length - 1;
      }
      a++;
    }
  }
  static createElement(e, t) {
    const s = U.createElement("template");
    return s.innerHTML = e, s;
  }
}
function D(i, e, t = i, s) {
  var r, h;
  if (e === V) return e;
  let o = s !== void 0 ? (r = t._$Co) == null ? void 0 : r[s] : t._$Cl;
  const a = L(e) ? void 0 : e._$litDirective$;
  return (o == null ? void 0 : o.constructor) !== a && ((h = o == null ? void 0 : o._$AO) == null || h.call(o, !1), a === void 0 ? o = void 0 : (o = new a(i), o._$AT(i, t, s)), s !== void 0 ? (t._$Co ?? (t._$Co = []))[s] = o : t._$Cl = o), o !== void 0 && (e = D(i, o._$AS(i, e.values), o, s)), e;
}
class gt {
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
    let a = P.nextNode(), r = 0, h = 0, l = s[0];
    for (; l !== void 0; ) {
      if (r === l.index) {
        let c;
        l.type === 2 ? c = new z(a, a.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(a, l.name, l.strings, this, e) : l.type === 6 && (c = new $t(a, this, e)), this._$AV.push(c), l = s[++h];
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
class z {
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
    e = D(this, e, t), L(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== V && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : ut(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && L(this._$AH) ? this._$AA.nextSibling.data = e : this.T(U.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var a;
    const { values: t, _$litType$: s } = e, o = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = B.createElement(Ge(s.h, s.h[0]), this.options)), s);
    if (((a = this._$AH) == null ? void 0 : a._$AD) === o) this._$AH.p(t);
    else {
      const r = new gt(o, this), h = r.u(this.options);
      r.p(t), this.T(h), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = ke.get(e.strings);
    return t === void 0 && ke.set(e.strings, t = new B(e)), t;
  }
  k(e) {
    pe(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let s, o = 0;
    for (const a of e) o === t.length ? t.push(s = new z(this.O(I()), this.O(I()), this, this.options)) : s = t[o], s._$AI(a), o++;
    o < t.length && (this._$AR(s && s._$AB.nextSibling, o), t.length = o);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, t); e && e !== this._$AB; ) {
      const o = e.nextSibling;
      e.remove(), e = o;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class X {
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
    if (a === void 0) e = D(this, e, t, 0), r = !L(e) || e !== this._$AH && e !== V, r && (this._$AH = e);
    else {
      const h = e;
      let l, c;
      for (e = a[0], l = 0; l < a.length - 1; l++) c = D(this, h[s + l], t, l), c === V && (c = this._$AH[l]), r || (r = !L(c) || c !== this._$AH[l]), c === d ? e = d : e !== d && (e += (c ?? "") + a[l + 1]), this._$AH[l] = c;
    }
    r && !o && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class mt extends X {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class yt extends X {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class _t extends X {
  constructor(e, t, s, o, a) {
    super(e, t, s, o, a), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = D(this, e, t, 0) ?? d) === V) return;
    const s = this._$AH, o = e === d && s !== d || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, a = e !== d && (s === d || o);
    o && this.element.removeEventListener(this.name, this, s), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class $t {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    D(this, e);
  }
}
const te = R.litHtmlPolyfillSupport;
te == null || te(B, z), (R.litHtmlVersions ?? (R.litHtmlVersions = [])).push("3.2.1");
const vt = (i, e, t) => {
  const s = (t == null ? void 0 : t.renderBefore) ?? e;
  let o = s._$litPart$;
  if (o === void 0) {
    const a = (t == null ? void 0 : t.renderBefore) ?? null;
    s._$litPart$ = o = new z(e.insertBefore(I(), a), a, void 0, t ?? {});
  }
  return o._$AI(i), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class H extends O {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = vt(t, this.renderRoot, this.renderOptions);
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
var Be;
H._$litElement$ = !0, H.finalized = !0, (Be = globalThis.litElementHydrateSupport) == null || Be.call(globalThis, { LitElement: H });
const ie = globalThis.litElementPolyfillSupport;
ie == null || ie({ LitElement: H });
(globalThis.litElementVersions ?? (globalThis.litElementVersions = [])).push("4.1.1");
const Me = (i, e, t) => {
  if (!i)
    return;
  const s = i.split(",");
  if (s && s.length > 0) {
    const o = bt(s);
    At(o, t, !1).forEach((r) => {
      e ? r.style.removeProperty("display") : r.style.display = "none";
    });
  }
}, bt = (i) => {
  let e = "";
  for (let t = 0; t < i.length; t++) {
    e !== "" && (e += ",");
    const s = i[t].trim();
    e += `umb-property[data-mark="property:${s}"]`;
  }
  return e;
}, At = (i, e = document.body, t = !1) => {
  const s = [], o = (a) => {
    if (a.nodeType !== Node.ELEMENT_NODE || a.matches(i) && (s.push(a), t))
      return;
    const r = a.children;
    if (r.length)
      for (const l of r)
        o(l);
    const h = a.shadowRoot;
    if (h) {
      const l = h.children;
      for (const c of l)
        o(c);
    }
  };
  return o(e), t ? s.slice(0, 1) : s;
}, Et = st`
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
var Q, qe;
const $e = class $e extends et(H) {
  constructor() {
    super();
    be(this, Q);
    this.consumeContext(tt, (t) => {
      this.datasetHostElement = t.getHostElement();
    });
  }
  connectedCallback() {
    super.connectedCallback(), setTimeout(() => {
      Ae(this, Q, qe).call(this);
    }, 50);
  }
  displayProps(t, s) {
    this.datasetHostElement && (Me(t, !0, this.datasetHostElement), Me(s, !1, this.datasetHostElement));
  }
};
Q = new WeakSet(), qe = function() {
  this.initDefaults(), this.bootstrap();
}, $e.styles = Et;
let N = $e;
var wt = Object.defineProperty, St = Object.getOwnPropertyDescriptor, Je = (i) => {
  throw TypeError(i);
}, y = (i, e, t, s) => {
  for (var o = s > 1 ? void 0 : s ? St(e, t) : e, a = i.length - 1, r; a >= 0; a--)
    (r = i[a]) && (o = (s ? r(e, t, o) : r(o)) || o);
  return s && o && wt(e, t, o), o;
}, ue = (i, e, t) => e.has(i) || Je("Cannot " + t), Ct = (i, e, t) => (ue(i, e, "read from private field"), t ? t.call(i) : e.get(i)), Re = (i, e, t) => e.has(i) ? Je("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t), Pt = (i, e, t, s) => (ue(i, e, "write to private field"), e.set(i, t), t), Ut = (i, e, t) => (ue(i, e, "access private method"), t), F, oe, Ke;
const fe = `${he}-checkbox`;
let f = class extends N {
  constructor() {
    super(...arguments), Re(this, oe), Re(this, F, !1);
  }
  set config(i) {
    this.configDefaultValue = i.getValueByAlias(A.default.alias), this.configShowIfChecked = i.getValueByAlias(A.showIfChecked.alias), this.configShowIfUnchecked = i.getValueByAlias(A.showIfUnchecked.alias), this.configIsShowLabels = i.getValueByAlias(A.showLabels.alias), this.configLabelOn = i.getValueByAlias(A.labelOn.alias), this.configLabelOff = i.getValueByAlias(A.labelOff.alias);
  }
  get toggleValue() {
    return Ct(this, F);
  }
  set toggleValue(i) {
    i = i || !1, Pt(this, F, i), this.value = i ? "1" : "0", this.dispatchEvent(new ne());
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
            <uui-toggle .checked=${this.toggleValue} @change=${Ut(this, oe, Ke)}
                    label="${(this.configIsShowLabels ? this.toggleValue ? this.configLabelOn : this.configLabelOff : Ee) ?? Ee}"
                    labelPosition="right"></uui-toggle>
        </div>
        `;
  }
};
F = /* @__PURE__ */ new WeakMap();
oe = /* @__PURE__ */ new WeakSet();
Ke = function(i) {
  i.stopPropagation(), this.toggleValue = i.target.checked, this.runDisplayLogic();
};
y([
  T({ type: String, attribute: !0 })
], f.prototype, "value", 2);
y([
  T({ attribute: !1 })
], f.prototype, "config", 1);
y([
  p()
], f.prototype, "configDefaultValue", 2);
y([
  p()
], f.prototype, "configShowIfChecked", 2);
y([
  p()
], f.prototype, "configShowIfUnchecked", 2);
y([
  p()
], f.prototype, "configIsShowLabels", 2);
y([
  p()
], f.prototype, "configLabelOn", 2);
y([
  p()
], f.prototype, "configLabelOff", 2);
y([
  p()
], f.prototype, "toggleValue", 1);
f = y([
  le(fe)
], f);
const xt = f, Ot = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CdCheckboxElement() {
    return f;
  },
  default: xt,
  elementName: fe
}, Symbol.toStringTag, { value: "Module" }));
var Vt = Object.defineProperty, Dt = Object.getOwnPropertyDescriptor, Ze = (i) => {
  throw TypeError(i);
}, v = (i, e, t, s) => {
  for (var o = s > 1 ? void 0 : s ? Dt(e, t) : e, a = i.length - 1, r; a >= 0; a--)
    (r = i[a]) && (o = (s ? r(e, t, o) : r(o)) || o);
  return s && o && Vt(e, t, o), o;
}, ge = (i, e, t) => e.has(i) || Ze("Cannot " + t), Tt = (i, e, t) => (ge(i, e, "read from private field"), t ? t.call(i) : e.get(i)), He = (i, e, t) => e.has(i) ? Ze("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t), kt = (i, e, t, s) => (ge(i, e, "write to private field"), e.set(i, t), t), Ie = (i, e, t) => (ge(i, e, "access private method"), t), G, q, re;
const me = `${he}-radio`;
let g = class extends N {
  constructor() {
    super(...arguments), He(this, q), this.availableValues = [], He(this, G, "");
  }
  set config(i) {
    this.assignValuesFromConfig(i);
  }
  get selectedValue() {
    return Tt(this, G);
  }
  set selectedValue(i) {
    if (!i)
      throw new Error("value not set");
    kt(this, G, i), this.selectedItem = this.availableValues.find((e) => e.value === i), this.value = i, this.dispatchEvent(new ne());
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
        <div class="cd-conditional-group ${this.configAlignHorizontal ? "horizontal" : ""} labelpos-${this.configLabelPosition}" @change=${Ie(this, q, re)}>
            ${we(this.availableValues, (i) => $`
                <label><input type="radio" name="radioGroup" value="${i.value}" .checked=${this.selectedValue === i.value} /><span class="label">${i.value}</span></label>
            `)}

            </div>
        `;
  }
  renderButtonGroup() {
    return $`
        <div class="cd-conditional-group ${this.configAlignHorizontal ? "horizontal" : ""}" @click=${Ie(this, q, re)}>
            ${we(this.availableValues, (i) => $`
            <uui-button label="${i.value}" value="${i.value}" look="${this.selectedValue === i.value ? "primary" : "secondary"}"></uui-button>
            `)}
        </div>
        `;
  }
};
G = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakSet();
re = function(i) {
  i.stopPropagation();
  const e = i.target.value;
  this.selectedValue = e, this.runDisplayLogic();
};
v([
  T({ type: String, attribute: !1 })
], g.prototype, "value", 2);
v([
  T({ attribute: !1 })
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
  le(me)
], g);
const Mt = g, Rt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CdRadioElement() {
    return g;
  },
  default: Mt,
  elementName: me
}, Symbol.toStringTag, { value: "Module" }));
var Ht = Object.defineProperty, It = Object.getOwnPropertyDescriptor, Qe = (i) => {
  throw TypeError(i);
}, x = (i, e, t, s) => {
  for (var o = s > 1 ? void 0 : s ? It(e, t) : e, a = i.length - 1, r; a >= 0; a--)
    (r = i[a]) && (o = (s ? r(e, t, o) : r(o)) || o);
  return s && o && Ht(e, t, o), o;
}, ye = (i, e, t) => e.has(i) || Qe("Cannot " + t), Lt = (i, e, t) => (ye(i, e, "read from private field"), t ? t.call(i) : e.get(i)), Le = (i, e, t) => e.has(i) ? Qe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t), Bt = (i, e, t, s) => (ye(i, e, "write to private field"), e.set(i, t), t), Nt = (i, e, t) => (ye(i, e, "access private method"), t), J, ae, Xe;
const _e = `${he}-dropdown`;
let m = class extends N {
  constructor() {
    super(...arguments), Le(this, ae), this.availableValues = [], this.viewModelSelectOptions = [], Le(this, J, "");
  }
  set config(i) {
    this.assignValuesFromConfig(i);
  }
  get selectedValue() {
    return Lt(this, J);
  }
  set selectedValue(i) {
    if (!i)
      throw new Error("value not set");
    Bt(this, J, i);
    const e = this.availableValues.find((t) => t.value === i);
    e && (this.selectedItem = e), this.value = i, this.dispatchEvent(new ne());
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
    this.configItems = i.getValueByAlias(Z.items.alias), this.configDefaultValue = i.getValueByAlias(Z.default.alias), this.availableValues = this.configItems;
  }
  isValidSelection(i) {
    return !!this.availableValues.find((e) => e.value === i);
  }
  render() {
    return this.availableValues.length === 0 ? $`<p>No conditional items configured</p>` : $`
        <uui-select @change=${Nt(this, ae, Xe)} required .options=${this.viewModelSelectOptions} placeholder="Pick One"></uui-select>
        `;
  }
};
J = /* @__PURE__ */ new WeakMap();
ae = /* @__PURE__ */ new WeakSet();
Xe = function(i) {
  i.stopPropagation();
  const e = i.target.value;
  this.selectedValue = e, this.runDisplayLogic();
};
x([
  T({ type: String, attribute: !1 })
], m.prototype, "value", 2);
x([
  T({ attribute: !1 })
], m.prototype, "config", 1);
x([
  p()
], m.prototype, "configDefaultValue", 2);
x([
  p()
], m.prototype, "configItems", 2);
x([
  p()
], m.prototype, "viewModelSelectOptions", 2);
x([
  p()
], m.prototype, "selectedValue", 1);
m = x([
  le(_e)
], m);
const zt = m, Wt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CdDropDownFlexibleElement() {
    return m;
  },
  default: zt,
  elementName: _e
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
}, Z = {
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
}, jt = Object.keys(A).map((i) => A[i]), Ft = Object.keys(w).map((i) => w[i]), Gt = Object.keys(Z).map((i) => Z[i]), qt = [
  // custom view for prevalues (will not be displayed in backoffice)
  {
    type: "propertyEditorUi",
    alias: "Our.Umbraco.CdMultivalues",
    name: "[Conditional] Multivalues Displayer",
    element: () => import("./cdMultivalues-CcqxN4Yx.js"),
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
    element: () => Promise.resolve().then(() => Ot),
    elementName: fe,
    meta: {
      label: "[Conditional] Checkbox Displayer",
      icon: "icon-checkbox-dotted-active",
      group: "Conditional Displayers",
      propertyEditorSchemaAlias: "Umbraco.Plain.String",
      settings: {
        properties: jt
      }
    }
  },
  // Conditional Radio
  {
    type: "propertyEditorUi",
    alias: "Our.Umbraco.CdRadio",
    name: "[Conditional] Radio Displayer",
    element: () => Promise.resolve().then(() => Rt),
    elementName: me,
    meta: {
      label: "[Conditional] Radio Displayer",
      icon: "icon-circle-dotted-active",
      group: "Conditional Displayers",
      propertyEditorSchemaAlias: "Umbraco.Plain.String",
      settings: {
        properties: Ft,
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
    element: () => Promise.resolve().then(() => Wt),
    elementName: _e,
    meta: {
      label: "[Conditional] Dropdown Displayer",
      icon: "icon-filter-arrows",
      group: "Conditional Displayers",
      propertyEditorSchemaAlias: "Umbraco.Plain.String",
      settings: {
        properties: Gt
      }
    }
  }
], Jt = (i, e) => {
  const t = [...qt];
  e.registerMany(t);
}, Kt = (i, e) => {
}, ii = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  onInit: Jt,
  onUnload: Kt
}, Symbol.toStringTag, { value: "Module" }));
export {
  ii as b,
  he as t
};
//# sourceMappingURL=backoffice-entrypoint-DsMPxxPY.js.map
