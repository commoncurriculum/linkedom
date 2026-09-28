import {HTMLElement} from '../html/element.js';
import {HTMLTemplateElement} from '../html/template-element.js';
import {HTMLHtmlElement} from '../html/html-element.js';
import {HTMLScriptElement} from '../html/script-element.js';
import {HTMLFrameElement} from '../html/frame-element.js';
import {HTMLIFrameElement} from '../html/i-frame-element.js';
import {HTMLObjectElement} from '../html/object-element.js';
import {HTMLHeadElement} from '../html/head-element.js';
import {HTMLBodyElement} from '../html/body-element.js';
import {HTMLStyleElement} from '../html/style-element.js';
import {HTMLTimeElement} from '../html/time-element.js';
import {HTMLFieldSetElement} from '../html/field-set-element.js';
import {HTMLEmbedElement} from '../html/embed-element.js';
import {HTMLHRElement} from '../html/hr-element.js';
import {HTMLProgressElement} from '../html/progress-element.js';
import {HTMLParagraphElement} from '../html/paragraph-element.js';
import {HTMLTableElement} from '../html/table-element.js';
import {HTMLFrameSetElement} from '../html/frame-set-element.js';
import {HTMLLIElement} from '../html/li-element.js';
import {HTMLBaseElement} from '../html/base-element.js';
import {HTMLDataListElement} from '../html/data-list-element.js';
import {HTMLInputElement} from '../html/input-element.js';
import {HTMLParamElement} from '../html/param-element.js';
import {HTMLMediaElement} from '../html/media-element.js';
import {HTMLAudioElement} from '../html/audio-element.js';
import {HTMLHeadingElement} from '../html/heading-element.js';
import {HTMLDirectoryElement} from '../html/directory-element.js';
import {HTMLQuoteElement} from '../html/quote-element.js';
import {HTMLCanvasElement} from '../html/canvas-element.js';
import {HTMLLegendElement} from '../html/legend-element.js';
import {HTMLOptionElement} from '../html/option-element.js';
import {HTMLSpanElement} from '../html/span-element.js';
import {HTMLMeterElement} from '../html/meter-element.js';
import {HTMLVideoElement} from '../html/video-element.js';
import {HTMLTableCellElement} from '../html/table-cell-element.js';
import {HTMLTitleElement} from '../html/title-element.js';
import {HTMLOutputElement} from '../html/output-element.js';
import {HTMLTableRowElement} from '../html/table-row-element.js';
import {HTMLDataElement} from '../html/data-element.js';
import {HTMLMenuElement} from '../html/menu-element.js';
import {HTMLSelectElement} from '../html/select-element.js';
import {HTMLBRElement} from '../html/br-element.js';
import {HTMLButtonElement} from '../html/button-element.js';
import {HTMLMapElement} from '../html/map-element.js';
import {HTMLOptGroupElement} from '../html/opt-group-element.js';
import {HTMLDListElement} from '../html/d-list-element.js';
import {HTMLTextAreaElement} from '../html/text-area-element.js';
import {HTMLFontElement} from '../html/font-element.js';
import {HTMLDivElement} from '../html/div-element.js';
import {HTMLLinkElement} from '../html/link-element.js';
import {HTMLSlotElement} from '../html/slot-element.js';
import {HTMLFormElement} from '../html/form-element.js';
import {HTMLImageElement} from '../html/image-element.js';
import {HTMLPreElement} from '../html/pre-element.js';
import {HTMLUListElement} from '../html/u-list-element.js';
import {HTMLMetaElement} from '../html/meta-element.js';
import {HTMLPictureElement} from '../html/picture-element.js';
import {HTMLAreaElement} from '../html/area-element.js';
import {HTMLOListElement} from '../html/o-list-element.js';
import {HTMLTableCaptionElement} from '../html/table-caption-element.js';
import {HTMLAnchorElement} from '../html/anchor-element.js';
import {HTMLLabelElement} from '../html/label-element.js';
import {HTMLUnknownElement} from '../html/unknown-element.js';
import {HTMLModElement} from '../html/mod-element.js';
import {HTMLDetailsElement} from '../html/details-element.js';
import {HTMLSourceElement} from '../html/source-element.js';
import {HTMLTrackElement} from '../html/track-element.js';
import {HTMLMarqueeElement} from '../html/marquee-element.js';
import {HTMLTableColElement} from '../html/table-col-element.js';
import {HTMLTableSectionElement} from '../html/table-section-element.js';
import {HTMLDialogElement} from '../html/dialog-element.js';

