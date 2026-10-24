import test from 'node:test';
import assert from 'node:assert/strict';
import { enhanceHtml } from '../seo-postbuild.mjs';
import { parse, elements, textOf, meta, attr } from '../html.mjs';
const source = `<!doctype html><html><head><title>Original portfolio title</title><meta content="Original description of the portfolio." name="description"><link rel="icon" href='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text>M</text></svg>'></head><body><h1>Portfolio</h1></body></html>`;
test('quoted SVG favicon does not corrupt visible content', () => {
  const output = enhanceHtml(source, 'index.html');
  const doc = parse(output);
  assert.equal(textOf(elements(doc, 'body')[0]), 'Portfolio');
  assert.equal(
    attr(
      elements(doc, 'link').find((n) => attr(n, 'rel') === 'icon'),
      'href',
    ),
    '/favicon.svg',
  );
  assert.equal(enhanceHtml(output, 'index.html'), output);
});
test('source copy and reversed attribute order survive normalization', () => {
  const doc = parse(enhanceHtml(source, 'security/index.html'));
  assert.equal(textOf(elements(doc, 'title')[0]), 'Original portfolio title');
  assert.equal(attr(meta(doc, 'description'), 'content'), 'Original description of the portfolio.');
  assert.equal(JSON.parse(textOf(elements(doc, 'script')[0]))['@type'], 'WebPage');
});
test('utility pages retain noindex', () => {
  const doc = parse(
    enhanceHtml(
      source.replace('</head>', '<meta name="robots" content="noindex, follow"></head>'),
      '404.html',
    ),
  );
  assert.equal(attr(meta(doc, 'robots'), 'content'), 'noindex, follow');
});
