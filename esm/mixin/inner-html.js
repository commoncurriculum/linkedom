import {ELEMENT_NODE, HTML_NAMESPACE} from '../shared/constants.js';
import {parseHTMLFragment} from '../shared/parse-html.js';
import {parseXML} from '../shared/parse-xml.js';
import {innerHTML, isTemplate} from '../shared/serialize-html.js';
import {serializeXML} from '../shared/serialize-xml.js';
import {ignoreCase} from '../shared/utils.js';

/**
 * The context insertAdjacentHTML and the outerHTML setter parse in: a body
 * element in place of a non-element or an html element.
 * @param {Node} node
 * @returns {Element}
 */
export const adjacentContext = node => (
  node.nodeType === ELEMENT_NODE &&
  !(ignoreCase(node) && node.localName === 'html' && node.namespaceURI === HTML_NAMESPACE)
) ? node : node.ownerDocument.createElement('body');

/**
 * @param {Element} context the element the markup is parsed for
 * @param {String} html
 * @returns {DocumentFragment}
 */
export const parseFragment = (context, html) => {
  html = html === null ? '' : String(html);
  if (ignoreCase(context))
    return parseHTMLFragment(context, html);
  return parseXML(context.ownerDocument.createDocumentFragment(), html, context);
};

/**
 * @param {Node} node
 * @returns {String}
 */
export const getInnerHtml = node => ignoreCase(node) ?
  innerHTML(node) :
  node.childNodes.map(child => serializeXML(child, true)).join('');

/**
 * @param {Element|ShadowRoot} node
 * @param {String} html
 */
export const setInnerHtml = (node, html) => {
  const fragment = parseFragment(node.nodeType === ELEMENT_NODE ? node : node.host, html);
  (node.nodeType === ELEMENT_NODE && isTemplate(node) ? node.content : node).replaceChildren(fragment);
};
