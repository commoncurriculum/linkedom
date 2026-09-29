'use strict';
const {stringAttribute} = require('../shared/attributes.js');

const {HTMLElement} = require('./element.js');

/**
 * @implements globalThis.HTMLTimeElement
 */
class HTMLTimeElement extends HTMLElement {
  constructor(ownerDocument, localName = 'time') {
    super(ownerDocument, localName);
  }

  /**
   * @type {string}
   */
  get dateTime() { return stringAttribute.get(this, 'datetime'); }
  set dateTime(value) { stringAttribute.set(this, 'datetime', value); }
}

exports.HTMLTimeElement = HTMLTimeElement;
