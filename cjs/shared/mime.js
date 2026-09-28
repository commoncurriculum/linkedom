'use strict';
const Mime = {
  'text/html': {
    docType: '<!DOCTYPE html>',
    ignoreCase: true
  },
  'image/svg+xml': {
    docType: '<?xml version="1.0" encoding="utf-8"?>',
    ignoreCase: false
  },
  'text/xml': {
    docType: '<?xml version="1.0" encoding="utf-8"?>',
    ignoreCase: false
  },
  'application/xml': {
    docType: '<?xml version="1.0" encoding="utf-8"?>',
    ignoreCase: false
  },
  'application/xhtml+xml': {
    docType: '<?xml version="1.0" encoding="utf-8"?>',
    ignoreCase: false
  }
};
exports.Mime = Mime;
