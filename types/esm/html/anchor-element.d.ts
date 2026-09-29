/**
 * @implements globalThis.HTMLAnchorElement
 */
export class HTMLAnchorElement extends HTMLElement implements globalThis.HTMLAnchorElement {
    set href(value: any);
    get href(): any;
    set download(value: any);
    get download(): any;
    set target(value: any);
    get target(): any;
    set type(value: any);
    get type(): any;
    set rel(value: any);
    get rel(): any;
}
import { HTMLElement } from './element.js';
