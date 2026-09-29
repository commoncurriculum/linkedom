import {ELEMENT_NODE} from '../shared/constants.js';
import {parseFragment} from '../shared/parse.js';
import {innerHTML, isTemplate} from '../shared/serialize-html.js';
import {serializeXML} from '../shared/serialize-xml.js';
import {ignoreCase} from '../shared/utils.js';

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
  const isElement = node.nodeType === ELEMENT_NODE;
  const target = isElement && isTemplate(node) ? node.content : node;
  target.replaceChildren(parseFragment(isElement ? node : node.host, html, target.ownerDocument));
};
