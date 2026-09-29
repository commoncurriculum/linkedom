import {stringAttribute} from '../shared/attributes.js';
import {hyperlinkHref} from '../shared/url.js';

import {HTMLElement} from './element.js';

/**
 * @implements globalThis.HTMLAreaElement
 */
export class HTMLAreaElement extends HTMLElement {
  constructor(ownerDocument, localName = 'area') {
    super(ownerDocument, localName);
  }

  get href() { return hyperlinkHref(this); }
  set href(value) { stringAttribute.set(this, 'href', value); }
}
