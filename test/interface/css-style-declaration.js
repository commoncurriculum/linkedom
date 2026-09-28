const assert = require('../assert.js').for('CSSStyleDeclaration');

const {parseHTML} = global[Symbol.for('linkedom')];

const {document} = parseHTML('');

let node = document.createElement('div');
assert(node.style.cssText, '', 'empty style');
// Per CSSOM, an unset property reads as the empty string, not undefined —
// matching getPropertyValue, which is routed through the same getter.
assert(node.style.color, '', 'unset property getter returns ""');
assert(node.style.getPropertyValue('color'), '', 'unset getPropertyValue returns ""');
node.style.cssText = 'background-color: blue; background-image: url("https://t.co/i.png");';
assert(node.style.backgroundColor, 'blue', 'style getter');
assert(node.style.backgroundImage, 'url("https://t.co/i.png")', 'style value with colon');
assert(node.style.toString(), '[object CSSStyleDeclaration]', 'toString');
assert(node.style.cssText, 'background-color: blue; background-image: url("https://t.co/i.png");', 'cssText setter');
assert([...node.style].join(','), 'background-color,background-image', 'iterable');
assert(node.style.length, 2, 'style.length');
assert(node.style[0], 'background-color', 'style[0]');
node.getAttributeNode('style').value = 'color: red';
assert(node.style.cssText, 'color: red;', 'cssText indirect setter');
let style = document.createAttribute('style');
node.setAttributeNode(style);
assert(node.toString(), '<div style=""></div>', 'cssText cleanup');
node.style.backgroundColor = 'green';
assert(node.toString(), '<div style="background-color: green;"></div>', 'cssText indirect property');
node.removeAttributeNode(style);
node.style.color = 'green';
assert(node.toString(), '<div style="color: green;"></div>', 'cssText indirect setter again');

node.style.color = null;
assert(node.toString(), '<div style=""></div>', 'setter as null');
node.id = '';
node.className = '';
assert(node.toString(), '<div style="" id="" class=""></div>', 'setter as null');

node.style.setProperty('background-color', 'purple');
assert(node.toString(), '<div style="background-color: purple;" id="" class=""></div>', 'setProperty');
assert(node.style.getPropertyValue('background-color'), 'purple', 'getPropertyValue');
node.style.removeProperty('background-color')
assert(node.toString(), '<div style="" id="" class=""></div>', 'removeProperty');

/** @type {HTMLDivElement} */
const divWithStyle = document.createElement('div');
divWithStyle.setAttribute('style', ' display:  flex ;');
assert(divWithStyle.hasAttribute('style'), true, 'hasAttribute');
assert(divWithStyle.getAttribute('style'), ' display:  flex ;', 'getAttribute');
assert([...divWithStyle.style].join(','), 'display', 'iterable');
assert(Array.from(divWithStyle.style).join(','), 'display', 'Array.from');
divWithStyle.style.setProperty('display', 'block');
assert([...divWithStyle.style].join(','), 'display', 'iterable after change');
assert(Array.from(divWithStyle.style).join(','), 'display', 'Array.from after change');
divWithStyle.style.setProperty('color', 'green');
assert([...divWithStyle.style].join(','), 'display,color', 'iterable after adding property');
assert(Array.from(divWithStyle.style).join(','), 'display,color', 'Array.from after adding property');

{
  const {document} = parseHTML('<!doctype html><html><body><p style="color: red">p</p></body></html>');
  const p = document.querySelector('p');
  assert(p.style, p.style, 'one declaration block per element');
  assert(p.style.cssText, 'color: red;');
  p.removeAttribute('style');
  assert(p.style.cssText, '', 'removing the attribute empties the declarations');
  assert(p.style.length, 0);
  assert(p.style[0], undefined, 'and their indices');
  p.setAttribute('style', 'color: red; font-weight: bold');
  assert(p.style.length, 2, 'setting it parses it');
  assert(p.style[1], 'font-weight');
  p.style = 'color: blue';
  assert(p.getAttribute('style'), 'color: blue;', 'style forwards to cssText');
  assert(p.style.length, 1);
  assert(p.style[1], undefined);
  assert(p.style.removeProperty('font-weight'), '', 'removing a missing property');
  assert(p.getAttribute('style'), 'color: blue;', 'leaves the attribute alone');
  p.style.cssText = null;
  assert(p.getAttribute('style'), '', 'cssText null');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  svg.style.fill = 'red';
  assert(svg.outerHTML, '<rect style="fill: red;"></rect>', 'SVG elements have style');
  const math = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi');
  math.setAttribute('style', 'color: red');
  assert(math.style.color, 'red', 'MathML elements have style');
  assert('style' in document.createElementNS('urn:x', 'x'), false, 'other elements do not');
  assert('style' in document.createElementNS(null, 'x'), false);
}

{
  // A custom element that restyles other elements while its own style
  // attribute changes: none of those writes is dropped.
  const {document, customElements, HTMLElement} = parseHTML('<!doctype html><html><body><p style="color: red">p</p><div></div></body></html>');
  const p = document.querySelector('p');
  const other = document.querySelector('div');
  assert(p.style.color, 'red');
  customElements.define('x-watch', class extends HTMLElement {
    static get observedAttributes() { return ['style']; }
    attributeChangedCallback() {
      other.style.color = 'blue';
      p.setAttribute('style', 'color: green');
    }
  });
  const watch = document.createElement('x-watch');
  document.body.appendChild(watch);
  watch.style.color = 'black';
  assert(watch.getAttribute('style'), 'color: black;');
  assert(other.style.cssText, 'color: blue;');
  assert(other.getAttribute('style'), 'color: blue;', 'a style write inside attributeChangedCallback reaches its attribute');
  assert(p.getAttribute('style'), 'color: green');
  assert(p.style.cssText, 'color: green;', 'an attribute write inside attributeChangedCallback reaches its style');
}

{
  const {document} = parseHTML('<!doctype html><html><body></body></html>');
  const p = document.createElement('p');
  p.style.setProperty('color', 'red', 'important');
  assert(p.style.getPropertyPriority('color'), 'important');
  assert(p.getAttribute('style'), 'color: red !important;');
  assert(p.style.getPropertyPriority('margin'), '');
}
