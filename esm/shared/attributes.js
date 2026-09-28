import {ATTRIBUTE_NODE} from './constants.js';
import {CLASS_LIST, NEXT, PREV, STYLE, VALUE} from './symbols.js';

import {knownAdjacent, knownSiblings} from './utils.js';

import {attributeChangedCallback as ceAttributes} from '../interface/custom-element-registry.js';
import {attributeChangedCallback as moAttributes} from '../interface/mutation-observer.js';

const {add, clear} = Set.prototype;
const asciiWhitespace = /[\t\n\f\r ]+/;

export const isClassAttribute = ({localName, namespaceURI}) =>
  localName === 'class' && namespaceURI === null;

// The style attribute and the declarations `style` exposes update each other;
// this keeps each update from echoing back.
let settingStyle = false;

export const quietly = update => {
  const was = settingStyle;
  settingStyle = true;
  try {
    update();
  }
  finally {
    settingStyle = was;
  }
};

export const isStyleAttribute = ({localName, namespaceURI}) =>
  localName === 'style' && namespaceURI === null;

export const resetStyle = (element, value) => {
  const style = element[STYLE];
  if (style && !settingStyle)
    quietly(() => { style.cssText = value; });
};

export const styleChanged = (element, cssText) => {
  if (!settingStyle)
    quietly(() => element.setAttribute('style', cssText));
};

export const attributeChanged = (element, attribute, value) => {
  if (isClassAttribute(attribute))
    resetClassList(element, value);
  else if (isStyleAttribute(attribute))
    resetStyle(element, value);
};

export const addClassTokens = (tokens, value) => {
  for (const token of value.split(asciiWhitespace)) {
    if (token)
      add.call(tokens, token);
  }
};

export const resetClassList = (element, value) => {
  const tokens = element[CLASS_LIST];
  if (tokens) {
    clear.call(tokens);
    addClassTokens(tokens, value);
  }
};

export const setAttribute = (element, attribute) => {
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

export const replaceAttribute = (element, previous, attribute) => {
  const {[VALUE]: value, name} = attribute;
  knownSiblings(previous[PREV], attribute, previous[NEXT]);
  previous.ownerElement = previous[PREV] = previous[NEXT] = null;
  attribute.ownerElement = element;
  attributeChanged(element, attribute, value);
  moAttributes(element, name, previous[VALUE]);
  ceAttributes(element, name, previous[VALUE], value);
};

export const removeAttribute = (element, attribute) => {
  const {[VALUE]: value, name} = attribute;
  knownAdjacent(attribute[PREV], attribute[NEXT]);
  attribute.ownerElement = attribute[PREV] = attribute[NEXT] = null;
  attributeChanged(element, attribute, '');
  moAttributes(element, name, value);
  ceAttributes(element, name, value, null);
};

export const booleanAttribute = {
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

export const numericAttribute = {
  get(element, name) {
    return parseFloat(element.getAttribute(name) || 0);
  },
  set(element, name, value) {
    element.setAttribute(name, value);
  }
};

export const stringAttribute = {
  get(element, name) {
    return element.getAttribute(name) || '';
  },
  set(element, name, value) {
    element.setAttribute(name, value);
  }
};

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
