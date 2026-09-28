import {ATTRIBUTE_NODE, HTML_NAMESPACE} from '../shared/constants.js';
import {CHANGED, VALUE} from '../shared/symbols.js';
import {String, ignoreCase} from '../shared/utils.js';
import {attrAsJSON} from '../shared/jsdon.js';
import {attributeChanged, emptyAttributes} from '../shared/attributes.js';

import {attributeChangedCallback as moAttributes} from './mutation-observer.js';
import {attributeChangedCallback as ceAttributes} from './custom-element-registry.js';

import {Node} from './node.js';
import {escape} from '../shared/text-escaper.js';

const QUOTE = /"/g;

// A node's own toString serializes it, but WebIDL converts it to a DOMString as
// browsers do: links through their href, other nodes through Object.prototype.toString.
export const toDOMString = value => {
  if (typeof value === 'string')
    return value;
  if (!(value instanceof Node))
    return String(value);
  const {localName, namespaceURI} = value;
  return (localName === 'a' || localName === 'area') && namespaceURI === HTML_NAMESPACE ?
    value.href : `[object ${value.constructor.name}]`;
};

/**
 * @implements globalThis.Attr
 */
export class Attr extends Node {
  constructor(ownerDocument, name, value = '', namespaceURI = null, prefix = null, localName = name) {
    super(ownerDocument, localName, ATTRIBUTE_NODE);
    this.ownerElement = null;
    this.name = String(name);
    this.namespaceURI = namespaceURI;
    this.prefix = prefix;
    this[VALUE] = toDOMString(value);
    this[CHANGED] = false;
  }

  get nodeName() { return this.name; }

  get value() { return this[VALUE]; }
  set value(newValue) {
    const {[VALUE]: oldValue, name, ownerElement} = this;
    this[VALUE] = toDOMString(newValue);
    this[CHANGED] = true;
    if (ownerElement) {
      attributeChanged(ownerElement, this, this[VALUE]);
      moAttributes(ownerElement, name, oldValue);
      ceAttributes(ownerElement, name, oldValue, this[VALUE]);
    }
  }

  cloneNode() {
    const {ownerDocument, name, [VALUE]: value, namespaceURI, prefix, localName} = this;
    return new Attr(ownerDocument, name, value, namespaceURI, prefix, localName);
  }

  toString() {
    const {name, [VALUE]: value} = this;
    if (emptyAttributes.has(name) && !value) {
      return ignoreCase(this) ? name : `${name}=""`;
    }
    const escapedValue = (ignoreCase(this) ? value : escape(value)).replace(QUOTE, '&quot;');
    return `${name}="${escapedValue}"`;
  }

  toJSON() {
    const json = [];
    attrAsJSON(this, json);
    return json;
  }
}
