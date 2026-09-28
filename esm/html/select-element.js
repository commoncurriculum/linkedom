import {booleanAttribute} from '../shared/attributes.js';

import {HTMLElement} from './element.js';
import {selectedOption} from './option-element.js';
import {NodeList} from '../interface/node-list.js';

const tagName = 'select';

/**
 * @implements globalThis.HTMLSelectElement
 */
class HTMLSelectElement extends HTMLElement {
  constructor(ownerDocument, localName = tagName) {
    super(ownerDocument, localName);
  }

  // https://html.spec.whatwg.org/multipage/form-elements.html#concept-select-option-list
  get options() {
    const options = new NodeList;
    for (const child of this.children) {
      if (child.localName === 'option')
        options.push(child);
      else if (child.localName === 'optgroup')
        options.push(...child.children.filter(({localName}) => localName === 'option'));
    }
    return options;
  }

  get multiple() { return booleanAttribute.get(this, 'multiple'); }
  set multiple(value) { booleanAttribute.set(this, 'multiple', value); }

  /* c8 ignore start */
  get disabled() { return booleanAttribute.get(this, 'disabled'); }
  set disabled(value) { booleanAttribute.set(this, 'disabled', value); }

  get name() { return this.getAttribute('name'); }
  set name(value) { this.setAttribute('name', value); }
  /* c8 ignore stop */

  // https://html.spec.whatwg.org/multipage/form-elements.html#dom-select-value
  get value() {
    const option = this.multiple ?
      this.options.find(option => option.selected) :
      selectedOption(this);
    return option ? option.value : '';
  }
}

export {HTMLSelectElement};
