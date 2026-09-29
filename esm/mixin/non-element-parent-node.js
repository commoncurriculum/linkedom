// https://dom.spec.whatwg.org/#interface-nonelementparentnode
// Document, DocumentFragment

import {ELEMENT_NODE} from '../shared/constants.js';
import {CLONE, END, NEXT} from '../shared/symbols.js';
import {nonElementAsJSON} from '../shared/jsdon.js';
import {ignoreCase, linkClones} from '../shared/utils.js';
import {innerHTML} from '../shared/serialize-html.js';
import {serializeXML} from '../shared/serialize-xml.js';

import {ParentNode} from './parent-node.js';

export class NonElementParentNode extends ParentNode {
  getElementById(id) {
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end) {
      if (next.nodeType === ELEMENT_NODE && next.id === id)
        return next;
      next = next[NEXT];
    }
    return null;
  }

  [CLONE](document, deep) {
    const clone = new this.constructor(document);
    if (deep)
      linkClones(this, clone, document);
    return clone;
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
