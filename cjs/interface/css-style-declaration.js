'use strict';
const {Declarations, initSync, propertyNames} = require('../shared/css/engine.js');
const bytes = (require('../shared/css/bytes.js'));
const {RESET, STYLE} = require('../shared/symbols.js');

const {toDOMString} = require('./attr.js');

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

let started = false;
const start = () => {
  initSync({module: bytes()});
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
  const names = style[DECLARATIONS].names();
  for (let i = names.length; i < style[INDICES]; i++)
    delete style[i];
  for (let i = 0; i < names.length; i++)
    style[i] = names[i];
  style[INDICES] = names.length;
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
class CSSStyleDeclaration {
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
    return this[index >>> 0] ?? '';
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
exports.CSSStyleDeclaration = CSSStyleDeclaration

/**
 * @param {Element} element
 * @returns {CSSStyleDeclaration} the declarations of the element's style attribute
 */
const styleOf = element => {
  if (!started)
    start();
  return element[STYLE] || (element[STYLE] = new CSSStyleDeclaration(element));
};
exports.styleOf = styleOf;
