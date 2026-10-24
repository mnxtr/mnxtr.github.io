import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { sourcePages, parse, meta, attr, canonicalFor } from './html.mjs';
const pages = sourcePages().filter(
  (file) =>
    !attr(meta(parse(readFileSync(file, 'utf8')), 'robots'), 'content')?.includes('noindex'),
);
const rows = pages.map((file) => {
  let lastmod = '';
  try {
    lastmod = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      encoding: 'utf8',
    }).trim();
  } catch {
    /* Last modified is optional. */
  }
  return `  <url><loc>${canonicalFor(file)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
});
writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`,
);
console.log(`Generated sitemap with ${pages.length} URLs.`);
