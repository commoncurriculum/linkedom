import {MATHML_NAMESPACE} from '../shared/constants.js';

import {ElementCSSInlineStyle} from '../mixin/element-css-inline-style.js';

/**
 * @implements globalThis.MathMLElement
 */
export class MathMLElement extends ElementCSSInlineStyle {
  get namespaceURI() {
    return MATHML_NAMESPACE;
  }
}
