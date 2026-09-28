'use strict';
const {ATTRIBUTE_NODE} = require('./constants.js');
const {ATTRIBUTE_CHANGED, NEXT, PREV, VALUE} = require('./symbols.js');

const {knownAdjacent, knownSiblings, linkAttribute} = require('./utils.js');

const {attributeChangedCallback: ceAttributes} = require('../interface/custom-element-registry.js');
const {attributeChangedCallback: moAttributes} = require('../interface/mutation-observer.js');

/**
 * @param {Element} element
 * @param {Attr} attribute the attribute that was set, changed or removed
 * @param {string?} oldValue
 * @param {string?} value null once removed
 */
const attributeChanged = (element, attribute, oldValue, value) => {
  const {name} = attribute;
  element[ATTRIBUTE_CHANGED](attribute, value);
  moAttributes(element, name, oldValue);
  ceAttributes(element, name, oldValue, value);
};
exports.attributeChanged = attributeChanged;

const setAttribute = (element, attribute) => {
  let last = element;
  while (last[NEXT].nodeType === ATTRIBUTE_NODE)
    last = last[NEXT];
  linkAttribute(element, attribute, last);
  attributeChanged(element, attribute, null, attribute[VALUE]);
};
exports.setAttribute = setAttribute;

const replaceAttribute = (element, previous, attribute) => {
  knownSiblings(previous[PREV], attribute, previous[NEXT]);
  previous.ownerElement = previous[PREV] = previous[NEXT] = null;
  attribute.ownerElement = element;
  attributeChanged(element, attribute, previous[VALUE], attribute[VALUE]);
};
exports.replaceAttribute = replaceAttribute;

const removeAttribute = (element, attribute) => {
  knownAdjacent(attribute[PREV], attribute[NEXT]);
  attribute.ownerElement = attribute[PREV] = attribute[NEXT] = null;
  attributeChanged(element, attribute, attribute[VALUE], null);
};
exports.removeAttribute = removeAttribute;

const booleanAttribute = {
  get(element, name) {
    return element.hasAttribute(name);
  },
  set(element, name, value) {
    if (value)
      element.setAttribute(name, '');
    else
      element.removeAttribute(name);
  }
};
exports.booleanAttribute = booleanAttribute;

const numericAttribute = {
  get(element, name) {
    return parseFloat(element.getAttribute(name) || 0);
  },
  set(element, name, value) {
    element.setAttribute(name, value);
  }
};
exports.numericAttribute = numericAttribute;

const stringAttribute = {
  get(element, name) {
    return element.getAttribute(name) || '';
  },
  set(element, name, value) {
    element.setAttribute(name, value);
  }
};
exports.stringAttribute = stringAttribute;

/* oddly enough, this apparently is not a thing
export const nullableAttribute = {
  get(element, name) {
    return element.getAttribute(name);
  },
  set(element, name, value) {
    if (value === null)
      element.removeAttribute(name);
    else
      element.setAttribute(name, value);
  }
};
*/
