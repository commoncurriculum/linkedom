const assert = require('../assert.js').for('HTML serialization');

const {parseHTML} = global[Symbol.for('linkedom')];

const {document} = parseHTML('<!doctype html><html><body></body></html>');

const special = `"&<>\xA0'`;

const p = document.createElement('p');
p.setAttribute('title', special);
p.textContent = special;
assert(p.outerHTML, `<p title="&quot;&amp;&lt;&gt;&nbsp;'">"&amp;&lt;&gt;&nbsp;'</p>`, 'attribute values escape <, > and ", text does not escape "');

document.body.innerHTML = '<p title="<b>x</b>">a</p>';
assert(document.body.innerHTML, '<p title="&lt;b&gt;x&lt;/b&gt;">a</p>', '< and > in a parsed attribute value');
const reparsed = parseHTML(`<!doctype html><html><body>${document.body.innerHTML}</body></html>`).document;
assert(reparsed.body.firstChild.getAttribute('title'), '<b>x</b>', 'the escaped value parses back to the same value');

const input = document.createElement('input');
input.setAttribute('value', '1 < 2 > 0');
assert(input.outerHTML, '<input value="1 &lt; 2 &gt; 0">', 'void elements escape their attributes too');

const template = document.createElement('template');
template.setAttribute('data-x', 'a>b');
template.innerHTML = '<i title="<">&lt;</i>';
assert(template.outerHTML, '<template data-x="a&gt;b"><i title="&lt;">&lt;</i></template>', 'templates escape their attributes and content');

const style = document.createElement('style');
style.textContent = 'a > b { content: "&\xA0" }';
assert(style.outerHTML, '<style>a > b { content: "&\xA0" }</style>', 'raw text is not escaped');

assert(p.getAttributeNode('title').value, special, 'escaping leaves the value alone');

{
  const BODY = '<body>Foo&#160;&quot;&#160;&quot;&#160;Bar</body>';
  const REBODY = BODY.replace(/&quot;/g, '"').replace(/&#160;/g, '&nbsp;');
  const HTML = `<html id="html" class="live">${BODY}</html>`;
  const REHTML = `<html id="html" class="live"><head></head>${REBODY}</html>`;

  const {document} = parseHTML('<!DOCTYPE html>' + HTML);
  assert(document.documentElement.toString(), REHTML);

  document.documentElement.innerHTML = BODY;
  assert(document.documentElement.toString(), REHTML);

  document.documentElement.innerHTML = '<body>&amp;amp;</body>';
  assert(document.documentElement.toString(), `<html id="html" class="live"><head></head><body>&amp;amp;</body></html>`);
}