import {Element} from '../interface/element.js';
import {SVGElement} from '../svg/element.js';
import {MathMLElement} from '../mathml/element.js';

import {HTML_NAMESPACE, MATHML_NAMESPACE, SVG_NAMESPACE} from './constants.js';
import {isValidCustomElementName} from './names.js';

// https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
// https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features
const htmlInterfaces = new Map;
for (const [names, Class] of [
  [
    'abbr acronym address article aside b basefont bdi bdo big center cite code dd dfn dt em ' +
    'figcaption figure footer header hgroup i kbd main mark nav nobr noembed noframes noscript ' +
    'plaintext rb rp rt rtc ruby s samp search section small strike strong sub summary sup tt u var wbr',
    HTMLElement
  ],
  ['a', HTMLAnchorElement],
  ['area', HTMLAreaElement],
  ['audio', HTMLAudioElement],
  ['base', HTMLBaseElement],
  ['blockquote q', HTMLQuoteElement],
  ['body', HTMLBodyElement],
  ['br', HTMLBRElement],
  ['button', HTMLButtonElement],
  ['canvas', HTMLCanvasElement],
  ['caption', HTMLTableCaptionElement],
  ['col colgroup', HTMLTableColElement],
  ['data', HTMLDataElement],
  ['datalist', HTMLDataListElement],
  ['del ins', HTMLModElement],
  ['details', HTMLDetailsElement],
  ['dialog', HTMLDialogElement],
  ['dir', HTMLDirectoryElement],
  ['div', HTMLDivElement],
  ['dl', HTMLDListElement],
  ['embed', HTMLEmbedElement],
  ['fieldset', HTMLFieldSetElement],
  ['font', HTMLFontElement],
  ['form', HTMLFormElement],
  ['frame', HTMLFrameElement],
  ['frameset', HTMLFrameSetElement],
  ['h1 h2 h3 h4 h5 h6', HTMLHeadingElement],
  ['head', HTMLHeadElement],
  ['hr', HTMLHRElement],
  ['html', HTMLHtmlElement],
  ['iframe', HTMLIFrameElement],
  ['img', HTMLImageElement],
  ['input', HTMLInputElement],
  ['label', HTMLLabelElement],
  ['legend', HTMLLegendElement],
  ['li', HTMLLIElement],
  ['link', HTMLLinkElement],
  ['map', HTMLMapElement],
  ['marquee', HTMLMarqueeElement],
  ['menu', HTMLMenuElement],
  ['meta', HTMLMetaElement],
  ['meter', HTMLMeterElement],
  ['object', HTMLObjectElement],
  ['ol', HTMLOListElement],
  ['optgroup', HTMLOptGroupElement],
  ['option', HTMLOptionElement],
  ['output', HTMLOutputElement],
  ['p', HTMLParagraphElement],
  ['param', HTMLParamElement],
  ['picture', HTMLPictureElement],
  ['pre listing xmp', HTMLPreElement],
  ['progress', HTMLProgressElement],
  ['script', HTMLScriptElement],
  ['select', HTMLSelectElement],
  ['slot', HTMLSlotElement],
  ['source', HTMLSourceElement],
  ['span', HTMLSpanElement],
  ['style', HTMLStyleElement],
  ['table', HTMLTableElement],
  ['tbody tfoot thead', HTMLTableSectionElement],
  ['td th', HTMLTableCellElement],
  ['template', HTMLTemplateElement],
  ['textarea', HTMLTextAreaElement],
  ['time', HTMLTimeElement],
  ['title', HTMLTitleElement],
  ['tr', HTMLTableRowElement],
  ['track', HTMLTrackElement],
  ['ul', HTMLUListElement],
  ['video', HTMLVideoElement]
]) {
  for (const name of names.split(' '))
    htmlInterfaces.set(name, Class);
}

/**
 * @param {string?} namespace
 * @param {string} localName
 * @returns {typeof Element} the interface of an element with this namespace and local name
 */
export const elementInterface = (namespace, localName) => {
  switch (namespace) {
    case HTML_NAMESPACE:
      return htmlInterfaces.get(localName) ||
        (isValidCustomElementName(localName) ? HTMLElement : HTMLUnknownElement);
    case SVG_NAMESPACE:
      return SVGElement;
    case MATHML_NAMESPACE:
      return MathMLElement;
  }
  return Element;
};

