'use strict';
// https://dom.spec.whatwg.org/#interface-element

const {
  ATTRIBUTE_NODE,
  BLOCK_ELEMENTS,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  ELEMENT_NODE,
  HTML_NAMESPACE,
  NODE_END,
  TEXT_NODE
} = require('../shared/constants.js');

const {
  setAttribute, replaceAttribute, removeAttribute, numericAttribute, stringAttribute
} = require('../shared/attributes.js');

const {
  ATTRIBUTE_CHANGED, CLASS_LIST, CONTENT, CREATE_ELEMENT, CUSTOM_ELEMENTS, DATASET, END, NEXT, PREV, NAMESPACE, PREFIX, RESET
} = require('../shared/symbols.js');

const {
  ignoreCase,
  knownAdjacent,
  String
} = require('../shared/utils.js');

const {
  asciiLowercase,
  asciiUppercase,
  validAttributeName,
  validateAndExtract
} = require('../shared/names.js');

const {outerHTML} = require('../shared/serialize-html.js');
const {serializeXML} = require('../shared/serialize-xml.js');
const {fragmentContext, parseFragment} = require('../shared/parse.js');

const {elementAsJSON} = require('../shared/jsdon.js');
const {matches, prepareMatch} = require('../shared/matches.js');
const {shadowRoots} = require('../shared/shadow-roots.js');

const {isConnected, parentElement, previousSibling, nextSibling} = require('../shared/node.js');
const {previousElementSibling, nextElementSibling} = require('../mixin/non-document-type-child-node.js');

const {before, after, replaceWith, remove} = require('../mixin/child-node.js');
const {getInnerHtml, setInnerHtml} = require('../mixin/inner-html.js');
const {ParentNode} = require('../mixin/parent-node.js');

const {DOMStringMap} = require('../dom/string-map.js');
const {DOMTokenList} = require('../dom/token-list.js');

const {Event} = require('./event.js');
const {NamedNodeMap} = require('./named-node-map.js');
const {ShadowRoot} = require('./shadow-root.js');
const {NodeList} = require('./node-list.js');
const {Attr} = require('./attr.js');
const {Text} = require('./text.js');

// <utils>
const attributesHandler = {
  get(target, key) {
    return key in target ? target[key] : target.find(({name}) => name === key);
  }
};

// https://dom.spec.whatwg.org/#concept-node-clone
const create = (ownerDocument, element, deep)  => {
  const is = ownerDocument[CUSTOM_ELEMENTS].active ? element.getAttributeNS(null, 'is') : null;
  const clone = ownerDocument[CREATE_ELEMENT](element.namespaceURI, element.localName, element.prefix, is);
  if (deep && element[CONTENT])
    clone[CONTENT] = element[CONTENT].cloneNode(true);
  return clone;
};

// https://dom.spec.whatwg.org/#concept-element-attributes-get-by-name
const qualify = (element, name) => (
  element.namespaceURI === HTML_NAMESPACE && ignoreCase(element) ?
    asciiLowercase(String(name)) : String(name)
);

const attributeNamed = (element, name) => {
  let next = element[NEXT];
  while (next.nodeType === ATTRIBUTE_NODE) {
    if (next.name === name)
      return next;
    next = next[NEXT];
  }
  return null;
};

const attributeNS = (element, namespace, localName) => {
  namespace = namespace === '' || namespace === undefined ? null : namespace;
  localName = String(localName);
  let next = element[NEXT];
  while (next.nodeType === ATTRIBUTE_NODE) {
    if (next.localName === localName && next.namespaceURI === namespace)
      return next;
    next = next[NEXT];
  }
  return null;
};

const invalidPosition = () => new DOMException(
  'Must provide one of "beforebegin", "afterbegin", "beforeend", or "afterend".',
  'SyntaxError'
);

