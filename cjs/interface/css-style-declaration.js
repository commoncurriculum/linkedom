'use strict';
// tarnish-css holds an element's declarations: stylo, Servo's CSS engine, compiled
// to WebAssembly, so they parse, change and serialize as a browser's do, and as
// tarnish's Rust DOM, which runs the same engine natively, has them.

const {Declarations, initSync, propertyNames} = require('../shared/css/engine.js');
const wasm = (require('../shared/css/wasm.js'));
const {quietly, styleChanged} = require('../shared/attributes.js');

const {toDOMString} = require('./attr.js');

const ELEMENT = Symbol('element');
const DECLARATIONS = Symbol('declarations');
const INDICES = Symbol('indices');

const nullable = value => value === null ? '' : toDOMString(value);

// https://drafts.csswg.org/cssom/#css-property-to-idl-attribute
const idlAttribute = (property, lowercaseFirst) => {
  const name = lowercaseFirst ? property.slice(1) : property;
  return name.replace(/-(.)/g, (_, character) => character.toUpperCase());
};

const defineProperty = (name, property) => {
  if (!(name in CSSStyleDeclaration.prototype))
    Object.defineProperty(CSSStyleDeclaration.prototype, name, {
      configurable: true,
      enumerable: true,
      get() { return this.getPropertyValue(property); },
      set(value) { this.setProperty(property, value); }
    });
};

const decode = base64 => {
  if (Uint8Array.fromBase64)
    return Uint8Array.fromBase64(base64);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i);
  return bytes;
};

let started = false;
const start = () => {
  started = true;
  initSync({module: decode(wasm)});
  // https://drafts.csswg.org/cssom/#the-cssstyleproperties-interface
  for (const property of propertyNames()) {
    defineProperty(idlAttribute(property, false), property);
    if (property.startsWith('-webkit-'))
      defineProperty(idlAttribute(property, true), property);
    if (property.includes('-'))
      defineProperty(property, property);
  }
};

// Browsers expose the declared names as indexed properties too.
const indexed = style => {
  const {length} = style;
  for (let i = length; i < style[INDICES]; i++)
    delete style[i];
  for (let i = 0; i < length; i++)
    style[i] = style.item(i);
  style[INDICES] = length;
};

const changed = style => {
  indexed(style);
  styleChanged(style[ELEMENT], style.cssText);
};

/**
 * @implements globalThis.CSSStyleDeclaration
 */
class CSSStyleDeclaration {
  constructor(element) {
    this[ELEMENT] = element;
    this[DECLARATIONS] = null;
    this[INDICES] = 0;
  }

  get cssText() {
    const declarations = this[DECLARATIONS];
    return declarations ? declarations.cssText() : '';
  }

  set cssText(value) {
    const css = nullable(value);
    if (this[DECLARATIONS])
      this[DECLARATIONS].free();
    this[DECLARATIONS] = css ? new Declarations(css) : null;
    changed(this);
  }

  get length() {
    const declarations = this[DECLARATIONS];
    return declarations ? declarations.length : 0;
  }

  get parentRule() { return null; }

  get cssFloat() { return this.getPropertyValue('float'); }
  set cssFloat(value) { this.setProperty('float', value); }

  item(index) {
    const declarations = this[DECLARATIONS];
    return (declarations && declarations.item(index >>> 0)) || '';
  }

  getPropertyValue(property) {
    const declarations = this[DECLARATIONS];
    return declarations ? declarations.value(toDOMString(property)) : '';
  }

  getPropertyPriority(property) {
    const declarations = this[DECLARATIONS];
    return declarations ? declarations.priority(toDOMString(property)) : '';
  }

  setProperty(property, value, priority = '') {
    const declarations = this[DECLARATIONS] || (this[DECLARATIONS] = new Declarations(''));
    if (declarations.set(toDOMString(property), nullable(value), nullable(priority)))
      changed(this);
  }

  removeProperty(property) {
    const declarations = this[DECLARATIONS];
    const value = declarations && declarations.remove(toDOMString(property));
    if (value === undefined || value === null)
      return '';
    changed(this);
    return value;
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++)
      yield this.item(i);
  }

  get [Symbol.toStringTag]() { return 'CSSStyleDeclaration'; }
}
exports.CSSStyleDeclaration = CSSStyleDeclaration

/**
 * @param {Element} element
 * @returns {CSSStyleDeclaration} the declarations of the element's style attribute
 */
const styleOf = element => {
  if (!started)
    start();
  const style = new CSSStyleDeclaration(element);
  const attribute = element.getAttributeNodeNS(null, 'style');
  if (attribute)
    quietly(() => { style.cssText = attribute.value; });
  return style;
};
exports.styleOf = styleOf;
