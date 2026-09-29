'use strict';
const {MIME} = require('../shared/symbols.js');
const {Document} = require('../interface/document.js');

/**
 * @implements globalThis.Document
 */
class SVGDocument extends Document {
  /**
   * @param {string} type an XML content type
   */
  constructor(type = 'image/svg+xml') { super(type); }
  toString() {
    return this[MIME].docType + super.toString();
  }
}
exports.SVGDocument = SVGDocument
