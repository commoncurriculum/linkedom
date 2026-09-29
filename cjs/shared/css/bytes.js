'use strict';
const {readFileSync} = require('fs');

// cjs/ reads esm/'s copy too; rollup/es.config.js puts the bytes in worker.js.
module.exports = () => readFileSync(new URL('../../../esm/shared/css/engine.wasm', ({url: require('url').pathToFileURL(__filename).href}).url));
