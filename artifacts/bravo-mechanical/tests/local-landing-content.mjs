#!/usr/bin/env node
import assert from 'node:assert/strict';
import sourceDataset from '../src/content/localLandingPages.json' with { type: 'json' };
import {
  auditLocalLandingContent,
  hasUnsafeLocalClaim,
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

assert.deepEqual(audit(() => {}), [], 'the reviewed local dataset must pass the deterministic audit');

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
  const shared = Array.from({ length: 69 }, (_, index) => `sharedtoken${index}`).join(' ');
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

const malformedErrors = audit((dataset) => {
  dataset.cities.yonkers.localContext = null;
  dataset.cities.yonkers.municipalResources = [{ label: '', url: '' }];
  dataset.serviceCities['hvac-installation/yonkers'].serviceScope = [''];
});
expectError(malformedErrors, '/service-areas/yonkers: localContext must be a non-empty array');
expectError(malformedErrors, '/service-areas/yonkers: municipalResources[0].label must be a non-empty string');
expectError(malformedErrors, '/services/hvac-installation/yonkers: serviceScope[0] must be a non-empty string');

console.log('Local landing-content mutation checks passed.');
