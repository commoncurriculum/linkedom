const assert = require('../assert.js').for('HTMLInputElement');

const {parseHTML} = global[Symbol.for('linkedom')];

let {document} = parseHTML('<input />');

let {firstElementChild: input} = document.body;

input.type = 'password';
assert(input.toString(), '<input type="password">');

({document} = parseHTML('<input>'));
({firstElementChild: input} = document.body);
assert(input.toString(), '<input>');
