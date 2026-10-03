import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import pkg from './package.json' with { type: 'json' }

// Never bundle what the package depends on. Two copies of React in one page
// break hooks, and a product that installs this package installs these anyway.
const dependencies = [...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)]

// Library build: what products install, and the proof that the package
// compiles in isolation — which is what actually keeps the framework layer
// honest.
export default defineConfig({
  // The collapse mark draws in a worker shipped as its own file. A relative base
  // points its URL at the module that loads it, so a product's bundler can find
  // and copy the file; the default `/assets/...` would point at the product's
  // own server root, where the file does not exist.
  base: './',
  // Colocated tests are typechecked but must not reach the published types:
  // emitting a .d.ts for a test file leaks its imports into the package surface.
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['**/*.test.*'], rollupTypes: false }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
      cssFileName: 'tular-ui',
    },
    rollupOptions: {
      external: (id) => dependencies.some((name) => id === name || id.startsWith(`${name}/`)),
      // One file per source module, so a product's bundler can still split what
      // only a lazily loaded screen uses (Markdown and its parser) out of the
      // first load, as it could when it compiled the source itself.
      output: { preserveModules: true, preserveModulesRoot: 'src' },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
