'use strict';
// https://dom.spec.whatwg.org/#interface-nonelementparentnode
// Document, DocumentFragment

const {ELEMENT_NODE} = require('../shared/constants.js');
const {END, NEXT} = require('../shared/symbols.js');
const {nonElementAsJSON} = require('../shared/jsdon.js');
const {ignoreCase} = require('../shared/utils.js');
const {innerHTML} = require('../shared/serialize-html.js');
const {serializeXML} = require('../shared/serialize-xml.js');

const {ParentNode} = require('./parent-node.js');

class NonElementParentNode extends ParentNode {
  getElementById(id) {
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end) {
      if (next.nodeType === ELEMENT_NODE && next.id === id)
        return next;
      next = next[NEXT];
    }
    return null;
  }

  cloneNode(deep) {
    const {ownerDocument, constructor} = this;
    const nonEPN = new constructor(ownerDocument);
    if (deep) {
      const {[END]: end} = nonEPN;
      for (const node of this.childNodes)
        nonEPN.insertBefore(node.cloneNode(deep), end);
    }
    return nonEPN; 
  }

  toString() {
    const {localName} = this;
    const children = ignoreCase(this) ? innerHTML(this) : serializeXML(this, false);
    return `<${localName}>${children}</${localName}>`;
  }

  toJSON() {
    const json = [];
    nonElementAsJSON(this, json);
    return json;
  }
}
exports.NonElementParentNode = NonElementParentNode
