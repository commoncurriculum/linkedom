const assert = require('../assert.js').for('Element interfaces');

const {parseHTML, parseJSON, DOMParser} = global[Symbol.for('linkedom')];

const HTML = 'http://www.w3.org/1999/xhtml';
const SVG = 'http://www.w3.org/2000/svg';
const MATHML = 'http://www.w3.org/1998/Math/MathML';

const {document} = parseHTML('<!doctype html><html><body></body></html>');
const name = node => node.constructor.name;

// https://html.spec.whatwg.org/multipage/dom.html#elements-in-the-dom
for (const localName of 'applet bgsound blink isindex keygen multicol nextid spacer menuitem image foo'.split(' '))
  assert(name(document.createElement(localName)), 'HTMLUnknownElement', `<${localName}> is unknown`);
for (const localName of 'acronym basefont big center nobr noembed noframes plaintext rb rtc strike tt search summary wbr'.split(' '))
  assert(name(document.createElement(localName)), 'HTMLElement', `<${localName}> is an HTMLElement`);
for (const localName of 'pre listing xmp'.split(' '))
  assert(name(document.createElement(localName)), 'HTMLPreElement', `<${localName}> is an HTMLPreElement`);
for (const [localName, Class] of [
  ['a', 'HTMLAnchorElement'], ['button', 'HTMLButtonElement'], ['canvas', 'HTMLCanvasElement'],
  ['h3', 'HTMLHeadingElement'], ['iframe', 'HTMLIFrameElement'], ['img', 'HTMLImageElement'],
  ['input', 'HTMLInputElement'], ['link', 'HTMLLinkElement'], ['meta', 'HTMLMetaElement'],
  ['option', 'HTMLOptionElement'], ['script', 'HTMLScriptElement'], ['select', 'HTMLSelectElement'],
  ['slot', 'HTMLSlotElement'], ['source', 'HTMLSourceElement'], ['style', 'HTMLStyleElement'],
  ['template', 'HTMLTemplateElement'], ['textarea', 'HTMLTextAreaElement'], ['time', 'HTMLTimeElement'],
  ['title', 'HTMLTitleElement'], ['td', 'HTMLTableCellElement'], ['q', 'HTMLQuoteElement']
])
  assert(name(document.createElement(localName)), Class, `<${localName}>`);

assert(name(document.createElement('x-foo')), 'HTMLElement', 'a valid custom element name is an HTMLElement');
assert(name(document.createElement('X-FOO')), 'HTMLElement', 'createElement lowercases in HTML documents');
assert(document.createElement('X-FOO').localName, 'x-foo');
assert(name(document.createElement('DIV')), 'HTMLDivElement');
assert(name(document.createElement('font-face')), 'HTMLUnknownElement', 'a reserved name is not a custom element name');
assert(name(document.createElement('x:div')), 'HTMLUnknownElement', 'createElement does not split prefixes');

assert(name(document.createElementNS(HTML, 'DIV')), 'HTMLUnknownElement', 'createElementNS keeps case, so DIV is unknown');
assert(document.createElementNS(HTML, 'DIV').localName, 'DIV');
assert(name(document.createElementNS(HTML, 'X-FOO')), 'HTMLUnknownElement', 'X-FOO is not a valid custom element name');
const prefixed = document.createElementNS(HTML, 'x:div');
assert(name(prefixed), 'HTMLDivElement', 'the prefix does not change the interface');
assert(prefixed.prefix, 'x');
assert(prefixed.tagName, 'X:DIV');
assert(name(document.createElementNS(HTML, 'x:foo')), 'HTMLUnknownElement', 'a prefixed unknown name is unknown too');
assert(name(document.createElementNS(HTML, 'x:x-foo')), 'HTMLElement');

for (const localName of ['svg', 'rect', 'foreignObject', 'title', 'unknown'])
  assert(name(document.createElementNS(SVG, localName)), 'SVGElement', `every SVG element is an SVGElement: ${localName}`);
assert(name(document.createElementNS(MATHML, 'mi')), 'MathMLElement');
assert(name(document.createElementNS('urn:x', 'div')), 'Element', 'other namespaces');
assert(name(document.createElementNS(null, 'div')), 'Element', 'no namespace');
assert(document.createElementNS('urn:x', 'div').namespaceURI, 'urn:x');
assert(document.createElementNS(null, 'div').namespaceURI, null);

{
  const {document} = parseHTML('<!doctype html><html><body><blink></blink><x-foo></x-foo><listing></listing><svg><title></title></svg><math><mi></mi></math></body></html>');
  assert(name(document.querySelector('blink')), 'HTMLUnknownElement', 'parsed unknown element');
  assert(name(document.querySelector('x-foo')), 'HTMLElement', 'parsed custom element name');
  assert(name(document.querySelector('listing')), 'HTMLPreElement');
  assert(name(document.querySelector('svg title')), 'SVGElement');
  assert(name(document.querySelector('mi')), 'MathMLElement');
}

{
  const xml = (new DOMParser).parseFromString('<r xmlns:h="http://www.w3.org/1999/xhtml"><h:div/><h:blink/><h:x-y/><other/></r>', 'text/xml');
  const [div, blink, custom, other] = xml.documentElement.children;
  assert(name(div), 'HTMLDivElement', 'XML parsed HTML element');
  assert(name(blink), 'HTMLUnknownElement', 'XML parsed unknown HTML element');
  assert(name(custom), 'HTMLElement');
  assert(name(other), 'Element');
  assert(other.namespaceURI, null);
  assert(name(xml.createElement('div')), 'Element', 'createElement in an XML document has no namespace');
  assert(xml.createElement('div').namespaceURI, null);
  assert(xml.createElement('DIV').localName, 'DIV', 'and keeps case');
}

{
  const json = parseJSON('[1,"div",1,"blink",-1,1,"x-foo",-1,1,"svg",1,"rect",-3]');
  assert(name(json), 'HTMLDivElement');
  assert(name(json.firstChild), 'HTMLUnknownElement', 'parseJSON uses the same interfaces');
  assert(name(json.childNodes[1]), 'HTMLElement');
  assert(name(json.lastChild.firstChild), 'SVGElement');
  assert(json.lastChild.firstChild.namespaceURI, SVG);
}
