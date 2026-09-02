#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const datasetPath = path.join(root, 'src/content/localLandingPages.json');
const blogDirectory = path.join(root, 'src/content/blog');

const CITY_SLUGS = new Set([
  'yonkers', 'white-plains', 'new-rochelle', 'mount-vernon', 'scarsdale', 'rye',
  'harrison', 'mamaroneck', 'larchmont', 'bronxville', 'tuckahoe', 'eastchester',
  'tarrytown', 'sleepy-hollow', 'ossining', 'peekskill', 'mount-kisco', 'chappaqua',
  'pleasantville', 'pound-ridge', 'bedford', 'katonah', 'armonk', 'hastings-on-hudson',
  'dobbs-ferry', 'irvington', 'briarcliff-manor', 'croton-on-hudson', 'yorktown',
  'somers', 'ardsley', 'hartsdale', 'pelham', 'port-chester',
]);
const SERVICE_SLUGS = new Set([
  'hvac-installation', 'hvac-repair', 'preventive-maintenance', 'indoor-air-quality',
]);
const SERVICE_CITY_CITY_SLUGS = new Set([
  'yonkers', 'white-plains', 'new-rochelle', 'mount-vernon', 'scarsdale',
]);
const PARENT_SERVICE_PATHS = new Map([
  ['hvac-installation', '/services/ac-installation-westchester-county-ny'],
  ['hvac-repair', '/services/emergency-hvac-repair-westchester-county-ny'],
  ['preventive-maintenance', '/services/hvac-maintenance-westchester-county-ny'],
  ['indoor-air-quality', '/services/indoor-air-quality-westchester-county-ny'],
]);
const OFFICIAL_SOURCE_HOSTS = new Set([
  'bedfordny.gov', 'dos.ny.gov', 'greenburghny.com', 'mynewcastleny.gov', 'ny.gov',
  'nyserda.ny.gov', 'tax.ny.gov', 'www.bedfordny.gov', 'www.cityofwhiteplains.com',
  'www.cpsc.gov', 'www.energystar.gov', 'www.epa.gov', 'www.greenburghny.com',
  'www.mountvernonny.gov', 'www.mynewcastleny.gov', 'www.newrochelleny.gov',
  'www.northcastleny.com', 'www.ny.gov', 'www.nyserda.ny.gov', 'www.scarsdale.gov',
  'www.tax.ny.gov', 'www.yonkersny.gov',
]);
const UNSAFE_LOCAL_CLAIMS = [
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
const CITY_ARRAY_FIELDS = [
  'zips', 'neighborhoods', 'localContext', 'commonConcerns', 'safeChecks',
  'professionalBoundaries', 'municipalResources', 'relatedGuideSlugs',
  'nearbyCitySlugs', 'faqItems', 'sourceNotes',
];
const SERVICE_CITY_ARRAY_FIELDS = [
  'localConsiderations', 'commonConcerns', 'serviceScope', 'safeChecks',
  'professionalBoundaries', 'relatedGuideSlugs', 'relatedServiceSlugs', 'faqItems',
  'sourceNotes',
];
const CITY_TEXT_FIELDS = ['answerFirst', 'localContext', 'commonConcerns', 'safeChecks', 'professionalBoundaries', 'faqItems'];
const SERVICE_CITY_TEXT_FIELDS = ['answerFirst', 'localConsiderations', 'commonConcerns', 'serviceScope', 'safeChecks', 'professionalBoundaries', 'faqItems'];
const actualGuideSlugs = new Set(
  readdirSync(blogDirectory)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.slice(0, -3)),
);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function normalizeUniqueCopy(value, locationNames) {
  return value.toLowerCase()
    .replace(new RegExp(locationNames.map(escapeRegex).join('|'), 'gi'), ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function jaccard(left, right) {
  const a = new Set(left);
  const b = new Set(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
}

function routeForCity(slug) {
  return `/service-areas/${slug}`;
}

function routeForServiceCity(key) {
  return `/services/${key}`;
}

function addError(errors, route, message) {
  errors.push(`${route}: ${message}`);
}

function validateString(value, field, route, errors) {
  if (typeof value !== 'string' || value.trim() === '') {
    addError(errors, route, `${field} must be a non-empty string`);
  }
}

function validateUrl(url, route, field, errors) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') addError(errors, route, `${field} must use HTTPS: ${url}`);
    else if (!OFFICIAL_SOURCE_HOSTS.has(parsed.hostname)) addError(errors, route, `${field} must use an approved official source host: ${url}`);
  } catch {
    addError(errors, route, `${field} must be a valid HTTPS URL: ${url}`);
  }
}

function validateSourceEntries(entries, route, field, errors) {
  if (!Array.isArray(entries) || entries.length === 0) return;
  entries.forEach((source, index) => {
    if (!source || typeof source !== 'object') {
      addError(errors, route, `${field}[${index}] must be an object`);
      return;
    }
    validateString(source.label, `${field}[${index}].label`, route, errors);
    validateString(source.url, `${field}[${index}].url`, route, errors);
    if (field === 'sourceNotes') validateString(source.supports, `${field}[${index}].supports`, route, errors);
    if (typeof source.url === 'string') validateUrl(source.url, route, `${field}[${index}].url`, errors);
  });
}

function validateFaqs(items, route, errors) {
  if (!Array.isArray(items) || items.length === 0) return;
  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      addError(errors, route, `faqItems[${index}] must be an object`);
      return;
    }
    validateString(item.q, `faqItems[${index}].q`, route, errors);
    validateString(item.a, `faqItems[${index}].a`, route, errors);
  });
}

