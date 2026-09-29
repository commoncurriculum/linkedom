'use strict';
const {HTMLElement} = require('./element.js');

/**
 * @implements globalThis.HTMLTableColElement
 */
class HTMLTableColElement extends HTMLElement {
  constructor(ownerDocument, localName = 'col') {
    super(ownerDocument, localName);
  }
}
exports.HTMLTableColElement = HTMLTableColElement
