/**
 * @implements globalThis.CSSStyleDeclaration
 */
export class CSSStyleDeclaration implements globalThis.CSSStyleDeclaration {
    constructor(element: any);
    set cssText(value: any);
    get cssText(): any;
    get length(): any;
    get parentRule(): any;
    set cssFloat(value: any);
    get cssFloat(): any;
    item(index: any): any;
    getPropertyValue(property: any): any;
    getPropertyPriority(property: any): any;
    setProperty(property: any, value: any, priority?: string): void;
    removeProperty(property: any): any;
    [Symbol.iterator](): Generator<any, void, unknown>;
    get [Symbol.toStringTag](): string;
    [ELEMENT]: any;
    [DECLARATIONS]: any;
    [INDICES]: number;
}
export function styleOf(element: Element): CSSStyleDeclaration;
declare const ELEMENT: unique symbol;
declare const DECLARATIONS: unique symbol;
declare const INDICES: unique symbol;
export {};
