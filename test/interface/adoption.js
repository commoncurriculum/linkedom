const assert = require('../assert.js').for('Adoption');

const {parseHTML, DOMParser} = global[Symbol.for('linkedom')];

const markup = '<!doctype html><html><head><title>t</title></head><body><div id="d" a="1">x<!--c--><template id="t" b="2"><p c="3">y<template><i>z</i></template></p></template><svg><rect/></svg></div></body></html>';

// Every node below root, attributes and template contents included, as the
// letter its document maps to.
const owners = (root, letters) => {
  const out = [];
  const walk = node => {
    out.push(letters.get(node.ownerDocument) || '?');
    for (const attribute of node.attributes || [])
      out.push(letters.get(attribute.ownerDocument) || '?');
    if (node.content)
      walk(node.content);
    node.childNodes.forEach(walk);
  };
  walk(root);
  return out.join('');
};

const templateDocument = document => document.createElement('template').content.ownerDocument;

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

// https://dom.spec.whatwg.org/#concept-node-clone
{
  const {document} = parseHTML(markup);
  const inert = templateDocument(document);
  const div = document.getElementById('d');
  assert(owners(div, new Map([[document, 'D'], [inert, 'I']])), 'DDDDDDDDIIIIIIIIDD');

  const clone = document.cloneNode(true);
  const cloneInert = templateDocument(clone);
  assert(cloneInert === inert, false, 'a cloned document has its own template contents document');
  const letters = new Map([[clone, 'C'], [cloneInert, 'J'], [document, 'D'], [inert, 'I']]);
  assert(owners(clone.getElementById('d'), letters), 'CCCCCCCCJJJJJJJJCC', 'its nodes belong to it, and their template contents to its template contents document');
  assert(owners(clone.documentElement, letters).includes('D') || owners(clone.documentElement, letters).includes('I'), false);
  assert(clone.doctype.ownerDocument, clone, 'its doctype too');
  assert(clone.doctype === clone.firstChild, true);
  assert(clone.toString(), document.toString());
  assert(clone.contentType, 'text/html');
  assert(clone.createElement('p').ownerDocument, clone);

  const shallow = document.cloneNode();
  assert(shallow.childNodes.length, 0, 'a shallow clone of a document');
  assert(shallow.doctype, null);

  const xml = (new DOMParser).parseFromString('<!DOCTYPE r><r a="1"><s/></r>', 'application/xml');
  const xmlClone = xml.cloneNode(true);
  assert(xmlClone.contentType, 'application/xml', 'a cloned XML document keeps its content type');
  assert(owners(xmlClone.documentElement, new Map([[xmlClone, 'X']])), 'XXX');
  assert(xmlClone.doctype.ownerDocument, xmlClone);
  assert(xmlClone.toString(), xml.toString());

  const element = div.cloneNode(true);
  assert(owners(element, new Map([[document, 'D'], [inert, 'I']])), 'DDDDDDDDIIIIIIIIDD', 'an element clone stays in its document');
  assert(element.getAttributeNode('a').parentNode, null, 'a cloned attribute has no parent');
}

// https://dom.spec.whatwg.org/#dom-document-importnode
{
  const {document} = parseHTML(markup);
  const other = (new DOMParser).parseFromString('<!doctype html><html><body></body></html>', 'text/html');
  const inert = templateDocument(document);
  const otherInert = templateDocument(other);
  const letters = new Map([[other, 'O'], [otherInert, 'P'], [document, 'D'], [inert, 'I']]);

  const deep = other.importNode(document.getElementById('d'), true);
  assert(owners(deep, letters), 'OOOOOOOOPPPPPPPPOO', 'importNode clones into the document');
  assert(deep.outerHTML, document.getElementById('d').outerHTML);
  const shallow = other.importNode(document.getElementById('d'));
  assert(owners(shallow, letters), 'OOO', 'a shallow import has its attributes');
  const content = document.importNode(document.getElementById('t').content, true);
  assert(owners(content, letters), 'DDDDDIII', 'importing template contents');
  assert(other.importNode(document.createTextNode('t')).ownerDocument, other, 'any node');
  assert(other.importNode(document.getElementById('d').getAttributeNode('a')).ownerDocument, other);

  throws(() => other.importNode(document, true), 'NotSupportedError', 'Cannot import a document node', 'importing a document');
  const shadowRoot = document.createElement('div').attachShadow({mode: 'open'});
  throws(() => other.importNode(shadowRoot, true), 'NotSupportedError', 'Cannot adopt a shadow root', 'importing a shadow root');
  throws(() => shadowRoot.cloneNode(true), 'NotSupportedError', 'ShadowRoot nodes are not clonable.', 'cloning a shadow root');
}

