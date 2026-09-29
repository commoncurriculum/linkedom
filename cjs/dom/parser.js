'use strict';
const {DOM_PARSER, GLOBALS} = require('../shared/symbols.js');
const {parseDocument} = require('../shared/parse.js');

const {HTMLDocument} = require('../html/document.js');
const {SVGDocument} = require('../svg/document.js');
const {XMLDocument} = require('../xml/document.js');

const PARSER_ERROR_NAMESPACE = 'http://www.mozilla.org/newlayout/xml/parsererror.xml';

const supportedTypes = new Set([
  'text/html', 'text/xml', 'application/xml', 'application/xhtml+xml', 'image/svg+xml'
]);

/**
 * @implements globalThis.DOMParser
 */
class DOMParser {

  /** @typedef {{ "text/html": HTMLDocument, "image/svg+xml": SVGDocument, "text/xml": XMLDocument, "application/xml": XMLDocument, "application/xhtml+xml": XMLDocument }} MimeToDoc */
  /**
   * @template {keyof MimeToDoc} MIME
   * @param {string} markupLanguage
   * @param {MIME} mimeType
   * @returns {MimeToDoc[MIME]}
   */
  parseFromString(markupLanguage, mimeType, globals = null) {
    const type = String(mimeType);
    if (!supportedTypes.has(type))
      throw new TypeError(`Failed to execute 'parseFromString' on 'DOMParser': parameter 2 '${type}' is not a valid enumeration value for SupportedType`);
    const isHTML = type === 'text/html';
    const create = () => {
      const document = isHTML ? new HTMLDocument : (
        type === 'image/svg+xml' ? new SVGDocument : new XMLDocument(type)
      );
      document[DOM_PARSER] = DOMParser;
      if (globals)
        document[GLOBALS] = globals;
      return document;
    };
    const document = create();
    if (isHTML) {
      if (markupLanguage === '...')
        markupLanguage = '<!doctype html><html><head></head><body></body></html>';
      return parseDocument(document, markupLanguage == null ? '' : String(markupLanguage));
    }
    if (!markupLanguage)
      return document;
    try {
      return parseDocument(document, String(markupLanguage));
    }
    catch (error) {
      const failed = create();
      const parserError = failed.createElementNS(PARSER_ERROR_NAMESPACE, 'parsererror');
      parserError.textContent = error.message;
      failed.appendChild(parserError);
      return failed;
    }
  }
}
exports.DOMParser = DOMParser
