// parse5 runs the HTML standard's tokenizer and tree builder; this adapter
// builds linkedom's nodes straight into their linked list.

import {parse, parseFragment} from 'parse5';

import {
  ATTRIBUTE_NODE,
  COMMENT_NODE,
  DOCUMENT_TYPE_NODE,
  ELEMENT_NODE,
  HTML_NAMESPACE,
  SVG_NAMESPACE,
  TEXT_NODE
} from './constants.js';

import {CREATE_ELEMENT, CUSTOM_ELEMENTS, DOCTYPE, END, MODE, NEXT, PREV, VALUE} from './symbols.js';
import {getEnd, knownAdjacent, knownBoundaries, knownSiblings} from './utils.js';

import {Attr} from '../interface/attr.js';
import {attributeChangedCallback, connectedCallback} from '../interface/custom-element-registry.js';

const options = {scriptingEnabled: false};

const attributes = function* (element) {
  let next = element[NEXT];
  while (next.nodeType === ATTRIBUTE_NODE) {
    yield next;
    next = next[NEXT];
  }
};

class Adapter {
  constructor(document) {
    this.document = document;
    this.active = document[CUSTOM_ELEMENTS].active;
  }

  createDocument() { return this.document; }
  createDocumentFragment() { return this.document.createDocumentFragment(); }
  createCommentNode(data) { return this.document.createComment(data); }
  createTextNode(data) { return this.document.createTextNode(data); }

  createElement(localName, namespace, attrs) {
    const {document, active} = this;
    let element = null;
    if (active && namespace === HTML_NAMESPACE) {
      const {registry} = document[CUSTOM_ELEMENTS];
      const is = localName.includes('-') ? localName : (attrs.find(({name}) => name === 'is')?.value || '');
      if (is && registry.has(is)) {
        const {Class} = registry.get(is);
        element = new Class;
        attrs = attrs.filter(({name}) => name !== 'is');
      }
    }
    element = element || document[CREATE_ELEMENT](namespace, localName);
    const end = element[END];
    for (const attr of attrs)
      this.addAttribute(element, attr, end[PREV]);
    return element;
  }

  addAttribute(element, {name: localName, value, namespace, prefix}, last) {
    const name = prefix ? `${prefix}:${localName}` : localName;
    const attribute = new Attr(this.document, name, value, namespace || null, prefix || null, localName);
    attribute.ownerElement = element;
    knownSiblings(last, attribute, last[NEXT]);
    if (this.active)
      attributeChangedCallback(element, name, null, value);
  }

  appendChild(parentNode, node) {
    this.insertBefore(parentNode, node, parentNode[END]);
  }

  insertBefore(parentNode, node, reference) {
    node.parentNode = parentNode;
    knownBoundaries(reference[PREV], node, reference);
    if (node.nodeType === ELEMENT_NODE) {
      if (node.namespaceURI === SVG_NAMESPACE && parentNode.namespaceURI === SVG_NAMESPACE)
        node.ownerSVGElement = parentNode.localName === 'svg' ? parentNode : parentNode.ownerSVGElement;
      if (this.active)
        connectedCallback(node);
    }
  }

  detachNode(node) {
    if (!node.parentNode)
      return;
    const end = getEnd(node);
    knownAdjacent(node[PREV], end[NEXT]);
    node[PREV] = end[NEXT] = node.parentNode = null;
  }

  insertText(parentNode, text) {
    this.insertTextBefore(parentNode, text, parentNode[END]);
  }

  insertTextBefore(parentNode, text, reference) {
    const previous = reference[PREV];
    if (previous.nodeType === TEXT_NODE)
      previous[VALUE] += text;
    else
      this.insertBefore(parentNode, this.createTextNode(text), reference);
  }

  // The standard adds only the attributes the element doesn't have yet, where
  // jsdom overwrites them.
  adoptAttributes(element, attrs) {
    for (const attr of attrs) {
      let last = element;
      for (const attribute of attributes(element)) {
        if (attribute.localName === attr.name) {
          last = null;
          break;
        }
        last = attribute;
      }
      if (last)
        this.addAttribute(element, attr, last);
    }
  }

  setTemplateContent() {}
  getTemplateContent(template) { return template.content; }

  setDocumentType(document, name, publicId, systemId) {
    const doctype = document.createDocumentType(name, publicId || '', systemId || '');
    document[DOCTYPE] = doctype;
    this.appendChild(document, doctype);
  }

  setDocumentMode(document, mode) { document[MODE] = mode; }
  getDocumentMode(document) { return document[MODE]; }

  getFirstChild(node) { return node.firstChild; }
  getChildNodes(node) { return node.childNodes; }
  getParentNode(node) { return node.parentNode; }

  getAttrList(element) {
    return [...attributes(element)].map(({localName, [VALUE]: value, namespaceURI, prefix}) => ({
      name: localName, value, namespace: namespaceURI, prefix
    }));
  }

  getTagName(element) { return element.localName; }
  getNamespaceURI(element) { return element.namespaceURI; }
  getTextNodeContent(node) { return node[VALUE]; }
  getCommentNodeContent(node) { return node[VALUE]; }
  getDocumentTypeNodeName(node) { return node.name; }
  getDocumentTypeNodePublicId(node) { return node.publicId; }
  getDocumentTypeNodeSystemId(node) { return node.systemId; }

  isTextNode(node) { return node.nodeType === TEXT_NODE; }
  isCommentNode(node) { return node.nodeType === COMMENT_NODE; }
  isDocumentTypeNode(node) { return node.nodeType === DOCUMENT_TYPE_NODE; }
  isElementNode(node) { return node.nodeType === ELEMENT_NODE; }

  setNodeSourceCodeLocation() {}
  getNodeSourceCodeLocation() { return null; }
  updateNodeSourceCodeLocation() {}
}

/**
 * @param {Document} document an empty HTML document
 * @param {string} html
 */
export const parseHTMLDocument = (document, html) => {
  parse(html, {...options, treeAdapter: new Adapter(document)});
  return document;
};

/**
 * @param {Element} context the element whose children the markup becomes
 * @param {string} html
 * @returns {DocumentFragment}
 */
export const parseHTMLFragment = (context, html) =>
  parseFragment(context, html, {...options, treeAdapter: new Adapter(context.ownerDocument)});
