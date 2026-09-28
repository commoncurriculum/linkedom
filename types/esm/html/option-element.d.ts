export function selectedOption(select: HTMLSelectElement): globalThis.HTMLOptionElement;
/**
 * @implements globalThis.HTMLOptionElement
 */
export class HTMLOptionElement extends HTMLElement implements globalThis.HTMLOptionElement {
    set value(value: any);
    get value(): any;
    get text(): string;
    set defaultSelected(value: any);
    get defaultSelected(): any;
    set selected(value: any);
    get selected(): any;
    [SELECTEDNESS]: any;
}
import { HTMLElement } from './element.js';
declare const SELECTEDNESS: unique symbol;
export {};
