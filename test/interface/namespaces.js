const assert = require('../assert.js').for('Namespaces');

const {parseHTML, DOMParser} = global[Symbol.for('linkedom')];

const HTML = 'http://www.w3.org/1999/xhtml';
const SVG = 'http://www.w3.org/2000/svg';
const MATHML = 'http://www.w3.org/1998/Math/MathML';
const XML = 'http://www.w3.org/XML/1998/namespace';
const XMLNS = 'http://www.w3.org/2000/xmlns/';
const XLINK = 'http://www.w3.org/1999/xlink';

const {document} = parseHTML('<!doctype html><html><body></body></html>');

const throws = (call, name, message, label) => {
  try {
    call();
    assert(true, false, `${label} should throw`);
  }
  catch (error) {
    assert(error.name, name, label);
    assert(error.message, message, label);
  }
};

// https://dom.spec.whatwg.org/#validate-and-extract, with jsdom's messages
throws(() => document.createElementNS(null, 'x:y'), 'NamespaceError', 'A prefix was given but no namespace was provided', 'a prefix without a namespace');
throws(() => document.createElementNS('urn:x', 'xml:y'), 'NamespaceError', 'A prefix of "xml" was given but the namespace was not the XML namespace', 'xml prefix');
throws(() => document.createElementNS('urn:x', 'xmlns'), 'NamespaceError', 'A prefix or qualifiedName of "xmlns" was given but the namespace was not the XMLNS namespace', 'xmlns name');
throws(() => document.createElementNS('urn:x', 'xmlns:y'), 'NamespaceError', 'A prefix or qualifiedName of "xmlns" was given but the namespace was not the XMLNS namespace', 'xmlns prefix');
throws(() => document.createElementNS(XMLNS, 'x'), 'NamespaceError', 'The XMLNS namespace was given but neither the prefix nor qualifiedName was "xmlns"', 'the XMLNS namespace');
throws(() => document.createElementNS(HTML, ':x'), 'InvalidCharacterError', '"" is not a valid namespace prefix', 'an empty prefix');
throws(() => document.createElementNS(HTML, 'x y:z'), 'InvalidCharacterError', '"x y" is not a valid namespace prefix', 'a prefix with a space');
throws(() => document.createElementNS(HTML, 'x:'), 'InvalidCharacterError', '"" is not a valid element local name', 'an empty local name');
throws(() => document.createElementNS(HTML, 'x:1a'), 'InvalidCharacterError', '"1a" is not a valid element local name', 'a local name starting with a digit');
throws(() => document.createAttributeNS(null, 'a=b'), 'InvalidCharacterError', '"a=b" is not a valid attribute local name', 'an attribute name with =');
throws(() => document.createAttributeNS(XMLNS, 'y'), 'NamespaceError', 'The XMLNS namespace was given but neither the prefix nor qualifiedName was "xmlns"', 'an XMLNS attribute');
throws(() => document.createElement('1a'), 'InvalidCharacterError', '"1a" is not a valid element local name', 'createElement');
throws(() => document.createElement(''), 'InvalidCharacterError', '"" is not a valid element local name', 'an empty name');
throws(() => document.createElement('<a'), 'InvalidCharacterError', '"<a" is not a valid element local name', 'a name starting with <');
throws(() => document.createAttribute(''), 'InvalidCharacterError', '"" is not a valid attribute local name', 'createAttribute');
throws(() => document.createAttribute('a>'), 'InvalidCharacterError', '"a>" is not a valid attribute local name', 'createAttribute with >');
throws(() => document.body.setAttribute('a b', ''), 'InvalidCharacterError', '"a b" is not a valid attribute local name', 'setAttribute');
throws(() => document.body.toggleAttribute('='), 'InvalidCharacterError', '"=" is not a valid attribute local name', 'toggleAttribute');
throws(() => document.body.setAttributeNS('urn:x', 'xmlns:q', ''), 'NamespaceError', 'A prefix or qualifiedName of "xmlns" was given but the namespace was not the XMLNS namespace', 'setAttributeNS');

assert(document.createElement('a<b').localName, 'a<b', 'names starting with a letter take almost anything');
assert(document.createElement('é').localName, 'é');
assert(document.createElement('_:x').localName, '_:x');
assert(document.createElementNS('', 'x').namespaceURI, null, 'the empty namespace is null');

const prefixed = document.createElementNS(HTML, 'x:y');
assert([prefixed.prefix, prefixed.localName, prefixed.tagName, prefixed.namespaceURI].join(), `x,y,X:Y,${HTML}`);
const svg = document.createElementNS(SVG, 's:rect');
assert([svg.prefix, svg.localName, svg.tagName].join(), 's,rect,s:rect', 'only HTML elements uppercase their tagName');

const lang = document.createAttributeNS(XML, 'xml:lang');
assert([lang.prefix, lang.localName, lang.name, lang.namespaceURI].join(), `xml,lang,xml:lang,${XML}`);

const element = document.createElement('p');
element.setAttributeNS(XLINK, 'x:href', 'a');
element.setAttributeNS(XLINK, 'y:href', 'b');
assert(element.attributes.length, 1, 'setAttributeNS changes the attribute with that namespace and local name');
assert(element.getAttributeNS(XLINK, 'href'), 'b');
assert(element.getAttributeNodeNS(XLINK, 'href').name, 'x:href', 'and keeps its prefix');
assert(element.hasAttributeNS(XLINK, 'href'), true);
assert(element.getAttribute('x:href'), 'b', 'getAttribute takes the qualified name');
assert(element.getAttributeNS(null, 'href'), null);
element.setAttribute('href', 'c');
assert(element.attributes.length, 2, 'a null-namespace attribute of the same local name is another attribute');
assert(element.outerHTML, '<p xlink:href="b" href="c"></p>');
element.removeAttributeNS(XLINK, 'href');
assert(element.outerHTML, '<p href="c"></p>', 'removeAttributeNS');
element.removeAttributeNS(XLINK, 'href');
const node = document.createAttributeNS(XLINK, 'l:href');
assert(element.setAttributeNodeNS(node), null, 'setAttributeNodeNS');
assert(element.getAttributeNodeNS(XLINK, 'href'), node);
const replacement = document.createAttributeNS(XLINK, 'm:href');
assert(element.setAttributeNodeNS(replacement), node, 'returns the attribute it replaces');
assert(element.outerHTML, '<p href="c" xlink:href=""></p>');
throws(() => document.createElement('i').setAttributeNode(replacement), 'InUseAttributeError', 'The attribute belongs to another element.', 'an attribute of another element');

