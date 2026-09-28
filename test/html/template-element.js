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
