'use strict';
const {
  NODE_END,
  ELEMENT_NODE,
  ATTRIBUTE_NODE,
  TEXT_NODE,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE,
  DOCUMENT_FRAGMENT_NODE,
  HTML_NAMESPACE,
  SVG_NAMESPACE
} = require('./constants.js');

const {CREATE_ELEMENT} = require('./symbols.js');

const {linkAttribute, linkNode} = require('./utils.js');

const {Attr} = require('../interface/attr.js');
const {CDATASection} = require('../interface/cdata-section.js');
const {Comment} = require('../interface/comment.js');
const {DocumentType} = require('../interface/document-type.js');
const {Text} = require('../interface/text.js');

const {HTMLDocument} = require('../html/document.js');

const {parse} = JSON;

/**
 * @typedef {number|string} jsdonValue - either a node type or its content
 */

/**
 * Given a stringified, or arrayfied DOM element, returns an HTMLDocument
 * that represent the content of such string, or array.
 * @param {string|jsdonValue[]} value
 * @returns {HTMLDocument}
 */
const parseJSON = value => {
  const array = typeof value === 'string' ? parse(value) : value;
  const {length} = array;
  const document = new HTMLDocument;
  let parentNode = document, i = 0;
  while (i < length) {
    let nodeType = array[i++];
    switch (nodeType) {
      case ELEMENT_NODE: {
        const localName = array[i++];
        const svg = localName === 'svg' || localName === 'SVG' || parentNode.namespaceURI === SVG_NAMESPACE;
        const element = document[CREATE_ELEMENT](svg ? SVG_NAMESPACE : HTML_NAMESPACE, localName);
        linkNode(parentNode, element);
        parentNode = element;
        break;
      }
      case ATTRIBUTE_NODE: {
        const name = array[i++];
        const value = typeof array[i] === 'string' ? array[i++] : '';
        linkAttribute(parentNode, new Attr(document, name, value));
        break;
      }
      case TEXT_NODE:
        linkNode(parentNode, new Text(document, array[i++]));
        break;
      case COMMENT_NODE:
        linkNode(parentNode, new Comment(document, array[i++]));
        break;
      case CDATA_SECTION_NODE:
        linkNode(parentNode, new CDATASection(document, array[i++]));
        break;
      case DOCUMENT_TYPE_NODE: {
        const args = [document];
        while (typeof array[i] === 'string')
          args.push(array[i++]);
        if (args.length === 3 && /\.dtd$/i.test(args[2]))
          args.splice(2, 0, '');
        linkNode(parentNode, new DocumentType(...args));
        break;
      }
      case DOCUMENT_FRAGMENT_NODE:
        parentNode = document.createDocumentFragment();
      /* eslint no-fallthrough:0 */
      case DOCUMENT_NODE:
        break;
      default:
        do {
          nodeType -= NODE_END;
          parentNode = parentNode.parentNode || parentNode;
        } while (nodeType < 0);
        break;
    }
  }
  switch (i && array[0]) {
    case ELEMENT_NODE:
      return document.firstElementChild;
    case DOCUMENT_FRAGMENT_NODE:
      return parentNode;
  }
  return document;
};
exports.parseJSON = parseJSON;

/**
 * 
 * @param {Document|Element} node the Document or Element to serialize
 * @returns {jsdonValue[]} the linear jsdon serialized array
 */
const toJSON = node => node.toJSON();
exports.toJSON = toJSON;
