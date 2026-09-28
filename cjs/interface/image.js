'use strict';
const {HTMLImageElement} = require('../html/image-element.js');

const ImageClass = ownerDocument =>
/**
 * @implements globalThis.Image
 */
class Image extends HTMLImageElement {
  constructor(width, height) {
    super(ownerDocument);
    if (width !== undefined)
      this.width = width;
    if (height !== undefined)
      this.height = height;
  }
};
exports.ImageClass = ImageClass;
