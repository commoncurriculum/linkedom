/**
 * @implements globalThis.HTMLStyleElement
 */
export class HTMLStyleElement extends HTMLElement implements globalThis.HTMLStyleElement {
    get sheet(): any;
    set innerText(value: string);
    get innerText(): string;
    [SHEET]: any;
}
import { HTMLElement } from './element.js';
import { SHEET } from '../shared/symbols.js';
