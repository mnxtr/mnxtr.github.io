import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { sourcePages } from './scripts/html.mjs';

const portfolioContentPlugin = {
  name: 'portfolio-shared-shell',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html.replace(/<!-- portfolio:(header|footer) -->/g, (_match, name) =>
        readFileSync(resolve(`partials/${name}.html`), 'utf8'),
      );
    },
  },

  generateBundle(_options, bundle) {
    for (const output of Object.values(bundle)) {
      if (output.type !== 'asset' || !output.fileName.endsWith('.html')) {
        continue;
      }

      const html = String(output.source);
      if (html.includes('your-form-id')) {
        throw new Error(`Placeholder contact endpoint found in ${output.fileName}`);
      }
    }
  },
};

const htmlFiles = Object.fromEntries(sourcePages().map((file) => [file, resolve(file)]));

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [portfolioContentPlugin],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    rollupOptions: {
      input: htmlFiles,
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },

  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  preview: {
    port: 4173,
  },

  ssr: {
    external: ['three'],
  },

  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
