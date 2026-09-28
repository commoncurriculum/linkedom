'use strict';
const {ELEMENT_NODE, HTML_NAMESPACE} = require('../shared/constants.js');
const {CREATE_ELEMENT, CUSTOM_ELEMENTS, END, NEXT} = require('../shared/symbols.js');
const {htmlClasses} = require('../shared/register-html-class.js');
const {asciiLowercase, validElementName} = require('../shared/names.js');
const {innerHTML} = require('../shared/serialize-html.js');

const {Document} = require('../interface/document.js');
const {NodeList} = require('../interface/node-list.js');
const {customElements} = require('../interface/custom-element-registry.js');

const {HTMLElement} = require('./element.js');
const {HTMLUnknownElement} = require('./unknown-element.js');

// https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
const htmlElements = new Set([
  'abbr', 'acronym', 'address', 'article', 'aside', 'b', 'basefont', 'bdi',
  'bdo', 'big', 'center', 'cite', 'code', 'dd', 'dfn', 'dt', 'em', 'figcaption',
  'figure', 'footer', 'header', 'hgroup', 'i', 'kbd', 'main', 'mark', 'nav',
  'nobr', 'noembed', 'noframes', 'noscript', 'plaintext', 'rb', 'rp', 'rt',
  'rtc', 'ruby', 's', 'samp', 'search', 'section', 'small', 'strike', 'strong',
  'sub', 'summary', 'sup', 'tt', 'u', 'var', 'wbr'
]);

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

const createHTMLElement = (ownerDocument, builtin, localName, options) => {
  if (!builtin && htmlClasses.has(localName)) {
    const Class = htmlClasses.get(localName);
    return new Class(ownerDocument, localName);
  }
  const {[CUSTOM_ELEMENTS]: {active, registry}} = ownerDocument;
  if (active) {
    const ce = builtin ? options.is : localName;
    if (registry.has(ce)) {
      const {Class} = registry.get(ce);
      const element = new Class(ownerDocument, localName);
      customElements.set(element, {connected: false});
      return element;
    }
  }
  const Class = htmlClasses.get(localName) || (
    localName.includes('-') || htmlElements.has(localName) ? HTMLElement : HTMLUnknownElement
  );
  return new Class(ownerDocument, localName);
};
exports.createHTMLElement = createHTMLElement;

/**
 * @implements globalThis.HTMLDocument
 */
class HTMLDocument extends Document {
  constructor() { super('text/html'); }

  toString() { return innerHTML(this); }

  [CREATE_ELEMENT](namespace, localName, prefix = null) {
    return namespace === HTML_NAMESPACE && !prefix ?
      createHTMLElement(this, false, localName) :
      super[CREATE_ELEMENT](namespace, localName, prefix);
  }

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

  createElement(localName, options) {
    localName = asciiLowercase(validElementName(String(localName)));
    const builtin = !!(options && options.is);
    const element = createHTMLElement(this, builtin, localName, options);
    if (builtin)
      element.setAttribute('is', options.is);
    return element;
  }
}
exports.HTMLDocument = HTMLDocument
