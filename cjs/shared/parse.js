'use strict';
const {ELEMENT_NODE, HTML_NAMESPACE} = require('./constants.js');
const {MIME} = require('./symbols.js');
const {ignoreCase} = require('./utils.js');
const {parseHTMLDocument, parseHTMLFragment} = require('./parse-html.js');
const {parseXML} = require('./parse-xml.js');

/**
 * @param {Document} document an empty document
 * @param {string} markup
 * @returns {Document}
 */
const parseDocument = (document, markup) => document[MIME].ignoreCase ?
  parseHTMLDocument(document, markup) :
  parseXML(document, markup);
exports.parseDocument = parseDocument;

/**
 * @param {Element} context the element the markup is parsed for
 * @param {string?} markup
 * @param {Document} document the document of the nodes
 * @returns {DocumentFragment}
 */
const parseFragment = (context, markup, document = context.ownerDocument) => {
  markup = markup === null ? '' : String(markup);
  return ignoreCase(context) ?
    parseHTMLFragment(context, markup, document) :
    parseXML(document.createDocumentFragment(), markup, context);
};
exports.parseFragment = parseFragment;

/**
 * https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-element-insertadjacenthtml
 * @param {Node} node where the markup goes
 * @returns {Element} the node, or a body element in place of a non-element or an html element
 */
const fragmentContext = node => (
  node.nodeType === ELEMENT_NODE &&
  !(ignoreCase(node) && node.localName === 'html' && node.namespaceURI === HTML_NAMESPACE)
) ? node : (node.ownerDocument || node).createElement('body');
exports.fragmentContext = fragmentContext;
