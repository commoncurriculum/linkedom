/**
 * @implements globalThis.CSSStyleDeclaration
 */
export class CSSStyleDeclaration implements globalThis.CSSStyleDeclaration {
    constructor(element: any);
    set cssText(value: string);
    get cssText(): string;
    get length(): number;
    get parentRule(): any;
    set cssFloat(value: string);
    get cssFloat(): string;
    item(index: any): string;
    getPropertyValue(property: any): string;
    getPropertyPriority(property: any): string;
    setProperty(property: any, value: any, priority?: string): void;
    removeProperty(property: any): string;
    [RESET](value: any): void;
    [Symbol.iterator](): Generator<string, void, unknown>;
    get [Symbol.toStringTag](): string;
    [ELEMENT]: any;
    [DECLARATIONS]: Declarations;
    [TEXT]: any;
    [INDICES]: number;
}
export function styleOf(element: Element): CSSStyleDeclaration;
import { RESET } from '../shared/symbols.js';
declare const ELEMENT: unique symbol;
declare const DECLARATIONS: unique symbol;
import { Declarations } from '../shared/css/engine.js';
declare const TEXT: unique symbol;
declare const INDICES: unique symbol;
export {};
