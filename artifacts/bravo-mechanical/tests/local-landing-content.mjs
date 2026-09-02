#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sourceDataset from '../src/content/localLandingPages.json' with { type: 'json' };
import {
  auditLocalLandingContent,
  hasUnsafeLocalClaim,
  initializeLocalLandingContentAudit,
} from '../scripts/local-landing-content.mjs';

await initializeLocalLandingContentAudit();

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

const baselineErrors = audit(() => {});
expectError(
  baselineErrors,
  '/service-areas/white-plains: title exceeds 65 characters',
);
assert.equal(
  baselineErrors.filter((error) => error.endsWith('title exceeds 65 characters')).length,
  15,
  'every current over-limit raw city title must be reported without a source-derived exemption',
);

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
  dataset.serviceCities['hvac-repair/yonkers'].parentServicePath = '/services/ac-installation-westchester-county-ny';
}), 'parentServicePath must match the reviewed hvac-repair parent route');

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

rmSync(tempDirectory, { recursive: true, force: true });

console.log('Local landing-content mutation checks passed.');