export {
  HTMLElement,
  HTMLTemplateElement,
  HTMLHtmlElement,
  HTMLScriptElement,
  HTMLFrameElement,
  HTMLIFrameElement,
  HTMLObjectElement,
  HTMLHeadElement,
  HTMLBodyElement,
  HTMLStyleElement,
  HTMLTimeElement,
  HTMLFieldSetElement,
  HTMLEmbedElement,
  HTMLHRElement,
  HTMLProgressElement,
  HTMLParagraphElement,
  HTMLTableElement,
  HTMLFrameSetElement,
  HTMLLIElement,
  HTMLBaseElement,
  HTMLDataListElement,
  HTMLInputElement,
  HTMLParamElement,
  HTMLMediaElement,
  HTMLAudioElement,
  HTMLHeadingElement,
  HTMLDirectoryElement,
  HTMLQuoteElement,
  HTMLCanvasElement,
  HTMLLegendElement,
  HTMLOptionElement,
  HTMLSpanElement,
  HTMLMeterElement,
  HTMLVideoElement,
  HTMLTableCellElement,
  HTMLTitleElement,
  HTMLOutputElement,
  HTMLTableRowElement,
  HTMLDataElement,
  HTMLMenuElement,
  HTMLSelectElement,
  HTMLBRElement,
  HTMLButtonElement,
  HTMLMapElement,
  HTMLOptGroupElement,
  HTMLDListElement,
  HTMLTextAreaElement,
  HTMLFontElement,
  HTMLDivElement,
  HTMLLinkElement,
  HTMLSlotElement,
  HTMLFormElement,
  HTMLImageElement,
  HTMLPreElement,
  HTMLUListElement,
  HTMLMetaElement,
  HTMLPictureElement,
  HTMLAreaElement,
  HTMLOListElement,
  HTMLTableCaptionElement,
  HTMLAnchorElement,
  HTMLLabelElement,
  HTMLUnknownElement,
  HTMLModElement,
  HTMLDetailsElement,
  HTMLSourceElement,
  HTMLTrackElement,
  HTMLMarqueeElement,
  HTMLTableColElement,
  HTMLTableSectionElement,
  HTMLDialogElement
};

export const HTMLClasses = {
  HTMLElement,
  HTMLTemplateElement,
  HTMLHtmlElement,
  HTMLScriptElement,
  HTMLFrameElement,
  HTMLIFrameElement,
  HTMLObjectElement,
  HTMLHeadElement,
  HTMLBodyElement,
  HTMLStyleElement,
  HTMLTimeElement,
  HTMLFieldSetElement,
  HTMLEmbedElement,
  HTMLHRElement,
  HTMLProgressElement,
  HTMLParagraphElement,
  HTMLTableElement,
  HTMLFrameSetElement,
  HTMLLIElement,
  HTMLBaseElement,
  HTMLDataListElement,
  HTMLInputElement,
  HTMLParamElement,
  HTMLMediaElement,
  HTMLAudioElement,
  HTMLHeadingElement,
  HTMLDirectoryElement,
  HTMLQuoteElement,
  HTMLCanvasElement,
  HTMLLegendElement,
  HTMLOptionElement,
  HTMLSpanElement,
  HTMLMeterElement,
  HTMLVideoElement,
  HTMLTableCellElement,
  HTMLTitleElement,
  HTMLOutputElement,
  HTMLTableRowElement,
  HTMLDataElement,
  HTMLMenuElement,
  HTMLSelectElement,
  HTMLBRElement,
  HTMLButtonElement,
  HTMLMapElement,
  HTMLOptGroupElement,
  HTMLDListElement,
  HTMLTextAreaElement,
  HTMLFontElement,
  HTMLDivElement,
  HTMLLinkElement,
  HTMLSlotElement,
  HTMLFormElement,
  HTMLImageElement,
  HTMLPreElement,
  HTMLUListElement,
  HTMLMetaElement,
  HTMLPictureElement,
  HTMLAreaElement,
  HTMLOListElement,
  HTMLTableCaptionElement,
  HTMLAnchorElement,
  HTMLLabelElement,
  HTMLUnknownElement,
  HTMLModElement,
  HTMLDetailsElement,
  HTMLSourceElement,
  HTMLTrackElement,
  HTMLMarqueeElement,
  HTMLTableColElement,
  HTMLTableSectionElement,
  HTMLDialogElement
};
