'use strict';
const {HTMLElement} = require('./element.js');

const tagName = 'h1';

/**
 * @implements globalThis.HTMLHeadingElement
 */
class HTMLHeadingElement extends HTMLElement {
  constructor(ownerDocument, localName = tagName) {
    super(ownerDocument, localName);
  }
}

exports.HTMLHeadingElement = HTMLHeadingElement;
