'use strict';
const {CDATA_SECTION_NODE} = require('../shared/constants.js');

const {CharacterData} = require('./character-data.js');

/**
 * @implements globalThis.CDATASection
 */
class CDATASection extends CharacterData {
  constructor(ownerDocument, data = '') {
    super(ownerDocument, '#cdatasection', CDATA_SECTION_NODE, data);
  }
}
exports.CDATASection = CDATASection