function validateRecordArrays(record, fields, route, errors) {
  for (const field of fields) {
    if (!Array.isArray(record[field])) {
      addError(errors, route, `${field} must be an array`);
    }
  }
}

function validateMetadata(record, titleField, route, errors, enforceTitleLimit = true) {
  validateString(record[titleField], titleField, route, errors);
  validateString(record.metaDescription, 'metaDescription', route, errors);
  if (enforceTitleLimit && typeof record[titleField] === 'string' && record[titleField].length > 65) {
    addError(errors, route, `${titleField} exceeds 65 characters`);
  }
  if (typeof record.metaDescription === 'string' && record.metaDescription.length > 160) {
    addError(errors, route, 'metaDescription exceeds 160 characters');
  }
}

function validateReviewedAt(value, route, errors) {
  if (typeof value !== 'string' || !/^2026-09-\d{2}$/.test(value) || Number(value.slice(-2)) < 1 || Number(value.slice(-2)) > 30) {
    addError(errors, route, 'reviewedAt must be a reviewed 2026-09 date');
  }
}

export function validateDatasetShape(dataset, errors) {
  if (!dataset || typeof dataset !== 'object') {
    errors.push('Dataset must be an object with cities and serviceCities records');
    return;
  }
  const cities = dataset.cities;
  const serviceCities = dataset.serviceCities;
  if (!cities || typeof cities !== 'object' || Array.isArray(cities)) {
    errors.push('cities must be an object');
    return;
  }
  if (!serviceCities || typeof serviceCities !== 'object' || Array.isArray(serviceCities)) {
    errors.push('serviceCities must be an object');
    return;
  }

  const cityKeys = Object.keys(cities);
  if (cityKeys.length !== CITY_SLUGS.size) errors.push(`cities must contain exactly ${CITY_SLUGS.size} records; found ${cityKeys.length}`);
  for (const slug of CITY_SLUGS) if (!Object.hasOwn(cities, slug)) errors.push(`cities is missing required city key: ${slug}`);
  for (const slug of cityKeys) if (!CITY_SLUGS.has(slug)) errors.push(`cities contains unknown city key: ${slug}`);

  for (const [slug, city] of Object.entries(cities)) {
    const route = routeForCity(slug);
    if (!city || typeof city !== 'object') {
      addError(errors, route, 'record must be an object');
      continue;
    }
    validateString(city.slug, 'slug', route, errors);
    if (city.slug !== slug) addError(errors, route, `slug must equal city key ${slug}`);
    for (const field of ['name', 'region', 'answerFirst']) validateString(city[field], field, route, errors);
    validateRecordArrays(city, CITY_ARRAY_FIELDS, route, errors);
    validateMetadata(city, 'title', route, errors, false);
    validateReviewedAt(city.reviewedAt, route, errors);
    validateFaqs(city.faqItems, route, errors);
    validateSourceEntries(city.municipalResources, route, 'municipalResources', errors);
    validateSourceEntries(city.sourceNotes, route, 'sourceNotes', errors);
  }

  const expectedServiceCityKeys = new Set(
    [...SERVICE_SLUGS].flatMap((service) => [...SERVICE_CITY_CITY_SLUGS].map((city) => `${service}/${city}`)),
  );
  const serviceCityKeys = Object.keys(serviceCities);
  if (serviceCityKeys.length !== expectedServiceCityKeys.size) errors.push(`serviceCities must contain exactly ${expectedServiceCityKeys.size} records; found ${serviceCityKeys.length}`);
  for (const key of expectedServiceCityKeys) if (!Object.hasOwn(serviceCities, key)) errors.push(`serviceCities is missing required service-city key: ${key}`);
  for (const key of serviceCityKeys) if (!expectedServiceCityKeys.has(key)) errors.push(`serviceCities contains unknown service-city key: ${key}`);

  for (const [key, page] of Object.entries(serviceCities)) {
    const route = routeForServiceCity(key);
    if (!page || typeof page !== 'object') {
      addError(errors, route, 'record must be an object');
      continue;
    }
    for (const field of ['serviceSlug', 'citySlug', 'serviceTitle', 'shortTitle', 'parentServicePath', 'h1', 'answerFirst']) validateString(page[field], field, route, errors);
    if (key !== `${page.serviceSlug}/${page.citySlug}`) addError(errors, route, `key must equal ${page.serviceSlug}/${page.citySlug}`);
    if (!CITY_SLUGS.has(page.citySlug)) addError(errors, route, `citySlug is not in the 34-city inventory: ${page.citySlug}`);
    if (!SERVICE_SLUGS.has(page.serviceSlug)) addError(errors, route, `serviceSlug is not in the reviewed service set: ${page.serviceSlug}`);
    validateRecordArrays(page, SERVICE_CITY_ARRAY_FIELDS, route, errors);
    validateMetadata(page, 'metaTitle', route, errors);
    validateReviewedAt(page.reviewedAt, route, errors);
    validateFaqs(page.faqItems, route, errors);
    validateSourceEntries(page.sourceNotes, route, 'sourceNotes', errors);
  }
}

