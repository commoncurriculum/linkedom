import {Declarations, initSync, propertyNames} from '../shared/css/engine.js';
import wasm from '../shared/css/wasm.js';
import {RESET, STYLE} from '../shared/symbols.js';

import {toDOMString} from './attr.js';

const ELEMENT = Symbol('element');
const DECLARATIONS = Symbol('declarations');
const INDICES = Symbol('indices');
const TEXT = Symbol('text');

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
  initSync({module: decode(wasm)});
  // https://drafts.csswg.org/cssom/#the-cssstyleproperties-interface
  for (const property of propertyNames()) {
    defineProperty(idlAttribute(property, false), property);
    if (property.startsWith('-webkit-'))
      defineProperty(idlAttribute(property, true), property);
    if (property.includes('-'))
      defineProperty(property, property);
  }
  started = true;
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

// Setting TEXT first makes the attribute change this causes a no-op in RESET.
const changed = style => {
  indexed(style);
  style[TEXT] = style[DECLARATIONS].cssText();
  style[ELEMENT].setAttribute('style', style[TEXT]);
};

/**
 * @implements globalThis.CSSStyleDeclaration
 */
export class CSSStyleDeclaration {
  constructor(element) {
    const text = element.getAttributeNS(null, 'style') || '';
    this[ELEMENT] = element;
    this[DECLARATIONS] = new Declarations(text);
    this[TEXT] = text;
    this[INDICES] = 0;
    indexed(this);
  }

  [RESET](value) {
    const text = value || '';
    if (text !== this[TEXT]) {
      this[DECLARATIONS].free();
      this[DECLARATIONS] = new Declarations(text);
      this[TEXT] = text;
      indexed(this);
    }
  }

  get cssText() { return this[DECLARATIONS].cssText(); }
  set cssText(value) {
    this[DECLARATIONS].free();
    this[DECLARATIONS] = new Declarations(nullable(value));
    changed(this);
  }

  get length() { return this[DECLARATIONS].length; }

  get parentRule() { return null; }

  get cssFloat() { return this.getPropertyValue('float'); }
  set cssFloat(value) { this.setProperty('float', value); }

  item(index) {
    return this[DECLARATIONS].item(index >>> 0) || '';
  }

  getPropertyValue(property) {
    return this[DECLARATIONS].value(toDOMString(property));
  }

  getPropertyPriority(property) {
    return this[DECLARATIONS].priority(toDOMString(property));
  }

  setProperty(property, value, priority = '') {
    if (this[DECLARATIONS].set(toDOMString(property), nullable(value), nullable(priority)))
      changed(this);
  }

  removeProperty(property) {
    const value = this[DECLARATIONS].remove(toDOMString(property));
    if (value === undefined)
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

/**
 * @param {Element} element
 * @returns {CSSStyleDeclaration} the declarations of the element's style attribute
 */
export const styleOf = element => {
  if (!started)
    start();
  return element[STYLE] || (element[STYLE] = new CSSStyleDeclaration(element));
};
