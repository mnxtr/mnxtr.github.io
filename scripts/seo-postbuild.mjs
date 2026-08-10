import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SITE_URL = 'https://mnxtr.github.io';
const OG_IMAGE = `${SITE_URL}/img/og-image.png`;
const DIST_DIR = 'dist';

const PAGE_OVERRIDES = {
  'index.html': {
    title: 'Mohammad Mansib Newaz | Full-Stack Developer in Bangladesh',
    description:
      'Full-stack developer in Bangladesh building React frontends, FastAPI APIs, PostgreSQL backends, and practical AI integrations for remote teams and product work.',
  },
  'about.html': {
    title: 'About Mohammad Mansib Newaz | Full-Stack Developer, Bangladesh',
    description:
      'About Mohammad Mansib Newaz, a Bangladesh-based full-stack developer focused on responsive web apps, secure APIs, reliable data systems, and practical AI integration.',
  },
  'project.html': {
    title: 'Full-Stack Development Projects | React, FastAPI & PostgreSQL',
    description:
      'Full-stack development projects by Mohammad Mansib Newaz featuring responsive web apps, secure FastAPI services, PostgreSQL systems, and practical AI integrations.',
  },
  'resume.html': {
    title: 'Mohammad Mansib Newaz Resume | Full-Stack Developer',
    description:
      'Resume of Mohammad Mansib Newaz, a Bangladesh-based full-stack developer working with React, JavaScript, FastAPI, PostgreSQL, secure APIs, and practical AI integration.',
  },
  'contact.html': {
    title: 'Hire a Full-Stack Developer | Bangladesh & Remote',
    description:
      'Contact Mohammad Mansib Newaz for remote full-stack development, React frontend work, FastAPI backends, PostgreSQL systems, secure APIs, and product collaboration.',
  },
  'blog/index.html': {
    title: 'Full-Stack Development Blog | React, FastAPI & PostgreSQL',
    description:
      'Engineering notes on full-stack development, React, FastAPI, PostgreSQL, API security, deployment, and practical AI integration from Mohammad Mansib Newaz.',
  },
};

function walkHtml(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) walkHtml(fullPath, files);
    else if (entry.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

function canonicalFor(relativePath) {
  if (relativePath === 'index.html') return `${SITE_URL}/`;
  if (relativePath.endsWith('/index.html')) {
    return `${SITE_URL}/${relativePath.slice(0, -'index.html'.length)}`;
  }
  return `${SITE_URL}/${relativePath}`;
}

function upsertMeta(html, attribute, key, content) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+${attribute}=["']${escapedKey}["'][^>]*>`, 'i');
  const tag = `<meta ${attribute}="${key}" content="${escapeAttribute(content)}" />`;
  return regex.test(html) ? html.replace(regex, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

function upsertCanonical(html, canonical) {
  const tag = `<link rel="canonical" href="${canonical}" />`;
  const regex = /<link\s+rel=["']canonical["'][^>]*>/i;
  return regex.test(html) ? html.replace(regex, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

function upsertFavicon(html) {
  html = html.replace(/\s*<link\s+rel=["']icon["'][^>]*>\s*/gi, '\n');
  return html.replace(
    '</head>',
    '  <link rel="icon" type="image/svg+xml" href="/favicon.svg" sizes="any" />\n</head>',
  );
}

function setTitle(html, title) {
  const tag = `<title>${title}</title>`;
  const regex = /<title>[\s\S]*?<\/title>/i;
  return regex.test(html) ? html.replace(regex, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

function extractMeta(html, attribute, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+${attribute}=["']${escapedKey}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const reverseRegex = new RegExp(`<meta\\s+content=["']([^"']*)["'][^>]*${attribute}=["']${escapedKey}["'][^>]*>`, 'i');
  return html.match(regex)?.[1] ?? html.match(reverseRegex)?.[1] ?? '';
}

function extractTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() ?? '';
}

function addWebsiteSchema(html) {
  if (/"@type"\s*:\s*"WebSite"/.test(html)) return html;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: 'Mohammad Mansib Newaz',
    alternateName: 'MNXTR',
    description:
      'Portfolio of Mohammad Mansib Newaz, a full-stack developer in Bangladesh available for remote product and engineering work.',
    inLanguage: 'en',
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Mohammad Mansib Newaz',
      url: SITE_URL,
    },
  };

  return html.replace(
    '</head>',
    `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>\n</head>`,
  );
}

function enhanceBlogPostingSchema(html, canonical, description) {
  return html.replace(
    /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi,
    (full, rawJson) => {
      try {
        const data = JSON.parse(rawJson);
        if (data['@type'] !== 'BlogPosting') return full;
        data.image = data.image ?? [OG_IMAGE];
        data.description = data.description ?? description;
        data.mainEntityOfPage = data.mainEntityOfPage ?? {
          '@type': 'WebPage',
          '@id': canonical,
        };
        return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n  </script>`;
      } catch {
        return full;
      }
    },
  );
}

function improveHomepageCopy(html) {
  html = html.replace(
    'Available for full-stack web projects',
    'Bangladesh-based · available for remote full-stack web projects',
  );
  html = html.replace('Web products built', 'Full-stack web products built');
  return html.replace(
    /I turn product ideas into responsive interfaces,\s*secure APIs, and reliable data\s*layers—adding AI where it creates real value\./,
    'I’m a full-stack developer based in Bangladesh, turning product ideas into responsive interfaces, secure APIs, and reliable data layers for remote teams—adding AI where it creates real value.',
  );
}

for (const filePath of walkHtml(DIST_DIR)) {
  const rel = relative(DIST_DIR, filePath).replaceAll('\\', '/');
  const canonical = canonicalFor(rel);
  let html = readFileSync(filePath, 'utf8');

  html = html.replace(/\s*<meta\s+name=["']keywords["'][^>]*>\s*/gi, '\n');

  const override = PAGE_OVERRIDES[rel];
  if (override) {
    html = setTitle(html, override.title);
    html = upsertMeta(html, 'name', 'description', override.description);
  }

  if (rel === 'index.html') html = improveHomepageCopy(html);

  const title = extractTitle(html);
  const description = extractMeta(html, 'name', 'description');
  const socialAlt = `${title} — Mohammad Mansib Newaz portfolio`;

  html = upsertCanonical(html, canonical);
  html = upsertFavicon(html);
  html = upsertMeta(html, 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  html = upsertMeta(html, 'property', 'og:url', canonical);
  html = upsertMeta(html, 'property', 'og:title', title);
  html = upsertMeta(html, 'property', 'og:description', description);
  html = upsertMeta(html, 'property', 'og:image', OG_IMAGE);
  html = upsertMeta(html, 'property', 'og:image:width', '1920');
  html = upsertMeta(html, 'property', 'og:image:height', '1080');
  html = upsertMeta(html, 'property', 'og:image:alt', socialAlt);
  html = upsertMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = upsertMeta(html, 'name', 'twitter:title', title);
  html = upsertMeta(html, 'name', 'twitter:description', description);
  html = upsertMeta(html, 'name', 'twitter:image', OG_IMAGE);
  html = upsertMeta(html, 'name', 'twitter:image:alt', socialAlt);

  if (rel === 'index.html') html = addWebsiteSchema(html);
  html = enhanceBlogPostingSchema(html, canonical, description);

  writeFileSync(filePath, html);
  console.log(`SEO enhanced: ${rel}`);
}
