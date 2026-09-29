'use strict';
const {MUTATION_OBSERVER} = require('./symbols.js');
const {defineProperties} = require('./object.js');

const windowless = new WeakSet;

/**
 * @param {Document} document a document without a browsing context, so without a window
 * @param {Document} source the document it is made for
 * @returns {Document}
 */
const withoutBrowsingContext = (document, source) => {
  windowless.add(document);
  defineProperties(document, {
    // A mutation reaches its observers through the node's document, and the
    // observers of source observe this document's nodes too.
    [MUTATION_OBSERVER]: {get: () => source[MUTATION_OBSERVER]}
  });
  return document;
};
exports.withoutBrowsingContext = withoutBrowsingContext;

/**
 * @param {Document} document
 * @returns {boolean}
 */
const hasBrowsingContext = document => !windowless.has(document);
exports.hasBrowsingContext = hasBrowsingContext;
