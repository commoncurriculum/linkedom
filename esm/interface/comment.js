import {COMMENT_NODE} from '../shared/constants.js';

import {CharacterData} from './character-data.js';

/**
 * @implements globalThis.Comment
 */
export class Comment extends CharacterData {
  constructor(ownerDocument, data = '') {
    super(ownerDocument, '#comment', COMMENT_NODE, data);
  }
}
