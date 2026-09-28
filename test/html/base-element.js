const assert = require('../assert.js').for('HTMLBaseElement');

const {parseHTML} = global[Symbol.for('linkedom')];

{
  const {document} = parseHTML('<!doctype html><html><head></head><body><a href="x/y">a</a><a href="HTTP://Example.COM">b</a><a>c</a><map><area href="z"></map></body></html>');
  const [a, absolute, none] = document.querySelectorAll('a');
  const area = document.querySelector('area');
  assert(a.href, 'x/y', 'without a base or a location, a relative href stays as written');
  assert(absolute.href, 'http://example.com/', 'an absolute href is parsed and serialized');
  assert(none.href, '', 'no href');
  assert(document.baseURI, 'about:blank');

  const base = document.createElement('base');
  base.setAttribute('href', 'https://example.org/dir/page.html');
  document.head.appendChild(base);
  assert(a.href, 'https://example.org/dir/x/y', 'a base added through the API');
  assert(area.href, 'https://example.org/dir/z', 'area');
  assert(a.baseURI, 'https://example.org/dir/page.html', 'baseURI');

  base.setAttribute('href', 'https://example.net/');
  assert(a.href, 'https://example.net/x/y', 'the base href changed');
  a.setAttribute('href', 'p?q=1#f');
  assert(a.href, 'https://example.net/p?q=1#f', 'queries and fragments');
  a.setAttribute('href', 'x/y');

  const first = document.createElement('base');
  document.head.prepend(first);
  assert(a.href, 'https://example.net/x/y', 'a base without href does not count');
  first.setAttribute('href', 'https://first.example/');
  assert(a.href, 'https://first.example/x/y', 'the first base with an href wins');
  first.removeAttribute('href');
  assert(a.href, 'https://example.net/x/y', 'removing its href');
  first.setAttribute('href', 'https://again.example/');
  assert(a.href, 'https://again.example/x/y', 'adding it back');
  first.remove();
  assert(a.href, 'https://example.net/x/y', 'removing the first base');

  document.head.replaceChildren();
  assert(a.href, 'x/y', 'removing every base');
  assert(document.baseURI, 'about:blank');

  document.head.innerHTML = '<base href="https://inner.example/a/">';
  assert(a.href, 'https://inner.example/a/x/y', 'a base set through innerHTML');
  document.head.firstChild.getAttributeNode('href').value = 'https://attr.example/';
  assert(a.href, 'https://attr.example/x/y', 'a base href changed through its Attr');
  const fragment = document.createDocumentFragment();
  fragment.append(document.head.firstChild);
  assert(a.href, 'x/y', 'a base moved into a fragment');
  document.head.append(fragment);
  assert(a.href, 'https://attr.example/x/y', 'and back');
}

{
  const location = {href: 'https://site.example/docs/index.html'};
  const {document} = parseHTML('<!doctype html><html><head><base href="../assets/"></head><body><a href="i.png">a</a></body></html>', {location});
  const a = document.querySelector('a');
  assert(a.href, 'https://site.example/assets/i.png', 'a relative base resolves against the location');
  assert(document.baseURI, 'https://site.example/assets/');
  document.head.firstChild.remove();
  assert(a.href, 'https://site.example/docs/i.png', 'the location alone');
  assert(document.baseURI, location.href);
}

{
  const {document} = parseHTML('<!doctype html><html><body><template><base href="https://template.example/"></template><a href="x">a</a></body></html>');
  assert(document.querySelector('a').href, 'x', 'a base in template contents does not count');
}
