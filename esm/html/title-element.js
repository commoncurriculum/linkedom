import {HTMLElement} from './element.js';

const tagName = 'title';

/**
 * @implements globalThis.HTMLTitleElement
 */
class HTMLTitleElement extends HTMLElement {
  constructor(ownerDocument, localName = tagName) {
    super(ownerDocument, localName);
  }
}

export {HTMLTitleElement};
