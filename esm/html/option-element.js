import {HTMLElement} from './element.js';
import {booleanAttribute} from '../shared/attributes.js';

const tagName = 'option';

// https://html.spec.whatwg.org/multipage/form-elements.html#concept-option-selectedness
// The selected attribute is only the default; once set, selectedness is the option's own.
const SELECTEDNESS = Symbol('selectedness');

const asciiWhitespace = /[\t\n\f\r ]+/g;

const selectOf = ({parentElement}) => {
  if (parentElement && parentElement.localName === 'optgroup')
    parentElement = parentElement.parentElement;
  return parentElement && parentElement.localName === 'select' ? parentElement : null;
};

/**
 * @implements globalThis.HTMLOptionElement
 */
class HTMLOptionElement extends HTMLElement {
  constructor(ownerDocument, localName = tagName) {
    super(ownerDocument, localName);
    this[SELECTEDNESS] = null;
  }

  get value() {
    const value = this.getAttribute('value');
    return value === null ? this.text : value;
  }
  set value(value) { this.setAttribute('value', value); }

  get text() {
    return this.textContent.replace(asciiWhitespace, ' ').trim();
  }

  get defaultSelected() { return booleanAttribute.get(this, 'selected'); }
  set defaultSelected(value) { booleanAttribute.set(this, 'selected', value); }

  get selected() {
    return this[SELECTEDNESS] === null ? this.defaultSelected : this[SELECTEDNESS];
  }
  set selected(value) {
    this[SELECTEDNESS] = !!value;
    const select = selectOf(this);
    if (value && select && !select.multiple) {
      for (const option of select.options) {
        if (option !== this)
          option[SELECTEDNESS] = false;
      }
    }
  }
}

export {HTMLOptionElement};
