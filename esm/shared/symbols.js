// used in Element for the attribute change steps of its class
export const ATTRIBUTE_CHANGED = Symbol('attributeChanged');

// used in Element to setup once classList
export const CLASS_LIST = Symbol('classList');

// used in Document to attach once customElements
export const CUSTOM_ELEMENTS = Symbol('CustomElements');

// used in HTMLTemplateElement
export const CONTENT = Symbol('content');

// used in Element for data attributes
export const DATASET = Symbol('dataset');

// used in Document to attach the DocType
export const DOCTYPE = Symbol('doctype');

// used in parser and Document to attach once a DOMParser
export const DOM_PARSER = Symbol('DOMParser');

// used to reference an end node
export const END = Symbol('end');

// used in Document to make the globalThis an event target
export const EVENT_TARGET = Symbol('EventTarget');

// used to augment a created document defaultView
export const GLOBALS = Symbol('globals');

// used in both Canvas and Document to provide images
export const IMAGE = Symbol('image');

// used to define Document mime type
export const MIME = Symbol('mime');

// used in Document to attach once MutationObserver
export const MUTATION_OBSERVER = Symbol('MutationObserver');

// used in Document to create elements from names already validated
export const CREATE_ELEMENT = Symbol('createElement');

// used in Document for the quirks mode its parser chose
export const MODE = Symbol('mode');

// used in Element for the namespace of an element whose class implies none
export const NAMESPACE = Symbol('namespace');

// used in Element for a namespace prefix
export const PREFIX = Symbol('prefix');

// used to define next node reference
export const NEXT = Symbol('next');

// used to define Attr owner elements
export const OWNER_ELEMENT = Symbol('ownerElement');

// used to define previous node reference
export const PREV = Symbol('prev');

// used to define various "private" properties
export const PRIVATE = Symbol('private');

// used in DOMTokenList and CSSStyleDeclaration to follow their attribute's value
export const RESET = Symbol('reset');

// used to define the CSSStyleSheet.sheet
export const SHEET = Symbol('sheet');

// used to define start node reference
export const START = Symbol('start');

// used in Document for the document its template contents belong to
export const TEMPLATE_DOCUMENT = Symbol('templateDocument');

// used to define special CSS style attribute
export const STYLE = Symbol('style');

// used to upgrade Custom Elements
export const UPGRADE = Symbol('upgrade');

// used to define generic values
export const VALUE = Symbol('value');
