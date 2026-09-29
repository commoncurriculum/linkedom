export { $String as String };
export function getEnd(node: any): any;
export function ignoreCase({ ownerDocument }: {
    ownerDocument: any;
}): any;
export function knownAdjacent(prev: any, next: any): void;
export function knownBoundaries(prev: any, current: any, next: any): void;
export function knownSegment(prev: any, start: any, end: any, next: any): void;
export function knownSiblings(prev: any, current: any, next: any): void;
export function linkNode(parentNode: Node, node: Node, next?: Node): void;
export function linkAttribute(element: Element, attribute: Attr, last?: Node): void;
export function linkClones(source: Node, parentNode: Node, document: Document): void;
export function setAdjacent(prev: any, next: any): void;
declare const $String: StringConstructor;
