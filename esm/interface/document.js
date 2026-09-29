import {DOCUMENT_NODE, DOCUMENT_TYPE_NODE, HTML_NAMESPACE} from '../shared/constants.js';

import {
  CUSTOM_ELEMENTS, DOM_PARSER, GLOBALS, IMAGE, MUTATION_OBSERVER, MODE, CLONE, TEMPLATE_DOCUMENT,
  DOCTYPE, END, NEXT, MIME, EVENT_TARGET, UPGRADE, NAMESPACE, PREFIX, CREATE_ELEMENT
} from '../shared/symbols.js';

import {hasBrowsingContext, withoutBrowsingContext} from '../shared/browsing-context.js';
import {Facades, illegalConstructor} from '../shared/facades.js';
import {HTMLClasses} from '../shared/html-classes.js';
import {elementInterface} from '../shared/element-interface.js';
import {asciiLowercase, validAttributeName, validElementName, validateAndExtract} from '../shared/names.js';
import {Mime} from '../shared/mime.js';
import {knownSiblings} from '../shared/utils.js';
import {assign, create, defineProperties, setPrototypeOf} from '../shared/object.js';
import {innerHTML} from '../shared/serialize-html.js';
import {serializeXML} from '../shared/serialize-xml.js';

import {NonElementParentNode} from '../mixin/non-element-parent-node.js';

import {Attr} from './attr.js';
import {CDATASection} from './cdata-section.js'
import {Comment} from './comment.js';
import {CustomElementRegistry, constructCustomElement} from './custom-element-registry.js';
import {CustomEvent} from './custom-event.js';
import {DOMImplementation} from './dom-implementation.js';
import {DocumentFragment} from './document-fragment.js';
import {DocumentType} from './document-type.js';
import {Element} from './element.js';
import {Event} from './event.js';
import {EventTarget} from './event-target.js';
import {InputEvent} from './input-event.js';
import {ImageClass} from './image.js';
import {MutationObserverClass} from './mutation-observer.js';
import {NamedNodeMap} from './named-node-map.js';
import {NodeList} from './node-list.js';
import {Range} from './range.js';
import {ShadowRoot} from './shadow-root.js';
import {Text} from './text.js';
import {TreeWalker} from './tree-walker.js';

const query = (method, ownerDocument, selectors) => {
  let {[NEXT]: next, [END]: end} = ownerDocument;
  return method.call({ownerDocument, [NEXT]: next, [END]: end}, selectors);
};

const globalExports = assign(
  {},
  Facades,
  HTMLClasses,
  {
    CustomEvent,
    Event,
    EventTarget,
    InputEvent,
    NamedNodeMap,
    NodeList
  }
);

const window = new WeakMap;

const implementations = new WeakMap;

// The window's event target, which ends every event path through the document.
const windowTarget = document => {
  if (!document[EVENT_TARGET]) {
    const et = document[EVENT_TARGET] = new EventTarget;
    et.dispatchEvent = et.dispatchEvent.bind(et);
    et.addEventListener = et.addEventListener.bind(et);
    et.removeEventListener = et.removeEventListener.bind(et);
  }
  return document[EVENT_TARGET];
};

/**
 * @implements globalThis.Document
 */
export class Document extends NonElementParentNode {
  constructor(type) {
    super(null, '#document', DOCUMENT_NODE);
    this[CUSTOM_ELEMENTS] = {active: false, registry: null};
    this[MUTATION_OBSERVER] = {active: false, class: null};
    this[MIME] = Mime[type];
    /** @type {DocumentType} */
    this[DOCTYPE] = null;
    this[DOM_PARSER] = null;
    this[GLOBALS] = null;
    this[IMAGE] = null;
    this[UPGRADE] = null;
  }

  /**
   * @type {string}
   */
  get contentType() {
    return this[MIME].type;
  }

  /**
   * @type {DOMImplementation}
   */
  get implementation() {
    if (!implementations.has(this))
      implementations.set(this, new DOMImplementation(this));
    return implementations.get(this);
  }

