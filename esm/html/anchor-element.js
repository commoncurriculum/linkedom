import {registerHTMLClass} from '../shared/register-html-class.js';
import {stringAttribute} from '../shared/attributes.js';
import {hyperlinkHref} from '../shared/url.js';

import {HTMLElement} from './element.js';

const tagName = 'a';

/**
 * @implements globalThis.HTMLAnchorElement
 */
class HTMLAnchorElement extends HTMLElement {
  constructor(ownerDocument, localName = tagName) {
    super(ownerDocument, localName);
  }

  get href() { return hyperlinkHref(this); }
  set href(value) { stringAttribute.set(this, 'href', value); }

  /* c8 ignore start */
  get download() { return stringAttribute.get(this, 'download'); }
  set download(value) { stringAttribute.set(this, 'download', value); }

  get target() { return stringAttribute.get(this, 'target'); }
  set target(value) { stringAttribute.set(this, 'target', value); }

  get type() { return stringAttribute.get(this, 'type'); }
  set type(value) { stringAttribute.set(this, 'type', value); }

  get rel() { return stringAttribute.get(this, 'rel'); }
  set rel(value) { stringAttribute.set(this, 'rel', value); }
  /* c8 ignore stop */

}

registerHTMLClass(tagName, HTMLAnchorElement);

export {HTMLAnchorElement};
