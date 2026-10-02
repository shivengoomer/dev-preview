import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts'
    },
    format: ['esm'],
    target: 'node18',
    dts: true,
    clean: true,
    sourcemap: true
  },
  {
    entry: {
      cli: 'src/cli/index.ts'
    },
    format: ['esm'],
    target: 'node18',
    dts: false,
    clean: false,
    sourcemap: true,
    banner: {
      js: '#!/usr/bin/env node'
    }
  }
]);
