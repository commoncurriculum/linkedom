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
export const baseChanged = node => {
  (node.ownerDocument || node)[BASE] = undefined;
};

// https://html.spec.whatwg.org/multipage/urls-and-fetching.html#document-base-url
export const documentBaseURL = document => {
  const fallback = document.defaultView.location?.href || 'about:blank';
  if (document[BASE] === undefined)
    document[BASE] = document.querySelector('base[href]');
  const base = document[BASE];
  return (base && parse(base.getAttribute('href'), fallback)?.href) || fallback;
};

// https://html.spec.whatwg.org/multipage/links.html#dom-hyperlink-href
export const hyperlinkHref = element => {
  const value = element.getAttribute('href');
  if (value === null)
    return '';
  return parse(value, documentBaseURL(element.ownerDocument))?.href ?? value;
};
