import {readFileSync} from 'fs';

// cjs/ reads esm/'s copy too; rollup/es.config.js puts the bytes in worker.js.
export default () => readFileSync(new URL('../../../esm/shared/css/engine.wasm', import.meta.url));
