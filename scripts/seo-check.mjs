import { readFileSync } from 'node:fs';
import { parse, elements, attr, textOf, meta, canonicalFor, htmlFiles, SITE_URL } from './html.mjs';
const root = process.argv[2] || 'dist';
const failures = [];
const indexed = [];
for (const file of htmlFiles(root)) {
  const doc = parse(readFileSync(`${root}/${file}`, 'utf8'));
  const head = elements(doc, 'head')[0];
  const check = (pass, message) => {
    if (!pass) failures.push(`${file}: ${message}`);
  };
  const title = textOf(elements(head, 'title')[0]);
  const description = attr(meta(head, 'description'), 'content') || '';
  check(title.length >= 20 && title.length <= 70, `title length ${title.length}`);
  check(
    description.length >= 70 && description.length <= 200,
    `description length ${description.length}`,
  );
  check(elements(doc, 'h1').length === 1, 'expected one H1');
  const canonicals = elements(head, 'link').filter((n) => attr(n, 'rel') === 'canonical');
  check(
    canonicals.length === 1 && attr(canonicals[0], 'href') === canonicalFor(file),
    'invalid canonical',
  );
  check(
    !!elements(head, 'link').find(
      (n) => attr(n, 'rel') === 'icon' && attr(n, 'href') === '/favicon.svg',
    ),
    'favicon missing',
  );
  check(!meta(head, 'keywords'), 'obsolete keywords');
  for (const key of ['title', 'description', 'url', 'image', 'type'])
    check(!!attr(meta(head, `og:${key}`, 'property'), 'content'), `missing og:${key}`);
  for (const key of ['card', 'title', 'description', 'image'])
    check(!!attr(meta(head, `twitter:${key}`), 'content'), `missing twitter:${key}`);
  const schemas = elements(head, 'script').filter((n) => attr(n, 'type') === 'application/ld+json');
  check(schemas.length > 0, 'missing JSON-LD');
  for (const node of schemas) {
    try {
      const schema = JSON.parse(textOf(node));
      check(!!schema['@type'], 'schema missing type');
      if (schema['@type'] === 'BlogPosting')
        check(
          !!(schema.image && schema.description && schema.mainEntityOfPage),
          'incomplete BlogPosting',
        );
    } catch {
      check(false, 'invalid JSON-LD');
    }
  }
  if (!attr(meta(head, 'robots'), 'content')?.includes('noindex')) indexed.push(canonicalFor(file));
}
const sitemap = [...readFileSync(`${root}/sitemap.xml`, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (m) => m[1],
);
if (indexed.some((url) => !sitemap.includes(url)) || sitemap.some((url) => !indexed.includes(url)))
  failures.push('Sitemap does not match indexable pages');
if (!readFileSync(`${root}/robots.txt`, 'utf8').includes(`Sitemap: ${SITE_URL}/sitemap.xml`))
  failures.push('robots.txt sitemap directive missing');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`SEO checks passed for ${indexed.length} indexable pages.`);
