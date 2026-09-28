import {MATHML_NAMESPACE} from '../shared/constants.js';
import {STYLE} from '../shared/symbols.js';

import {Element} from '../interface/element.js';
import {styleOf} from '../interface/css-style-declaration.js';

/**
 * @implements globalThis.MathMLElement
 */
export class MathMLElement extends Element {
  get namespaceURI() {
    return MATHML_NAMESPACE;
  }

  get style() {
    return this[STYLE] || (this[STYLE] = styleOf(this));
  }
}
