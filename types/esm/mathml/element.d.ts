/**
 * @implements globalThis.MathMLElement
 */
export class MathMLElement extends ElementCSSInlineStyle implements globalThis.MathMLElement {
    get namespaceURI(): string;
}
import { ElementCSSInlineStyle } from '../mixin/element-css-inline-style.js';
