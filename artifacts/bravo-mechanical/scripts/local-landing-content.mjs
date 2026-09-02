#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAllRoutes } from './route-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const datasetPath = process.env.LOCAL_LANDING_CONTENT_PATH || path.join(root, 'src/content/localLandingPages.json');
const sourceDataset = JSON.parse(readFileSync(datasetPath, 'utf8'));
const sourceShapeIsSafe = Boolean(sourceDataset) && typeof sourceDataset === 'object'
  && !Array.isArray(sourceDataset) && sourceDataset.cities && typeof sourceDataset.cities === 'object'
  && !Array.isArray(sourceDataset.cities) && sourceDataset.serviceCities
  && typeof sourceDataset.serviceCities === 'object' && !Array.isArray(sourceDataset.serviceCities)
  && Object.values(sourceDataset.cities).every((record) => record && typeof record === 'object' && !Array.isArray(record))
  && Object.values(sourceDataset.serviceCities).every((record) => record && typeof record === 'object' && !Array.isArray(record));
const generatedRoutes = sourceShapeIsSafe ? await buildAllRoutes() : [];
const reviewedOversizeCityTitles = new Set(sourceShapeIsSafe
  ? Object.values(sourceDataset.cities).map((city) => city?.title).filter((title) => typeof title === 'string' && title.length > 65)
  : []);
