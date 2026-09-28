// https://dom.spec.whatwg.org/#namespaces
// The patterns are the standard's; the messages are jsdom's.

import {XML_NAMESPACE, XMLNS_NAMESPACE} from './constants.js';

const validElementLocalName =
  /^(?:[A-Za-z][^\0\t\n\f\r />]*|[:_\u0080-\u{10FFFF}][A-Za-z0-9-.:_\u0080-\u{10FFFF}]*)$/u;
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
