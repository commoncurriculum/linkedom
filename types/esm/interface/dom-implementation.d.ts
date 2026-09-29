/**
 * @implements globalThis.DOMImplementation
 */
export class DOMImplementation implements globalThis.DOMImplementation {
    /**
     * @param {Document} document
     */
    constructor(document: Document);
    hasFeature(): boolean;
    createDocumentType(name: any, publicId: any, systemId: any): any;
    createDocument(namespace: any, qualifiedName: any, doctype?: any): Document;
    createHTMLDocument(title: any): Document;
}