  /**
   * @type {globalThis.Document['defaultView']}
   */
  get defaultView() {
    if (!hasBrowsingContext(this))
      return null;
    if (!window.has(this))
      window.set(this, new Proxy(globalThis, {
        set: (target, name, value) => {
          switch (name) {
            case 'addEventListener':
            case 'removeEventListener':
            case 'dispatchEvent':
              windowTarget(this)[name] = value;
              break;
            default:
              target[name] = value;
              break;
          }
          return true;
        },
        get: (globalThis, name) => {
          switch (name) {
            case 'addEventListener':
            case 'removeEventListener':
            case 'dispatchEvent':
              return windowTarget(this)[name];
            case 'document':
              return this;
            /* c8 ignore start */
            case 'navigator':
              return {
                userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
              };
            /* c8 ignore stop */
            case 'window':
              return window.get(this);
            case 'customElements':
              if (!this[CUSTOM_ELEMENTS].registry)
                this[CUSTOM_ELEMENTS] = new CustomElementRegistry(this);
              return this[CUSTOM_ELEMENTS];
            case 'performance':
              return globalThis.performance;
            case 'DOMParser':
              return this[DOM_PARSER];
            case 'Image':
              if (!this[IMAGE])
                this[IMAGE] = ImageClass(this);
              return this[IMAGE];
            case 'MutationObserver':
              if (!this[MUTATION_OBSERVER].class)
                this[MUTATION_OBSERVER] = new MutationObserverClass(this);
              return this[MUTATION_OBSERVER].class;
          }
          return (this[GLOBALS] && this[GLOBALS][name]) ||
                  globalExports[name] ||
                  globalThis[name];
        }
      }));
    return window.get(this);
  }

  get doctype() {
    const docType = this[DOCTYPE];
    if (docType)
      return docType;
    const {firstChild} = this;
    if (firstChild && firstChild.nodeType === DOCUMENT_TYPE_NODE)
      return (this[DOCTYPE] = firstChild);
    return null;
  }

