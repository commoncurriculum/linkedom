import {SaxesParser} from 'saxes';

import {DOCUMENT_NODE} from './constants.js';
import {CREATE_ELEMENT} from './symbols.js';
import {linkAttribute, linkNode} from './utils.js';

import {Attr} from '../interface/attr.js';

const doctypes = [
  [/^html$/i, () => ['html', '', '']],
  [/^([^\s]+)\s+public\s+"([^"]+)"\s+"([^"]+)"/i, match => match.slice(1)],
  [/^([^\s]+)\s+system\s+"([^"]+)"/i, ([, name, systemId]) => [name, '', systemId]],
  [/^([^\s>]+)/, ([, name]) => [name, '', '']]
];

const entities = /<!ENTITY ([^ ]+) "([^"]+)">/g;

const doctypeOf = (document, declaration) => {
  for (const [pattern, parts] of doctypes) {
    const match = pattern.exec(declaration);
    if (match)
      return document.createDocumentType(...parts(match));
  }
  return document.createDocumentType('html', '', '');
};

/**
 * @param {Document|DocumentFragment} root the node the markup's nodes go into
 * @param {string} xml
 * @param {Element?} context the element a fragment is parsed for
 */
export const parseXML = (root, xml, context = null) => {
  const document = root.nodeType === DOCUMENT_NODE ? root : root.ownerDocument;
  const parser = new SaxesParser({
    xmlns: true,
    defaultXMLVersion: '1.0',
    forceXMLVersion: true,
    fragment: !!context,
    resolvePrefix: context ? prefix => context.lookupNamespaceURI(prefix) || undefined : undefined
  });
  const stack = [root];
  const current = () => stack[stack.length - 1];

  // Text outside a document's root element is not part of its tree.
  parser.on('text', data => {
    if (context || stack.length > 1)
      linkNode(current(), document.createTextNode(data));
  });
  parser.on('cdata', data => linkNode(current(), document.createCDATASection(data)));
  parser.on('comment', data => linkNode(current(), document.createComment(data)));
  parser.on('doctype', declaration => {
    linkNode(current(), doctypeOf(document, declaration.trim()));
    for (const [, name, value] of declaration.matchAll(entities)) {
      if (!(name in parser.ENTITIES))
        parser.ENTITIES[name] = value;
    }
  });
  parser.on('opentag', ({local, uri, prefix, attributes}) => {
    const element = document[CREATE_ELEMENT](uri || null, local, prefix || null);
    for (const {local, uri, prefix, value} of Object.values(attributes)) {
      const name = prefix ? `${prefix}:${local}` : local;
      linkAttribute(element, new Attr(document, name, value, uri || null, prefix || null, local));
    }
    linkNode(current(), element);
    stack.push(element);
  });
  parser.on('closetag', () => stack.pop());
  parser.on('error', error => {
    throw new DOMException(error.message, 'SyntaxError');
  });

  parser.write(xml).close();
  return root;
};
