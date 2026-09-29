// https://html.spec.whatwg.org/multipage/parsing.html#serialising-html-fragments

import {
  ATTRIBUTE_NODE,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  DOCUMENT_TYPE_NODE,
  ELEMENT_NODE,
  HTML_NAMESPACE,
  MATHML_NAMESPACE,
  NODE_END,
  SVG_NAMESPACE,
  TEXT_NODE,
  XLINK_NAMESPACE,
  XML_NAMESPACE,
  XMLNS_NAMESPACE
} from './constants.js';

import {CONTENT, END, NEXT, PREV, START, VALUE} from './symbols.js';

const voidElements = new Set([
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'embed', 'frame', 'hr',
  'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

// noscript is not here: linkedom documents have scripting disabled, as a DOMParser's do.
const rawTextElements = new Set([
  'style', 'script', 'xmp', 'iframe', 'noembed', 'noframes', 'plaintext'
]);

const escapes = {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;', '\xA0': '&nbsp;'};

// https://html.spec.whatwg.org/multipage/parsing.html#escapingString
const escaper = characters => value => {
  characters.lastIndex = 0;
  if (!characters.test(value))
    return value;
  let escaped = '', last = 0;
  do {
    const index = characters.lastIndex - 1;
    escaped += value.slice(last, index) + escapes[value[index]];
    last = index + 1;
  } while (characters.test(value));
  return escaped + value.slice(last);
};

const escapeText = escaper(/[&<>\xA0]/g);
const escapeAttribute = escaper(/["&<>\xA0]/g);

export const isVoidElement = element =>
  voidElements.has(element.localName) && element.namespaceURI === HTML_NAMESPACE;

export const isTemplate = element =>
  element.localName === 'template' && element.namespaceURI === HTML_NAMESPACE;

const tagName = element => {
  const {namespaceURI, localName} = element;
  if (namespaceURI === HTML_NAMESPACE || namespaceURI === SVG_NAMESPACE || namespaceURI === MATHML_NAMESPACE)
    return localName;
  const {prefix} = element;
  return prefix ? `${prefix}:${localName}` : localName;
};

const attributeName = ({namespaceURI, localName, name}) => {
  switch (namespaceURI) {
    case null: return localName;
    case XML_NAMESPACE: return `xml:${localName}`;
    case XMLNS_NAMESPACE: return localName === 'xmlns' ? localName : `xmlns:${localName}`;
    case XLINK_NAMESPACE: return `xlink:${localName}`;
  }
  return name;
};

/**
 * @param {Attr} attribute
 * @returns {string} the attribute as its element's start tag writes it
 */
export const serializeAttribute = attribute =>
  `${attributeName(attribute)}="${escapeAttribute(attribute[VALUE])}"`;

const isRawText = ({parentNode}) =>
  parentNode !== null &&
  parentNode.nodeType === ELEMENT_NODE &&
  rawTextElements.has(parentNode.localName) &&
  parentNode.namespaceURI === HTML_NAMESPACE;

/**
 * Serializes the nodes from `first` to `last`, both included, where `last` is
 * a leaf or the end of an element whose start was already walked.
 */
const serialize = (first, last) => {
  let html = '';
  let node = first;
  for (;;) {
    switch (node.nodeType) {
      case ELEMENT_NODE: {
        const name = tagName(node);
        html += `<${name}`;
        let next = node[NEXT];
        while (next.nodeType === ATTRIBUTE_NODE) {
          html += ' ' + serializeAttribute(next);
          next = next[NEXT];
        }
        html += '>';
        if (isVoidElement(node))
          node = node[END];
        else if (isTemplate(node)) {
          html += `${innerHTML(node[CONTENT])}</${name}>`;
          node = node[END];
        }
        else
          node = next[PREV];
        break;
      }
      case NODE_END:
        html += `</${tagName(node[START])}>`;
        break;
      case TEXT_NODE:
      case CDATA_SECTION_NODE:
        html += isRawText(node) ? node[VALUE] : escapeText(node[VALUE]);
        break;
      case COMMENT_NODE:
        html += `<!--${node[VALUE]}-->`;
        break;
      case DOCUMENT_TYPE_NODE:
        html += `<!DOCTYPE ${node.name}>`;
        break;
    }
    if (node === last)
      return html;
    node = node[NEXT];
  }
};

/**
 * @param {Node} node an element, a document or a fragment
 * @returns {string} the serialization of its children
 */
export const innerHTML = node => {
  if (node.nodeType === ELEMENT_NODE) {
    if (isVoidElement(node))
      return '';
    if (isTemplate(node))
      node = node[CONTENT];
  }
  let first = node[NEXT];
  while (first.nodeType === ATTRIBUTE_NODE)
    first = first[NEXT];
  const end = node[END];
  return first === end ? '' : serialize(first, end[PREV]);
};

/**
 * @param {Node} node any node
 * @returns {string} its serialization
 */
export const outerHTML = node => serialize(node, node.nodeType === ELEMENT_NODE ? node[END] : node);
