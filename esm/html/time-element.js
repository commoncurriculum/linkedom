import {stringAttribute} from '../shared/attributes.js';

import {HTMLElement} from './element.js';

/**
 * @implements globalThis.HTMLTimeElement
 */
class HTMLTimeElement extends HTMLElement {
  constructor(ownerDocument, localName = 'time') {
    super(ownerDocument, localName);
  }

  /**
   * @type {string}
   */
  get dateTime() { return stringAttribute.get(this, 'datetime'); }
  set dateTime(value) { stringAttribute.set(this, 'datetime', value); }
}

export {HTMLTimeElement};
