const assert = require('../assert.js').for('Attribute changes');

const {parseHTML} = global[Symbol.for('linkedom')];

// Every way to change an attribute is seen by queries, which linkedom/cached
// caches, and by classList.
const {document} = parseHTML('<!doctype html><html><body><div><p></p></div></body></html>');
const {body} = document;
const div = document.querySelector('div');
const p = document.querySelector('p');

assert(body.querySelector('[disabled]'), null);
assert(div.toggleAttribute('disabled'), true);
assert(body.querySelector('[disabled]'), div, 'toggleAttribute adds');
assert(div.toggleAttribute('disabled'), false);
assert(body.querySelector('[disabled]'), null, 'toggleAttribute removes');
div.toggleAttribute('disabled', true);
assert(body.querySelector('[disabled]'), div, 'toggleAttribute forced on');
div.toggleAttribute('disabled', false);
assert(body.querySelector('[disabled]'), null, 'toggleAttribute forced off');

div.setAttributeNS(null, 'data-x', '1');
assert(body.querySelector('[data-x="1"]'), div, 'setAttributeNS');
div.getAttributeNode('data-x').value = '2';
assert(body.querySelector('[data-x="2"]'), div, 'Attr.value');
div.removeAttributeNS(null, 'data-x');
assert(body.querySelector('[data-x]'), null, 'removeAttributeNS');

const title = document.createAttribute('title');
title.value = 't';
div.setAttributeNode(title);
assert(body.querySelector('[title=t]'), div, 'setAttributeNode');
div.removeAttributeNode(title);
assert(body.querySelector('[title]'), null, 'removeAttributeNode');

assert(div.querySelector('.a > p'), null);
div.classList.add('a');
assert(body.querySelector('.a'), div, 'classList');
assert(div.querySelector('.a > p'), p, 'queries on the element itself see its attributes');
div.className = 'b';
assert(div.classList.contains('a'), false, 'classList follows className');
assert(div.classList.contains('b'), true);
div.getAttributeNode('class').value = 'c d';
assert([...div.classList].join(' '), 'c d', 'classList follows Attr.value');
div.removeAttribute('class');
assert(div.classList.length, 0, 'classList empties with its attribute');
div.setAttributeNS('urn:x', 'x:class', 'e');
assert(div.classList.length, 0, 'a namespaced class attribute is not the class');
div.setAttribute('class', 'f');
assert(div.classList.value, 'f');

{
  const {document, customElements, HTMLElement} = parseHTML('<!doctype html><html><body></body></html>');
  const seen = [];
  customElements.define('x-seen', class extends HTMLElement {
    static get observedAttributes() { return ['class', 'style']; }
    attributeChangedCallback(name, oldValue, newValue) {
      seen.push([name, oldValue, newValue, this.classList.value, this.style.cssText]);
    }
  });
  document.body.innerHTML = '<x-seen class="a" style="color: red"></x-seen>';
  const element = document.body.firstChild;
  assert(JSON.stringify(seen), '[["class",null,"a","a",""],["style",null,"color: red","a","color: red;"]]', 'classList and style are up to date in attributeChangedCallback while parsing');
  seen.length = 0;
  element.classList.toggle('b');
  element.style.color = 'blue';
  assert(JSON.stringify(seen), '[["class","a","a b","a b","color: red;"],["style","color: red","color: blue;","a b","color: blue;"]]', 'and after');
}
