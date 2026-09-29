import {DOCUMENT_TYPE_NODE} from '../shared/constants.js';
import {CLONE} from '../shared/symbols.js';
import {documentTypeAsJSON} from '../shared/jsdon.js';

import {Node} from './node.js';

/**
 * @implements globalThis.DocumentType
 */
export class DocumentType extends Node {
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
