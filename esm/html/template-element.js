import {CONTENT} from '../shared/symbols.js';

import {registerHTMLClass} from '../shared/register-html-class.js';

import {HTMLElement} from './element.js';

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
}

registerHTMLClass(tagName, HTMLTemplateElement);

export {HTMLTemplateElement};
