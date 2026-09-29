const assert = require('../assert.js').for('Template contents');

const {parseHTML, DOMParser} = global[Symbol.for('linkedom')];

// https://html.spec.whatwg.org/multipage/scripting.html#appropriate-template-contents-owner-document
{
  const {document} = parseHTML('<!doctype html><html><head></head><body><template id="t" a="1"><p b="2">x<!--y--></p><template><i>z</i></template></template></body></html>');
  const template = document.getElementById('t');
  const inert = template.content.ownerDocument;
  assert(inert === document, false, 'template contents belong to another document');
  assert(inert.contentType, 'text/html', 'an HTML one');
  assert(inert.defaultView, null, 'with no window');
  assert(document.createElement('template').content.ownerDocument, inert, 'the same for every template of the document');
  assert(inert.createElement('template').content.ownerDocument, inert, 'and for the templates it has itself');
  assert(template.ownerDocument, document);
  assert(template.getAttributeNode('a').ownerDocument, document);

  const nodes = [];
  const walk = node => {
    nodes.push(node, ...(node.attributes || []));
    if (node.content)
      walk(node.content);
    node.childNodes.forEach(walk);
  };
  walk(template.content);
  assert(nodes.length, 9, 'the parser');
  assert(nodes.every(node => node.ownerDocument === inert), true, 'creates template contents in that document');

  template.innerHTML = '<b c="3">1</b>';
  assert(template.content.firstChild.ownerDocument, inert, 'and so does innerHTML');
  assert(template.content.firstChild.getAttributeNode('c').ownerDocument, inert);
  assert(template.innerHTML, '<b c="3">1</b>');

  const other = (new DOMParser).parseFromString('<r/>', 'text/xml');
  const xmlTemplate = other.createElementNS('http://www.w3.org/1999/xhtml', 'template');
  assert(xmlTemplate.content.ownerDocument.contentType, 'application/xml', 'an XML document\'s template contents belong to an XML document');
  assert(xmlTemplate.content.ownerDocument.defaultView, null);

  const {firstChild: anchor} = parseHTML('<template><a href="page">a</a></template>').document.querySelector('template').content;
  assert(anchor.href, 'page', 'a URL in template contents has no base to resolve against');
  assert(anchor.baseURI, 'about:blank');
}

// https://html.spec.whatwg.org/multipage/custom-elements.html#look-up-a-custom-element-definition
{
  const {document, customElements, HTMLElement, HTMLButtonElement, MutationObserver} = parseHTML('<!doctype html><html><head></head><body></body></html>');
  const events = [];
  class XFoo extends HTMLElement {
    constructor() { super(); events.push('x-foo'); }
  }
  class XButton extends HTMLButtonElement {
    constructor() { super(); events.push('x-button'); }
  }
  customElements.define('x-foo', XFoo);
  customElements.define('x-button', XButton, {extends: 'button'});

  document.body.innerHTML = '<template id="t"><x-foo></x-foo><button is="x-button"></button><template><x-foo></x-foo></template></template><x-foo></x-foo>';
  const template = document.getElementById('t');
  const [foo, button] = template.content.children;
  assert(events.join(), 'x-foo', 'the parser constructs no custom element in template contents');
  assert(foo instanceof XFoo, false);
  assert(button instanceof XButton, false);
  assert(document.body.lastChild instanceof XFoo, true, 'but does outside them');

  events.splice(0);
  template.innerHTML = '<x-foo></x-foo>';
  assert(events.length, 0, 'nor does innerHTML');
  assert(template.content.firstChild instanceof XFoo, false);
  template.cloneNode(true);
  template.content.cloneNode(true);
  assert(events.length, 0, 'nor a clone');

  document.body.innerHTML = '<template id="late"><x-late></x-late></template><x-late></x-late>';
  customElements.define('x-late', class extends HTMLElement {
    constructor() { super(); events.push('x-late'); }
  });
  assert(events.join(), 'x-late', 'a definition upgrades the elements of the document only');

  events.splice(0);
  const imported = document.importNode(document.getElementById('late').content, true);
  assert(imported.firstChild.ownerDocument, document, 'importing template contents');
  assert(events.join(), 'x-late', 'constructs their custom elements');

  const records = [];
  const observer = new MutationObserver(list => records.push(...list));
  observer.observe(template.content, {childList: true});
  template.content.append(document.createElement('i'));
  Promise.resolve().then(() => {
    assert(records.length, 1, 'template contents are observed from the document');
    observer.disconnect();
  });
}