// https://dom.spec.whatwg.org/#concept-node-adopt
{
  const {document} = parseHTML(markup);
  const other = (new DOMParser).parseFromString('<!doctype html><html><body></body></html>', 'text/html');
  const inert = templateDocument(document);
  const otherInert = templateDocument(other);
  const letters = new Map([[other, 'O'], [otherInert, 'P'], [document, 'D'], [inert, 'I']]);

  const div = document.getElementById('d');
  const host = div.appendChild(document.createElement('div'));
  host.attachShadow({mode: 'open'}).innerHTML = '<b>s</b>';
  other.body.appendChild(div);
  assert(owners(div, letters), 'OOOOOOOOPPPPPPPPOOO', 'inserting a node into another document adopts it');
  assert(host.shadowRoot.firstChild.ownerDocument, other, 'and its shadow tree');
  assert(document.getElementById('d'), null);

  const template = other.getElementById('t');
  const paragraph = document.createElement('p');
  paragraph.setAttribute('q', '1');
  paragraph.append('text');
  template.content.appendChild(paragraph);
  assert(owners(paragraph, letters), 'PPP', 'inserting into template contents adopts into their document');

  const fragment = document.createDocumentFragment();
  fragment.append(document.createElement('b'), 'text');
  other.body.append(fragment);
  assert(fragment.ownerDocument, document, 'a fragment\'s children are adopted');
  assert(other.body.lastChild.ownerDocument, other);
  assert(other.body.lastChild.previousSibling.ownerDocument, other);

  const attribute = document.createAttribute('z');
  other.body.setAttributeNode(attribute);
  assert(attribute.ownerDocument, other, 'an attribute set on an element of another document');
  const replacement = document.createAttribute('z');
  other.body.setAttributeNode(replacement);
  assert(replacement.ownerDocument, other, 'or replacing one there');
}

// https://html.spec.whatwg.org/multipage/custom-elements.html#concept-custom-element-definition-lifecycle-callbacks
{
  const {document, customElements, HTMLElement} = parseHTML('<!doctype html><html><head></head><body></body></html>');
  const events = [];
  class XFoo extends HTMLElement {
    static get observedAttributes() { return ['a']; }
    constructor() { super(); events.push('constructed'); }
    attributeChangedCallback(name, oldValue, value) { events.push(`${name}:${oldValue}:${value}`); }
    adoptedCallback(oldDocument, newDocument) { events.push(`adopted:${oldDocument === document}:${newDocument === document}`); }
  }
  customElements.define('x-foo', XFoo);
  const take = () => events.splice(0).join();

  document.body.innerHTML = '<x-foo a="1"></x-foo>';
  const foo = document.body.firstChild;
  take();
  const clone = foo.cloneNode(true);
  assert(clone instanceof XFoo, true, 'a clone is upgraded');
  assert(take(), 'constructed,a:null:1', 'once it has its attributes');

  const template = document.createElement('template');
  template.content.appendChild(foo);
  assert(take(), 'adopted:true:false', 'moving a custom element to another document calls adoptedCallback');
  document.body.appendChild(foo);
  assert(take(), 'adopted:false:true');
  document.body.appendChild(foo);
  assert(take(), '', 'but not within one');

  const copy = document.cloneNode(true);
  assert(copy.body.firstChild instanceof XFoo, true, 'a cloned document shares the definitions');
  assert(copy.body.firstChild.ownerDocument, copy);
  assert(copy.createElement('x-foo') instanceof XFoo, true, 'and creates custom elements');
}
