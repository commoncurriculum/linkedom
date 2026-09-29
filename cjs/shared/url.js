'use strict';
const BASE = Symbol('base');

// https://url.spec.whatwg.org/#no-scheme-state: against a base with an opaque path, such as
// about:blank, only a fragment or a URL with a scheme resolves. Node's parser also resolves a
// relative URL that has a fragment, into about:blank/x#f.
const resolves = (url, base) => {
  if (base[base.indexOf(':') + 1] === '/')
    return true;
  const input = url.replace(/[\t\n\r]/g, '');
  let i = 0;
  while (i < input.length && input.charCodeAt(i) <= 0x20)
    i++;
  return input[i] === '#' || URL.canParse(url);
};

const parse = (url, base) => {
  try {
    const parsed = new URL(url, base);
    return resolves(url, base) ? parsed : null;
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
  const fallback = document.defaultView?.location?.href || 'about:blank';
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
