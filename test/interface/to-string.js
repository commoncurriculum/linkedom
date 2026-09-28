const assert = require('../assert.js').for('Node.toString');

const {parseHTML, DOMParser} = global[Symbol.for('linkedom')];

const {document} = parseHTML('<!doctype html><html><body><p title="x">a&nbsp;b<!--c--></p><script>1 < 2</script></body></html>');

const p = document.querySelector('p');
const [text, comment] = p.childNodes;

assert(String(text), 'a&nbsp;b', 'a text node writes as innerHTML writes it');
assert(String(text), p.innerHTML.slice(0, 8), 'the same escaping as innerHTML');
assert(String(comment), '<!--c-->', 'comment');
assert(String(document.querySelector('script').firstChild), '1 < 2', 'text inside raw text elements stays raw');
assert(String(document.doctype), '<!DOCTYPE html>', 'doctype');
assert(p.childNodes.join(''), p.innerHTML, 'joining the children gives innerHTML');

const title = p.getAttributeNode('title');
assert(String(title), 'title="x"', 'attribute');
title.value = '"<&>\xA0';
assert(String(title), 'title="&quot;&lt;&amp;&gt;&nbsp;"', 'attribute values escape as the start tag escapes them');
const disabled = document.createAttribute('disabled');
assert(String(disabled), 'disabled=""', 'no shorthand for empty attributes');
const xlink = document.createAttributeNS('http://www.w3.org/1999/xlink', 'x:href');
assert(String(xlink), 'xlink:href=""', 'namespaced attributes use the serialized name');

const cdata = document.createCDATASection('<b>');
assert(String(cdata), '&lt;b&gt;', 'HTML writes a CDATA section as text');

const fragment = document.createDocumentFragment();
fragment.append('a<b', document.createElement('i'));
assert(String(fragment), '<#document-fragment>a&lt;b<i></i></#document-fragment>', 'fragments keep their wrapper');

const xml = (new DOMParser).parseFromString('<root a="1&#9;2"><![CDATA[<b>]]><!--c-->t&amp;</root>', 'text/xml');
const root = xml.documentElement;
const [xmlCdata, xmlComment, xmlText] = root.childNodes;
assert(String(xmlCdata), '<![CDATA[<b>]]>', 'XML CDATA section');
assert(String(xmlComment), '<!--c-->', 'XML comment');
assert(String(xmlText), 't&amp;', 'XML text');
assert(String(root.getAttributeNode('a')), 'a="1&#x9;2"', 'XML attribute');
const nbsp = xml.createAttribute('n');
nbsp.value = '\xA0<';
assert(String(nbsp), 'n="\xA0&lt;"', 'XML leaves U+00A0 alone');
assert(xml.toString(), '<?xml version="1.0" encoding="utf-8"?><root a="1&#x9;2"><![CDATA[<b>]]><!--c-->t&amp;</root>', 'XML document');

const xmlFragment = xml.createDocumentFragment();
xmlFragment.append(xml.createElement('x'), 'y');
assert(String(xmlFragment), '<#document-fragment><x/>y</#document-fragment>', 'XML fragments keep their wrapper');