// https://dom.spec.whatwg.org/#locate-a-namespace
{
  const xml = (new DOMParser).parseFromString('<r xmlns="urn:default" xmlns:a="urn:a"><c xmlns:b="urn:b" a:x="1">t<d xmlns=""/></c></r>', 'text/xml');
  const r = xml.documentElement;
  const c = r.firstChild;
  const d = c.lastChild;
  assert(r.lookupNamespaceURI(null), 'urn:default', 'the default namespace');
  assert(r.lookupNamespaceURI(''), 'urn:default', 'the empty prefix is the default');
  assert(r.lookupNamespaceURI(undefined), 'urn:default');
  assert(c.lookupNamespaceURI('a'), 'urn:a', 'an ancestor\'s prefix');
  assert(c.lookupNamespaceURI('b'), 'urn:b', 'its own');
  assert(r.lookupNamespaceURI('b'), null, 'not a descendant\'s');
  assert(d.lookupNamespaceURI(null), null, 'an undeclared default namespace');
  assert(d.namespaceURI, null);
  assert(c.firstChild.lookupNamespaceURI('a'), 'urn:a', 'a text node asks its parent');
  assert(c.getAttributeNodeNS('urn:a', 'x').lookupNamespaceURI('b'), 'urn:b', 'an attribute asks its element');
  assert(xml.lookupNamespaceURI('a'), 'urn:a', 'a document asks its element');
  assert(r.lookupNamespaceURI('xml'), XML, 'xml is always bound');
  assert(r.lookupNamespaceURI('xmlns'), XMLNS, 'xmlns is always bound');
  assert(xml.createDocumentFragment().lookupNamespaceURI('a'), null, 'a fragment has none');
  assert(xml.createAttribute('x').lookupNamespaceURI('a'), null, 'nor an attribute without an element');
  assert((new DOMParser).parseFromString('', 'text/xml').lookupNamespaceURI(null), null, 'nor an empty document');
  assert(r.isDefaultNamespace('urn:default'), true, 'isDefaultNamespace');
  assert(d.isDefaultNamespace(''), true);
  assert(d.isDefaultNamespace('urn:default'), false);

  const {document} = parseHTML('<!doctype html><html><body><svg><rect/></svg></body></html>');
  assert(document.querySelector('rect').lookupNamespaceURI(null), SVG, 'an element\'s own namespace');
  assert(document.body.lookupNamespaceURI(null), HTML);
  assert(document.doctype.lookupNamespaceURI(null), null, 'a doctype has none');
}

// https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
{
  for (const type of ['text/xml', 'image/svg+xml', 'application/xml']) {
    const failed = (new DOMParser).parseFromString('<a><b></a>', type);
    const {documentElement} = failed;
    assert(documentElement.localName, 'parsererror', `malformed ${type} gives a parsererror document`);
    assert(documentElement.namespaceURI, 'http://www.mozilla.org/newlayout/xml/parsererror.xml');
    assert(documentElement.textContent.length > 0, true, 'with the error as its text');
    assert(failed.childNodes.length, 1, 'and nothing else');
  }
  const lowercase = (new DOMParser).parseFromString('<!doctype svg><svg/>', 'image/svg+xml');
  assert(lowercase.documentElement.localName, 'parsererror', 'XML is case-sensitive, so <!doctype> is an error');
  const empty = (new DOMParser).parseFromString('', 'text/xml');
  assert(empty.documentElement, null, 'an empty XML document');
  assert(empty.childNodes.length, 0);
}

// MathML
{
  const {document} = parseHTML('<!doctype html><html><body><math definitionurl="u"><mi mathvariant="bold">x</mi><annotation-xml encoding="text/html"><p>h</p></annotation-xml></math></body></html>');
  const math = document.querySelector('math');
  const mi = math.firstChild;
  assert(math.namespaceURI, MATHML, 'the parser puts math in the MathML namespace');
  assert(mi.namespaceURI, MATHML);
  assert(mi.constructor.name, 'MathMLElement');
  assert(mi.tagName, 'mi', 'MathML tag names keep their case');
  assert(math.getAttribute('definitionURL'), 'u', 'the parser adjusts MathML attribute names');
  assert(math.getAttributeNames().join(), 'definitionURL');
  assert(document.querySelector('p').namespaceURI, HTML, 'annotation-xml with HTML holds HTML');
  assert(math.outerHTML, '<math definitionURL="u"><mi mathvariant="bold">x</mi><annotation-xml encoding="text/html"><p>h</p></annotation-xml></math>');
  mi.style.color = 'red';
  assert(mi.outerHTML, '<mi mathvariant="bold" style="color: red;">x</mi>', 'MathML elements have style');
  const created = document.createElementNS(MATHML, 'mfrac');
  created.append(document.createElementNS(MATHML, 'mn'));
  assert(created.outerHTML, '<mfrac><mn></mn></mfrac>');
}

assert(document.createTextNode('t').lookupNamespaceURI(null), null, 'a detached text node has none');
