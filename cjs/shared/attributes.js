'use strict';
const {ATTRIBUTE_NODE} = require('./constants.js');
const {CLASS_LIST, NEXT, PREV, STYLE, VALUE} = require('./symbols.js');

const {knownAdjacent, knownSiblings} = require('./utils.js');

const {attributeChangedCallback: ceAttributes} = require('../interface/custom-element-registry.js');
const {attributeChangedCallback: moAttributes} = require('../interface/mutation-observer.js');

const emptyAttributes = new Set([
  'allowfullscreen',
  'allowpaymentrequest',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'class',
  'contenteditable',
  'controls',
  'default',
  'defer',
  'disabled',
  'draggable',
  'formnovalidate',
  'hidden',
  'id',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected',
  'style',
  'truespeed'
]);
exports.emptyAttributes = emptyAttributes;

const {add, clear} = Set.prototype;
const asciiWhitespace = /[\t\n\f\r ]+/;

const isClassAttribute = ({localName, namespaceURI}) =>
  localName === 'class' && namespaceURI === null;
exports.isClassAttribute = isClassAttribute;

// The style attribute and the declarations `style` exposes update each other;
// this keeps each update from echoing back.
let settingStyle = false;

const quietly = update => {
  const was = settingStyle;
  settingStyle = true;
  try {
    update();
  }
  finally {
    settingStyle = was;
  }
};
exports.quietly = quietly;

const isStyleAttribute = ({localName, namespaceURI}) =>
  localName === 'style' && namespaceURI === null;
exports.isStyleAttribute = isStyleAttribute;

const resetStyle = (element, value) => {
  const style = element[STYLE];
  if (style && !settingStyle)
    quietly(() => { style.cssText = value; });
};
exports.resetStyle = resetStyle;

const styleChanged = (element, cssText) => {
  if (!settingStyle)
    quietly(() => element.setAttribute('style', cssText));
};
exports.styleChanged = styleChanged;

const attributeChanged = (element, attribute, value) => {
  if (isClassAttribute(attribute))
    resetClassList(element, value);
  else if (isStyleAttribute(attribute))
    resetStyle(element, value);
};
exports.attributeChanged = attributeChanged;

const addClassTokens = (tokens, value) => {
  for (const token of value.split(asciiWhitespace)) {
    if (token)
      add.call(tokens, token);
  }
};
exports.addClassTokens = addClassTokens;

const resetClassList = (element, value) => {
  const tokens = element[CLASS_LIST];
  if (tokens) {
    clear.call(tokens);
    addClassTokens(tokens, value);
  }
};
exports.resetClassList = resetClassList;

const setAttribute = (element, attribute) => {
  const {[VALUE]: value, name} = attribute;
  let last = element;
  while (last[NEXT].nodeType === ATTRIBUTE_NODE)
    last = last[NEXT];
  attribute.ownerElement = element;
  knownSiblings(last, attribute, last[NEXT]);
  attributeChanged(element, attribute, value);
  moAttributes(element, name, null);
  ceAttributes(element, name, null, value);
};
exports.setAttribute = setAttribute;

const replaceAttribute = (element, previous, attribute) => {
  const {[VALUE]: value, name} = attribute;
  knownSiblings(previous[PREV], attribute, previous[NEXT]);
  previous.ownerElement = previous[PREV] = previous[NEXT] = null;
  attribute.ownerElement = element;
  attributeChanged(element, attribute, value);
  moAttributes(element, name, previous[VALUE]);
  ceAttributes(element, name, previous[VALUE], value);
};
exports.replaceAttribute = replaceAttribute;

const removeAttribute = (element, attribute) => {
  const {[VALUE]: value, name} = attribute;
  knownAdjacent(attribute[PREV], attribute[NEXT]);
  attribute.ownerElement = attribute[PREV] = attribute[NEXT] = null;
  attributeChanged(element, attribute, '');
  moAttributes(element, name, value);
  ceAttributes(element, name, value, null);
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
