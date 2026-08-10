#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist', 'public');
const canonicalOrigin = 'https://www.bravomechanicalny.com';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function findCssRule(cssRoot, selector) {
  let match;
  cssRoot.walkRules((rule) => {
    if (!match && rule.selectors?.includes(selector)) match = rule;
  });
  return match;
}

function hasDeclaration(rule, property, value) {
  return Boolean(rule?.nodes?.some((node) =>
    node.type === 'decl' && node.prop === property && node.value === value));
}

async function readDist(relativePath) {
  const file = path.join(dist, relativePath);
  assert(existsSync(file), `Missing built asset: ${relativePath}`);
  return readFile(file, 'utf8');
}

const home = await readDist('index.html');
const assetDir = path.join(dist, 'assets');
const jsAssets = (await import('node:fs/promises')).readdir(assetDir);
const appText = [home];
const cssText = [];
for (const file of await jsAssets) {
  if (file.endsWith('.js')) appText.push(await readFile(path.join(assetDir, file), 'utf8'));
  if (file.endsWith('.css')) cssText.push(await readFile(path.join(assetDir, file), 'utf8'));
}
const bundledApp = appText.join('\n');
const bundledCss = cssText.join('\n');
const cssRoot = postcss.parse(bundledCss);
assert(bundledApp.includes('tel:+19143619142'), 'Built app is missing tel:+19143619142 CTA');
assert(bundledApp.includes('mailto:info@bravomechanicalny.com'), 'Built app is missing info@bravomechanicalny.com mailto CTA');
assert(!/Bravomechanicalllc@gmail\.com|bravomechanicalllc@gmail\.com|914-555-0100|9145550100/.test(bundledApp), 'Built app contains outdated placeholder contact info');
const skipLinkFocus = findCssRule(cssRoot, '.skip-link:focus');
assert(hasDeclaration(skipLinkFocus, 'transform', 'translateY(0)'), 'Built CSS is missing the visible .skip-link:focus rule');
assert(hasDeclaration(skipLinkFocus, 'outline-offset', '2px'), 'Built CSS is missing the skip-link focus outline');
const pageLoader = findCssRule(cssRoot, '.page-loader');
assert(hasDeclaration(pageLoader, 'min-height', '100vh'), 'Built CSS is missing the .page-loader viewport block');
assert(hasDeclaration(pageLoader, 'display', 'flex'), 'Built CSS is missing the .page-loader layout rule');
let reducedMotionSpinner;
cssRoot.walkAtRules('media', (atRule) => {
  if (atRule.params.replace(/\s+/g, '') !== '(prefers-reduced-motion:reduce)') return;
  atRule.walkRules((rule) => {
    if (!reducedMotionSpinner && rule.selectors?.includes('.page-loader__spinner')) {
      reducedMotionSpinner = rule;
    }
  });
});
assert(hasDeclaration(reducedMotionSpinner, 'animation', 'none'), 'Built CSS is missing .page-loader__spinner { animation: none } within reduced motion');

const robots = await readDist('robots.txt');
assert(robots.includes('Allow: /'), 'robots.txt must allow crawling');
assert(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), 'robots.txt must reference canonical sitemap');

const sitemap = await readDist('sitemap.xml');
for (const route of ['/', '/contact', '/services', '/about']) {
  const loc = `${canonicalOrigin}${route === '/' ? '/' : route}`;
  assert(sitemap.includes(loc), `sitemap.xml missing ${loc}`);
}
assert(!sitemap.includes('https://bravomechanicalny.com'), 'sitemap.xml must not use the redirecting non-www host');
assert(!sitemap.includes('/admin/'), 'sitemap.xml must not include admin routes');
assert(!sitemap.includes('/auth'), 'sitemap.xml must not include auth routes');

const llms = await readDist('llms.txt');
assert(llms.includes(canonicalOrigin), 'llms.txt missing canonical website');
assert(!llms.includes('https://bravomechanicalny.com'), 'llms.txt must not use the redirecting non-www host');
assert(llms.includes('info@bravomechanicalny.com'), 'llms.txt missing canonical email');
assert(llms.includes('+1-914-361-9142'), 'llms.txt missing canonical phone');

for (const route of ['contact/index.html', 'services/index.html', 'about/index.html']) {
  const html = await readDist(route);
  assert(html.includes('<meta name="robots" content="index, follow'), `${route} should be indexable`);
}

const allDistFiles = await (await import('node:fs/promises')).readdir(dist, { recursive: true });
const routeHtmlFiles = allDistFiles.filter((file) => file === 'index.html' || file.endsWith('/index.html'));
for (const relativePath of routeHtmlFiles) {
  const html = await readDist(relativePath);
  const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
  const description = decodeHtml(html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '');
  assert(title.length <= 65, `${relativePath} title is ${title.length} characters`);
  assert(description.length <= 160, `${relativePath} description is ${description.length} characters`);

  const jsonLd = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap((match) => {
      const parsed = JSON.parse(match[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    });
  assert(jsonLd.filter((item) => item['@type'] === 'FAQPage').length <= 1, `${relativePath} has duplicate FAQPage schema`);
  assert(jsonLd.filter((item) => item['@type'] === 'HVACBusiness').length <= 1, `${relativePath} has duplicate HVACBusiness schema`);
  assert((html.match(/"@type"\s*:\s*"HVACBusiness"/g) || []).length <= 1, `${relativePath} repeats the canonical HVACBusiness node`);
  assert(!/"aggregateRating"\s*:/.test(html), `${relativePath} contains self-serving LocalBusiness rating markup`);
}

const yonkers = await readDist('service-areas/yonkers/index.html');
assert(yonkers.includes('largest city in Westchester County'), 'Yonkers prerender must include its verified local content');
const whitePlains = await readDist('service-areas/white-plains/index.html');
assert(whitePlains.includes('commercial hub'), 'White Plains prerender must include its verified local content');

const boilerAssets = (await jsAssets).filter((file) => file.startsWith('project-boiler-after-'));
assert(boilerAssets.length === 1, 'Expected exactly one optimized boiler project asset');
assert(!boilerAssets[0].endsWith('.png'), 'Boiler project image must use a modern compressed format');
const boilerStat = await (await import('node:fs/promises')).stat(path.join(assetDir, boilerAssets[0]));
assert(boilerStat.size < 250_000, `Boiler project image is still too large: ${boilerStat.size} bytes`);

for (const file of await jsAssets) {
  if (!/\.(?:avif|webp|jpe?g|png)$/i.test(file)) continue;
  const { size } = await (await import('node:fs/promises')).stat(path.join(assetDir, file));
  assert(size < 750_000, `${file} is too large for mobile delivery: ${size} bytes`);
}

console.log('Smoke checks passed for homepage, CTAs, robots.txt, sitemap.xml, llms.txt, and core routes.');