  set doctype(value) {
    if (/^([a-z:]+)(\s+system|\s+public(\s+"([^"]+)")?)?(\s+"([^"]+)")?/i.test(value)) {
      const {$1: name, $4: publicId, $6: systemId} = RegExp;
      this[DOCTYPE] = new DocumentType(this, name, publicId, systemId);
      knownSiblings(this, this[DOCTYPE], this[NEXT]);
    }
  }

  get documentElement() {
    return this.firstElementChild;
  }

  get isConnected() { return true; }

  // https://html.spec.whatwg.org/multipage/scripting.html#appropriate-template-contents-owner-document
  get [TEMPLATE_DOCUMENT]() {
    const document = withoutBrowsingContext(
      new this.constructor(this[MIME].ignoreCase ? 'text/html' : 'application/xml'),
      this
    );
    document[DOM_PARSER] = this[DOM_PARSER];
    defineProperties(document, {[TEMPLATE_DOCUMENT]: {value: document}});
    defineProperties(this, {[TEMPLATE_DOCUMENT]: {value: document}});
    return document;
  }

  /**
   * @protected
   */
   _getParent() {
    return windowTarget(this);
  }

  createAttribute(name) {
    name = validAttributeName(String(name));
    return new Attr(this, this[MIME].ignoreCase ? asciiLowercase(name) : name);
  }
  createCDATASection(data) { return new CDATASection(this, data); }
  createComment(textContent) { return new Comment(this, textContent); }
  createDocumentFragment() { return new DocumentFragment(this); }
  createDocumentType(name, publicId, systemId) { return new DocumentType(this, name, publicId, systemId); }

  /**
   * @param {string} localName
   * @param {ElementCreationOptions} [options]
   * @returns {any}
   */
  createElement(localName, options) {
    localName = validElementName(String(localName));
    const {ignoreCase: isHTML, type} = this[MIME];
    const is = isHTML && options && options.is || null;
    const element = this[CREATE_ELEMENT](
      isHTML || type === 'application/xhtml+xml' ? HTML_NAMESPACE : null,
      isHTML ? asciiLowercase(localName) : localName,
      null,
      is
    );
    if (is)
      element.setAttribute('is', is);
    return element;
  }

  createRange() {
    const range = new Range;
    range.commonAncestorContainer = this;
    return range;
  }
  createTextNode(textContent) { return new Text(this, textContent); }
  createTreeWalker(root, whatToShow = -1) { return new TreeWalker(root, whatToShow); }
  createNodeIterator(root, whatToShow = -1) { return this.createTreeWalker(root, whatToShow); }

  createEvent(name) {
    const event = create(name === 'Event' ? new Event('') : new CustomEvent(''));
    event.initEvent = event.initCustomEvent = (
      type,
      canBubble = false,
      cancelable = false,
      detail
    ) => {
      event.bubbles = !!canBubble;

      defineProperties(event, {
        type: {value: type},
        canBubble: {value: canBubble},
        cancelable: {value: cancelable},
        detail: {value: detail}
      });
    };
    return event;
  }

  [CLONE](_, deep) {
    const document = new this.constructor(this[MIME].type);
    document[CUSTOM_ELEMENTS] = this[CUSTOM_ELEMENTS];
    document[DOM_PARSER] = this[DOM_PARSER];
    document[MODE] = this[MODE];
    if (deep) {
      for (const child of this.childNodes) {
        const clone = child[CLONE](document, true);
        if (clone.nodeType === DOCUMENT_TYPE_NODE)
          document[DOCTYPE] = clone;
        document.insertBefore(clone);
      }
    }
    return document;
  }

  importNode(externalNode) {
    // important: keep the signature length as *one*
    // or it would behave like old IE or Edge with polyfills
    const deep = 1 < arguments.length && !!arguments[1];
    if (externalNode.nodeType === DOCUMENT_NODE)
      throw new DOMException('Cannot import a document node', 'NotSupportedError');
    if (externalNode instanceof ShadowRoot)
      throw new DOMException('Cannot adopt a shadow root', 'NotSupportedError');
    return externalNode[CLONE](this, deep);
  }

  toString() {
    return this[MIME].ignoreCase ? innerHTML(this) : serializeXML(this, false);
  }

  querySelector(selectors) {
    return query(super.querySelector, this, selectors);
  }

  querySelectorAll(selectors) {
    return query(super.querySelectorAll, this, selectors);
  }

  createAttributeNS(namespace, qualifiedName) {
    qualifiedName = String(qualifiedName);
    const {namespace: ns, prefix, localName} = validateAndExtract(namespace, qualifiedName, false);
    return new Attr(this, qualifiedName, '', ns, prefix, localName);
  }

  createElementNS(namespace, qualifiedName, options) {
    const {namespace: ns, prefix, localName} = validateAndExtract(namespace, String(qualifiedName), true);
    const is = ns === HTML_NAMESPACE && options && options.is || null;
    const element = this[CREATE_ELEMENT](ns, localName, prefix, is);
    if (is)
      element.setAttribute('is', is);
    return element;
  }

  // https://dom.spec.whatwg.org/#concept-create-element
  [CREATE_ELEMENT](namespace, localName, prefix = null, is = null, synchronous = true) {
    const Class = elementInterface(namespace, localName);
    const element = new Class(this, localName);
    if (Class === Element)
      element[NAMESPACE] = namespace;
    if (prefix)
      element[PREFIX] = prefix;
    if (synchronous && namespace === HTML_NAMESPACE && this[CUSTOM_ELEMENTS].active)
      constructCustomElement(this, element, is);
    return element;
  }
}

setPrototypeOf(
  globalExports.Document = function Document() {
    illegalConstructor();
  },
  Document
).prototype = Document.prototype;
