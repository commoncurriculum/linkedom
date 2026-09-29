// https://drafts.csswg.org/cssom/#the-elementcssinlinestyle-mixin
// HTMLElement, SVGElement, MathMLElement

import {ATTRIBUTE_CHANGED, RESET, STYLE} from '../shared/symbols.js';

import {Element} from '../interface/element.js';
import {styleOf} from '../interface/css-style-declaration.js';

export class ElementCSSInlineStyle extends Element {
  get style() { return styleOf(this); }
  set style(value) { styleOf(this).cssText = value; }

  [ATTRIBUTE_CHANGED](attribute, value) {
    super[ATTRIBUTE_CHANGED](attribute, value);
    if (attribute.localName === 'style' && attribute.namespaceURI === null)
      this[STYLE]?.[RESET](value);
  }
}
