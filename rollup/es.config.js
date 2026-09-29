import {readFileSync} from 'fs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: './esm/index.js',
  plugins: [
    shims(),
    nodeResolve(),
    commonjs(),
    json()
  ],
  output: {
    file: './worker.js',
    format: 'esm'
  }
};

function shims() {
  return {
    resolveId(specifier) {
      if(specifier.endsWith('canvas.cjs')) {
        return 'shim:canvas';
      }
      if(specifier.endsWith('/css/bytes.js')) {
        return 'shim:css-bytes';
      }
    },
    load(id) {
      switch(id) {
        case 'shim:canvas': {
          return `
            class Canvas {
              constructor(width, height) {
                this.width = width;
                this.height = height;
              }
              getContext() { return null; }
              toDataURL() { return ''; }
            }
            export default {createCanvas: (width, height) => new Canvas(width, height)};
          `;
        }
        // A worker has no file system to read the module from.
        case 'shim:css-bytes': {
          const base64 = readFileSync('./esm/shared/css/engine.wasm').toString('base64');
          return `
            const base64 = ${JSON.stringify(base64)};
            export default () => {
              if (Uint8Array.fromBase64)
                return Uint8Array.fromBase64(base64);
              const binary = atob(base64);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++)
                bytes[i] = binary.charCodeAt(i);
              return bytes;
            };
          `;
        }
      }
    }
  }
}