// https://dom.spec.whatwg.org/#insert-adjacent
const insertAdjacent = (element, position, node) => {
  const {parentNode} = element;
  switch (asciiLowercase(String(position))) {
    case 'beforebegin':
      if (!parentNode)
        return null;
      parentNode.insertBefore(node, element);
      break;
    case 'afterbegin':
      element.insertBefore(node, element.firstChild);
      break;
    case 'beforeend':
      element.insertBefore(node, null);
      break;
    case 'afterend':
      if (!parentNode)
        return null;
      parentNode.insertBefore(node, element.nextSibling);
      break;
    default:
      throw invalidPosition();
  }
  return node;
};

// </utils>

/**
 * @implements globalThis.Element
 */
class Element extends ParentNode {
  constructor(ownerDocument, localName) {
    super(ownerDocument, localName, ELEMENT_NODE);
    this[CLASS_LIST] = null;
    this[DATASET] = null;
  }

  // <Mixins>
  get isConnected() { return isConnected(this); }
  get parentElement() { return parentElement(this); }
  get previousSibling() { return previousSibling(this); }
  get nextSibling() { return nextSibling(this); }
  get namespaceURI() { return this[NAMESPACE]; }
  get prefix() { return this[PREFIX] || null; }

  get previousElementSibling() { return previousElementSibling(this); }
  get nextElementSibling() { return nextElementSibling(this); }

  before(...nodes) { before(this, nodes); }
  after(...nodes) { after(this, nodes); }
  replaceWith(...nodes) { replaceWith(this, nodes); }
  remove() { remove(this[PREV], this, this[END][NEXT]); }
  // </Mixins>

  // <specialGetters>
  get id() { return stringAttribute.get(this, 'id'); }
  set id(value) { stringAttribute.set(this, 'id', value); }

  get className() { return this.getAttribute('class') ?? ''; }
  set className(value) { this.setAttribute('class', value); }

  get nodeName() { return this.tagName; }
  get tagName() {
    const {localName, [PREFIX]: prefix} = this;
    const name = prefix ? `${prefix}:${localName}` : localName;
    return this.namespaceURI === HTML_NAMESPACE && ignoreCase(this) ? asciiUppercase(name) : name;
  }

  get classList() {
    return this[CLASS_LIST] || (
      this[CLASS_LIST] = new DOMTokenList(this)
    );
  }

  get dataset() {
    return this[DATASET] || (
      this[DATASET] = new DOMStringMap(this)
    );
  }

  getBoundingClientRect() {
    return {
      x: 0,
      y: 0,
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0
    };
  }

  get nonce() { return stringAttribute.get(this, 'nonce'); }
  set nonce(value) { stringAttribute.set(this, 'nonce', value); }

  get tabIndex() { return numericAttribute.get(this, 'tabindex') || -1; }
  set tabIndex(value) { numericAttribute.set(this, 'tabindex', value); }

  get slot() { return stringAttribute.get(this, 'slot'); }
  set slot(value) { stringAttribute.set(this, 'slot', value); }
  // </specialGetters>


