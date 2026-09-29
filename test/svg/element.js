const assert = require('../assert.js').for('SVGElement');
const {parseHTML, SVGElement, DOMParser} = global[Symbol.for('linkedom')];

let {document} = parseHTML('<div><svg><rect /></svg></div>');

assert(document.ELEMENT_NODE, 1);
assert(document.ATTRIBUTE_NODE, 2);
assert(document.TEXT_NODE, 3);
assert(document.COMMENT_NODE, 8);
assert(document.DOCUMENT_NODE, 9);
assert(document.DOCUMENT_TYPE_NODE, 10);
assert(document.DOCUMENT_FRAGMENT_NODE, 11);

let svg = document.querySelector('svg');
assert(svg instanceof SVGElement, true, '<svg> is an instance of a facade');
assert('ownerSVGElement' in svg, true, '<svg> ownerSVGElement');
assert(svg.ownerSVGElement, null, '<svg> ownerSVGElement is null');
assert(svg.firstChild.ownerSVGElement, svg, '<rect> has an ownerSVGElement');
assert(document.toString(), '<html><head></head><body><div><svg><rect></rect></svg></div></body></html>', 'svg nodes are OK');
assert(document.documentElement.cloneNode(true).outerHTML, '<html><head></head><body><div><svg><rect></rect></svg></div></body></html>', 'svg cloned');

assert(JSON.stringify(document), '[9,1,"html",1,"head",-1,1,"body",1,"div",1,"svg",1,"rect",-6]');
assert(JSON.stringify(svg), '[1,"svg",1,"rect",-2]');

try {
  new SVGElement;
  assert(false, true, 'facades should not be instantiable');
}
catch (OK) {}

document = (new DOMParser).parseFromString(`<!doctype html><html><svg><rect /></svg></html>`, 'text/html');

assert('ownerSVGElement' in document.querySelector('svg rect'), true, 'svg restored');

svg.className.what = 'ever';

assert(svg.className.what, 'ever', '<svg>.className');

svg.setAttribute('test', 123);
svg.setAttribute('style', 'width:100px');

assert(svg.toString(), '<svg test="123" style="width:100px"><rect></rect></svg>');

svg.className = 'a b c';
assert(svg.getAttribute('class'), 'a b c');

svg.setAttribute('class', 'd e');
assert(svg.getAttribute('class'), 'd e');
assert(svg.namespaceURI, 'http://www.w3.org/2000/svg');

{
  const {document} = parseHTML('<!doctype html><html><body><svg><g><rect></rect></g><foreignObject><div><svg><circle></circle></svg></div></foreignObject></svg></body></html>');
  const svg = document.querySelector('svg');
  const rect = document.querySelector('rect');
  assert(rect.ownerSVGElement, svg, 'the nearest svg ancestor, through a g');

  const inner = document.querySelector('div > svg');
  assert(inner.ownerSVGElement, svg, 'an svg inside HTML inside an svg has the outer svg');
  assert(inner.firstChild.ownerSVGElement, inner, 'the nearest svg wins');

  const clone = svg.cloneNode(true);
  assert(clone.querySelector('rect').ownerSVGElement, clone, 'a deep clone points at its own svg');
  assert(clone.ownerSVGElement, null, 'a cloned outermost svg has none');

  const SVG = 'http://www.w3.org/2000/svg';
  const line = document.createElementNS(SVG, 'line');
  assert(line.ownerSVGElement, null, 'a created element has none until inserted');
  svg.firstChild.appendChild(line);
  assert(line.ownerSVGElement, svg, 'an element inserted through the API has one');
  inner.appendChild(line);
  assert(line.ownerSVGElement, inner, 'moving it moves its svg');
  line.remove();
  assert(line.ownerSVGElement, null, 'removing it clears it');

  const svgDocument = (new DOMParser).parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><g><path/></g></svg>', 'image/svg+xml');
  assert(svgDocument.querySelector('path').ownerSVGElement, svgDocument.documentElement, 'XML-parsed SVG');
}
