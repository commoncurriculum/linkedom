// https://html.spec.whatwg.org/multipage/urls-and-fetching.html#document-base-url

const parse = (url, base) => {
  try {
    return new URL(url, base);
  }
  catch {
    return null;
  }
};

const documentBaseURL = document => {
  const fallback = document.defaultView.location?.href || 'about:blank';
  const base = document.querySelector('base[href]');
  return (base && parse(base.getAttribute('href'), fallback)?.href) || fallback;
};

// https://html.spec.whatwg.org/multipage/links.html#dom-hyperlink-href
export const hyperlinkHref = element => {
  const value = element.getAttribute('href');
  if (value === null)
    return '';
  return parse(value, documentBaseURL(element.ownerDocument))?.href ?? value;
};
