const assert = require('../assert.js').for('Text');

const {parseHTML, DOMParser} = global[Symbol.for('linkedom')];

const {document} = parseHTML('<html><div><span></span></div></html>');

let div = document.querySelector('div');

div.firstChild.outerHTML = 'hello';
assert(div.firstChild.toString(), 'hello');

div.innerHTML = '<span></span>'
div.firstChild.outerHTML = '<p>hello</p>';
assert(div.firstChild.toString(), '<p>hello</p>');

div.innerHTML = '<span></span>'
div.firstChild.outerHTML = '<p>hello</p> world';
assert(div.toString(), '<div><p>hello</p> world</div>');

assert(div.namespaceURI, 'http://www.w3.org/1999/xhtml');

const parser = new DOMParser();
const htmlDoc = parser.parseFromString(`<div><span content-desc="text3&amp;more"/></div>`, 'text/html').body.firstElementChild;

assert(htmlDoc.firstChild.getAttribute('content-desc'), 'text3&more');
assert(htmlDoc.firstChild.outerHTML, '<span content-desc="text3&amp;more"></span>');
assert(htmlDoc.innerHTML, '<span content-desc="text3&amp;more"></span>');

htmlDoc.firstChild.setAttribute('content-desc', '');
assert(htmlDoc.firstChild.getAttribute('content-desc'), '');
assert(htmlDoc.firstChild.outerHTML, '<span content-desc=""></span>');
assert(htmlDoc.innerHTML, '<span content-desc=""></span>');

const htmlNode = htmlDoc.ownerDocument.createElement('div');
htmlNode.innerHTML = '<p>!</p>';
assert(htmlNode.innerHTML, '<p>!</p>', 'innerHTML');
try {
  htmlNode.insertAdjacentHTML('beforebegin', 'beforebegin');
  assert(true, false, 'no parent, beforebegin should throw');
} catch ({name}) {
  assert(name, 'NoModificationAllowedError', 'no parent, beforebegin throws');
}
try {
  htmlNode.insertAdjacentHTML('afterend', 'afterend');
  assert(true, false, 'no parent, afterend should throw');
} catch ({name}) {
  assert(name, 'NoModificationAllowedError', 'no parent, afterend throws');
}
assert(htmlNode.toString(), '<div><p>!</p></div>', 'no element, no before/after');
htmlNode.firstElementChild.insertAdjacentHTML('beforebegin', 'beforebegin');
assert(htmlNode.toString(), '<div>beforebegin<p>!</p></div>', 'beforebegin works');
htmlNode.firstElementChild.insertAdjacentHTML('afterbegin', 'afterbegin');
assert(htmlNode.toString(), '<div>beforebegin<p>afterbegin!</p></div>', 'afterbegin works');
htmlNode.firstElementChild.insertAdjacentHTML('beforeend', 'beforeend');
assert(htmlNode.toString(), '<div>beforebegin<p>afterbegin!beforeend</p></div>', 'beforeend works');
htmlNode.firstElementChild.insertAdjacentHTML('afterend', 'afterend');
assert(htmlNode.toString(), '<div>beforebegin<p>afterbegin!beforeend</p>afterend</div>', 'afterend works');

htmlNode.firstElementChild.insertAdjacentHTML('beforeend', '<i>1</i><i>2</i>');
assert(htmlNode.toString(), '<div>beforebegin<p>afterbegin!beforeend<i>1</i><i>2</i></p>afterend</div>', 'multiple html works');

htmlNode.firstElementChild.insertAdjacentText('afterend', '<OK>');
assert(htmlNode.toString(), '<div>beforebegin<p>afterbegin!beforeend<i>1</i><i>2</i></p>&lt;OK&gt;afterend</div>', 'insertAdjacentText works');

const htmlDocWithEmptyAttrFromSet = parser.parseFromString(`<div><span style=""/></div>`, 'text/html').body.firstElementChild;

