import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

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
  return html.replaceAll('Newaz', 'Newaz').replaceAll(FORM_PLACEHOLDER, FORM_ENDPOINT);
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
      if (html.includes('Newaz')) {
        throw new Error(`Non-canonical surname found in ${output.fileName}`);
      }

      if (html.includes('your-form-id')) {
        throw new Error(`Placeholder contact endpoint found in ${output.fileName}`);
      }
    }
  },
};

/**
 * Recursively find all HTML files for the multi-page build.
 *
 * @param {string} dir - Directory to search
 * @param {Object} files - Accumulator for found files
 * @param {string} base - Base path for relative paths
 * @returns {Object} Object with filename: filepath mappings
 */
function findHtmlFiles(dir, files = {}, base = '') {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const relativePath = base ? `${base}/${item}` : item;
    const isDir = statSync(fullPath).isDirectory();
    const isExcludedDir = [
      '.',
      '..',
      'node_modules',
      'dist',
      'vite-project',
      'website',
      'scripts',
    ].includes(item);

    if (isDir && !isExcludedDir) {
      findHtmlFiles(fullPath, files, relativePath);
    } else if (item.endsWith('.html')) {
      const name = relativePath.replace(/\//g, '-').replace('.html', '') || 'main';
      files[name] = fullPath;
    }
  }

  return files;
}

const htmlFiles = findHtmlFiles(__dirname);

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
