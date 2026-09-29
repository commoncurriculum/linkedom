'use strict';
const {CONTENT, TEMPLATE_DOCUMENT} = require('../shared/symbols.js');

const {HTMLElement} = require('./element.js');

const tagName = 'template';

/**
 * @implements globalThis.HTMLTemplateElement
 */
class HTMLTemplateElement extends HTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, tagName);
    this[CONTENT] = this.ownerDocument[TEMPLATE_DOCUMENT].createDocumentFragment();
  }

  get content() {
    return this[CONTENT];
  }
}

exports.HTMLTemplateElement = HTMLTemplateElement;
