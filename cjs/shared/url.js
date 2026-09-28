'use strict';
const BASE = Symbol('base');

const parse = (url, base) => {
  try {
    return new URL(url, base);
  }
  catch {
    return null;
  }
};

/**
 * @param {Node} node a node of the document, or the document
 */
const baseChanged = node => {
  (node.ownerDocument || node)[BASE] = undefined;
};
exports.baseChanged = baseChanged;

// https://html.spec.whatwg.org/multipage/urls-and-fetching.html#document-base-url
const documentBaseURL = document => {
  const fallback = document.defaultView.location?.href || 'about:blank';
  if (document[BASE] === undefined)
    document[BASE] = document.querySelector('base[href]');
  const base = document[BASE];
  return (base && parse(base.getAttribute('href'), fallback)?.href) || fallback;
};
exports.documentBaseURL = documentBaseURL;

// https://html.spec.whatwg.org/multipage/links.html#dom-hyperlink-href
const hyperlinkHref = element => {
  const value = element.getAttribute('href');
  if (value === null)
    return '';
  return parse(value, documentBaseURL(element.ownerDocument))?.href ?? value;
};
exports.hyperlinkHref = hyperlinkHref;