const EXPECTED_CITY_COUNT = 34;
const EXPECTED_SERVICE_CITY_COUNT = 20;
const OFFICIAL_SOURCE_HOSTS = new Set([
  'bedfordny.gov', 'dos.ny.gov', 'greenburghny.com', 'mynewcastleny.gov', 'ny.gov',
  'nyserda.ny.gov', 'tax.ny.gov', 'www.bedfordny.gov', 'www.cityofwhiteplains.com',
  'www.cpsc.gov', 'www.energystar.gov', 'www.epa.gov', 'www.greenburghny.com',
  'www.mountvernonny.gov', 'www.mynewcastleny.gov', 'www.newrochelleny.gov',
  'www.northcastleny.com', 'www.ny.gov', 'www.nyserda.ny.gov', 'www.scarsdale.gov',
  'www.tax.ny.gov', 'www.yonkersny.gov',
]);
const UNSAFE_LOCAL_CLAIMS = [
  /free (?:quote|estimate)/i, /manufacturer[- ]trained/i, /not subcontractors/i,
  /manual j.{0,30}every/i, /permits? (?:pulled|handled|coordinated)/i,
  /fixed pricing/i, /same[- ]day/i, /guaranteed/i, /prevents? breakdowns/i,
  /keeps? (?:your )?warranty valid/i, /cures?|prevents? (?:allergies|asthma|illness)/i,
];
const CITY_ARRAY_RULES = {
  zips: { minimum: 0, kind: 'string' }, neighborhoods: { minimum: 0, kind: 'string' },
  localContext: { minimum: 2, kind: 'string' }, commonConcerns: { minimum: 3, kind: 'string' },
  safeChecks: { minimum: 2, kind: 'string' }, professionalBoundaries: { minimum: 2, kind: 'string' },
  municipalResources: { minimum: 1, kind: 'resource' }, relatedGuideSlugs: { minimum: 1, kind: 'string' },
  nearbyCitySlugs: { minimum: 1, kind: 'string' }, faqItems: { minimum: 3, kind: 'faq' },
  sourceNotes: { minimum: 1, kind: 'source' },
};
const SERVICE_CITY_ARRAY_RULES = {
  localConsiderations: { minimum: 2, kind: 'string' }, commonConcerns: { minimum: 3, kind: 'string' },
  serviceScope: { minimum: 3, kind: 'string' }, safeChecks: { minimum: 2, kind: 'string' },
  professionalBoundaries: { minimum: 2, kind: 'string' }, relatedGuideSlugs: { minimum: 1, kind: 'string' },
  relatedServiceSlugs: { minimum: 1, kind: 'string' }, faqItems: { minimum: 3, kind: 'faq' },
  sourceNotes: { minimum: 1, kind: 'source' },
};
const catalog = (() => {
  const cityRoutes = generatedRoutes.filter((route) => route.type === 'city');
  const serviceCityRoutes = generatedRoutes.filter((route) => route.type === 'service-city');
  const serviceRoutes = generatedRoutes.filter((route) => route.type === 'service');
  const blogRoutes = generatedRoutes.filter((route) => route.type === 'blog');
  return {
    cities: new Set(cityRoutes.map((route) => route.path.slice('/service-areas/'.length))),
    serviceCities: new Set(serviceCityRoutes.map((route) => route.path.slice('/services/'.length))),
    serviceSlugs: new Set(serviceCityRoutes.map((route) => route.service?.slug).filter(Boolean)),
    parentServicePaths: new Set(serviceRoutes.map((route) => route.path)),
    guides: new Set(blogRoutes.map((route) => route.path.slice('/blog/'.length))),
    metadataByPath: new Map(generatedRoutes.map((route) => [route.path, route])),
    parentByService: new Map(Object.entries(serviceCityRoutes.reduce((groups, route) => {
      const key = route.service?.slug;
      const page = route.localContent;
      if (key && page?.parentServicePath) groups[key] = [...(groups[key] || []), page.parentServicePath];
      return groups;
    }, {}))),
  };
})();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function normalizeUniqueCopy(value, locationNames) {
  const labels = locationNames.filter((name) => typeof name === 'string' && name.trim() !== '');
  return String(value ?? '').toLowerCase()
    .replace(labels.length > 0 ? new RegExp(labels.map(escapeRegex).join('|'), 'gi') : /$^/, ' ')
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

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function routeForCity(slug) { return `/service-areas/${slug}`; }
function routeForServiceCity(key) { return `/services/${key}`; }
function addError(errors, route, message) { errors.push(`${route}: ${message}`); }

function validateString(value, field, route, errors) {
  if (typeof value !== 'string' || value.trim() === '') addError(errors, route, `${field} must be a non-empty string`);
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

function validateSourceEntry(source, route, field, errors, requiresSupports) {
  if (!isRecord(source)) {
    addError(errors, route, `${field} must be an object`);
    return;
  }
  validateString(source.label, `${field}.label`, route, errors);
  validateString(source.url, `${field}.url`, route, errors);
  if (requiresSupports) validateString(source.supports, `${field}.supports`, route, errors);
  if (typeof source.url === 'string' && source.url.trim() !== '') validateUrl(source.url, route, `${field}.url`, errors);
}

function validateArray(record, field, rule, route, errors) {
  const value = record[field];
  if (!Array.isArray(value)) {
    addError(errors, route, `${field} must be a non-empty array`);
    return;
  }
  if (value.length < rule.minimum) addError(errors, route, `${field} must be a non-empty array`);
  value.forEach((entry, index) => {
    const itemField = `${field}[${index}]`;
    if (rule.kind === 'string') validateString(entry, itemField, route, errors);
    if (rule.kind === 'faq') {
      if (!isRecord(entry)) addError(errors, route, `${itemField} must be an object`);
      else {
        validateString(entry.q, `${itemField}.q`, route, errors);
        validateString(entry.a, `${itemField}.a`, route, errors);
      }
    }
    if (rule.kind === 'resource') validateSourceEntry(entry, route, itemField, errors, false);
    if (rule.kind === 'source') validateSourceEntry(entry, route, itemField, errors, true);
  });
}

function validateArrays(record, rules, route, errors) {
  for (const [field, rule] of Object.entries(rules)) validateArray(record, field, rule, route, errors);
}

function validateMetadata(routePath, route, errors) {
  const generated = catalog.metadataByPath.get(routePath);
  if (!generated) {
    addError(errors, route, 'is missing from the generated canonical route catalog');
    return;
  }
  if (typeof generated.title !== 'string' || generated.title.length > 65) addError(errors, route, 'generated title exceeds 65 characters');
  if (typeof generated.description !== 'string' || generated.description.length > 160) addError(errors, route, 'generated metaDescription exceeds 160 characters');
}

function validateRawMetadata(record, titleField, route, errors, allowedOversizeTitles = new Set()) {
  if (typeof record[titleField] === 'string' && record[titleField].length > 65 && !allowedOversizeTitles.has(record[titleField])) addError(errors, route, `${titleField} exceeds 65 characters`);
  if (typeof record.metaDescription === 'string' && record.metaDescription.length > 160) addError(errors, route, 'metaDescription exceeds 160 characters');
}

function validateReviewedAt(value, route, errors) {
  if (typeof value !== 'string' || !/^2026-09-\d{2}$/.test(value) || Number(value.slice(-2)) < 1 || Number(value.slice(-2)) > 30) addError(errors, route, 'reviewedAt must be a reviewed 2026-09 date');
}

function validateCatalogCounts(errors) {
  if (catalog.cities.size !== EXPECTED_CITY_COUNT) errors.push(`generated catalog must contain exactly ${EXPECTED_CITY_COUNT} city routes; found ${catalog.cities.size}`);
  if (catalog.serviceCities.size !== EXPECTED_SERVICE_CITY_COUNT) errors.push(`generated catalog must contain exactly ${EXPECTED_SERVICE_CITY_COUNT} service-city routes; found ${catalog.serviceCities.size}`);
}

export function validateDatasetShape(dataset, errors) {
  if (!isRecord(dataset)) {
    errors.push('Dataset must be an object with cities and serviceCities records');
    return;
  }
  if (!isRecord(dataset.cities)) errors.push('cities must be an object');
  if (!isRecord(dataset.serviceCities)) errors.push('serviceCities must be an object');
  if (!isRecord(dataset.cities) || !isRecord(dataset.serviceCities)) return;
  validateCatalogCounts(errors);

  const cityKeys = Object.keys(dataset.cities);
  if (cityKeys.length !== catalog.cities.size) errors.push(`cities must contain exactly ${catalog.cities.size} records; found ${cityKeys.length}`);
  for (const slug of catalog.cities) if (!Object.hasOwn(dataset.cities, slug)) errors.push(`cities is missing generated city key: ${slug}`);
  for (const slug of cityKeys) if (!catalog.cities.has(slug)) errors.push(`cities contains unknown generated city key: ${slug}`);
  for (const [slug, city] of Object.entries(dataset.cities)) {
    const route = routeForCity(slug);
    if (!isRecord(city)) {
      addError(errors, route, 'record must be an object');
      continue;
    }
    for (const field of ['slug', 'name', 'region', 'title', 'metaDescription', 'answerFirst']) validateString(city[field], field, route, errors);
    if (city.slug !== slug) addError(errors, route, `slug must equal city key ${slug}`);
    validateArrays(city, CITY_ARRAY_RULES, route, errors);
    validateRawMetadata(city, 'title', route, errors, reviewedOversizeCityTitles);
    validateReviewedAt(city.reviewedAt, route, errors);
    validateMetadata(route, route, errors);
  }

  const serviceCityKeys = Object.keys(dataset.serviceCities);
  if (serviceCityKeys.length !== catalog.serviceCities.size) errors.push(`serviceCities must contain exactly ${catalog.serviceCities.size} records; found ${serviceCityKeys.length}`);
  for (const key of catalog.serviceCities) if (!Object.hasOwn(dataset.serviceCities, key)) errors.push(`serviceCities is missing generated service-city key: ${key}`);
  for (const key of serviceCityKeys) if (!catalog.serviceCities.has(key)) errors.push(`serviceCities contains unknown generated service-city key: ${key}`);
  for (const [key, page] of Object.entries(dataset.serviceCities)) {
    const route = routeForServiceCity(key);
    if (!isRecord(page)) {
      addError(errors, route, 'record must be an object');
      continue;
    }
    for (const field of ['serviceSlug', 'citySlug', 'serviceTitle', 'shortTitle', 'parentServicePath', 'h1', 'metaTitle', 'metaDescription', 'answerFirst']) validateString(page[field], field, route, errors);
    if (key !== `${page.serviceSlug}/${page.citySlug}`) addError(errors, route, `key must equal ${page.serviceSlug}/${page.citySlug}`);
    if (!catalog.cities.has(page.citySlug)) addError(errors, route, `citySlug is not in the generated 34-city inventory: ${page.citySlug}`);
    if (!catalog.serviceSlugs.has(page.serviceSlug)) addError(errors, route, `serviceSlug is not in the generated reviewed service set: ${page.serviceSlug}`);
    validateArrays(page, SERVICE_CITY_ARRAY_RULES, route, errors);
    validateRawMetadata(page, 'metaTitle', route, errors);
    validateReviewedAt(page.reviewedAt, route, errors);
    validateMetadata(route, route, errors);
  }
}

function collectVisibleStrings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectVisibleStrings);
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([key, item]) => {
    if (['url', 'slug', 'reviewedAt', 'parentServicePath', 'relatedGuideSlugs', 'relatedServiceSlugs', 'nearbyCitySlugs'].includes(key)) return [];
    return collectVisibleStrings(item);
  });
}

