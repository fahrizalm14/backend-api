import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  target: 'node20',
  platform: 'node',
  bundle: true,
  format: ['cjs'],
  outDir: 'dist',
  clean: true,
  dts: false,
  skipNodeModulesBundle: false,
  external: [],
  noExternal: [/.*/],
});
