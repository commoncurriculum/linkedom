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
  const fragment = parseFragment(node.nodeType === ELEMENT_NODE ? node : node.host, html);
  (node.nodeType === ELEMENT_NODE && isTemplate(node) ? node.content : node).replaceChildren(fragment);
};
exports.setInnerHtml = setInnerHtml;