function qualifiedClaim(value, start) {
  const prior = value.slice(Math.max(0, start - 80), start);
  return /(?:\bnot|\bno|\bwithout)(?:\s+[a-z-]+){0,3}\s+$|\bavoids?(?:\s+[a-z-]+){0,2}\s+$|\bavoiding(?:\s+[a-z-]+){0,2}\s+$|\bimply(?:ing)?(?:\s+[a-z-]+){0,2}\s+$/i.test(prior);
}

function claimMatches(value, pattern) {
  const matcher = new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`);
  const matches = [];
  let match;
  while ((match = matcher.exec(value)) !== null) {
    const isHealthClaim = pattern.source === UNSAFE_LOCAL_CLAIMS.at(-1).source;
    const before = value[match.index - 1] ?? '';
    const after = value[match.index + match[0].length] ?? '';
    const wordBoundaries = !/[a-z]/i.test(before) && !/[a-z]/i.test(after);
    if (!qualifiedClaim(value, match.index) && (!isHealthClaim || wordBoundaries)) matches.push(match);
    if (match[0] === '') matcher.lastIndex += 1;
  }
  return matches;
}

export function hasUnsafeLocalClaim(value, pattern) { return claimMatches(String(value ?? ''), pattern).length > 0; }

export function validateClaims(dataset, errors) {
  if (!isRecord(dataset) || !isRecord(dataset.cities) || !isRecord(dataset.serviceCities)) return;
  const records = [
    ...Object.entries(dataset.cities).map(([slug, record]) => [routeForCity(slug), record]),
    ...Object.entries(dataset.serviceCities).map(([key, record]) => [routeForServiceCity(key), record]),
  ];
  for (const [route, record] of records) {
    for (const text of collectVisibleStrings(record)) {
      for (const pattern of UNSAFE_LOCAL_CLAIMS) if (hasUnsafeLocalClaim(text, pattern)) addError(errors, route, `unsafe claim ${pattern} in visible copy: ${text}`);
    }
  }
}

export function validateRelationships(dataset, errors) {
  if (!isRecord(dataset) || !isRecord(dataset.cities) || !isRecord(dataset.serviceCities)) return;
  for (const [slug, city] of Object.entries(dataset.cities)) {
    if (!isRecord(city)) continue;
    const route = routeForCity(slug);
    for (const nearbySlug of Array.isArray(city.nearbyCitySlugs) ? city.nearbyCitySlugs : []) {
      if (!catalog.cities.has(nearbySlug)) addError(errors, route, `nearbyCitySlugs references missing generated city route: ${nearbySlug}`);
      if (nearbySlug === slug) addError(errors, route, 'nearbyCitySlugs cannot include its own city');
    }
    for (const guideSlug of Array.isArray(city.relatedGuideSlugs) ? city.relatedGuideSlugs : []) if (!catalog.guides.has(guideSlug)) addError(errors, route, `relatedGuideSlugs references missing frontmatter-derived blog route: ${guideSlug}`);
  }
  for (const [key, page] of Object.entries(dataset.serviceCities)) {
    if (!isRecord(page)) continue;
    const route = routeForServiceCity(key);
    if (!catalog.parentServicePaths.has(page.parentServicePath)) addError(errors, route, 'parentServicePath must reference a generated canonical service route');
    const parents = catalog.parentByService.get(page.serviceSlug) ?? [];
    if (parents.length > 0 && parents.some((parent) => parent !== page.parentServicePath)) addError(errors, route, `parentServicePath must match the reviewed ${page.serviceSlug} parent route`);
    for (const relatedSlug of Array.isArray(page.relatedServiceSlugs) ? page.relatedServiceSlugs : []) {
      if (!catalog.serviceSlugs.has(relatedSlug)) addError(errors, route, `relatedServiceSlugs references unreviewed generated service: ${relatedSlug}`);
      if (relatedSlug === page.serviceSlug) addError(errors, route, 'relatedServiceSlugs cannot include its own service');
    }
    for (const guideSlug of Array.isArray(page.relatedGuideSlugs) ? page.relatedGuideSlugs : []) if (!catalog.guides.has(guideSlug)) addError(errors, route, `relatedGuideSlugs references missing frontmatter-derived blog route: ${guideSlug}`);
  }
}

function cityName(dataset, slug) {
  const city = isRecord(dataset?.cities) ? dataset.cities[slug] : undefined;
  return isRecord(city) && typeof city.name === 'string' ? city.name : slug;
}

function normalizedRecordCopy(record, labels) {
  const fields = record.serviceSlug
    ? ['answerFirst', 'localConsiderations', 'commonConcerns', 'faqItems']
    : ['answerFirst', 'localContext', 'commonConcerns', 'faqItems'];
  return normalizeUniqueCopy(fields.flatMap((field) => {
    const value = record[field];
    if (typeof value === 'string') return [value];
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => typeof item === 'string' ? [item] : isRecord(item) ? [item.q, item.a] : []).filter((item) => typeof item === 'string');
  }).join(' '), labels);
}

export function validateSimilarity(dataset, errors) {
  if (!isRecord(dataset) || !isRecord(dataset.cities) || !isRecord(dataset.serviceCities)) return;
  const cities = Object.entries(dataset.cities).filter(([, record]) => isRecord(record));
  for (let leftIndex = 0; leftIndex < cities.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < cities.length; rightIndex += 1) {
      const [leftSlug, left] = cities[leftIndex];
      const [rightSlug, right] = cities[rightIndex];
      const labels = [cityName(dataset, leftSlug), cityName(dataset, rightSlug), leftSlug, rightSlug, 'hvac services', 'westchester county'];
      const score = jaccard(normalizedRecordCopy(left, labels), normalizedRecordCopy(right, labels));
      if (score >= 0.72) errors.push(`${routeForCity(leftSlug)} and ${routeForCity(rightSlug)}: normalized unique-copy similarity ${score.toFixed(2)} is at or above 0.72`);
    }
  }
  const pages = Object.entries(dataset.serviceCities).filter(([, record]) => isRecord(record));
  for (let leftIndex = 0; leftIndex < pages.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < pages.length; rightIndex += 1) {
      const [leftKey, left] = pages[leftIndex];
      const [rightKey, right] = pages[rightIndex];
      if (left.serviceSlug !== right.serviceSlug) continue;
      const labels = [cityName(dataset, left.citySlug), cityName(dataset, right.citySlug), left.citySlug, right.citySlug, left.serviceTitle, right.serviceTitle, left.shortTitle, right.shortTitle, left.h1, right.h1];
      const leftAnswer = normalizeUniqueCopy(left.answerFirst, labels).join(' ');
      const rightAnswer = normalizeUniqueCopy(right.answerFirst, labels).join(' ');
      if (leftAnswer === rightAnswer) errors.push(`${routeForServiceCity(leftKey)} and ${routeForServiceCity(rightKey)}: answerFirst is identical after city-name normalization`);
      const score = jaccard(normalizedRecordCopy(left, labels), normalizedRecordCopy(right, labels));
      if (score >= 0.72) errors.push(`${routeForServiceCity(leftKey)} and ${routeForServiceCity(rightKey)}: normalized unique-copy similarity ${score.toFixed(2)} is at or above 0.72`);
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
  if (!isRecord(dataset)) return [];
  const entries = [];
  if (isRecord(dataset.cities)) for (const [slug, city] of Object.entries(dataset.cities)) {
    if (!isRecord(city)) continue;
    for (const source of Array.isArray(city.municipalResources) ? city.municipalResources : []) entries.push({ route: routeForCity(slug), source });
    for (const source of Array.isArray(city.sourceNotes) ? city.sourceNotes : []) entries.push({ route: routeForCity(slug), source });
  }
  if (isRecord(dataset.serviceCities)) for (const [key, page] of Object.entries(dataset.serviceCities)) {
    if (!isRecord(page)) continue;
    for (const source of Array.isArray(page.sourceNotes) ? page.sourceNotes : []) entries.push({ route: routeForServiceCity(key), source });
  }
  return entries;
}

export async function auditLiveOfficialSources(dataset) {
  const errors = [];
  const routesByUrl = new Map();
  for (const { route, source } of sourceEntries(dataset)) {
    if (!isRecord(source) || typeof source.url !== 'string' || source.url.trim() === '') continue;
    const routes = routesByUrl.get(source.url) ?? new Set();
    routes.add(route);
    routesByUrl.set(source.url, routes);
  }
  await Promise.all([...routesByUrl.entries()].map(async ([url, routes]) => {
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20_000) });
      if (!response.ok) for (const route of routes) errors.push(`${route}: source ${url} returned HTTP ${response.status} after redirect to ${response.url}`);
    } catch (error) {
      for (const route of routes) errors.push(`${route}: source ${url} could not be checked live: ${error.message}`);
    }
  }));
  return { errors, checked: routesByUrl.size };
}

async function main() {
  const dataset = sourceDataset;
  const { errors, warnings } = auditLocalLandingContent(dataset);
  const liveMode = process.argv.includes('--live-sources');
  const liveResult = liveMode ? await auditLiveOfficialSources(dataset) : { errors: [], checked: 0 };
  const allErrors = [...errors, ...liveResult.errors];
  for (const error of allErrors) console.error(`ERROR: ${error}`);
  for (const warning of warnings) console.warn(`WARNING: ${warning}`);
  const count = isRecord(dataset.cities) && isRecord(dataset.serviceCities) ? Object.keys(dataset.cities).length + Object.keys(dataset.serviceCities).length : 0;
  if (allErrors.length > 0) {
    console.error(`${count} local landing-page records audited; ${allErrors.length} errors`);
    process.exitCode = 1;
    return;
  }
  console.log(`${count} local landing-page records audited; 0 errors${liveMode ? `; ${liveResult.checked} official sources checked live` : ''}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
