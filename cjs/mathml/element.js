'use strict';
const {MATHML_NAMESPACE} = require('../shared/constants.js');

const {ElementCSSInlineStyle} = require('../mixin/element-css-inline-style.js');

/**
 * @implements globalThis.MathMLElement
 */
class MathMLElement extends ElementCSSInlineStyle {
  get namespaceURI() {
    return MATHML_NAMESPACE;
  }
}
exports.MathMLElement = MathMLElement
