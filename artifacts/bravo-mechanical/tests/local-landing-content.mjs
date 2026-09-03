#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sourceDataset from '../src/content/localLandingPages.json' with { type: 'json' };
import {
  APPROVED_SERVICE_AREAS,
  approvedServiceAreaPlaces,
} from '../src/lib/localPageModel.ts';
import {
  auditLocalLandingContent,
  auditLiveOfficialSources,
  fetchOfficialSource,
  hasUnsafeLocalClaim,
  pinnedHttpsRequest,
  validateClaims,
} from '../scripts/local-landing-content.mjs';

function audit(mutator) {
  const dataset = structuredClone(sourceDataset);
  mutator(dataset);
  return auditLocalLandingContent(dataset).errors;
}

function expectError(errors, expected) {
  assert(
    errors.some((error) => error.includes(expected)),
    `Expected an audit error containing: ${expected}\nActual errors:\n${errors.join('\n')}`,
  );
}

const sourceIndexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sourceSchemas = [...sourceIndexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1]));
const sourceBusiness = sourceSchemas.find((schema) => schema['@type'] === 'HVACBusiness');
assert.deepEqual(
  sourceBusiness?.areaServed,
  approvedServiceAreaPlaces(),
  'the base crawler schema must mirror the authoritative 34-community inventory',
);
const sourceNoscript = sourceIndexHtml.match(/<noscript>\s*<h2>[\s\S]*?<\/noscript>/)?.[0] ?? '';
assert.match(sourceNoscript, new RegExp(`serving ${APPROVED_SERVICE_AREAS.length} listed communities`, 'i'));
for (const { name } of APPROVED_SERVICE_AREAS) {
  assert.match(sourceNoscript, new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`));
}
assert.doesNotMatch(sourceNoscript, /serving (?:all of )?Westchester County|across Westchester County/i);

const sourceLlms = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');
assert.match(sourceLlms, new RegExp(`${APPROVED_SERVICE_AREAS.length} listed communities in Westchester County`, 'i'));
assert.match(sourceLlms, /\/service-areas/);
assert.doesNotMatch(
  sourceLlms,
  /serving (?:residential and light-commercial customers )?(?:all of |across )?Westchester County|^Westchester County, NY$/im,
  'AI discovery copy must not imply coverage of every Westchester locality',
);

const standaloneDataset = structuredClone(sourceDataset);
standaloneDataset.serviceCities['hvac-repair/yonkers'].parentServicePath = '/services/ac-installation-westchester-county-ny';
standaloneDataset.cities.yonkers.nearbyCitySlugs[0] = 'missing-canonical-city';
const standaloneErrors = auditLocalLandingContent(standaloneDataset).errors;
expectError(standaloneErrors, '/services/hvac-repair/yonkers: parentServicePath must match the independent hvac-repair parent /services');
expectError(standaloneErrors, '/service-areas/yonkers: nearbyCitySlugs references missing generated city route: missing-canonical-city');

const baselineErrors = audit(() => {});
assert.equal(
  baselineErrors.length,
  0,
  `the reviewed local landing dataset must pass the content audit:\n${baselineErrors.join('\n')}`,
);

expectError(audit((dataset) => {
  delete dataset.cities.hartsdale;
}), 'cities is missing approved service-area key: hartsdale');

expectError(audit((dataset) => {
  dataset.cities.hartsdale.name = 'Hartsdale Village';
}), 'approved service-area hartsdale must use name Hartsdale');

const sharedClaimErrors = [];
validateClaims(sourceDataset, sharedClaimErrors, [
  'Air purifiers create healthier indoor environments.',
]);
expectError(sharedClaimErrors, 'unsafe claim /healthier indoor environments?/i in shared local-page copy');

assert.equal(
  hasUnsafeLocalClaim('This is not guaranteed. Service is guaranteed.', /guaranteed/i),
  true,
  'an affirmative later claim must not be hidden by an earlier qualified occurrence',
);
assert.equal(
  hasUnsafeLocalClaim('We do not offer guaranteed repairs.', /guaranteed/i),
  false,
  'a qualified claim must remain allowed',
);
assert.equal(
  hasUnsafeLocalClaim('Continued operation can obscure the cause.', /cures?|prevents? (?:allergies|asthma|illness)/i),
  false,
  'health-claim patterns must match whole words instead of substrings such as obscure',
);

const visibleClaimErrors = audit((dataset) => {
  dataset.serviceCities['hvac-repair/yonkers'].h1 = 'Guaranteed HVAC Repair in Yonkers';
  dataset.serviceCities['hvac-repair/yonkers'].serviceTitle = 'Guaranteed Repair';
  dataset.serviceCities['hvac-repair/yonkers'].shortTitle = 'Guaranteed';
  dataset.cities.yonkers.municipalResources[0].label = 'Guaranteed permit information';
});
assert(
  visibleClaimErrors.filter((error) => error.includes('unsafe claim /guaranteed/i')).length >= 4,
  `Every visible heading and resource label must be scanned:\n${visibleClaimErrors.join('\n')}`,
);

expectError(audit((dataset) => {
  const left = dataset.serviceCities['hvac-installation/white-plains'];
  const right = dataset.serviceCities['hvac-installation/new-rochelle'];
  left.answerFirst = 'A shared review starts in White Plains.';
  right.answerFirst = 'A shared review starts in New Rochelle.';
}), 'answerFirst is identical after city-name normalization');

expectError(audit((dataset) => {
  const left = dataset.cities.yonkers;
  const right = dataset.cities['white-plains'];
  const shared = Array.from({ length: 72 }, (_, index) => `sharedtoken${index}`).join(' ');
  for (const city of [left, right]) {
    city.region = 'commonregion';
    city.title = 'commonmetadata';
    city.metaDescription = 'commondescription';
    city.localContext = [];
    city.commonConcerns = [];
    city.safeChecks = [];
    city.professionalBoundaries = [];
    city.municipalResources = [];
    city.faqItems = [];
    city.sourceNotes = [];
  }
  left.answerFirst = `${shared} ${Array.from({ length: 14 }, (_, index) => `lefttoken${index}`).join(' ')}`;
  right.answerFirst = `${shared} ${Array.from({ length: 14 }, (_, index) => `righttoken${index}`).join(' ')}`;
}), 'similarity 0.72 is at or above 0.72');

expectError(audit((dataset) => {
  dataset.serviceCities['hvac-installation/yonkers'].parentServicePath = '/services/missing-canonical-target';
}), 'parentServicePath must reference a generated canonical service route');

expectError(audit((dataset) => {
  for (const page of Object.values(dataset.serviceCities)) {
    if (page.serviceSlug === 'hvac-repair') page.parentServicePath = '/services/missing-family-parent';
  }
}), 'parentServicePath must reference a generated canonical service route');

expectError(audit((dataset) => {
  dataset.serviceCities['hvac-repair/yonkers'].parentServicePath = '/services/ac-installation-westchester-county-ny';
}), 'parentServicePath must match the independent hvac-repair parent /services');

expectError(audit((dataset) => {
  dataset.cities.yonkers.title = 'Yonkers Heating and Cooling | Bravo Mechanical';
}), 'title must match generated canonical route metadata');

expectError(audit((dataset) => {
  dataset.cities.yonkers.title = 'x'.repeat(66);
}), 'title exceeds 65 characters');
expectError(audit((dataset) => {
  dataset.serviceCities['hvac-installation/yonkers'].metaDescription = 'x'.repeat(161);
}), 'metaDescription exceeds 160 characters');

const malformedErrors = audit((dataset) => {
  dataset.cities.yonkers.localContext = null;
  dataset.cities.yonkers.municipalResources = [{ label: '', url: '' }];
  dataset.serviceCities['hvac-installation/yonkers'].serviceScope = [''];
});
expectError(malformedErrors, '/service-areas/yonkers: localContext must be a non-empty array');
expectError(malformedErrors, '/service-areas/yonkers: municipalResources[0].label must be a non-empty string');
expectError(malformedErrors, '/services/hvac-installation/yonkers: serviceScope[0] must be a non-empty string');

const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'bravo-local-content-'));
const malformedPath = path.join(tempDirectory, 'malformed.json');
writeFileSync(malformedPath, JSON.stringify({ cities: { yonkers: null }, serviceCities: {} }));
const cliResult = spawnSync('node', ['scripts/local-landing-content.mjs'], {
  cwd: path.resolve(import.meta.dirname, '..'),
  encoding: 'utf8',
  env: { ...process.env, LOCAL_LANDING_CONTENT_PATH: malformedPath },
});
assert.equal(cliResult.status, 1, 'malformed CLI input must fail');
assert.match(cliResult.stderr, /\/service-areas\/yonkers: record must be an object/);
assert.doesNotMatch(cliResult.stderr, /(?:TypeError|SyntaxError|at file:)/);

const invalidJsonPath = path.join(tempDirectory, 'invalid.json');
writeFileSync(invalidJsonPath, '{"cities":');
const invalidJsonResult = spawnSync('node', ['scripts/local-landing-content.mjs'], {
  cwd: path.resolve(import.meta.dirname, '..'),
  encoding: 'utf8',
  env: { ...process.env, LOCAL_LANDING_CONTENT_PATH: invalidJsonPath },
});
assert.equal(invalidJsonResult.status, 1, 'non-JSON CLI input must fail');
assert.match(invalidJsonResult.stderr, /ERROR: local landing-content source is not valid JSON/);
assert.doesNotMatch(invalidJsonResult.stderr, /(?:TypeError|SyntaxError|at file:)/);

const observedLiveRequests = [];
const publicResolver = async () => [{ address: '93.184.216.34', family: 4 }];

let pinnedRequestOptions;
await pinnedHttpsRequest('https://www.epa.gov/verified', {
  headers: { Accept: 'text/html' },
  signal: undefined,
  resolvedAddress: { address: '93.184.216.34', family: 4 },
}, (_url, options, onResponse) => {
  pinnedRequestOptions = options;
  return {
    on() { return this; },
    end() {
      onResponse({ statusCode: 200, headers: {}, destroy() {} });
    },
  };
});
assert.equal(
  pinnedRequestOptions.agent,
  false,
  'the pinned verifier must bypass process-wide connection pools and proxy agents',
);

const liveFetch = async (url, options) => {
  observedLiveRequests.push({ url, options });
  return {
    ok: !url.endsWith('/unavailable'),
    status: url.endsWith('/unavailable') ? 503 : 200,
    url,
    headers: { get: () => null },
    body: { cancel: async () => {} },
  };
};
const liveResult = await auditLiveOfficialSources({
  cities: {
    verified: { municipalResources: [{ url: 'https://www.epa.gov/verified' }], sourceNotes: [] },
    unavailable: { municipalResources: [{ url: 'https://www.epa.gov/unavailable' }], sourceNotes: [] },
  },
  serviceCities: {},
}, { requestImpl: liveFetch, resolveHostname: publicResolver });
assert.equal(liveResult.checked, 2, 'each unique official URL must be checked once');
assert.equal(observedLiveRequests.length, 2, 'the audit must issue a request for every unique official URL');
for (const { options } of observedLiveRequests) {
  assert.equal(options.redirect, 'manual', 'live source verification must inspect redirects itself');
  assert.ok(options.headers, 'live source verification must send transparent request headers');
  assert.equal(options.headers['User-Agent'], 'BravoMechanicalLinkVerifier/1.0 (+https://www.bravomechanicalny.com/contact)', 'live source verification must identify the checker and its contact page');
  assert.doesNotMatch(options.headers['User-Agent'], /Mozilla|Chrome|Safari/i, 'the verifier must not impersonate a browser');
  assert.equal(options.headers.Accept, 'text/html,application/pdf;q=0.9,*/*;q=0.8', 'live source verification must state ordinary accepted content types');
  assert.deepEqual(options.resolvedAddress, { address: '93.184.216.34', family: 4 }, 'the request transport must receive the validated public address');
}
assert.equal(liveResult.errors.length, 1, 'a non-2xx source response must remain an audit error');
assert.match(liveResult.errors[0], /https:\/\/www\.epa\.gov\/unavailable returned HTTP 503/);

const redirectRequests = [];
const redirected = await fetchOfficialSource('https://www.epa.gov/start', {
  resolveHostname: publicResolver,
  requestImpl: async (url, options) => {
    redirectRequests.push({ url, options });
    if (url.endsWith('/start')) return {
      ok: false,
      status: 302,
      url,
      headers: { get: (name) => name.toLowerCase() === 'location' ? '/final' : null },
      body: { cancel: async () => {} },
    };
    return { ok: true, status: 200, url, headers: { get: () => null }, body: { cancel: async () => {} } };
  },
});
assert.equal(redirected.url, 'https://www.epa.gov/final');
assert.deepEqual(redirectRequests.map(({ url }) => url), [
  'https://www.epa.gov/start',
  'https://www.epa.gov/final',
]);
assert(redirectRequests.every(({ options }) => options.redirect === 'manual'));

await assert.rejects(
  fetchOfficialSource('https://www.epa.gov/start', {
    resolveHostname: publicResolver,
    requestImpl: async (url) => ({
      ok: false,
      status: 302,
      url,
      headers: { get: () => 'https://attacker.example/collect' },
      body: { cancel: async () => {} },
    }),
  }),
  /approved official source host/,
  'a redirect to an unapproved host must fail before it is requested',
);

await assert.rejects(
  fetchOfficialSource('https://www.epa.gov/start', {
    resolveHostname: publicResolver,
    requestImpl: async (url) => ({
      ok: false,
      status: 302,
      url,
      headers: { get: () => 'http://www.epa.gov/insecure' },
      body: { cancel: async () => {} },
    }),
  }),
  /must use HTTPS/,
  'a redirect downgrade to HTTP must fail',
);

await assert.rejects(
  fetchOfficialSource('https://www.epa.gov/start', {
    resolveHostname: async () => [{ address: '127.0.0.1', family: 4 }],
    requestImpl: async () => { throw new Error('private destinations must not be requested'); },
  }),
  /non-public address/,
  'DNS resolving to a private address must fail before fetch',
);

let crossHostFetches = 0;
await assert.rejects(
  fetchOfficialSource('https://www.epa.gov/start', {
    resolveHostname: async (hostname) => [{
      address: hostname === 'www.epa.gov' ? '93.184.216.34' : '10.0.0.8',
      family: 4,
    }],
    requestImpl: async (url) => {
      crossHostFetches += 1;
      return {
        ok: false,
        status: 302,
        url,
        headers: { get: () => 'https://www.ny.gov/final' },
        body: { cancel: async () => {} },
      };
    },
  }),
  /non-public address: www\.ny\.gov/,
  'an approved redirect host that resolves privately must fail before the redirected request',
);
assert.equal(crossHostFetches, 1, 'private-address policy must be applied before every redirect hop');

await assert.rejects(
  fetchOfficialSource('https://www.epa.gov/start', {
    resolveHostname: async () => [{ address: '::ffff:127.0.0.1', family: 6 }],
    requestImpl: async () => { throw new Error('mapped private destinations must not be requested'); },
  }),
  /non-public address/,
  'IPv4-mapped private IPv6 addresses must be rejected',
);

let redirectCount = 0;
await assert.rejects(
  fetchOfficialSource('https://www.epa.gov/start', {
    maxRedirects: 2,
    resolveHostname: publicResolver,
    requestImpl: async (url) => ({
      ok: false,
      status: 302,
      url,
      headers: { get: () => `/hop-${++redirectCount}` },
      body: { cancel: async () => {} },
    }),
  }),
  /exceeded 2 redirects/,
  'redirect chains must stop at the configured bound',
);

rmSync(tempDirectory, { recursive: true, force: true });

console.log('Local landing-content mutation checks passed.');
