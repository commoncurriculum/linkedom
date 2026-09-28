const assert = require('../assert.js').for('HTMLTemplateElement');

const {parseHTML} = global[Symbol.for('linkedom')];

let {document} = parseHTML('<template><div>foo</div><div>bar</div></template>');

let template = document.querySelector('template');
assert(template.innerHTML, '<div>foo</div><div>bar</div>');

assert(template.toString(), '<template><div>foo</div><div>bar</div></template>');
assert(document.toString(), '<html><head><template><div>foo</div><div>bar</div></template></head><body></body></html>');

assert(document.querySelector('template > *'), null);

assert(template.content, template.content);

template.replaceChildren();
assert(template.innerHTML, '<div>foo</div><div>bar</div>');

template.innerHTML = '<p>ok</p>';
assert(template.innerHTML, '<p>ok</p>');

template = document.createElement('template');
template.innerHTML = '<p>template</p>';
assert(template.content, template.content, 'template.content');
assert(template.innerHTML, '<p>template</p>', 'template.innerHTML');
document.documentElement.appendChild(template.content);
assert(template.innerHTML, '', 'empty template.innerHTML');

let html = `<!DOCTYPE html>
<html>

<template>
    <div></div>
</template>
<template>

</template>
</html>
`;

({document} = parseHTML(html));

assert(document.toString(), `<!DOCTYPE html><html><head><template>
    <div></div>
</template>
<template>

</template>
</head><body>
</body></html>`);

const docWithTemplateAttribute = parseHTML(`<div template="anything"><p>not inside a template</p></div>`).document.body.firstElementChild;

assert(docWithTemplateAttribute.querySelector('*').tagName, 'P');
assert(docWithTemplateAttribute.querySelectorAll('*').length, 1);

{
  const {document} = parseHTML('<!doctype html><html><body><div id="d"><template id="t"><p>x</p><template><i>y</i></template></template></div></body></html>');
  const div = document.getElementById('d');
  const markup = '<div id="d"><template id="t"><p>x</p><template><i>y</i></template></template></div>';
  assert(div.outerHTML, markup);

  const clone = div.cloneNode(true);
  assert(clone.outerHTML, markup, 'a deep clone copies a descendant template\'s contents');
  const cloned = clone.firstChild;
  assert(cloned.content !== document.getElementById('t').content, true, 'into a contents of its own');
  assert(cloned.content.firstChild !== document.getElementById('t').content.firstChild, true, 'as copies');
  cloned.content.firstChild.textContent = 'changed';
  assert(document.getElementById('t').innerHTML, '<p>x</p><template><i>y</i></template>', 'leaving the original alone');

  assert(document.importNode(div, true).outerHTML, markup, 'importNode');
  assert(document.cloneNode(true).toString(), document.toString(), 'document.cloneNode');
  assert(document.getElementById('t').cloneNode(true).outerHTML, '<template id="t"><p>x</p><template><i>y</i></template></template>', 'a template itself');
  assert(document.getElementById('t').cloneNode().outerHTML, '<template id="t"></template>', 'a shallow clone has empty contents');
  assert(div.cloneNode().outerHTML, '<div id="d"></div>', 'a shallow clone of its parent');
}
