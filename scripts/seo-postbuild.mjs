import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  parse,
  serialize,
  elements,
  attr,
  textOf,
  remove,
  append,
  meta,
  upsertMeta,
  canonicalFor,
  htmlFiles,
  SITE_URL,
} from './html.mjs';

export function enhanceHtml(html, file) {
  const doc = parse(html);
  const head = elements(doc, 'head')[0];
  const title = textOf(elements(head, 'title')[0]);
  const description = attr(meta(head, 'description'), 'content') || '';
  const canonical = canonicalFor(file);
  for (const link of elements(head, 'link')) {
    if (['canonical', 'icon'].includes(attr(link, 'rel'))) remove(link);
  }
  elements(head, 'meta')
    .filter((n) => attr(n, 'name') === 'keywords')
    .forEach(remove);
  append(head, 'link', { rel: 'canonical', href: canonical });
  append(head, 'link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg', sizes: 'any' });
  upsertMeta(head, 'robots', attr(meta(head, 'robots'), 'content') || 'index, follow');
  for (const [key, value] of Object.entries({
    title,
    description,
    url: canonical,
    image: `${SITE_URL}/img/og-image.png`,
    type: file.startsWith('blog/') && !file.endsWith('index.html') ? 'article' : 'website',
    site_name: 'MNXTR · Mohammad Mansib Newaz',
  })) {
    upsertMeta(head, `og:${key}`, value, 'property');
  }
  for (const [key, value] of Object.entries({
    card: 'summary_large_image',
    title,
    description,
    image: `${SITE_URL}/img/og-image.png`,
  }))
    upsertMeta(head, `twitter:${key}`, value);
  const schemaNodes = elements(head, 'script').filter(
    (n) => attr(n, 'type') === 'application/ld+json',
  );
  const schemas = schemaNodes.map((n) => JSON.parse(textOf(n)));
  schemaNodes.forEach(remove);
  if (!schemas.length)
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonical,
    });
  if (file === 'index.html' && !schemas.some((s) => s['@type'] === 'WebSite'))
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Mohammad Mansib Newaz',
      alternateName: 'MNXTR',
      url: canonical,
      description,
    });
  for (const schema of schemas) {
    if (schema['@type'] === 'BlogPosting') {
      schema.image ||= [`${SITE_URL}/img/og-image.png`];
      schema.description ||= description;
      schema.mainEntityOfPage ||= { '@type': 'WebPage', '@id': canonical };
    }
    append(
      head,
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(schema).replaceAll('<', '\\u003c'),
    );
  }
  return serialize(doc);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  for (const file of htmlFiles('dist'))
    writeFileSync(`dist/${file}`, enhanceHtml(readFileSync(`dist/${file}`, 'utf8'), file));
  console.log('Normalized production metadata without rewriting page content.');
}
