// https://dom.spec.whatwg.org/#interface-parentnode
// Document, DocumentFragment, Element

import {
  ATTRIBUTE_NODE,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  TEXT_NODE,
  NODE_END,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  HTML_NAMESPACE
} from '../shared/constants.js';

import {
  CONTENT, PRIVATE, END, MIME, NEXT, PREFIX, PREV, START, TEMPLATE_DOCUMENT, VALUE
} from '../shared/symbols.js';

import {prepareMatch} from '../shared/matches.js';
import {asciiLowercase} from '../shared/names.js';
import {previousSibling, nextSibling} from '../shared/node.js';
import {shadowRoots} from '../shared/shadow-roots.js';
import {baseChanged} from '../shared/url.js';
import {getEnd, knownAdjacent, knownBoundaries, knownSegment, knownSiblings} from '../shared/utils.js';

import {Node} from '../interface/node.js';
import {Text} from '../interface/text.js';
import {NodeList} from '../interface/node-list.js';

import {moCallback} from '../interface/mutation-observer.js';
import {adoptedCallback, connectedCallback} from '../interface/custom-element-registry.js';

import {nextElementSibling} from './non-document-type-child-node.js';

const isNode = node => node instanceof Node;

// WebIDL's conversion of a Node argument, with the message browsers give.
const nodeArgument = (method, node) => {
  if (!isNode(node))
    throw new TypeError(`Failed to execute '${method}' on 'Node': parameter 1 is not of type 'Node'.`);
};

// https://dom.spec.whatwg.org/#concept-node-adopt
const adopt = (node, document) => {
  const oldDocument = node.ownerDocument;
  const end = node.nodeType === DOCUMENT_FRAGMENT_NODE ? node[END] : getEnd(node);
  for (let next = node; ; next = next[NEXT]) {
    next.ownerDocument = document;
    if (next.nodeType === ELEMENT_NODE) {
      // https://html.spec.whatwg.org/multipage/scripting.html#template-adopting-steps
      const content = next[CONTENT];
      if (content && content.ownerDocument !== document[TEMPLATE_DOCUMENT])
        adopt(content, document[TEMPLATE_DOCUMENT]);
      if (shadowRoots.has(next))
        adopt(shadowRoots.get(next).shadowRoot, document);
      adoptedCallback(next, oldDocument, document);
    }
    if (next === end)
      break;
  }
};

const descendants = (root, matches) => {
  const elements = new NodeList;
  let {[NEXT]: next, [END]: end} = root;
  while (next !== end) {
    if (next.nodeType === ELEMENT_NODE && matches(next))
      elements.push(next);
    next = next[NEXT];
  }
  return elements;
};

const asciiWhitespaces = /[\t\n\f\r ]+/;

// https://dom.spec.whatwg.org/#concept-ordered-set-parser
const orderedSet = value => [...new Set(value.split(asciiWhitespaces))].filter(Boolean);

const qualify = ({[PREFIX]: prefix, localName}) => prefix ? `${prefix}:${localName}` : localName;

const insert = (parentNode, child, nodes) => {
  const {ownerDocument} = parentNode;
  for (const node of nodes)
    parentNode.insertBefore(
      isNode(node) ? node : new Text(ownerDocument, node),
      child
    );
};

/** @typedef { import('../interface/element.js').Element & {
    [typeof NEXT]: NodeStruct,
    [typeof PREV]: NodeStruct,
    [typeof START]: NodeStruct,
    nodeType: typeof ATTRIBUTE_NODE | typeof DOCUMENT_FRAGMENT_NODE | typeof ELEMENT_NODE | typeof TEXT_NODE | typeof NODE_END | typeof COMMENT_NODE | typeof CDATA_SECTION_NODE,
    ownerDocument: Document,
    parentNode: ParentNode,
}} NodeStruct */

export class ParentNode extends Node {
  constructor(ownerDocument, localName, nodeType) {
    super(ownerDocument, localName, nodeType);
    this[PRIVATE] = null;
    /** @type {NodeStruct} */
    this[NEXT] = this[END] = {
      [NEXT]: null,
      [PREV]: this,
      [START]: this,
      nodeType: NODE_END,
      ownerDocument: this.ownerDocument,
      parentNode: null
    };
  }

  get childNodes() {
    const childNodes = new NodeList;
    let {firstChild} = this;
    while (firstChild) {
      childNodes.push(firstChild);
      firstChild = nextSibling(firstChild);
    }
    return childNodes;
  }

  get children() {
    const children = new NodeList;
    let {firstElementChild} = this;
    while (firstElementChild) {
      children.push(firstElementChild);
      firstElementChild = nextElementSibling(firstElementChild);
    }
    return children;
  }

  /**
   * @returns {NodeStruct | null}
   */
  get firstChild() {
    let {[NEXT]: next, [END]: end} = this;
    while (next.nodeType === ATTRIBUTE_NODE)
      next = next[NEXT];
    return next === end ? null : next;
  }

  /**
   * @returns {NodeStruct | null}
   */
  get firstElementChild() {
    let {firstChild} = this;
    while (firstChild) {
      if (firstChild.nodeType === ELEMENT_NODE)
        return firstChild;
      firstChild = nextSibling(firstChild);
    }
    return null;
  }

  get lastChild() {
    const prev = this[END][PREV];
    switch (prev.nodeType) {
      case NODE_END:
        return prev[START];
      case ATTRIBUTE_NODE:
        return null;
    }
    return prev === this ? null : prev;
  }

