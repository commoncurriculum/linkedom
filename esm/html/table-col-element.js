import {HTMLElement} from './element.js';

/**
 * @implements globalThis.HTMLTableColElement
 */
export class HTMLTableColElement extends HTMLElement {
  constructor(ownerDocument, localName = 'col') {
    super(ownerDocument, localName);
  }
}
