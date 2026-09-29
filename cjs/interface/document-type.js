'use strict';
const {DOCUMENT_TYPE_NODE} = require('../shared/constants.js');
const {CLONE} = require('../shared/symbols.js');
const {documentTypeAsJSON} = require('../shared/jsdon.js');

const {Node} = require('./node.js');

/**
 * @implements globalThis.DocumentType
 */
class DocumentType extends Node {
  constructor(ownerDocument, name, publicId = '', systemId = '') {
    super(ownerDocument, '#document-type', DOCUMENT_TYPE_NODE);
    this.name = name;
    this.publicId = publicId;
    this.systemId = systemId;
  }

  [CLONE](document) {
    const {name, publicId, systemId} = this;
    return new DocumentType(document, name, publicId, systemId);
  }

  toJSON() {
    const json = [];
    documentTypeAsJSON(this, json);
    return json;
  }
}
exports.DocumentType = DocumentType
