import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse, serialize, defaultTreeAdapter as tree } from 'parse5';
export { parse, serialize };
export const SITE_URL = 'https://mnxtr.github.io';
export function* walk(node) {
  yield node;
  for (const child of node.childNodes || []) yield* walk(child);
}
export const elements = (node, tag) => [...walk(node)].filter((n) => n.tagName === tag);
export const attr = (node, key) => node?.attrs?.find((a) => a.name === key)?.value;
export const textOf = (node) =>
  [...walk(node)]
    .filter((n) => n.nodeName === '#text')
    .map((n) => n.value)
    .join('');
export function setAttr(node, key, value) {
  const item = node.attrs.find((a) => a.name === key);
  if (item) item.value = value;
  else node.attrs.push({ name: key, value });
}
export function remove(node) {
  tree.detachNode(node);
}
export function append(parent, tag, attrs = {}, content) {
  const node = tree.createElement(
    tag,
    'http://www.w3.org/1999/xhtml',
    Object.entries(attrs).map(([name, value]) => ({ name, value })),
  );
  tree.appendChild(parent, node);
  if (content !== undefined) tree.insertText(node, content);
  return node;
}
export const meta = (doc, key, field = 'name') =>
  elements(doc, 'meta').find((n) => attr(n, field) === key);
export function upsertMeta(head, key, value, field = 'name') {
  elements(head, 'meta')
    .filter((n) => attr(n, field) === key)
    .forEach(remove);
  append(head, 'meta', { [field]: key, content: value });
}
export function canonicalFor(file) {
  return `${SITE_URL}/${file.replace(/(^|\/)index\.html$/, '$1')}`;
}
export function htmlFiles(root, prefix = '') {
  return readdirSync(join(root, prefix))
    .sort()
    .flatMap((name) => {
      const file = join(prefix, name);
      if (statSync(join(root, file)).isDirectory())
        return name === 'tanvora' ? [] : htmlFiles(root, file);
      return name.endsWith('.html') ? [file] : [];
    });
}
export function sourcePages(root = process.cwd()) {
  const rootFiles = readdirSync(root).filter((n) => n.endsWith('.html'));
  for (const dir of ['blog', 'projects', 'security']) {
    try {
      rootFiles.push(...htmlFiles(root, dir));
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  return rootFiles.sort();
}
