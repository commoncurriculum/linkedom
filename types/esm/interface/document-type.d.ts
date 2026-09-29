/**
 * @implements globalThis.DocumentType
 */
export class DocumentType extends Node implements globalThis.DocumentType {
    constructor(ownerDocument: any, name: any, publicId?: string, systemId?: string);
    name: any;
    publicId: string;
    systemId: string;
    toJSON(): any[];
    [CLONE](document: any): DocumentType;
}
import { Node } from './node.js';
import { CLONE } from '../shared/symbols.js';
