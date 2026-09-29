const assert = require('../assert.js').for('DOMImplementation');

const {parseHTML} = global[Symbol.for('linkedom')];

const HTML = 'http://www.w3.org/1999/xhtml';
const SVG = 'http://www.w3.org/2000/svg';

const {document, MutationObserver} = parseHTML('<!doctype html><html><head></head><body></body></html>');
const {implementation} = document;

assert(document.implementation, implementation, 'one implementation per document');
assert(implementation.hasFeature(), true);

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

// https://dom.spec.whatwg.org/#dom-domimplementation-createdocument
for (const [namespace, type] of [
  [null, 'application/xml'],
  ['', 'application/xml'],
  ['urn:x', 'application/xml'],
  [HTML, 'application/xhtml+xml'],
  [SVG, 'image/svg+xml']
]) {
  const xml = implementation.createDocument(namespace, namespace ? 'r' : '', null);
  assert(xml.contentType, type, `createDocument(${JSON.stringify(namespace)}) is ${type}`);
  assert(xml.defaultView, null, 'with no window');
  assert(xml.childNodes.length, namespace ? 1 : 0, 'and a document element for a qualified name');
  if (namespace)
    assert(xml.documentElement.namespaceURI, namespace);
}
assert(implementation.createDocument(HTML, 'html').createElement('p').namespaceURI, HTML, 'an XHTML document creates HTML elements');
assert(implementation.createDocument(SVG, 'svg').createElement('p').namespaceURI, null, 'an SVG one does not');
assert(implementation.createDocument('urn:x', null).childNodes.length, 0, 'a null qualified name is empty');
assert(implementation.createDocument(null, 'r', undefined).childNodes.length, 1, 'the doctype is optional');
assert(implementation.createDocument(SVG, 's:svg', null).toString(), '<?xml version="1.0" encoding="utf-8"?><s:svg xmlns:s="http://www.w3.org/2000/svg"/>');
throws(() => implementation.createDocument(null, 'x:y', null), 'NamespaceError', 'A prefix was given but no namespace was provided', 'a prefix without a namespace');
throws(() => implementation.createDocument('urn:x', '1a', null), 'InvalidCharacterError', '"1a" is not a valid element local name', 'an invalid name');

// https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype
const doctype = implementation.createDocumentType('svg', 'pub', 'sys');
assert([doctype.name, doctype.publicId, doctype.systemId].join(), 'svg,pub,sys');
assert(doctype.ownerDocument, document, 'a doctype belongs to the implementation\'s document');
const svg = implementation.createDocument(SVG, 's:svg', doctype);
assert(svg.doctype, doctype, 'until createDocument appends it');
assert(doctype.ownerDocument, svg, 'and adopts it');
assert(svg.childNodes.length, 2);
assert(svg.toString(), '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "pub" "sys"><s:svg xmlns:s="http://www.w3.org/2000/svg"/>');
assert(implementation.createDocumentType('', '', '').name, '', 'an empty doctype name is valid');
assert(implementation.createDocumentType('1:<', '', '').name, '1:<', 'and so is almost anything');
for (const name of ['a b', 'a>', 'a\0', 'a\tb'])
  throws(() => implementation.createDocumentType(name, '', ''), 'InvalidCharacterError', `"${name}" is not a valid doctype name`, `doctype name ${JSON.stringify(name)}`);

// https://dom.spec.whatwg.org/#dom-domimplementation-createhtmldocument
const html = implementation.createHTMLDocument('T');
assert(html.contentType, 'text/html', 'createHTMLDocument');
assert(html.defaultView, null, 'with no window');
assert(html.toString(), '<!DOCTYPE html><html><head><title>T</title></head><body></body></html>');
assert(html.title, 'T');
assert(html.body.namespaceURI, HTML);
assert(implementation.createHTMLDocument().toString(), '<!DOCTYPE html><html><head></head><body></body></html>', 'without a title');
assert(implementation.createHTMLDocument('').head.firstChild.childNodes.length, 1, 'an empty title has its text node');
assert(implementation.createHTMLDocument(null).title, 'null');
assert(html.implementation.createHTMLDocument('x').title, 'x', 'a created document has an implementation too');
assert(html.createElement('a').ownerDocument, html);

// A MutationObserver of the document observes the documents made for it.
const records = [];
const observer = new MutationObserver(list => records.push(...list));
observer.observe(html.body, {childList: true});
html.body.append(html.createElement('p'));
Promise.resolve().then(() => {
  assert(records.length, 1, 'mutations in a created document reach the observers');
  observer.disconnect();
});
