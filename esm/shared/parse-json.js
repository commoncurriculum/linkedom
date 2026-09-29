import {
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
} from './constants.js';

import {CREATE_ELEMENT, DOM_PARSER} from './symbols.js';

import {linkAttribute, linkNode} from './utils.js';

import {Attr} from '../interface/attr.js';
import {CDATASection} from '../interface/cdata-section.js';
import {Comment} from '../interface/comment.js';
import {DocumentType} from '../interface/document-type.js';
import {Text} from '../interface/text.js';

import {DOMParser} from '../dom/parser.js';
import {HTMLDocument} from '../html/document.js';

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
export const parseJSON = value => {
  const array = typeof value === 'string' ? parse(value) : value;
  const {length} = array;
  const document = new HTMLDocument;
  document[DOM_PARSER] = DOMParser;
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

/**
 * 
 * @param {Document|Element} node the Document or Element to serialize
 * @returns {jsdonValue[]} the linear jsdon serialized array
 */
export const toJSON = node => node.toJSON();
