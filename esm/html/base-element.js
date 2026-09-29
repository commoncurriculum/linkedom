import {ATTRIBUTE_CHANGED} from '../shared/symbols.js';
import {baseChanged} from '../shared/url.js';

import {HTMLElement} from './element.js';

/**
 * @implements globalThis.HTMLBaseElement
 */
export class HTMLBaseElement extends HTMLElement {
  constructor(ownerDocument, localName = 'base') {
    super(ownerDocument, localName);
    // The parser inserts elements without insertBefore, which would forget the base.
    baseChanged(this);
  }

  [ATTRIBUTE_CHANGED](attribute, value) {
    super[ATTRIBUTE_CHANGED](attribute, value);
    if (attribute.localName === 'href' && attribute.namespaceURI === null)
      baseChanged(this);
  }
}
