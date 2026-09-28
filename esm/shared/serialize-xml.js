// w3c-xmlserializer is jsdom's implementation of the DOM Parsing standard's
// XML serialization.

import produceXMLSerialization from 'w3c-xmlserializer';

/**
 * @param {Node} node
 * @param {boolean} requireWellFormed
 * @returns {string}
 */
export const serializeXML = (node, requireWellFormed) => {
  try {
    return produceXMLSerialization(node, {requireWellFormed});
  }
  catch (error) {
    throw new DOMException(error.message, 'InvalidStateError');
  }
};
