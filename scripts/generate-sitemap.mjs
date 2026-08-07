import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SITE_URL = 'https://mnxtr.github.io';
const ROOT = process.cwd();
const OUTPUT = join(ROOT, 'public', 'sitemap.xml');
const EXCLUDED_DIRS = new Set([
  '.git',
  '.github',
  '.serena',
  '.vscode',
  'dist',
  'node_modules',
  'scripts',
  'src',
  'supabase',
  'vite-project',
  'website',
  'public',
]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const rel = relative(ROOT, fullPath).replaceAll('\\', '/');
    const isDir = statSync(fullPath).isDirectory();

    if (isDir) {
      if (!EXCLUDED_DIRS.has(entry)) walk(fullPath, files);
    } else if (entry.endsWith('.html')) {
      files.push(rel);
    }
  }
  return files;
}

function routeFor(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.slice(0, -'index.html'.length)}`;
  return `/${file}`;
}

function gitDate(path) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', path], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

const buildConfigDate = gitDate('vite.config.js');
const postBuildDate = gitDate('scripts/seo-postbuild.mjs');
const globalTransformDate = [buildConfigDate, postBuildDate].filter(Boolean).sort().at(-1) ?? '';

const pages = walk(ROOT)
  .map((file) => {
    const fileDate = gitDate(file);
    const lastmod = [fileDate, globalTransformDate].filter(Boolean).sort().at(-1) || new Date().toISOString().slice(0, 10);
    return { file, route: routeFor(file), lastmod };
  })
  .sort((a, b) => (a.route === '/' ? -1 : b.route === '/' ? 1 : a.route.localeCompare(b.route)));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.flatMap(({ route, lastmod }) => [
    '  <url>',
    `    <loc>${SITE_URL}${route}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    '  </url>',
  ]),
  '</urlset>',
  '',
].join('\n');

writeFileSync(OUTPUT, xml);
console.log(`Generated sitemap with ${pages.length} URLs -> public/sitemap.xml`);
