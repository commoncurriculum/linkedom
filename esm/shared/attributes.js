import {ATTRIBUTE_NODE} from './constants.js';
import {ATTRIBUTE_CHANGED, NEXT, PREV, VALUE} from './symbols.js';

import {knownAdjacent, knownSiblings} from './utils.js';

import {attributeChangedCallback as ceAttributes} from '../interface/custom-element-registry.js';
import {attributeChangedCallback as moAttributes} from '../interface/mutation-observer.js';

/**
 * @param {Element} element
 * @param {Attr} attribute the attribute that was set, changed or removed
 * @param {string?} oldValue
 * @param {string?} value null once removed
 */
export const attributeChanged = (element, attribute, oldValue, value) => {
  const {name} = attribute;
  element[ATTRIBUTE_CHANGED](attribute, value);
  moAttributes(element, name, oldValue);
  ceAttributes(element, name, oldValue, value);
};

export const setAttribute = (element, attribute) => {
  let last = element;
  while (last[NEXT].nodeType === ATTRIBUTE_NODE)
    last = last[NEXT];
  attribute.ownerElement = element;
  knownSiblings(last, attribute, last[NEXT]);
  attributeChanged(element, attribute, null, attribute[VALUE]);
};

export const replaceAttribute = (element, previous, attribute) => {
  knownSiblings(previous[PREV], attribute, previous[NEXT]);
  previous.ownerElement = previous[PREV] = previous[NEXT] = null;
  attribute.ownerElement = element;
  attributeChanged(element, attribute, previous[VALUE], attribute[VALUE]);
};

export const removeAttribute = (element, attribute) => {
  knownAdjacent(attribute[PREV], attribute[NEXT]);
  attribute.ownerElement = attribute[PREV] = attribute[NEXT] = null;
  attributeChanged(element, attribute, attribute[VALUE], null);
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