  // <contentRelated>
  get innerText() {
    const text = [];
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end) {
      if (next.nodeType === TEXT_NODE) {
        text.push(next.textContent.replace(/\s+/g, ' '));
      } else if(
        text.length && next[NEXT] != end &&
        BLOCK_ELEMENTS.has(next.tagName)
      ) {
        text.push('\n');
      }
      next = next[NEXT];
    }
    return text.join('');
  }

  /**
   * @returns {String}
   */
  get textContent() {
    const text = [];
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end) {
      const nodeType = next.nodeType;
      if (nodeType === TEXT_NODE || nodeType === CDATA_SECTION_NODE)
        text.push(next.textContent);
      next = next[NEXT];
    }
    return text.join('');
  }

  set textContent(text) {
    this.replaceChildren();
    if (text != null && text !== '')
      this.appendChild(new Text(this.ownerDocument, text));
  }

  get innerHTML() {
    return getInnerHtml(this);
  }
  set innerHTML(html) {
    setInnerHtml(this, html);
  }

  get outerHTML() { return ignoreCase(this) ? outerHTML(this) : serializeXML(this, true); }
  set outerHTML(html) {
    const {parentNode} = this;
    if (!parentNode)
      return;
    if (parentNode.nodeType === DOCUMENT_NODE)
      throw new DOMException('A document can\'t take markup in place of its element.', 'NoModificationAllowedError');
    const context = parentNode.nodeType === ELEMENT_NODE ? parentNode : fragmentContext(parentNode);
    parentNode.replaceChild(parseFragment(context, html), this);
  }
  // </contentRelated>

  // <attributes>
  get attributes() {
    const attributes = new NamedNodeMap(this);
    let next = this[NEXT];
    while (next.nodeType === ATTRIBUTE_NODE) {
      attributes.push(next);
      next = next[NEXT];
    }
    return new Proxy(attributes, attributesHandler);
  }

  focus() { this.dispatchEvent(new Event('focus')); }

  getAttribute(name) {
    const attribute = this.getAttributeNode(name);
    return attribute && attribute.value;
  }

  getAttributeNode(name) {
    return attributeNamed(this, qualify(this, name));
  }

  getAttributeNS(namespace, localName) {
    const attribute = attributeNS(this, namespace, localName);
    return attribute && attribute.value;
  }

  getAttributeNodeNS(namespace, localName) {
    return attributeNS(this, namespace, localName);
  }

  getAttributeNames() {
    const attributes = new NodeList;
    let next = this[NEXT];
    while (next.nodeType === ATTRIBUTE_NODE) {
      attributes.push(next.name);
      next = next[NEXT];
    }
    return attributes;
  }

  hasAttribute(name) { return !!this.getAttributeNode(name); }
  hasAttributeNS(namespace, localName) { return !!attributeNS(this, namespace, localName); }
  hasAttributes() { return this[NEXT].nodeType === ATTRIBUTE_NODE; }

  removeAttribute(name) {
    const attribute = this.getAttributeNode(name);
    if (attribute)
      removeAttribute(this, attribute);
  }

  removeAttributeNS(namespace, localName) {
    const attribute = attributeNS(this, namespace, localName);
    if (attribute)
      removeAttribute(this, attribute);
  }

  removeAttributeNode(attribute) {
    let next = this[NEXT];
    while (next.nodeType === ATTRIBUTE_NODE) {
      if (next === attribute) {
        removeAttribute(this, next);
        return;
      }
      next = next[NEXT];
    }
  }

  setAttribute(name, value) {
    name = qualify(this, validAttributeName(String(name)));
    const attribute = attributeNamed(this, name);
    if (attribute)
      attribute.value = value;
    else
      setAttribute(this, new Attr(this.ownerDocument, name, value));
  }

  setAttributeNS(namespace, qualifiedName, value) {
    qualifiedName = String(qualifiedName);
    const {namespace: ns, prefix, localName} = validateAndExtract(namespace, qualifiedName, false);
    const attribute = attributeNS(this, ns, localName);
    if (attribute)
      attribute.value = value;
    else
      setAttribute(this, new Attr(this.ownerDocument, qualifiedName, value, ns, prefix, localName));
  }

  setAttributeNode(attribute) {
    const {ownerElement, namespaceURI, localName} = attribute;
    if (ownerElement && ownerElement !== this)
      throw new DOMException('The attribute belongs to another element.', 'InUseAttributeError');
    const previously = attributeNS(this, namespaceURI, localName);
    if (previously === attribute)
      return attribute;
    if (previously)
      replaceAttribute(this, previously, attribute);
    else
      setAttribute(this, attribute);
    return previously;
  }

  setAttributeNodeNS(attribute) { return this.setAttributeNode(attribute); }

  toggleAttribute(name, force) {
    name = qualify(this, validAttributeName(String(name)));
    const attribute = attributeNamed(this, name);
    if (!attribute) {
      if (force === undefined || force) {
        setAttribute(this, new Attr(this.ownerDocument, name, ''));
        return true;
      }
      return false;
    }
    if (force === undefined || !force) {
      removeAttribute(this, attribute);
      return false;
    }
    return true;
  }

  // https://dom.spec.whatwg.org/#concept-element-attributes-change-ext
  [ATTRIBUTE_CHANGED](attribute, value) {
    if (attribute.localName === 'class' && attribute.namespaceURI === null)
      this[CLASS_LIST]?.[RESET](value);
  }
  // </attributes>

  // <ShadowDOM>
  get shadowRoot() {
    if (shadowRoots.has(this)) {
      const {mode, shadowRoot} = shadowRoots.get(this);
      if (mode === 'open')
        return shadowRoot;
    }
    return null;
  }

  attachShadow(init) {
    if (shadowRoots.has(this))
      throw new Error('operation not supported');
    // TODO: shadowRoot should be likely a specialized class that extends DocumentFragment
    //       but until DSD is out, I am not sure I should spend time on this.
    const shadowRoot = new ShadowRoot(this);
    shadowRoots.set(this, {
      mode: init.mode,
      shadowRoot
    });
    return shadowRoot;
  }
  // </ShadowDOM>

  // <selectors>
  matches(selectors) { return matches(this, selectors); }
  closest(selectors) {
    let parentElement = this;
    const matches = prepareMatch(parentElement, selectors);
    while (parentElement && !matches(parentElement))
      parentElement = parentElement.parentElement;
    return parentElement;
  }
  // </selectors>

  // <insertAdjacent>
  insertAdjacentElement(position, element) {
    return insertAdjacent(this, position, element);
  }

  // https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-element-insertadjacenthtml
  insertAdjacentHTML(position, html) {
    let context = this;
    switch (asciiLowercase(String(position))) {
      case 'beforebegin':
      case 'afterend':
        context = this.parentNode;
        if (!context || context.nodeType === DOCUMENT_NODE)
          throw new DOMException('The element has no parent to take the markup.', 'NoModificationAllowedError');
        break;
      case 'afterbegin':
      case 'beforeend':
        break;
      default:
        throw invalidPosition();
    }
    insertAdjacent(this, position, parseFragment(fragmentContext(context), html));
  }

  insertAdjacentText(position, text) {
    insertAdjacent(this, position, this.ownerDocument.createTextNode(text));
  }
  // </insertAdjacent>

  cloneNode(deep = false) {
    const {ownerDocument} = this;
    const addNext = next => {
      next.parentNode = parentNode;
      knownAdjacent($next, next);
      $next = next;
    };
    const clone = create(ownerDocument, this, deep);
    let parentNode = clone, $next = clone;
    let {[NEXT]: next, [END]: prev} = this;
    while (next !== prev && (deep || next.nodeType === ATTRIBUTE_NODE)) {
      switch (next.nodeType) {
        case NODE_END:
          knownAdjacent($next, parentNode[END]);
          $next = parentNode[END];
          parentNode = parentNode.parentNode;
          break;
        case ELEMENT_NODE: {
          const node = create(ownerDocument, next, true);
          addNext(node);
          parentNode = node;
          break;
        }
        case ATTRIBUTE_NODE: {
          const attr = next.cloneNode(deep);
          attr.ownerElement = parentNode;
          addNext(attr);
          break;
        }
        case TEXT_NODE:
        case COMMENT_NODE:
        case CDATA_SECTION_NODE:
          addNext(next.cloneNode(deep));
          break;
      }
      next = next[NEXT];
    }
    knownAdjacent($next, clone[END]);
    return clone;
  }

  // <custom>
  toJSON() {
    const json = [];
    elementAsJSON(this, json);
    return json;
  }
  // </custom>
}
exports.Element = Element
