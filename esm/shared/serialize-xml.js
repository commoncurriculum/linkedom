import produceXMLSerialization from 'w3c-xmlserializer';
import {serializeAttributeValue} from 'w3c-xmlserializer/lib/attributes.js';

import {VALUE} from './symbols.js';

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

export const serializeXMLAttribute = attribute =>
  `${attribute.name}="${serializeAttributeValue(attribute[VALUE], false)}"`;
