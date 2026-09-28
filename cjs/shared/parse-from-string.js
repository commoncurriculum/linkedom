'use strict';
const {parseHTMLDocument} = require('./parse-html.js');
const {parseXML} = require('./parse-xml.js');

let notParsing = true;

const isNotParsing = () => notParsing;
exports.isNotParsing = isNotParsing;

const parseFromString = (document, isHTML, markupLanguage) => {
  notParsing = false;
  try {
    return isHTML ?
      parseHTMLDocument(document, markupLanguage) :
      parseXML(document, markupLanguage);
  }
  finally {
    notParsing = true;
  }
};
exports.parseFromString = parseFromString;
