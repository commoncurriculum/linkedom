const assert = require('../assert.js').for('DocumentType');

const {parseHTML} = global[Symbol.for('linkedom')];

const {document} = parseHTML('<!doctype html><html />');

const {body} = document;

assert(body.shadowRoot, null, 'no shadowRoot');

const shadowRoot = body.attachShadow({mode: 'open'});

assert(body.shadowRoot, shadowRoot, 'yes shadowRoot');

assert(body.shadowRoot.host, body, 'yes shadowRoot.host');

try {
  body.attachShadow({mode: 'open'});
  assert(true, false, 'double shadowRoot should not be possible');
} catch (ok) {}

shadowRoot.innerHTML = '<div class="js-shadowChild">content</div>';
assert(shadowRoot.innerHTML, '<div class="js-shadowChild">content</div>', 'shadowRoot innerHTML should be properly defined');
