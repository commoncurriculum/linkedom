'use strict';
const html = require('./html-classes.js');

const {Element} = require('../interface/element.js');
const {SVGElement} = require('../svg/element.js');
const {MathMLElement} = require('../mathml/element.js');

const {HTML_NAMESPACE, MATHML_NAMESPACE, SVG_NAMESPACE} = require('./constants.js');
const {isValidCustomElementName} = require('./names.js');

// https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
// https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features
const htmlInterfaces = new Map;
for (const [names, Class] of [
  [
    'abbr acronym address article aside b basefont bdi bdo big center cite code dd dfn dt em ' +
    'figcaption figure footer header hgroup i kbd main mark nav nobr noembed noframes noscript ' +
    'plaintext rb rp rt rtc ruby s samp search section small strike strong sub summary sup tt u var wbr',
    html.HTMLElement
  ],
  ['a', html.HTMLAnchorElement],
  ['area', html.HTMLAreaElement],
  ['audio', html.HTMLAudioElement],
  ['base', html.HTMLBaseElement],
  ['blockquote q', html.HTMLQuoteElement],
  ['body', html.HTMLBodyElement],
  ['br', html.HTMLBRElement],
  ['button', html.HTMLButtonElement],
  ['canvas', html.HTMLCanvasElement],
  ['caption', html.HTMLTableCaptionElement],
  ['col colgroup', html.HTMLTableColElement],
  ['data', html.HTMLDataElement],
  ['datalist', html.HTMLDataListElement],
  ['del ins', html.HTMLModElement],
  ['details', html.HTMLDetailsElement],
  ['dialog', html.HTMLDialogElement],
  ['dir', html.HTMLDirectoryElement],
  ['div', html.HTMLDivElement],
  ['dl', html.HTMLDListElement],
  ['embed', html.HTMLEmbedElement],
  ['fieldset', html.HTMLFieldSetElement],
  ['font', html.HTMLFontElement],
  ['form', html.HTMLFormElement],
  ['frame', html.HTMLFrameElement],
  ['frameset', html.HTMLFrameSetElement],
  ['h1 h2 h3 h4 h5 h6', html.HTMLHeadingElement],
  ['head', html.HTMLHeadElement],
  ['hr', html.HTMLHRElement],
  ['html', html.HTMLHtmlElement],
  ['iframe', html.HTMLIFrameElement],
  ['img', html.HTMLImageElement],
  ['input', html.HTMLInputElement],
  ['label', html.HTMLLabelElement],
  ['legend', html.HTMLLegendElement],
  ['li', html.HTMLLIElement],
  ['link', html.HTMLLinkElement],
  ['map', html.HTMLMapElement],
  ['marquee', html.HTMLMarqueeElement],
  ['menu', html.HTMLMenuElement],
  ['meta', html.HTMLMetaElement],
  ['meter', html.HTMLMeterElement],
  ['object', html.HTMLObjectElement],
  ['ol', html.HTMLOListElement],
  ['optgroup', html.HTMLOptGroupElement],
  ['option', html.HTMLOptionElement],
  ['output', html.HTMLOutputElement],
  ['p', html.HTMLParagraphElement],
  ['param', html.HTMLParamElement],
  ['picture', html.HTMLPictureElement],
  ['pre listing xmp', html.HTMLPreElement],
  ['progress', html.HTMLProgressElement],
  ['script', html.HTMLScriptElement],
  ['select', html.HTMLSelectElement],
  ['slot', html.HTMLSlotElement],
  ['source', html.HTMLSourceElement],
  ['span', html.HTMLSpanElement],
  ['style', html.HTMLStyleElement],
  ['table', html.HTMLTableElement],
  ['tbody tfoot thead', html.HTMLTableSectionElement],
  ['td th', html.HTMLTableCellElement],
  ['template', html.HTMLTemplateElement],
  ['textarea', html.HTMLTextAreaElement],
  ['time', html.HTMLTimeElement],
  ['title', html.HTMLTitleElement],
  ['tr', html.HTMLTableRowElement],
  ['track', html.HTMLTrackElement],
  ['ul', html.HTMLUListElement],
  ['video', html.HTMLVideoElement]
]) {
  for (const name of names.split(' '))
    htmlInterfaces.set(name, Class);
}

/**
 * @param {string?} namespace
 * @param {string} localName
 * @returns {typeof Element}
 */
const elementInterface = (namespace, localName) => {
  switch (namespace) {
    case HTML_NAMESPACE:
      return htmlInterfaces.get(localName) ||
        (isValidCustomElementName(localName) ? html.HTMLElement : html.HTMLUnknownElement);
    case SVG_NAMESPACE:
      return SVGElement;
    case MATHML_NAMESPACE:
      return MathMLElement;
  }
  return Element;
};
exports.elementInterface = elementInterface;