assert(htmlDocWithEmptyAttrFromSet.firstChild.getAttribute('style'), '');
assert(htmlDocWithEmptyAttrFromSet.firstChild.outerHTML, '<span style=""></span>');
assert(htmlDocWithEmptyAttrFromSet.innerHTML, '<span style=""></span>');

const xmlDoc = parser.parseFromString(`<hierarchy><android.view.View content-desc="text3&amp;more"/></hierarchy>`, 'text/xml').documentElement;

assert(xmlDoc.firstChild.getAttribute('content-desc'), 'text3&more');
assert(xmlDoc.firstChild.outerHTML, '<android.view.View content-desc="text3&amp;more"/>');
assert(xmlDoc.innerHTML, '<android.view.View content-desc="text3&amp;more"/>');

xmlDoc.firstChild.setAttribute('content-desc', '');
assert(xmlDoc.firstChild.getAttribute('content-desc'), '');
assert(xmlDoc.firstChild.outerHTML, '<android.view.View content-desc=""/>');
assert(xmlDoc.innerHTML, '<android.view.View content-desc=""/>');

const xmlNode = xmlDoc.ownerDocument.createElement('div');
xmlNode.innerHTML = '<p>!</p>';
assert(xmlNode.innerHTML, '<p>!</p>', 'innerHTML');
try {
  xmlNode.insertAdjacentHTML('beforebegin', 'beforebegin');
  assert(true, false, 'no parent, beforebegin should throw');
} catch ({name}) {
  assert(name, 'NoModificationAllowedError', 'no parent, beforebegin throws');
}
try {
  xmlNode.insertAdjacentHTML('afterend', 'afterend');
  assert(true, false, 'no parent, afterend should throw');
} catch ({name}) {
  assert(name, 'NoModificationAllowedError', 'no parent, afterend throws');
}
assert(xmlNode.toString(), '<div><p>!</p></div>', 'no element, no before/after');
xmlNode.firstElementChild.insertAdjacentHTML('beforebegin', 'beforebegin');
assert(xmlNode.toString(), '<div>beforebegin<p>!</p></div>', 'beforebegin works');
xmlNode.firstElementChild.insertAdjacentHTML('afterbegin', 'afterbegin');
assert(xmlNode.toString(), '<div>beforebegin<p>afterbegin!</p></div>', 'afterbegin works');
xmlNode.firstElementChild.insertAdjacentHTML('beforeend', 'beforeend');
assert(xmlNode.toString(), '<div>beforebegin<p>afterbegin!beforeend</p></div>', 'beforeend works');
xmlNode.firstElementChild.insertAdjacentHTML('afterend', 'afterend');
assert(xmlNode.toString(), '<div>beforebegin<p>afterbegin!beforeend</p>afterend</div>', 'afterend works');

xmlNode.firstElementChild.insertAdjacentHTML('beforeend', '<i>1</i><i>2</i>');
assert(xmlNode.toString(), '<div>beforebegin<p>afterbegin!beforeend<i>1</i><i>2</i></p>afterend</div>', 'multiple html works');

xmlNode.firstElementChild.insertAdjacentText('afterend', '<OK>');
assert(xmlNode.toString(), '<div>beforebegin<p>afterbegin!beforeend<i>1</i><i>2</i></p>&lt;OK&gt;afterend</div>', 'insertAdjacentText works');

const xmlDocWithEmptyAttrFromSet = parser.parseFromString(`<hierarchy><android.view.View style=""/></hierarchy>`, 'text/xml').documentElement;
assert(xmlDocWithEmptyAttrFromSet.firstChild.getAttribute('style'), '');
assert(xmlDocWithEmptyAttrFromSet.firstChild.outerHTML, '<android.view.View style=""/>');
assert(xmlDocWithEmptyAttrFromSet.innerHTML, '<android.view.View style=""/>');

