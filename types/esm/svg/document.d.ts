/**
 * @implements globalThis.Document
 */
export class SVGDocument extends Document implements globalThis.Document {
    /**
     * @param {string} type an XML content type
     */
    constructor(type?: string);
}
import { Document } from '../interface/document.js';
