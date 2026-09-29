export function toDOMString(value: any): any;
/**
 * @implements globalThis.Attr
 */
export class Attr extends Node implements globalThis.Attr {
    constructor(ownerDocument: any, name: any, value?: string, namespaceURI?: any, prefix?: any, localName?: any);
    ownerElement: any;
    name: string;
    namespaceURI: any;
    prefix: any;
    get nodeName(): string;
    set value(newValue: any);
    get value(): any;
    toJSON(): any[];
    [CLONE](document: any): Attr;
    [VALUE]: any;
}
import { Node } from './node.js';
import { CLONE } from '../shared/symbols.js';
import { VALUE } from '../shared/symbols.js';