function visibleText(record, fields) {
  if (!record || typeof record !== 'object') return [];
  return fields.flatMap((field) => {
    const value = record[field];
    if (typeof value === 'string') return [value];
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
      if (typeof item === 'string') return [item];
      if (item && typeof item === 'object') return [item.q, item.a].filter((text) => typeof text === 'string');
      return [];
    });
  });
}

export function hasUnsafeLocalClaim(value, pattern) {
  const match = pattern.exec(value);
  if (!match) return false;
  const priorText = value.slice(Math.max(0, match.index - 48), match.index);
  const isQualified = /(?:\bnot\s+|\bno\s+|\bwithout\s+|\bavoids?\s+|\bavoiding\s+|\bimply(?:ing)?\s+)$/i.test(priorText);
  const isHealthClaim = pattern.source === UNSAFE_LOCAL_CLAIMS.at(-1).source;
  const before = value[match.index - 1] ?? '';
  const after = value[match.index + match[0].length] ?? '';
  const hasWordBoundaries = !/[a-z]/i.test(before) && !/[a-z]/i.test(after);
  return !isQualified && (!isHealthClaim || hasWordBoundaries);
}

export function validateClaims(dataset, errors) {
  if (!dataset?.cities || !dataset?.serviceCities) return;
  const records = [
    ...Object.entries(dataset.cities).map(([slug, record]) => [routeForCity(slug), record, CITY_TEXT_FIELDS]),
    ...Object.entries(dataset.serviceCities).map(([key, record]) => [routeForServiceCity(key), record, SERVICE_CITY_TEXT_FIELDS]),
  ];
  for (const [route, record, fields] of records) {
    for (const text of visibleText(record, fields)) {
      for (const pattern of UNSAFE_LOCAL_CLAIMS) {
        if (hasUnsafeLocalClaim(text, pattern)) {
          addError(errors, route, `unsafe claim ${pattern} in visible copy: ${text}`);
        }
      }
    }
  }
}

