import {ELEMENT_NODE, HTML_NAMESPACE} from '../shared/constants.js';
import {CUSTOM_ELEMENTS, END, NEXT, UPGRADE} from '../shared/symbols.js';
import {entries, setPrototypeOf} from '../shared/object.js';
import {shadowRoots} from '../shared/shadow-roots.js';

let reactive = false;

export const Classes = new WeakMap;

export const customElements = new WeakMap;

// https://html.spec.whatwg.org/multipage/custom-elements.html#look-up-a-custom-element-definition
const lookUp = ({registry}, localName, is) => {
  for (const name of [localName, is]) {
    const definition = name && registry.get(name);
    if (definition && definition.localName === localName)
      return definition;
  }
  return null;
};

/**
 * @param {Document} document
 * @param {Element} element a new HTML element
 * @param {string?} is
 */
export const constructCustomElement = (document, element, is) => {
  const registry = document[CUSTOM_ELEMENTS];
  const definition = lookUp(registry, element.localName, is);
  if (definition) {
    const {Class} = definition;
    // HTMLElement's constructor looks for the element on the document that defined its class,
    // which a cloned document sharing the registry is not.
    const {ownerDocument} = registry;
    setPrototypeOf(element, Class.prototype);
    ownerDocument[UPGRADE] = {element, values: []};
    new Class(ownerDocument, element.localName);
    customElements.set(element, {connected: false});
  }
};

/**
 * https://dom.spec.whatwg.org/#concept-node-clone creates elements without their
 * definition and upgrades them once they have their attributes.
 * @param {Document} document
 * @param {Element} element a clone and its descendants
 */
export const upgradeClone = (document, element) => {
  const registry = document[CUSTOM_ELEMENTS];
  if (registry.active) {
    const end = element[END];
    for (let next = element; next !== end; next = next[NEXT]) {
      if (next.nodeType === ELEMENT_NODE && next.namespaceURI === HTML_NAMESPACE)
        registry.upgrade(next);
    }
  }
};

export const adoptedCallback = (element, oldDocument, newDocument) => {
  if (reactive && customElements.has(element) && element.adoptedCallback)
    element.adoptedCallback(oldDocument, newDocument);
};

export const attributeChangedCallback = (element, attributeName, oldValue, newValue) => {
  if (
    reactive &&
    customElements.has(element) &&
    element.attributeChangedCallback &&
    element.constructor.observedAttributes.includes(attributeName)
  ) {
    element.attributeChangedCallback(attributeName, oldValue, newValue);
  }
};

const createTrigger = (method, isConnected) => element => {
  if (customElements.has(element)) {
    const info = customElements.get(element);
    if (info.connected !== isConnected && element.isConnected === isConnected) {
      info.connected = isConnected;
      if (method in element)
        element[method]();
    }
  }
};

const triggerConnected = createTrigger('connectedCallback', true);
export const connectedCallback = element => {
  if (reactive) {
    triggerConnected(element);
    if (shadowRoots.has(element))
      element = shadowRoots.get(element).shadowRoot;
    let {[NEXT]: next, [END]: end} = element;
    while (next !== end) {
      if (next.nodeType === ELEMENT_NODE)
        triggerConnected(next);
      next = next[NEXT];
    }
  }
};

const triggerDisconnected = createTrigger('disconnectedCallback', false);
export const disconnectedCallback = element => {
  if (reactive) {
    triggerDisconnected(element);
    if (shadowRoots.has(element))
      element = shadowRoots.get(element).shadowRoot;
    let {[NEXT]: next, [END]: end} = element;
    while (next !== end) {
      if (next.nodeType === ELEMENT_NODE)
        triggerDisconnected(next);
      next = next[NEXT];
    }
  }
};

/**
 * @implements globalThis.CustomElementRegistry
 */
export class CustomElementRegistry {

  /**
   * @param {Document} ownerDocument
   */
  constructor(ownerDocument) {
    /**
     * @private
     */
    this.ownerDocument = ownerDocument;

    /**
     * @private
     */
    this.registry = new Map;

    /**
     * @private
     */
    this.waiting = new Map;

    /**
     * @private
     */
    this.active = false;
  }

  /**
   * @param {string} localName the custom element definition name
   * @param {Function} Class the custom element **Class** definition
   * @param {object?} options the optional object with an `extends` property
   */
  define(localName, Class, options = {}) {
    const {ownerDocument, registry, waiting} = this;

    if (registry.has(localName))
      throw new Error('unable to redefine ' + localName);

    if (Classes.has(Class))
      throw new Error('unable to redefine the same class: ' + Class);

    this.active = (reactive = true);

    const {extends: extend} = options;

    Classes.set(Class, {
      ownerDocument,
      options: {is: extend ? localName : ''},
      localName: extend || localName
    });

    registry.set(localName, {Class, localName: extend || localName});
    if (waiting.has(localName)) {
      for (const resolve of waiting.get(localName))
        resolve(Class);
      waiting.delete(localName);
    }
    ownerDocument.querySelectorAll(
      extend ? `${extend}[is="${localName}"]` : localName
    ).forEach(this.upgrade, this);
  }

  /**
   * @param {Element} element
   */
  upgrade(element) {
    if (customElements.has(element))
      return;
    const {ownerDocument} = this;
    const definition = lookUp(this, element.localName, element.getAttribute('is'));
    if (definition) {
      const {Class} = definition;
      const {attributes, isConnected} = element;
      for (const attr of attributes)
        element.removeAttributeNode(attr);

      const values = entries(element);
      for (const [key] of values)
        delete element[key];

      setPrototypeOf(element, Class.prototype);
      ownerDocument[UPGRADE] = {element, values};
      new Class(ownerDocument, element.localName);

      customElements.set(element, {connected: isConnected});

      for (const attr of attributes)
        element.setAttributeNode(attr);

      if (isConnected && element.connectedCallback)
        element.connectedCallback();
    }
  }

  /**
   * @param {string} localName the custom element definition name
   */
  whenDefined(localName) {
    const {registry, waiting} = this;
    return new Promise(resolve => {
      if (registry.has(localName))
        resolve(registry.get(localName).Class);
      else {
        if (!waiting.has(localName))
          waiting.set(localName, []);
        waiting.get(localName).push(resolve);
      }
    });
  }

  /**
   * @param {string} localName the custom element definition name
   * @returns {Function?} the custom element **Class**, if any
   */
  get(localName) {
    const info = this.registry.get(localName);
    return info && info.Class;
  }

  /**
   * @param {Function} Class **Class** of custom element
   * @returns {string?} found tag name or null
   */
  getName(Class) {
    if (Classes.has(Class)) {
      const { localName } = Classes.get(Class);
      return localName;
    }
    return null;
  }
}
