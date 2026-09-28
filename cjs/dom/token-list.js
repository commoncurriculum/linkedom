'use strict';
const {OWNER_ELEMENT} = require('../shared/symbols.js');
const {addClassTokens, setAttribute} = require('../shared/attributes.js');

const {Attr} = require('../interface/attr.js');

const {add, clear} = Set.prototype;
const asciiWhitespace = /[\t\n\f\r ]/;

const classAttribute = ownerElement => ownerElement.getAttributeNodeNS(null, 'class');

const valid = token => {
  token = String(token);
  if (!token)
    throw new DOMException('The token must not be empty.', 'SyntaxError');
  if (asciiWhitespace.test(token))
    throw new DOMException('The token must not contain whitespace.', 'InvalidCharacterError');
  return token;
};

const update = self => {
  const ownerElement = self[OWNER_ELEMENT];
  const attribute = classAttribute(ownerElement);
  if (!attribute && !self.size)
    return;
  const value = [...self].join(' ');
  if (attribute)
    attribute.value = value;
  else
    setAttribute(ownerElement, new Attr(ownerElement.ownerDocument, 'class', value));
};

/**
 * @implements globalThis.DOMTokenList
 */
class DOMTokenList extends Set {

  constructor(ownerElement) {
    super();
    this[OWNER_ELEMENT] = ownerElement;
    const attribute = classAttribute(ownerElement);
    if (attribute)
      addClassTokens(this, attribute.value);
  }

  get length() { return this.size; }

  get value() {
    const attribute = classAttribute(this[OWNER_ELEMENT]);
    return attribute ? attribute.value : '';
  }

  set value(value) {
    this[OWNER_ELEMENT].setAttribute('class', value);
  }

  item(index) {
    return [...this][index] ?? null;
  }

  /**
   * @param  {...string} tokens
   */
  add(...tokens) {
    for (const token of tokens.map(valid))
      add.call(this, token);
    update(this);
  }

  /**
   * @param {string} token
   */
  contains(token) { return this.has(String(token)); }

  /**
   * @param  {...string} tokens
   */
  remove(...tokens) {
    for (const token of tokens.map(valid))
      this.delete(token);
    update(this);
  }

  /**
   * @param {string} token
   * @param {boolean?} force
   */
  toggle(token, force) {
    token = valid(token);
    if (this.has(token)) {
      if (force)
        return true;
      this.delete(token);
      update(this);
    }
    else if (force || arguments.length === 1) {
      add.call(this, token);
      update(this);
      return true;
    }
    return false;
  }

  /**
   * @param {string} token
   * @param {string} newToken
   */
  replace(token, newToken) {
    token = valid(token);
    newToken = valid(newToken);
    if (!this.has(token))
      return false;
    const tokens = [...this];
    clear.call(this);
    for (const current of tokens)
      add.call(this, current === token ? newToken : current);
    update(this);
    return true;
  }

  /**
   * @param {string} token
   */
  supports() { return true; }

  toString() { return this.value; }
}
exports.DOMTokenList = DOMTokenList