export function validateRelationships(dataset, errors) {
  if (!dataset?.cities || !dataset?.serviceCities) return;
  for (const [slug, city] of Object.entries(dataset.cities)) {
    if (!city || typeof city !== 'object') continue;
    const route = routeForCity(slug);
    for (const nearbySlug of Array.isArray(city.nearbyCitySlugs) ? city.nearbyCitySlugs : []) {
      if (!CITY_SLUGS.has(nearbySlug)) addError(errors, route, `nearbyCitySlugs references unknown city: ${nearbySlug}`);
      if (nearbySlug === slug) addError(errors, route, 'nearbyCitySlugs cannot include its own city');
    }
    for (const guideSlug of Array.isArray(city.relatedGuideSlugs) ? city.relatedGuideSlugs : []) {
      if (!actualGuideSlugs.has(guideSlug)) addError(errors, route, `relatedGuideSlugs references missing blog guide: ${guideSlug}`);
    }
  }
  for (const [key, page] of Object.entries(dataset.serviceCities)) {
    if (!page || typeof page !== 'object') continue;
    const route = routeForServiceCity(key);
    const expectedParentPath = PARENT_SERVICE_PATHS.get(page.serviceSlug);
    if (!expectedParentPath || page.parentServicePath !== expectedParentPath) {
      addError(errors, route, `parentServicePath must match the canonical ${page.serviceSlug} route: ${expectedParentPath ?? 'unknown service'}`);
    }
    for (const relatedSlug of Array.isArray(page.relatedServiceSlugs) ? page.relatedServiceSlugs : []) {
      if (!SERVICE_SLUGS.has(relatedSlug)) addError(errors, route, `relatedServiceSlugs references unreviewed service: ${relatedSlug}`);
      if (relatedSlug === page.serviceSlug) addError(errors, route, 'relatedServiceSlugs cannot include its own service');
    }
    for (const guideSlug of Array.isArray(page.relatedGuideSlugs) ? page.relatedGuideSlugs : []) {
      if (!actualGuideSlugs.has(guideSlug)) addError(errors, route, `relatedGuideSlugs references missing blog guide: ${guideSlug}`);
    }
  }
}

function normalizedRecordCopy(record, fields, labels) {
  return normalizeUniqueCopy(visibleText(record, fields).join(' '), labels);
}

