import {DOM_PARSER, GLOBALS} from '../shared/symbols.js';
import {parseDocument} from '../shared/parse.js';

import {HTMLDocument} from '../html/document.js';
import {SVGDocument} from '../svg/document.js';
import {XMLDocument} from '../xml/document.js';

const PARSER_ERROR_NAMESPACE = 'http://www.mozilla.org/newlayout/xml/parsererror.xml';

/**
 * @implements globalThis.DOMParser
 */
export class DOMParser {

  /** @typedef {{ "text/html": HTMLDocument, "image/svg+xml": SVGDocument, "text/xml": XMLDocument }} MimeToDoc */
  /**
   * @template {keyof MimeToDoc} MIME
   * @param {string} markupLanguage
   * @param {MIME} mimeType
   * @returns {MimeToDoc[MIME]}
   */
  parseFromString(markupLanguage, mimeType, globals = null) {
    const isHTML = mimeType === 'text/html';
    const create = () => {
      const document = isHTML ? new HTMLDocument : (
        mimeType === 'image/svg+xml' ? new SVGDocument : new XMLDocument
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
