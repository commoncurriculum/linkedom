'use strict';
const {ELEMENT_NODE, HTML_NAMESPACE} = require('../shared/constants.js');
const {parseHTMLFragment} = require('../shared/parse-html.js');
const {parseXML} = require('../shared/parse-xml.js');
const {innerHTML, isTemplate} = require('../shared/serialize-html.js');
const {serializeXML} = require('../shared/serialize-xml.js');
const {ignoreCase} = require('../shared/utils.js');

/**
 * The context insertAdjacentHTML and the outerHTML setter parse in: a body
 * element in place of a non-element or an html element.
 * @param {Node} node
 * @returns {Element}
 */
const adjacentContext = node => (
  node.nodeType === ELEMENT_NODE &&
  !(ignoreCase(node) && node.localName === 'html' && node.namespaceURI === HTML_NAMESPACE)
) ? node : node.ownerDocument.createElement('body');
exports.adjacentContext = adjacentContext;

/**
 * @param {Element} context the element the markup is parsed for
 * @param {String} html
 * @returns {DocumentFragment}
 */
const parseFragment = (context, html) => {
  html = html === null ? '' : String(html);
  if (ignoreCase(context))
    return parseHTMLFragment(context, html);
  return parseXML(context.ownerDocument.createDocumentFragment(), html, context);
};
exports.parseFragment = parseFragment;

/**
 * @param {Node} node
 * @returns {String}
 */
const getInnerHtml = node => ignoreCase(node) ?
  innerHTML(node) :
  node.childNodes.map(child => serializeXML(child, true)).join('');
exports.getInnerHtml = getInnerHtml;

/**
 * @param {Element|ShadowRoot} node
 * @param {String} html
 */
const setInnerHtml = (node, html) => {
  const fragment = parseFragment(node.nodeType === ELEMENT_NODE ? node : node.host, html);
  (node.nodeType === ELEMENT_NODE && isTemplate(node) ? node.content : node).replaceChildren(fragment);
};
exports.setInnerHtml = setInnerHtml;
