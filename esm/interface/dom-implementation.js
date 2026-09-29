// https://dom.spec.whatwg.org/#interface-domimplementation

import {HTML_NAMESPACE, SVG_NAMESPACE} from '../shared/constants.js';
import {DOM_PARSER} from '../shared/symbols.js';
import {withoutBrowsingContext} from '../shared/browsing-context.js';

const documents = new WeakMap;

const invalidDoctypeName = /[\t\n\f\r >\0]/;

const create = (implementation, markup, type) => {
  const source = documents.get(implementation);
  return withoutBrowsingContext(new source[DOM_PARSER]().parseFromString(markup, type), source);
};

/**
 * @implements globalThis.DOMImplementation
 */
export class DOMImplementation {
  /**
   * @param {Document} document
   */
  constructor(document) {
    documents.set(this, document);
  }

  hasFeature() {
    return true;
  }

  createDocumentType(name, publicId, systemId) {
    name = String(name);
    if (invalidDoctypeName.test(name))
      throw new DOMException(`"${name}" is not a valid doctype name`, 'InvalidCharacterError');
    return documents.get(this).createDocumentType(name, String(publicId), String(systemId));
  }

  createDocument(namespace, qualifiedName, doctype = null) {
    const type = namespace === HTML_NAMESPACE ? 'application/xhtml+xml' : (
      namespace === SVG_NAMESPACE ? 'image/svg+xml' : 'application/xml'
    );
    const document = create(this, '', type);
    const element = qualifiedName === null || qualifiedName === '' ?
      null : document.createElementNS(namespace, qualifiedName);
    if (doctype)
      document.appendChild(doctype);
    if (element)
      document.appendChild(element);
    return document;
  }

  createHTMLDocument(title) {
    const document = create(this, '<!DOCTYPE html>', 'text/html');
    if (title !== undefined) {
      const element = document.createElement('title');
      element.appendChild(document.createTextNode(String(title)));
      document.head.appendChild(element);
    }
    return document;
  }
}
