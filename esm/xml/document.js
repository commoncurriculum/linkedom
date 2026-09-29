import {MIME} from '../shared/symbols.js';
import {Document} from '../interface/document.js';

/**
 * @implements globalThis.XMLDocument
 */
export class XMLDocument extends Document {
  /**
   * @param {string} type an XML content type
   */
  constructor(type = 'application/xml') { super(type); }
  toString() {
    return this[MIME].docType + super.toString();
  }
}
