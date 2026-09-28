'use strict';
const {CONTENT} = require('../shared/symbols.js');

const {registerHTMLClass} = require('../shared/register-html-class.js');

const {HTMLElement} = require('./element.js');

const tagName = 'template';

/**
 * @implements globalThis.HTMLTemplateElement
 */
class HTMLTemplateElement extends HTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, tagName);
    this[CONTENT] = this.ownerDocument.createDocumentFragment();
  }

  get content() {
    return this[CONTENT];
  }

  cloneNode(deep = false) {
    const clone = super.cloneNode(deep);
    if (deep) {
      for (const child of this[CONTENT].childNodes)
        clone[CONTENT].appendChild(child.cloneNode(true));
    }
    return clone;
  }
}

registerHTMLClass(tagName, HTMLTemplateElement);

exports.HTMLTemplateElement = HTMLTemplateElement;
