import {MIME} from '../shared/symbols.js';
import {Document} from '../interface/document.js';

/**
 * @implements globalThis.Document
 */
export class SVGDocument extends Document {
  /**
   * @param {string} type an XML content type
   */
  constructor(type = 'image/svg+xml') { super(type); }
  toString() {
    return this[MIME].docType + super.toString();
  }
}