{
  const {document} = parseHTML('<!doctype html><html><body><div id="d"><p>p</p></div></body></html>');
  const div = document.getElementById('d');
  const p = div.firstChild;

  p.insertAdjacentHTML('BeforeEnd', '<b>1</b>');
  p.insertAdjacentHTML('AFTERBEGIN', '<i>0</i>');
  p.insertAdjacentHTML('beforeBegin', '<u>a</u>');
  p.insertAdjacentHTML('AfterEnd', '<s>z</s>');
  assert(div.innerHTML, '<u>a</u><p><i>0</i>p<b>1</b></p><s>z</s>', 'insertAdjacentHTML matches positions case-insensitively');

  p.insertAdjacentText('BEFOREEND', '<2>');
  assert(p.innerHTML, '<i>0</i>p<b>1</b>&lt;2&gt;', 'insertAdjacentText too');
  const em = document.createElement('em');
  assert(p.insertAdjacentElement('AfterBegin', em), em, 'insertAdjacentElement too');
  assert(p.firstChild, em);

  for (const [name, call] of [
    ['insertAdjacentHTML', position => p.insertAdjacentHTML(position, '<q></q>')],
    ['insertAdjacentText', position => p.insertAdjacentText(position, 'q')],
    ['insertAdjacentElement', position => p.insertAdjacentElement(position, document.createElement('q'))]
  ]) {
    for (const position of ['bogus', '', 'before begin', 'beforebegin ']) {
      try {
        call(position);
        assert(true, false, `${name}(${JSON.stringify(position)}) should throw`);
      }
      catch (error) {
        assert(error.name, 'SyntaxError', `${name}(${JSON.stringify(position)}) throws a SyntaxError`);
        assert(error.message, 'Must provide one of "beforebegin", "afterbegin", "beforeend", or "afterend".');
      }
    }
  }
  assert(div.innerHTML, '<u>a</u><p><em></em><i>0</i>p<b>1</b>&lt;2&gt;</p><s>z</s>', 'an invalid position inserts nothing');

  const orphan = document.createElement('div');
  try {
    orphan.insertAdjacentHTML('nowhere', '<q></q>');
    assert(true, false, 'an invalid position throws before the parent is checked');
  }
  catch ({name}) {
    assert(name, 'SyntaxError');
  }
  assert(orphan.insertAdjacentElement('beforebegin', em), null, 'no parent, no insertion');
  assert(em.parentNode, p);

  const fragment = document.createDocumentFragment();
  const child = fragment.appendChild(document.createElement('span'));
  child.insertAdjacentElement('beforebegin', document.createElement('a'));
  child.insertAdjacentHTML('afterend', '<i>i</i>');
  assert(String(fragment), '<#document-fragment><a></a><span></span><i>i</i></#document-fragment>', 'a fragment parent takes adjacent nodes');
}

{
  const {document} = parseHTML('<!doctype html><html><body><p>p</p></body></html>');
  const orphan = document.createElement('div');
  assert(orphan.insertAdjacentElement('afterend', document.createElement('i')), null, 'afterend without a parent');
  orphan.outerHTML = '<b>ignored</b>';
  assert(orphan.outerHTML, '<div></div>', 'outerHTML without a parent does nothing');
  try {
    document.documentElement.outerHTML = '<html></html>';
    assert(true, false, 'a document child cannot be replaced by markup');
  }
  catch ({name}) {
    assert(name, 'NoModificationAllowedError');
  }
  const fragment = document.createDocumentFragment();
  const child = fragment.appendChild(document.createElement('span'));
  child.outerHTML = '<td>cell</td><b>b</b>';
  assert(String(fragment), '<#document-fragment>cell<b>b</b></#document-fragment>', 'a fragment parent parses in a body');
  document.body.firstChild.outerHTML = '<td>cell</td>';
  assert(document.body.innerHTML, 'cell', 'an element parent is the context');
  document.body.insertAdjacentHTML('beforebegin', '<td>c</td><p>x</p>');
  assert(document.documentElement.innerHTML, '<head></head>c<p>x</p><body>cell</body>', 'an html parent parses in a body');
  document.body.innerHTML = null;
  assert(document.body.innerHTML, '', 'innerHTML null');
}
