'use strict';
const {TEXT_NODE} = require('../shared/constants.js');
const {VALUE} = require('../shared/symbols.js');

const {CharacterData} = require('./character-data.js');

/**
 * @implements globalThis.Text
 */
class Text extends CharacterData {
  constructor(ownerDocument, data = '') {
    super(ownerDocument, '#text', TEXT_NODE, data);
  }

  get wholeText() {
    const text = [];
    let {previousSibling, nextSibling} = this;
    while (previousSibling) {
      if (previousSibling.nodeType === TEXT_NODE)
        text.unshift(previousSibling[VALUE]);
      else
        break;
      previousSibling = previousSibling.previousSibling;
    }
    text.push(this[VALUE]);
    while (nextSibling) {
      if (nextSibling.nodeType === TEXT_NODE)
        text.push(nextSibling[VALUE]);
      else
        break;
      nextSibling = nextSibling.nextSibling;
    }
    return text.join('');
  }
}
exports.Text = Text
