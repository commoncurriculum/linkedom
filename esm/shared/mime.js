const xml = type => ({
  type,
  docType: '<?xml version="1.0" encoding="utf-8"?>',
  ignoreCase: false
});

export const Mime = {
  'text/html': {
    type: 'text/html',
    docType: '<!DOCTYPE html>',
    ignoreCase: true
  },
  'image/svg+xml': xml('image/svg+xml'),
  'text/xml': xml('text/xml'),
  'application/xml': xml('application/xml'),
  'application/xhtml+xml': xml('application/xhtml+xml')
};
