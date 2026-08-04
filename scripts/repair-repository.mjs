import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const archiveDirectories = ['vite-project', 'website', '.playwright-mcp'];
const skippedDirectories = new Set(['.git', 'node_modules', 'dist']);
const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.txt',
  '.xml',
  '.yaml',
  '.yml',
]);

const replacements = [
  [/Newaz/g, 'Newaz'],
  [/https:\/\/formspree\.io\/f\/your-form-id/g, 'https://formsubmit.co/mohammad.newaz1@northsouth.edu'],
  [/https:\/\/mnxtr\.github\.io\/website\/?/g, 'https://github.com/mnxtr/bd-traffic-signs'],
  [/href=["'](?:\.\/)?website\/?(?:index\.html)?["']/g, 'href="https://github.com/mnxtr/bd-traffic-signs"'],
];

let updatedFiles = 0;

async function normalizeFile(filePath) {
  if (!textExtensions.has(extname(filePath).toLowerCase())) {
    return;
  }

  const original = await readFile(filePath, 'utf8');
  let normalized = original;

  for (const [pattern, replacement] of replacements) {
    normalized = normalized.replace(pattern, replacement);
  }

  if (normalized !== original) {
    await writeFile(filePath, normalized, 'utf8');
    updatedFiles += 1;
    console.log(`updated ${relative(root, filePath)}`);
  }
}

async function walk(directory) {
  for (const entry of await readdir(directory)) {
    if (skippedDirectories.has(entry)) {
      continue;
    }

    const fullPath = join(directory, entry);
    const entryStat = await stat(fullPath);

    if (entryStat.isDirectory()) {
      await walk(fullPath);
    } else if (entryStat.isFile()) {
      await normalizeFile(fullPath);
    }
  }
}

for (const directory of archiveDirectories) {
  const fullPath = join(root, directory);
  await rm(fullPath, { recursive: true, force: true });
  console.log(`removed ${directory}/ (preserved on archive/legacy-apps-2026-08-04)`);
}

await walk(root);
console.log(`repository repair complete; ${updatedFiles} text files normalized`);
