'use strict';
const {ELEMENT_NODE} = require('../shared/constants.js');
const {parseFragment} = require('../shared/parse.js');
const {innerHTML, isTemplate} = require('../shared/serialize-html.js');
const {serializeXML} = require('../shared/serialize-xml.js');
const {ignoreCase} = require('../shared/utils.js');

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
  const isElement = node.nodeType === ELEMENT_NODE;
  const target = isElement && isTemplate(node) ? node.content : node;
  target.replaceChildren(parseFragment(isElement ? node : node.host, html, target.ownerDocument));
};
exports.setInnerHtml = setInnerHtml;
