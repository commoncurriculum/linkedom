'use strict';
const {MIME} = require('../shared/symbols.js');
const {Document} = require('../interface/document.js');

/**
 * @implements globalThis.XMLDocument
 */
class XMLDocument extends Document {
  /**
   * @param {string} type an XML content type
   */
  constructor(type = 'application/xml') { super(type); }
  toString() {
    return this[MIME].docType + super.toString();
  }
}
exports.XMLDocument = XMLDocument
