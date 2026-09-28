// cssstyle is the CSSStyleDeclaration jsdom used until it folded it in: it
// parses declarations and normalizes their values as browsers do.

import {CSSStyleDeclaration as Declarations} from 'cssstyle';

import {quietly, styleChanged} from '../shared/attributes.js';

// cssstyle exposes the indexed properties browsers iterate over, but no iterator.
class CSSStyleDeclaration extends Declarations {
  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++)
      yield this.item(i);
  }
}

/**
 * @param {Element} element
 * @returns {CSSStyleDeclaration} the declarations of the element's style attribute
 */
export const styleOf = element => {
  const style = new CSSStyleDeclaration(cssText => styleChanged(element, cssText));
  const attribute = element.getAttributeNodeNS(null, 'style');
  if (attribute)
    quietly(() => { style.cssText = attribute.value; });
  return style;
};
