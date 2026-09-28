// https://dom.spec.whatwg.org/#namespaces
// The patterns are the standard's; the messages are jsdom's.

import {XML_NAMESPACE, XMLNS_NAMESPACE} from './constants.js';

const validElementLocalName =
  /^(?:[A-Za-z][^\0\t\n\f\r />]*|[:_\u{80}-\u{10FFFF}][A-Za-z0-9-.:_\u{80}-\u{10FFFF}]*)$/u;
const invalidNamespacePrefix = /[\0\t\n\f\r />]/u;
const invalidAttributeLocalName = /[\0\t\n\f\r /=>]/u;

const invalidCharacter = (name, type) => new DOMException(
  `"${name}" is not a valid ${type}`,
  'InvalidCharacterError'
);

const namespaceError = message => new DOMException(message, 'NamespaceError');

export const validElementName = name => {
  if (!validElementLocalName.test(name))
    throw invalidCharacter(name, 'element local name');
  return name;
};

export const validAttributeName = name => {
  if (!name.length || invalidAttributeLocalName.test(name))
    throw invalidCharacter(name, 'attribute local name');
  return name;
};

/**
 * @param {string?} namespace
 * @param {string} qualifiedName
 * @param {boolean} isElement
 * @returns {{namespace: string?, prefix: string?, localName: string}}
 */
export const validateAndExtract = (namespace, qualifiedName, isElement) => {
  if (namespace === '' || namespace === undefined)
    namespace = null;
  let prefix = null, localName = qualifiedName;
  const colon = qualifiedName.indexOf(':');
  if (colon > -1) {
    prefix = qualifiedName.slice(0, colon);
    localName = qualifiedName.slice(colon + 1);
    if (!prefix.length || invalidNamespacePrefix.test(prefix))
      throw invalidCharacter(prefix, 'namespace prefix');
  }
  if (isElement)
    validElementName(localName);
  else
    validAttributeName(localName);
  if (prefix !== null && namespace === null)
    throw namespaceError('A prefix was given but no namespace was provided');
  if (prefix === 'xml' && namespace !== XML_NAMESPACE)
    throw namespaceError('A prefix of "xml" was given but the namespace was not the XML namespace');
  if ((qualifiedName === 'xmlns' || prefix === 'xmlns') && namespace !== XMLNS_NAMESPACE)
    throw namespaceError('A prefix or qualifiedName of "xmlns" was given but the namespace was not the XMLNS namespace');
  if (namespace === XMLNS_NAMESPACE && qualifiedName !== 'xmlns' && prefix !== 'xmlns')
    throw namespaceError('The XMLNS namespace was given but neither the prefix nor qualifiedName was "xmlns"');
  return {namespace, prefix, localName};
};

const asciiLetters = /[a-z]+/g;
const asciiCapitals = /[A-Z]+/g;
const upper = letters => letters.toUpperCase();
const lower = letters => letters.toLowerCase();

export const asciiUppercase = name => name.replace(asciiLetters, upper);
export const asciiLowercase = name => name.replace(asciiCapitals, lower);

// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
const potentialCustomElementName =
  /^[a-z][-.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{203F}\u{2040}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}\u{10000}-\u{EFFFF}]*$/u;

const reservedCustomElementNames = new Set([
  'annotation-xml', 'color-profile', 'font-face', 'font-face-src',
  'font-face-uri', 'font-face-format', 'font-face-name', 'missing-glyph'
]);

export const isValidCustomElementName = name =>
  name.includes('-') &&
  potentialCustomElementName.test(name) &&
  !reservedCustomElementNames.has(name);
