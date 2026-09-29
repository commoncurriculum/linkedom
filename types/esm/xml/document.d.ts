/**
 * @implements globalThis.XMLDocument
 */
export class XMLDocument extends Document implements globalThis.XMLDocument {
    /**
     * @param {string} type an XML content type
     */
    constructor(type?: string);
}
import { Document } from '../interface/document.js';
