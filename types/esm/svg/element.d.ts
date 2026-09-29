/**
 * @implements globalThis.SVGElement
 */
export class SVGElement extends ElementCSSInlineStyle implements globalThis.SVGElement {
    get ownerSVGElement(): any;
    get namespaceURI(): string;
}
import { ElementCSSInlineStyle } from '../mixin/element-css-inline-style.js';
