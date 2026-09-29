import {MUTATION_OBSERVER} from './symbols.js';
import {defineProperties} from './object.js';

const windowless = new WeakSet;

/**
 * @param {Document} document a document without a browsing context, so without a window
 * @param {Document} source the document it is made for
 * @returns {Document}
 */
export const withoutBrowsingContext = (document, source) => {
  windowless.add(document);
  defineProperties(document, {
    // A mutation reaches its observers through the node's document, and the
    // observers of source observe this document's nodes too.
    [MUTATION_OBSERVER]: {get: () => source[MUTATION_OBSERVER]}
  });
  return document;
};

/**
 * @param {Document} document
 * @returns {boolean}
 */
export const hasBrowsingContext = document => !windowless.has(document);
