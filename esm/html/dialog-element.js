import {HTMLElement} from './element.js';

/**
 * @implements globalThis.HTMLDialogElement
 */
export class HTMLDialogElement extends HTMLElement {
  constructor(ownerDocument, localName = 'dialog') {
    super(ownerDocument, localName);
  }
}
