/**
 * @implements globalThis.MathMLElement
 */
export class MathMLElement extends Element implements globalThis.MathMLElement {
    get namespaceURI(): string;
    get style(): any;
}
import { Element } from '../interface/element.js';
