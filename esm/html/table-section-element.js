import {HTMLElement} from './element.js';

/**
 * @implements globalThis.HTMLTableSectionElement
 */
export class HTMLTableSectionElement extends HTMLElement {
  constructor(ownerDocument, localName = 'tbody') {
    super(ownerDocument, localName);
  }
}
