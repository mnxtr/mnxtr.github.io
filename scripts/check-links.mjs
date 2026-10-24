import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse, walk, attr, htmlFiles } from './html.mjs';
const root = resolve('dist');
const errors = [];
function targetPath(url) {
  let path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
  if (!path.startsWith(`${root}/`) && path !== root) throw new Error('Path leaves build directory');
  if (existsSync(path) && statSync(path).isDirectory()) path += '/index.html';
  return path;
}
for (const file of htmlFiles(root)) {
  const doc = parse(readFileSync(`${root}/${file}`, 'utf8'));
  const ids = new Set();
  for (const node of walk(doc)) {
    const id = attr(node, 'id');
    if (id && ids.has(id)) errors.push(`${file}: duplicate ID ${id}`);
    if (id) ids.add(id);
    for (const key of ['href', 'src']) {
      const value = attr(node, key);
      if (!value || value.startsWith('data:') || value.startsWith('mailto:')) continue;
      if (value === '#') {
        errors.push(`${file}: placeholder link`);
        continue;
      }
      const url = new URL(value, `https://mnxtr.github.io/${file}`);
      if (url.origin !== 'https://mnxtr.github.io') continue;
      const target = targetPath(url);
      if (!existsSync(target)) {
        errors.push(`${file}: missing ${value}`);
        continue;
      }
      if (url.hash && target.endsWith('.html')) {
        const destination = parse(readFileSync(target, 'utf8'));
        if (
          ![...walk(destination)].some(
            (n) => attr(n, 'id') === decodeURIComponent(url.hash.slice(1)),
          )
        )
          errors.push(`${file}: missing anchor ${value}`);
      }
    }
  }
}
const index = JSON.parse(readFileSync(`${root}/data/portfolio-index.json`, 'utf8'));
for (const item of index.documents) {
  if (!existsSync(targetPath(new URL(item.url, 'https://mnxtr.github.io'))))
    errors.push(`Search index: missing ${item.url}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Internal links, assets, anchors, and ${index.documents.length} search destinations passed.`,
  );
