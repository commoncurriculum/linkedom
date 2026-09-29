'use strict';
const {COMMENT_NODE} = require('../shared/constants.js');

const {CharacterData} = require('./character-data.js');

/**
 * @implements globalThis.Comment
 */
class Comment extends CharacterData {
  constructor(ownerDocument, data = '') {
    super(ownerDocument, '#comment', COMMENT_NODE, data);
  }
}
exports.Comment = Comment
