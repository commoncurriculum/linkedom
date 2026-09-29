'use strict';
const {ATTRIBUTE_CHANGED} = require('../shared/symbols.js');
const {baseChanged} = require('../shared/url.js');

const {HTMLElement} = require('./element.js');

/**
 * @implements globalThis.HTMLBaseElement
 */
class HTMLBaseElement extends HTMLElement {
  constructor(ownerDocument, localName = 'base') {
    super(ownerDocument, localName);
    // The parser inserts elements without insertBefore, which would forget the base.
    baseChanged(this);
  }

  [ATTRIBUTE_CHANGED](attribute, value) {
    super[ATTRIBUTE_CHANGED](attribute, value);
    if (attribute.localName === 'href' && attribute.namespaceURI === null)
      baseChanged(this);
  }
}
exports.HTMLBaseElement = HTMLBaseElement
