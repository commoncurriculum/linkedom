'use strict';
const {HTMLElement} = require('./element.js');

/**
 * @implements globalThis.HTMLTableSectionElement
 */
class HTMLTableSectionElement extends HTMLElement {
  constructor(ownerDocument, localName = 'tbody') {
    super(ownerDocument, localName);
  }
}
exports.HTMLTableSectionElement = HTMLTableSectionElement
