const assert = require('../assert.js').for('getElementsByTagName');

const {parseHTML, DOMParser} = global[Symbol.for('linkedom')];

const HTML = 'http://www.w3.org/1999/xhtml';
const SVG = 'http://www.w3.org/2000/svg';

const {document} = parseHTML('<!doctype html><html><body><div id="a"><p>1</p><svg><foreignObject><p>2</p></foreignObject><linearGradient></linearGradient></svg></div></body></html>');
const body = document.body;
const names = list => list.map(element => element.id || element.localName).join();

body.firstChild.append(
  Object.assign(document.createElementNS(HTML, 'x:p'), {id: 'x:p'}),
  Object.assign(document.createElementNS('urn:x', 'Div'), {id: 'urn:Div'}),
  Object.assign(document.createElementNS(HTML, 'DIV'), {id: 'html:DIV'})
);

assert(names(document.getElementsByTagName('p')), 'p,p', 'every p in the HTML namespace');
assert(names(document.getElementsByTagName('P')), 'p,p', 'names match HTML elements ASCII case-insensitively');
assert(names(document.getElementsByTagName('div')), 'a', 'an HTML element whose local name is uppercase is not lowercase');
assert(names(document.getElementsByTagName('DIV')), 'a', 'lowercasing the name');
assert(names(document.getElementsByTagName('Div')), 'a,urn:Div', 'other namespaces match exactly');
assert(names(document.getElementsByTagName('linearGradient')), 'linearGradient', 'SVG keeps its case');
assert(names(document.getElementsByTagName('lineargradient')), '', 'and needs it');
assert(names(document.getElementsByTagName('x:p')), 'x:p', 'the qualified name');
assert(document.getElementsByTagName('*').length, 12, 'every element');
assert(names(body.getElementsByTagName('*')), 'a,p,svg,foreignObject,p,linearGradient,x:p,urn:Div,html:DIV', 'only descendants');
assert(names(body.firstChild.getElementsByTagName('svg')), 'svg', 'on an element');

assert(names(document.getElementsByTagNameNS(HTML, 'p')), 'p,p,x:p', 'namespace and local name');
assert(names(document.getElementsByTagNameNS(HTML, 'P')), '', 'exactly');
assert(names(document.getElementsByTagNameNS(SVG, '*')), 'svg,foreignObject,linearGradient', 'any local name');
assert(names(document.getElementsByTagNameNS('*', 'Div')), 'urn:Div', 'any namespace');
assert(names(document.getElementsByTagNameNS(HTML, 'DIV')), 'html:DIV');
assert(document.getElementsByTagNameNS('*', '*').length, 12, 'any element');
assert(names(document.getElementsByTagNameNS(null, 'Div')), '', 'no namespace');
assert(names(document.getElementsByTagNameNS('', 'Div')), '', 'the empty namespace is no namespace');
assert(names(body.firstChild.getElementsByTagNameNS('urn:x', 'Div')), 'urn:Div', 'on an element');

const xml = (new DOMParser).parseFromString('<r xmlns:x="urn:x"><Item/><item/><x:Item/></r>', 'text/xml');
assert(xml.getElementsByTagName('Item').length, 1, 'XML documents match exactly');
assert(xml.getElementsByTagName('item').length, 1);
assert(xml.getElementsByTagName('x:Item').length, 1);
assert(xml.getElementsByTagNameNS(null, 'Item').length, 1);
assert(xml.getElementsByTagNameNS(undefined, 'item').length, 1);
assert(xml.getElementsByTagNameNS('urn:x', 'Item').length, 1);
assert(xml.getElementsByTagNameNS('*', 'Item').length, 2);
