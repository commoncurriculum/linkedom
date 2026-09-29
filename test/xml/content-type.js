const assert = require('../assert.js').for('Content type');

const {DOMParser, parseHTML} = global[Symbol.for('linkedom')];

const HTML = 'http://www.w3.org/1999/xhtml';

const {document} = parseHTML('<!doctype html><html><head></head><body></body></html>');
assert(document.contentType, 'text/html', 'an HTML document');

for (const type of ['text/xml', 'application/xml', 'application/xhtml+xml', 'image/svg+xml']) {
  const xml = (new DOMParser).parseFromString('<r/>', type);
  assert(xml.contentType, type, `DOMParser keeps ${type}`);
  assert((new DOMParser).parseFromString('', type).contentType, type, `an empty ${type} document`);
  assert(xml.cloneNode(false).contentType, type, `and its clone`);
  const element = xml.createElement('Div');
  assert(element.localName, 'Div', `${type} documents keep the case of names`);
  assert(element.namespaceURI, type === 'application/xhtml+xml' ? HTML : null, `createElement in ${type}`);
  assert(xml.toString().startsWith('<?xml version="1.0" encoding="utf-8"?>'), true, 'XML documents serialize with an XML declaration');
}

const xhtml = (new DOMParser).parseFromString('<html xmlns="http://www.w3.org/1999/xhtml"><body/></html>', 'application/xhtml+xml');
const section = xhtml.createElement('Section');
const paragraph = xhtml.createElement('p');
assert(section.constructor.name, 'HTMLUnknownElement', 'an XHTML document creates HTML elements');
assert(paragraph.constructor.name, 'HTMLParagraphElement');
assert(paragraph.tagName, 'p', 'whose tag names keep their case');
xhtml.documentElement.firstChild.append(section, paragraph);
assert(xhtml.documentElement.outerHTML, '<html xmlns="http://www.w3.org/1999/xhtml"><body><Section></Section><p></p></body></html>', 'in the XHTML namespace');
assert(xhtml.createElement('button', {is: 'x-y'}).hasAttribute('is'), false, 'is only applies to HTML documents');

for (const type of ['foo', 'text/xml; charset=utf-8', 'html', 'TEXT/HTML']) {
  try {
    (new DOMParser).parseFromString('<r/>', type);
    assert(true, false, `${type} should throw`);
  }
  catch (error) {
    assert(error.name, 'TypeError', `${type} is not a supported type`);
    assert(error.message, `Failed to execute 'parseFromString' on 'DOMParser': parameter 2 '${type}' is not a valid enumeration value for SupportedType`);
  }
}
