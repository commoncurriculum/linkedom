import {CDATA_SECTION_NODE} from '../shared/constants.js';

import {CharacterData} from './character-data.js';

/**
 * @implements globalThis.CDATASection
 */
export class CDATASection extends CharacterData {
  constructor(ownerDocument, data = '') {
    super(ownerDocument, '#cdatasection', CDATA_SECTION_NODE, data);
  }
}
