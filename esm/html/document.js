import {ELEMENT_NODE, HTML_NAMESPACE} from '../shared/constants.js';
import {END, NEXT} from '../shared/symbols.js';

import {Document} from '../interface/document.js';
import {NodeList} from '../interface/node-list.js';

const asciiWhitespace = /[\t\n\f\r ]+/g;

const htmlChild = ({documentElement}, matches) => {
  if (documentElement && documentElement.localName === 'html') {
    for (const child of documentElement.children) {
      if (matches(child.localName) && child.namespaceURI === HTML_NAMESPACE)
        return child;
    }
  }
  return null;
};

/**
 * @implements globalThis.HTMLDocument
 */
export class HTMLDocument extends Document {
  constructor() { super('text/html'); }

  get all() {
    const nodeList = new NodeList;
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end) {
      switch (next.nodeType) {
        case ELEMENT_NODE:
          nodeList.push(next);
          break;
      }
      next = next[NEXT];
    }
    return nodeList;
  }

  /**
   * @type HTMLHeadElement?
   */
  get head() {
    return htmlChild(this, name => name === 'head');
  }

  /**
   * @type HTMLBodyElement?
   */
  get body() {
    return htmlChild(this, name => name === 'body' || name === 'frameset');
  }

  /**
   * @type string
   */
  get title() {
    const title = this.getElementsByTagName('title').at(0);
    return title ? title.textContent.replace(asciiWhitespace, ' ').trim() : '';
  }

  set title(textContent) {
    const {head} = this;
    let title = this.getElementsByTagName('title').at(0);
    if (!title) {
      if (!head)
        return;
      title = head.appendChild(this.createElement('title'));
    }
    title.textContent = textContent;
  }
}
