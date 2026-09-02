#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import { hasUnsafeLocalClaim } from '../scripts/local-landing-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist', 'public');
const canonicalOrigin = 'https://www.bravomechanicalny.com';
const deploymentConfig = JSON.parse(
  await readFile(path.join(root, 'vercel.json'), 'utf8'),
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const localContentAudit = spawnSync('node', ['scripts/local-landing-content.mjs'], {
  cwd: root,
  encoding: 'utf8',
});
assert(
  localContentAudit.status === 0,
  `Local landing content audit failed: ${localContentAudit.stderr || localContentAudit.stdout}`,
);

const unsafeLocalClaims = [
  /free (?:quote|estimate)/i,
  /manufacturer[- ]trained/i,
  /not subcontractors/i,
  /manual j.{0,30}every/i,
  /permits? (?:pulled|handled|coordinated)/i,
  /fixed pricing/i,
  /same[- ]day/i,
  /guaranteed/i,
  /prevents? breakdowns/i,
  /keeps? (?:your )?warranty valid/i,
  /cures?|prevents? (?:allergies|asthma|illness)/i,
];

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
assert(home.includes('send_page_view: false'), 'GA4 automatic page views must remain disabled');
assert(home.includes('window.location.search || window.location.hash'), 'GA4 loader must reject query- or hash-bearing entries');
assert(home.includes("page_referrer: ''"), 'GA4 loader must explicitly redact referrers');
assert(!home.includes('<script async src="https://www.googletagmanager.com/gtag/js'), 'GA4 must not load before the privacy gate runs');
assert(
  deploymentConfig.outputDirectory === 'dist/public',
  'Deployed Vercel config must publish dist/public',
);
const catchAllRewrites = deploymentConfig.rewrites.filter((rule) => rule.source === '/:path*');
assert(
  catchAllRewrites.length === 1
    && catchAllRewrites[0].destination === '/'
    && catchAllRewrites[0].has?.length === 1
    && catchAllRewrites[0].has[0].type === 'host'
    && catchAllRewrites[0].has[0].value === 'app.bravomechanicalny.com',
  'Deployed Vercel config must not rewrite every public route to the SPA entry point',
);
for (const privateRoute of ['/auth', '/admin/:path*', '/proposal/:path*']) {
  assert(
    deploymentConfig.rewrites.some(
      (rule) => rule.source === privateRoute && rule.destination === '/',
    ),
    `Deployed Vercel config is missing the ${privateRoute} private rewrite`,
  );
  assert(
    deploymentConfig.headers.some(
      (rule) => rule.source === privateRoute
        && rule.headers?.some(
          (header) => header.key === 'X-Robots-Tag' && header.value === 'noindex, nofollow',
        ),
    ),
    `Deployed Vercel config is missing noindex headers for ${privateRoute}`,
  );
}
assert(
  deploymentConfig.headers.some(
    (rule) => rule.source === '/(.*)'
      && rule.has?.some((condition) => condition.type === 'host' && condition.value === 'app.bravomechanicalny.com')
      && rule.headers?.some((header) => header.key === 'X-Robots-Tag' && header.value === 'noindex, nofollow'),
  ),
  'Deployed Vercel config must noindex every app.bravomechanicalny.com response',
);
for (const [source, destination] of Object.entries({
  '/emergency-hvac-westchester': '/services/emergency-hvac-repair-westchester-county-ny',
  '/services/gas-boilers': '/services/boiler-installation-westchester-county-ny',
  '/services/mini-splits': '/services/mini-split-installation-westchester-county-ny',
  '/services/heat-pumps': '/services/heat-pump-installation-westchester-county-ny',
  '/services/central-ac': '/services/ac-installation-westchester-county-ny',
  '/services/gas-furnaces': '/services/furnace-installation-westchester-county-ny',
  '/services/water-heaters': '/services/water-heater-installation-westchester-county-ny',
  '/blog/ac-not-cooling-westchester': '/blog/why-is-my-ac-not-cooling-westchester',
})) {
  assert(
    deploymentConfig.redirects.some((redirect) => redirect.source === source && redirect.destination === destination && redirect.permanent),
    `Deployed Vercel config is missing permanent redirect ${source} -> ${destination}`,
  );
}
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
assert(!/\(914\) 318-7368|9143187368/.test(bundledApp), 'Built app contains the outdated alternate phone number');
for (const [pattern, claim] of [
  [/free written quote|get a free estimate|get a free quote/i, 'unverified free-estimate offer'],
  [/priority scheduling|preferred repair pricing|no overtime premium|flat-rate plans|discounts on parts and repairs|reminder system.{0,20}we book it/i, 'unverified maintenance-plan benefit'],
  [/most HVAC breakdowns.{0,30}preventable|prevents breakdowns.{0,30}lowers bills.{0,30}extends equipment life/i, 'unverified maintenance outcome'],
  [/keeps? (?:your )?warranty valid|protects? your manufacturer warranty|protects? your claim/i, 'unverified warranty outcome'],
  [/we (?:coordinate|handle|pull) (?:every |the )?(?:mechanical )?permits?|pull every Westchester permit/i, 'unverified permit-handling promise'],
  [/we(?:'re| are) (?:NYS Clean Heat participating|A2L-certified)/i, 'unverified rebate credential'],
  [/factory-trained on Mitsubishi Diamond|keep common sizes in stock/i, 'unverified training or inventory claim'],
  [/licensed\s*(?:&|and)\s*insured|fully licensed and insured/i, 'unverified insurance claim'],
  [/financing for qualified homeowners is available|cash, check, Zelle, and major credit cards/i, 'unverified financing or payment-method claim'],
  [/same[- ]day repair|completed same day|same day or next morning/i, 'unverified same-day service claim'],
]) {
  assert(!pattern.test(bundledApp), `Built app contains ${claim}`);
}
const skipLinkFocus = findCssRule(cssRoot, '.skip-link:focus');
assert(hasDeclaration(skipLinkFocus, 'transform', 'translateY(0)'), 'Built CSS is missing the visible .skip-link:focus rule');
assert(hasDeclaration(skipLinkFocus, 'outline', '3px solid hsl(var(--ring))'), 'Built CSS is missing the skip-link focus outline');
assert(hasDeclaration(skipLinkFocus, 'outline-offset', '2px'), 'Built CSS is missing the skip-link focus outline');
const pageLoader = findCssRule(cssRoot, '.page-loader');
assert(hasDeclaration(pageLoader, 'min-height', '100vh'), 'Built CSS is missing the .page-loader viewport block');
assert(hasDeclaration(pageLoader, 'display', 'flex'), 'Built CSS is missing the .page-loader layout rule');
assert(hasDeclaration(pageLoader, 'align-items', 'center'), 'Built CSS is missing vertical loader centering');
assert(hasDeclaration(pageLoader, 'justify-content', 'center'), 'Built CSS is missing horizontal loader centering');
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
assert(
  sitemap.includes(`${canonicalOrigin}/blog/furnace-smells-like-burning-westchester`),
  'sitemap.xml missing the current weekly SEO article',
);
assert(!sitemap.includes('https://bravomechanicalny.com'), 'sitemap.xml must not use the redirecting non-www host');
const privateSitemapEntry = sitemap.match(
  /<loc>[^<]*\/(?:auth|admin|proposal)(?:\/[^<]*)?<\/loc>/,
)?.[0];
assert(!privateSitemapEntry, `sitemap.xml must not include private routes: ${privateSitemapEntry}`);
for (const redirectOnlyPath of deploymentConfig.redirects.map((redirect) => redirect.source).filter((source) => !source.includes(':'))) {
  assert(!sitemap.includes(`<loc>${canonicalOrigin}${redirectOnlyPath}</loc>`), `sitemap.xml contains redirect-only URL ${redirectOnlyPath}`);
}

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
  assert((html.match(/<h1(?:\s|>)/gi) || []).length === 1, `${relativePath} must contain exactly one crawler-visible H1`);
  const expectedPath = relativePath === 'index.html' ? '/' : `/${relativePath.replace(/\/index\.html$/, '')}`;
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  assert(canonical === `${canonicalOrigin}${expectedPath}`, `${relativePath} canonical must be self-referencing`);

  const jsonLd = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap((match) => {
      const parsed = JSON.parse(match[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    });
  assert(jsonLd.filter((item) => item['@type'] === 'FAQPage').length <= 1, `${relativePath} has duplicate FAQPage schema`);
  assert(jsonLd.filter((item) => item['@type'] === 'HVACBusiness').length <= 1, `${relativePath} has duplicate HVACBusiness schema`);
  assert((html.match(/"@type"\s*:\s*"HVACBusiness"/g) || []).length <= 1, `${relativePath} repeats the canonical HVACBusiness node`);
  assert(!/"aggregateRating"\s*:/.test(html), `${relativePath} contains self-serving LocalBusiness rating markup`);

  const isLocalRoute = /^service-areas\/[^/]+\/index\.html$/.test(relativePath)
    || /^services\/(?:hvac-installation|hvac-repair|preventive-maintenance|indoor-air-quality)\/[^/]+\/index\.html$/.test(relativePath);
  if (isLocalRoute) {
    for (const unsafeClaim of unsafeLocalClaims) {
      assert(!hasUnsafeLocalClaim(html, unsafeClaim), `${relativePath} contains unsafe local claim: ${unsafeClaim}`);
    }
  }
}

const yonkers = await readDist('service-areas/yonkers/index.html');
assert(yonkers.includes('Start with the system symptom and building conditions'), 'Yonkers prerender must include reviewed localContent guidance');
const whitePlains = await readDist('service-areas/white-plains/index.html');
assert(whitePlains.includes('should fit both the equipment and the space it serves'), 'White Plains prerender must include reviewed localContent guidance');
const acRepair = await readDist('services/ac-repair-westchester-county-ny/index.html');
assert(acRepair.includes('How do I request urgent AC repair in Westchester County?'), 'AC repair prerender must use the reviewed priority FAQ override');
assert(!/same[- ]day|all brands|medically sensitive/i.test(acRepair), 'AC repair prerender contains stale unsupported FAQ claims');
const warrantyGuide = await readDist('blog/hvac-warranty-guide-westchester/index.html');
assert(!warrantyGuide.includes('Written 2-year labor warranty'), 'Unvetted warranty claims must not be inserted into crawler-first raw HTML');
const furnaceOdorGuide = await readDist('blog/furnace-smells-like-burning-westchester/index.html');
assert(furnaceOdorGuide.includes('Start with the emergency signs'), 'Furnace odor guide must prerender its safety-first article body');
assert(furnaceOdorGuide.includes('1-800-752-6633'), 'Furnace odor guide must include the reviewed Con Edison emergency number');
assert(furnaceOdorGuide.includes('"@type":"BlogPosting"'), 'Furnace odor guide must include BlogPosting schema');

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
