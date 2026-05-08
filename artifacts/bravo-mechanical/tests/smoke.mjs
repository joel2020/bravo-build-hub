#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist', 'public');

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
for (const file of await jsAssets) {
  if (file.endsWith('.js')) appText.push(await readFile(path.join(assetDir, file), 'utf8'));
}
const bundledApp = appText.join('\n');
assert(bundledApp.includes('tel:+19143619142'), 'Built app is missing tel:+19143619142 CTA');
assert(bundledApp.includes('mailto:info@bravomechanicalny.com'), 'Built app is missing info@bravomechanicalny.com mailto CTA');
assert(!/Bravomechanicalllc@gmail\.com|bravomechanicalllc@gmail\.com|914-555-0100|9145550100/.test(bundledApp), 'Built app contains outdated placeholder contact info');

const robots = await readDist('robots.txt');
assert(robots.includes('Allow: /'), 'robots.txt must allow crawling');
assert(robots.includes('Sitemap: https://bravomechanicalny.com/sitemap.xml'), 'robots.txt must reference canonical sitemap');

const sitemap = await readDist('sitemap.xml');
for (const route of ['/', '/contact', '/services', '/about']) {
  const loc = `https://bravomechanicalny.com${route === '/' ? '/' : route}`;
  assert(sitemap.includes(loc), `sitemap.xml missing ${loc}`);
}
assert(!sitemap.includes('/admin/'), 'sitemap.xml must not include admin routes');
assert(!sitemap.includes('/auth'), 'sitemap.xml must not include auth routes');

const llms = await readDist('llms.txt');
assert(llms.includes('https://bravomechanicalny.com'), 'llms.txt missing canonical website');
assert(llms.includes('info@bravomechanicalny.com'), 'llms.txt missing canonical email');
assert(llms.includes('+1-914-361-9142'), 'llms.txt missing canonical phone');

for (const route of ['contact/index.html', 'services/index.html', 'about/index.html']) {
  const html = await readDist(route);
  assert(html.includes('<meta name="robots" content="index, follow'), `${route} should be indexable`);
}

console.log('Smoke checks passed for homepage, CTAs, robots.txt, sitemap.xml, llms.txt, and core routes.');
