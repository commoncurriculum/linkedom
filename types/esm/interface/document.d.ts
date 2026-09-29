/**
 * @implements globalThis.Document
 */
export class Document extends NonElementParentNode implements globalThis.Document {
    constructor(type: any);
    /**
     * @type {string}
     */
    get contentType(): string;
    /**
     * @type {DOMImplementation}
     */
    get implementation(): DOMImplementation;
    /**
     * @type {globalThis.Document['defaultView']}
     */
    get defaultView(): Window & typeof globalThis;
    set doctype(value: import("../mixin/parent-node.js").NodeStruct | DocumentType);
    get doctype(): import("../mixin/parent-node.js").NodeStruct | DocumentType;
    get documentElement(): import("../mixin/parent-node.js").NodeStruct;
    createAttribute(name: any): Attr;
    createCDATASection(data: any): CDATASection;
    createComment(textContent: any): Comment;
    createDocumentFragment(): DocumentFragment;
    createDocumentType(name: any, publicId: any, systemId: any): DocumentType;
    /**
     * @param {string} localName
     * @param {ElementCreationOptions} [options]
     * @returns {any}
     */
    createElement(localName: string, options?: ElementCreationOptions): any;
    createRange(): Range;
    createTextNode(textContent: any): Text;
    createTreeWalker(root: any, whatToShow?: number): TreeWalker;
    createNodeIterator(root: any, whatToShow?: number): TreeWalker;
    createEvent(name: any): any;
    importNode(externalNode: any, ...args: any[]): any;
    querySelectorAll(selectors: any): any;
    createAttributeNS(namespace: any, qualifiedName: any): Attr;
    createElementNS(namespace: any, qualifiedName: any, options: any): Element;
    get [TEMPLATE_DOCUMENT](): globalThis.Document;
    [CREATE_ELEMENT](namespace: any, localName: any, prefix?: any, is?: any, synchronous?: boolean): Element;
    [CUSTOM_ELEMENTS]: {
        active: boolean;
        registry: any;
    };
    [MUTATION_OBSERVER]: {
        active: boolean;
        class: any;
    };
    [MIME]: any;
    /** @type {DocumentType} */
    [DOCTYPE]: DocumentType;
    [DOM_PARSER]: any;
    [GLOBALS]: any;
    [IMAGE]: any;
    [UPGRADE]: any;
}
import { NonElementParentNode } from '../mixin/non-element-parent-node.js';
import { DOMImplementation } from './dom-implementation.js';
import { DocumentType } from './document-type.js';
import { Attr } from './attr.js';
import { CDATASection } from './cdata-section.js';
import { Comment } from './comment.js';
import { DocumentFragment } from './document-fragment.js';
import { Range } from './range.js';
import { Text } from './text.js';
import { TreeWalker } from './tree-walker.js';
import { Element } from './element.js';
import { TEMPLATE_DOCUMENT } from '../shared/symbols.js';
import { CREATE_ELEMENT } from '../shared/symbols.js';
import { CUSTOM_ELEMENTS } from '../shared/symbols.js';
import { MUTATION_OBSERVER } from '../shared/symbols.js';
import { MIME } from '../shared/symbols.js';
import { DOCTYPE } from '../shared/symbols.js';
import { DOM_PARSER } from '../shared/symbols.js';
import { GLOBALS } from '../shared/symbols.js';
import { IMAGE } from '../shared/symbols.js';
import { UPGRADE } from '../shared/symbols.js';