export function validateSimilarity(dataset, errors) {
  if (!dataset?.cities || !dataset?.serviceCities) return;
  const cities = Object.entries(dataset.cities)
    .filter(([, record]) => record && typeof record === 'object')
    .map(([slug, record]) => ({ slug, record }));
  for (let leftIndex = 0; leftIndex < cities.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < cities.length; rightIndex += 1) {
      const left = cities[leftIndex];
      const right = cities[rightIndex];
      const labels = [left.record.name, right.record.name, left.slug, right.slug, 'hvac services', 'westchester county'];
      const score = jaccard(
        normalizedRecordCopy(left.record, CITY_TEXT_FIELDS, labels),
        normalizedRecordCopy(right.record, CITY_TEXT_FIELDS, labels),
      );
      if (score >= 0.72) {
        errors.push(`${routeForCity(left.slug)} and ${routeForCity(right.slug)}: normalized unique-copy similarity ${score.toFixed(2)} is at or above 0.72`);
      }
    }
  }

  const pages = Object.entries(dataset.serviceCities)
    .filter(([, record]) => record && typeof record === 'object')
    .map(([key, record]) => ({ key, record }));
  for (let leftIndex = 0; leftIndex < pages.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < pages.length; rightIndex += 1) {
      const left = pages[leftIndex];
      const right = pages[rightIndex];
      if (left.record.serviceSlug !== right.record.serviceSlug) continue;
      const labels = [left.record.citySlug, right.record.citySlug, left.record.serviceTitle, right.record.serviceTitle, left.record.shortTitle, right.record.shortTitle];
      const leftAnswer = normalizeUniqueCopy(left.record.answerFirst || '', labels).join(' ');
      const rightAnswer = normalizeUniqueCopy(right.record.answerFirst || '', labels).join(' ');
      if (leftAnswer === rightAnswer) {
        errors.push(`${routeForServiceCity(left.key)} and ${routeForServiceCity(right.key)}: answerFirst is identical after city-name normalization`);
      }
      const score = jaccard(
        normalizedRecordCopy(left.record, SERVICE_CITY_TEXT_FIELDS, labels),
        normalizedRecordCopy(right.record, SERVICE_CITY_TEXT_FIELDS, labels),
      );
      if (score >= 0.72) {
        errors.push(`${routeForServiceCity(left.key)} and ${routeForServiceCity(right.key)}: normalized unique-copy similarity ${score.toFixed(2)} is at or above 0.72`);
      }
    }
  }
}

export function auditLocalLandingContent(dataset) {
  const errors = [];
  const warnings = [];
  validateDatasetShape(dataset, errors);
  validateClaims(dataset, errors);
  validateRelationships(dataset, errors);
  validateSimilarity(dataset, errors);
  return { errors, warnings };
}

function sourceEntries(dataset) {
  return [
    ...Object.entries(dataset.cities ?? {}).flatMap(([slug, city]) => {
      if (!city || typeof city !== 'object') return [];
      return [
      ...(city.municipalResources ?? []).map((source) => ({ route: routeForCity(slug), source })),
      ...(city.sourceNotes ?? []).map((source) => ({ route: routeForCity(slug), source })),
      ];
    }),
    ...Object.entries(dataset.serviceCities ?? {}).flatMap(([key, page]) => {
      if (!page || typeof page !== 'object') return [];
      return (page.sourceNotes ?? []).map((source) => ({ route: routeForServiceCity(key), source }));
    }),
  ];
}

export async function auditLiveOfficialSources(dataset) {
  const errors = [];
  const routesByUrl = new Map();
  for (const { route, source } of sourceEntries(dataset)) {
    if (!source?.url) continue;
    const routes = routesByUrl.get(source.url) ?? new Set();
    routes.add(route);
    routesByUrl.set(source.url, routes);
  }
  await Promise.all([...routesByUrl.entries()].map(async ([url, routes]) => {
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20_000) });
      if (!response.ok) {
        for (const route of routes) errors.push(`${route}: source ${url} returned HTTP ${response.status} after redirect to ${response.url}`);
      }
    } catch (error) {
      for (const route of routes) errors.push(`${route}: source ${url} could not be checked live: ${error.message}`);
    }
  }));
  return { errors, checked: routesByUrl.size };
}

async function main() {
  const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'));
  const { errors, warnings } = auditLocalLandingContent(dataset);
  const liveMode = process.argv.includes('--live-sources');
  let liveResult = { errors: [], checked: 0 };
  if (liveMode) liveResult = await auditLiveOfficialSources(dataset);
  const allErrors = [...errors, ...liveResult.errors];
  for (const error of allErrors) console.error(`ERROR: ${error}`);
  for (const warning of warnings) console.warn(`WARNING: ${warning}`);
  if (allErrors.length > 0) {
    console.error(`${Object.keys(dataset.cities).length + Object.keys(dataset.serviceCities).length} local landing-page records audited; ${allErrors.length} errors`);
    process.exitCode = 1;
    return;
  }
  const liveSummary = liveMode ? `; ${liveResult.checked} official sources checked live` : '';
  console.log(`${Object.keys(dataset.cities).length + Object.keys(dataset.serviceCities).length} local landing-page records audited; 0 errors${liveSummary}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
