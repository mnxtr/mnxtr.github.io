import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { sourcePages } from './scripts/html.mjs';

const FORM_PLACEHOLDER = 'https://formsubmit.co/mohammad.newaz1@northsouth.edu';
const FORM_ENDPOINT = 'https://formsubmit.co/mohammad.newaz1@northsouth.edu';

/**
 * Normalize public-facing content without changing page layout or behavior.
 * The output guard below prevents accidental regressions from being deployed.
 *
 * @param {string} html - HTML being processed by Vite
 * @returns {string} Normalized HTML
 */
function normalizePortfolioHtml(html) {
  return html.replaceAll(FORM_PLACEHOLDER, FORM_ENDPOINT);
}

const portfolioContentPlugin = {
  name: 'portfolio-content-normalization',

  transformIndexHtml(html) {
    return normalizePortfolioHtml(html);
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
