'use strict';
const {HTMLElement} = require('./element.js');

/**
 * @implements globalThis.HTMLDialogElement
 */
class HTMLDialogElement extends HTMLElement {
  constructor(ownerDocument, localName = 'dialog') {
    super(ownerDocument, localName);
  }
}
exports.HTMLDialogElement = HTMLDialogElement
