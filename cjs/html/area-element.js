'use strict';
const {stringAttribute} = require('../shared/attributes.js');
const {hyperlinkHref} = require('../shared/url.js');

const {HTMLElement} = require('./element.js');

/**
 * @implements globalThis.HTMLAreaElement
 */
class HTMLAreaElement extends HTMLElement {
  constructor(ownerDocument, localName = 'area') {
    super(ownerDocument, localName);
  }

  get href() { return hyperlinkHref(this); }
  set href(value) { stringAttribute.set(this, 'href', value); }
}
exports.HTMLAreaElement = HTMLAreaElement
