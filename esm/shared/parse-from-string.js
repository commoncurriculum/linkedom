import {parseHTMLDocument} from './parse-html.js';
import {parseXML} from './parse-xml.js';

let notParsing = true;

export const isNotParsing = () => notParsing;

export const parseFromString = (document, isHTML, markupLanguage) => {
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
