import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SITE_URL = 'https://mnxtr.github.io';
const DIST_DIR = process.argv[2] || 'dist';
const errors = [];

function walkHtml(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) walkHtml(fullPath, files);
    else if (entry.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

function meta(html, attribute, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const direct = new RegExp(`<meta\\s+${attribute}=["']${escapedKey}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const reverse = new RegExp(`<meta\\s+content=["']([^"']*)["'][^>]*${attribute}=["']${escapedKey}["'][^>]*>`, 'i');
  return html.match(direct)?.[1] ?? html.match(reverse)?.[1] ?? '';
}

function canonical(html) {
  return html.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] ??
    html.match(/<link\s+href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1] ?? '';
}

function jsonLdObjects(html, file) {
  const values = [];
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(regex)) {
    try {
      values.push(JSON.parse(match[1]));
    } catch {
      fail(file, 'contains invalid JSON-LD');
    }
  }
  return values;
}

if (!existsSync(DIST_DIR)) {
  console.error(`SEO check failed: ${DIST_DIR} does not exist. Run npm run build first.`);
  process.exit(1);
}

const htmlFiles = walkHtml(DIST_DIR);
const expectedCanonicals = [];

for (const filePath of htmlFiles) {
  const file = relative(DIST_DIR, filePath).replaceAll('\\', '/');
  const html = readFileSync(filePath, 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() ?? '';
  const description = meta(html, 'name', 'description');
  const canonicalUrl = canonical(html);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const schemas = jsonLdObjects(html, file);

  if (title.length < 20 || title.length > 70) fail(file, `title length ${title.length} is outside 20–70 characters`);
  if (description.length < 70 || description.length > 180) fail(file, `description length ${description.length} is outside 70–180 characters`);
  if (!canonicalUrl.startsWith(`${SITE_URL}/`)) fail(file, 'missing or invalid canonical URL');
  if (h1Count !== 1) fail(file, `expected exactly one H1, found ${h1Count}`);
  if (!meta(html, 'property', 'og:title')) fail(file, 'missing og:title');
  if (!meta(html, 'property', 'og:description')) fail(file, 'missing og:description');
  if (!meta(html, 'property', 'og:image')) fail(file, 'missing og:image');
  if (!meta(html, 'name', 'twitter:image')) fail(file, 'missing twitter:image');
  if (!/<link\s+rel=["']icon["'][^>]*href=["']\/favicon\.svg["']/i.test(html)) fail(file, 'missing stable /favicon.svg');
  if (/<meta\s+name=["']keywords["']/i.test(html)) fail(file, 'meta keywords should not ship');
  if (schemas.length === 0) fail(file, 'missing JSON-LD structured data');

  if (file === 'index.html' && !schemas.some((schema) => schema['@type'] === 'WebSite')) {
    fail(file, 'homepage missing WebSite structured data');
  }

  if (meta(html, 'property', 'og:type') === 'article') {
    const article = schemas.find((schema) => schema['@type'] === 'BlogPosting');
    if (!article) fail(file, 'article page missing BlogPosting schema');
    else {
      for (const field of ['headline', 'datePublished', 'dateModified', 'author', 'image', 'mainEntityOfPage']) {
        if (!article[field]) fail(file, `BlogPosting missing ${field}`);
      }
    }
  }

  expectedCanonicals.push(canonicalUrl);
}

const sitemapPath = join(DIST_DIR, 'sitemap.xml');
if (!existsSync(sitemapPath)) fail('sitemap.xml', 'missing from production build');
else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  if (/<priority>|<changefreq>/i.test(sitemap)) fail('sitemap.xml', 'contains ignored priority/changefreq fields');
  for (const url of expectedCanonicals) {
    if (url && !sitemap.includes(`<loc>${url}</loc>`)) fail('sitemap.xml', `missing ${url}`);
  }
}

const robotsPath = join(DIST_DIR, 'robots.txt');
if (!existsSync(robotsPath)) fail('robots.txt', 'missing from production build');
else {
  const robots = readFileSync(robotsPath, 'utf8');
  if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) fail('robots.txt', 'missing sitemap directive');
  if (/crawl-delay/i.test(robots)) fail('robots.txt', 'contains unsupported crawl-delay directive');
}

if (errors.length) {
  console.error('\nSEO regression check failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`SEO regression check passed for ${htmlFiles.length} HTML pages.`);
