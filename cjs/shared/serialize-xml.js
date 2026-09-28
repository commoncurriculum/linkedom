'use strict';
const produceXMLSerialization = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('w3c-xmlserializer'));
const {serializeAttributeValue} = require('w3c-xmlserializer/lib/attributes.js');

const {VALUE} = require('./symbols.js');

/**
 * @param {Node} node
 * @param {boolean} requireWellFormed
 * @returns {string}
 */
const serializeXML = (node, requireWellFormed) => {
  try {
    return produceXMLSerialization(node, {requireWellFormed});
  }
  catch (error) {
    throw new DOMException(error.message, 'InvalidStateError');
  }
};
exports.serializeXML = serializeXML;

const serializeXMLAttribute = attribute =>
  `${attribute.name}="${serializeAttributeValue(attribute[VALUE], false)}"`;
exports.serializeXMLAttribute = serializeXMLAttribute;
