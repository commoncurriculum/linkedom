'use strict';
// https://drafts.csswg.org/cssom/#the-elementcssinlinestyle-mixin
// HTMLElement, SVGElement, MathMLElement

const {ATTRIBUTE_CHANGED, RESET, STYLE} = require('../shared/symbols.js');

const {Element} = require('../interface/element.js');
const {styleOf} = require('../interface/css-style-declaration.js');

class ElementCSSInlineStyle extends Element {
  get style() { return styleOf(this); }
  set style(value) { styleOf(this).cssText = value; }

  [ATTRIBUTE_CHANGED](attribute, value) {
    super[ATTRIBUTE_CHANGED](attribute, value);
    if (attribute.localName === 'style' && attribute.namespaceURI === null)
      this[STYLE]?.[RESET](value);
  }
}
exports.ElementCSSInlineStyle = ElementCSSInlineStyle
