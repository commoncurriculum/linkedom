import {ELEMENT_NODE, HTML_NAMESPACE} from './constants.js';
import {MIME} from './symbols.js';
import {ignoreCase} from './utils.js';
import {parseHTMLDocument, parseHTMLFragment} from './parse-html.js';
import {parseXML} from './parse-xml.js';

/**
 * @param {Document} document an empty document
 * @param {string} markup
 * @returns {Document}
 */
export const parseDocument = (document, markup) => document[MIME].ignoreCase ?
  parseHTMLDocument(document, markup) :
  parseXML(document, markup);

/**
 * @param {Element} context the element the markup is parsed for
 * @param {string?} markup
 * @returns {DocumentFragment}
 */
export const parseFragment = (context, markup) => {
  markup = markup === null ? '' : String(markup);
  return ignoreCase(context) ?
    parseHTMLFragment(context, markup) :
    parseXML(context.ownerDocument.createDocumentFragment(), markup, context);
};

/**
 * https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-element-insertadjacenthtml
 * @param {Node} node where the markup goes
 * @returns {Element} the node, or a body element in place of a non-element or an html element
 */
export const fragmentContext = node => (
  node.nodeType === ELEMENT_NODE &&
  !(ignoreCase(node) && node.localName === 'html' && node.namespaceURI === HTML_NAMESPACE)
) ? node : (node.ownerDocument || node).createElement('body');
