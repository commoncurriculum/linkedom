import {ATTRIBUTE_NODE, HTML_NAMESPACE} from '../shared/constants.js';
import {VALUE} from '../shared/symbols.js';
import {String, ignoreCase} from '../shared/utils.js';
import {attrAsJSON} from '../shared/jsdon.js';
import {attributeChanged} from '../shared/attributes.js';
import {serializeAttribute} from '../shared/serialize-html.js';
import {serializeXMLAttribute} from '../shared/serialize-xml.js';

import {Node} from './node.js';

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
  }

  get nodeName() { return this.name; }

  get value() { return this[VALUE]; }
  set value(newValue) {
    const {[VALUE]: oldValue, ownerElement} = this;
    this[VALUE] = toDOMString(newValue);
    if (ownerElement)
      attributeChanged(ownerElement, this, oldValue, this[VALUE]);
  }

  cloneNode() {
    const {ownerDocument, name, [VALUE]: value, namespaceURI, prefix, localName} = this;
    return new Attr(ownerDocument, name, value, namespaceURI, prefix, localName);
  }

  toString() {
    return ignoreCase(this) ? serializeAttribute(this) : serializeXMLAttribute(this);
  }

  toJSON() {
    const json = [];
    attrAsJSON(this, json);
    return json;
  }
}
