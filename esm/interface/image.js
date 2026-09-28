import {HTMLImageElement} from '../html/image-element.js';

/**
 * @param {Document} ownerDocument
 * @returns {new (width?: number, height?: number) => HTMLImageElement}
 */
export const ImageClass = ownerDocument =>
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
