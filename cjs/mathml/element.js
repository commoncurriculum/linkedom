'use strict';
const {MATHML_NAMESPACE} = require('../shared/constants.js');
const {STYLE} = require('../shared/symbols.js');

const {Element} = require('../interface/element.js');
const {styleOf} = require('../interface/css-style-declaration.js');

/**
 * @implements globalThis.MathMLElement
 */
class MathMLElement extends Element {
  get namespaceURI() {
    return MATHML_NAMESPACE;
  }

  get style() {
    return this[STYLE] || (this[STYLE] = styleOf(this));
  }
}
exports.MathMLElement = MathMLElement
