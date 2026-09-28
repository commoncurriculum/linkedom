'use strict';
const {SVG_NAMESPACE} = require('../shared/constants.js');
const {ElementCSSInlineStyle} = require('../mixin/element-css-inline-style.js');

const classNames = new WeakMap;

const animatedClass = element => ({
  get baseVal() { return element.getAttribute('class') ?? ''; },
  set baseVal(value) { element.setAttribute('class', value); },
  get animVal() { return element.getAttribute('class') ?? ''; }
});

/**
 * @implements globalThis.SVGElement
 */
class SVGElement extends ElementCSSInlineStyle {
  // https://svgwg.org/svg2-draft/types.html#__svg__SVGElement__ownerSVGElement
  get ownerSVGElement() {
    let {parentElement} = this;
    while (parentElement) {
      if (parentElement.localName === 'svg' && parentElement.namespaceURI === SVG_NAMESPACE)
        return parentElement;
      ({parentElement} = parentElement);
    }
    return null;
  }

  get className() {
    if (!classNames.has(this))
      classNames.set(this, animatedClass(this));
    return classNames.get(this);
  }

  /* c8 ignore start */
  set className(value) {
    this.setAttribute('class', value);
  }
  /* c8 ignore stop */

  get namespaceURI() {
    return SVG_NAMESPACE;
  }
}
exports.SVGElement = SVGElement
