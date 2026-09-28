export const emptyAttributes: Set<string>;
export function isClassAttribute({ localName, namespaceURI }: {
    localName: any;
    namespaceURI: any;
}): boolean;
export function quietly(update: any): void;
export function isStyleAttribute({ localName, namespaceURI }: {
    localName: any;
    namespaceURI: any;
}): boolean;
export function resetStyle(element: any, value: any): void;
export function styleChanged(element: any, cssText: any): void;
export function attributeChanged(element: any, attribute: any, value: any): void;
export function addClassTokens(tokens: any, value: any): void;
export function resetClassList(element: any, value: any): void;
export function setAttribute(element: any, attribute: any): void;
export function replaceAttribute(element: any, previous: any, attribute: any): void;
export function removeAttribute(element: any, attribute: any): void;
export namespace booleanAttribute {
    function get(element: any, name: any): any;
    function set(element: any, name: any, value: any): void;
}
export namespace numericAttribute {
    function get(element: any, name: any): number;
    function set(element: any, name: any, value: any): void;
}
export namespace stringAttribute {
    function get(element: any, name: any): any;
    function set(element: any, name: any, value: any): void;
}