  get lastElementChild() {
    let {lastChild} = this;
    while (lastChild) {
      if (lastChild.nodeType === ELEMENT_NODE)
        return lastChild;
      lastChild = previousSibling(lastChild);
    }
    return null;
  }

  get childElementCount() {
    return this.children.length;
  }

  prepend(...nodes) {
    insert(this, this.firstChild, nodes);
  }

  append(...nodes) {
    insert(this, this[END], nodes);
  }

  replaceChildren(...nodes) {
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end && next.nodeType === ATTRIBUTE_NODE)
      next = next[NEXT];
    while (next !== end) {
      const after = getEnd(next)[NEXT];
      next.remove();
      next = after;
    }
    if (nodes.length)
      insert(this, end, nodes);
  }

  // https://dom.spec.whatwg.org/#concept-getelementsbyclassname
  getElementsByClassName(classNames) {
    const classes = orderedSet(String(classNames));
    const hasClasses = ({classList}) => classes.every(token => classList.has(token));
    return classes.length ?
      descendants(this, element => element.hasAttribute('class') && hasClasses(element)) :
      new NodeList;
  }

  // https://dom.spec.whatwg.org/#concept-getelementsbytagname
  getElementsByTagName(qualifiedName) {
    qualifiedName = String(qualifiedName);
    if (qualifiedName === '*')
      return descendants(this, () => true);
    if ((this.ownerDocument || this)[MIME].ignoreCase) {
      const lowercase = asciiLowercase(qualifiedName);
      return descendants(this, element => qualify(element) === (
        element.namespaceURI === HTML_NAMESPACE ? lowercase : qualifiedName
      ));
    }
    return descendants(this, element => qualify(element) === qualifiedName);
  }

  // https://dom.spec.whatwg.org/#concept-getelementsbytagnamens
  getElementsByTagNameNS(namespace, localName) {
    namespace = namespace === '' || namespace == null ? null : String(namespace);
    localName = String(localName);
    return descendants(this, element =>
      (namespace === '*' || element.namespaceURI === namespace) &&
      (localName === '*' || element.localName === localName)
    );
  }

  querySelector(selectors) {
    const matches = prepareMatch(this, selectors);
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end) {
      if (next.nodeType === ELEMENT_NODE && matches(next))
        return next;
      next = next[NEXT];
    }
    return null;
  }

  querySelectorAll(selectors) {
    const matches = prepareMatch(this, selectors);
    const elements = new NodeList;
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end) {
      if (next.nodeType === ELEMENT_NODE && matches(next))
        elements.push(next);
      next = next[NEXT];
    }
    return elements;
  }

  appendChild(node) {
    nodeArgument('appendChild', node);
    return this.insertBefore(node, this[END]);
  }

  contains(node) {
    let parentNode = node;
    while (parentNode && parentNode !== this)
      parentNode = parentNode.parentNode;
    return parentNode === this;
  }

  insertBefore(node, before = null) {
    nodeArgument('insertBefore', node);
    if (node === before)
      return node;
    if (node === this)
      throw new Error('unable to append a node to itself');
    const next = before || this[END];
    const document = this.ownerDocument || this;
    switch (node.nodeType) {
      case ELEMENT_NODE:
        node.remove();
        if (node.ownerDocument !== document)
          adopt(node, document);
        node.parentNode = this;
        knownBoundaries(next[PREV], node, next);
        baseChanged(this);
        moCallback(node, null);
        connectedCallback(node);
        break;
      case DOCUMENT_FRAGMENT_NODE: {
        let {[PRIVATE]: parentNode, firstChild, lastChild} = node;
        if (firstChild) {
          knownSegment(next[PREV], firstChild, lastChild, next);
          baseChanged(this);
          knownAdjacent(node, node[END]);
          if (parentNode)
            parentNode.replaceChildren();
          do {
            if (firstChild.ownerDocument !== document)
              adopt(firstChild, document);
            firstChild.parentNode = this;
            moCallback(firstChild, null);
            if (firstChild.nodeType === ELEMENT_NODE)
              connectedCallback(firstChild);
          } while (
            firstChild !== lastChild &&
            (firstChild = nextSibling(firstChild))
          );
        }
        break;
      }
      case TEXT_NODE:
      case COMMENT_NODE:
      case CDATA_SECTION_NODE:
        node.remove();
      /* eslint no-fallthrough:0 */
      // this covers DOCUMENT_TYPE_NODE too
      default:
        if (node.ownerDocument !== document)
          adopt(node, document);
        node.parentNode = this;
        knownSiblings(next[PREV], node, next);
        moCallback(node, null);
        break;
    }
    return node;
  }

  normalize() {
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end) {
      const {[NEXT]: $next, [PREV]: $prev, nodeType} = next;
      if (nodeType === TEXT_NODE) {
        if (!next[VALUE])
          next.remove();
        else if ($prev && $prev.nodeType === TEXT_NODE) {
          $prev.textContent += next.textContent;
          next.remove();
        }
      }
      next = $next;
    }
  }

  removeChild(node) {
    if (node.parentNode !== this)
      throw new Error('node is not a child');
    node.remove();
    return node;
  }

  replaceChild(node, replaced) {
    const next = getEnd(replaced)[NEXT];
    replaced.remove();
    this.insertBefore(node, next);
    return replaced;
  }
}
