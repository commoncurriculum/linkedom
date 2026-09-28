/**
 * @implements globalThis.HTMLSelectElement
 */
export class HTMLSelectElement extends HTMLElement implements globalThis.HTMLSelectElement {
    get options(): NodeList;
    set disabled(value: any);
    get disabled(): any;
    set name(value: any);
    get name(): any;
    set multiple(value: any);
    get multiple(): any;
    get value(): any;
}
import { HTMLElement } from './element.js';
import { NodeList } from '../interface/node-list.js';
