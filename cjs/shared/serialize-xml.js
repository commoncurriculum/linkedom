'use strict';
// w3c-xmlserializer is jsdom's implementation of the DOM Parsing standard's
// XML serialization.

const produceXMLSerialization = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('w3c-xmlserializer'));

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
