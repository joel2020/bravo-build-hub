#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { lookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAllRoutesSync } from './route-data.mjs';
import {
  APPROVED_SERVICE_AREAS,
  LOCAL_PAGE_SHARED_STRINGS,
  SERVICE_INTENT_PARENTS,
} from '../src/lib/localPageModel.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const datasetPath = process.env.LOCAL_LANDING_CONTENT_PATH || path.join(root, 'src/content/localLandingPages.json');
const EXPECTED_CITY_COUNT = APPROVED_SERVICE_AREAS.length;
const EXPECTED_SERVICE_CITY_COUNT = 20;
const OFFICIAL_SOURCE_HOSTS = new Set([
  'bedfordny.gov', 'dos.ny.gov', 'greenburghny.com', 'mynewcastleny.gov', 'ny.gov',
  'nyserda.ny.gov', 'tax.ny.gov', 'www.bedfordny.gov', 'www.cityofwhiteplains.com',
  'www.cpsc.gov', 'www.energystar.gov', 'www.epa.gov', 'www.greenburghny.com',
  'www.mountvernonny.gov', 'www.mynewcastleny.gov', 'www.newrochelleny.gov',
  'www.northcastleny.gov', 'www.ny.gov', 'www.nyserda.ny.gov', 'www.scarsdale.gov',
  'www.tax.ny.gov', 'www.yonkersny.gov',
]);
const UNSAFE_LOCAL_CLAIMS = [
  /free (?:quote|estimate)/i, /manufacturer[- ]trained/i, /not subcontractors/i,
  /manual j.{0,30}every/i, /permits? (?:pulled|handled|coordinated)/i,
  /fixed pricing/i, /same[- ]day/i, /guaranteed/i, /prevents? breakdowns/i,
  /keeps? (?:your )?warranty valid/i, /cures?|prevents? (?:allergies|asthma|illness)/i,
  /healthier indoor environments?/i,
];
const LIVE_SOURCE_REQUEST_HEADERS = {
  Accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8',
  'User-Agent': 'BravoMechanicalLinkVerifier/1.0 (+https://www.bravomechanicalny.com/contact)',
};
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const DEFAULT_MAX_REDIRECTS = 5;
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
function createCatalog(generatedRoutes) {
  const cityRoutes = generatedRoutes.filter((route) => route.type === 'city');
  const serviceCityRoutes = generatedRoutes.filter((route) => route.type === 'service-city');
  const blogRoutes = generatedRoutes.filter((route) => route.type === 'blog');
  return {
    cities: new Set(cityRoutes.map((route) => route.path.slice('/service-areas/'.length))),
    serviceCities: new Set(serviceCityRoutes.map((route) => route.path.slice('/services/'.length))),
    serviceSlugs: new Set(serviceCityRoutes.map((route) => route.service?.slug).filter(Boolean)),
    parentServicePaths: new Set(generatedRoutes.map((route) => route.path)),
    guides: new Set(blogRoutes.map((route) => route.path.slice('/blog/'.length))),
    metadataByPath: new Map(generatedRoutes.map((route) => [route.path, route])),
  };
}

function buildCanonicalAuditCatalog() {
  return createCatalog(buildAllRoutesSync());
}

export async function initializeLocalLandingContentAudit() {
  return buildCanonicalAuditCatalog();
}

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

function validateMetadata(routePath, record, titleField, route, errors, routeCatalog) {
  if (!routeCatalog) return;
  const generated = routeCatalog.metadataByPath.get(routePath);
  if (!generated) {
    addError(errors, route, 'is missing from the generated canonical route catalog');
    return;
  }
  if (typeof generated.title !== 'string' || generated.title.length > 65) addError(errors, route, 'generated title exceeds 65 characters');
  if (typeof generated.description !== 'string' || generated.description.length > 160) addError(errors, route, 'generated metaDescription exceeds 160 characters');
  if (typeof record[titleField] === 'string' && generated.title !== record[titleField]) addError(errors, route, `${titleField} must match generated canonical route metadata`);
  if (typeof record.metaDescription === 'string' && generated.description !== record.metaDescription) addError(errors, route, 'metaDescription must match generated canonical route metadata');
}

function validateRawMetadata(record, titleField, route, errors) {
  if (typeof record[titleField] === 'string' && record[titleField].length > 65) addError(errors, route, `${titleField} exceeds 65 characters`);
  if (typeof record.metaDescription === 'string' && record.metaDescription.length > 160) addError(errors, route, 'metaDescription exceeds 160 characters');
}

function validateReviewedAt(value, route, errors) {
  if (typeof value !== 'string' || !/^2026-09-\d{2}$/.test(value) || Number(value.slice(-2)) < 1 || Number(value.slice(-2)) > 30) addError(errors, route, 'reviewedAt must be a reviewed 2026-09 date');
}

function validateCatalogCounts(errors, routeCatalog) {
  if (!routeCatalog) return;
  if (routeCatalog.cities.size !== EXPECTED_CITY_COUNT) errors.push(`generated catalog must contain exactly ${EXPECTED_CITY_COUNT} city routes; found ${routeCatalog.cities.size}`);
  if (routeCatalog.serviceCities.size !== EXPECTED_SERVICE_CITY_COUNT) errors.push(`generated catalog must contain exactly ${EXPECTED_SERVICE_CITY_COUNT} service-city routes; found ${routeCatalog.serviceCities.size}`);
}

export function validateDatasetShape(dataset, errors, routeCatalog) {
  if (!isRecord(dataset)) {
    errors.push('Dataset must be an object with cities and serviceCities records');
    return;
  }
  if (!isRecord(dataset.cities)) errors.push('cities must be an object');
  if (!isRecord(dataset.serviceCities)) errors.push('serviceCities must be an object');
  if (!isRecord(dataset.cities) || !isRecord(dataset.serviceCities)) return;
  validateCatalogCounts(errors, routeCatalog);

  const cityKeys = Object.keys(dataset.cities);
  const approvedBySlug = new Map(APPROVED_SERVICE_AREAS.map((area) => [area.slug, area.name]));
  const expectedCityCount = routeCatalog?.cities.size ?? EXPECTED_CITY_COUNT;
  if (cityKeys.length !== expectedCityCount) errors.push(`cities must contain exactly ${expectedCityCount} records; found ${cityKeys.length}`);
  for (const [slug, name] of approvedBySlug) {
    if (!Object.hasOwn(dataset.cities, slug)) errors.push(`cities is missing approved service-area key: ${slug}`);
    else if (dataset.cities[slug]?.name !== name) errors.push(`approved service-area ${slug} must use name ${name}`);
  }
  for (const slug of cityKeys) if (!approvedBySlug.has(slug)) errors.push(`cities contains unapproved service-area key: ${slug}`);
  if (routeCatalog) {
    for (const slug of routeCatalog.cities) if (!Object.hasOwn(dataset.cities, slug)) errors.push(`cities is missing generated city key: ${slug}`);
    for (const slug of cityKeys) if (!routeCatalog.cities.has(slug)) errors.push(`cities contains unknown generated city key: ${slug}`);
  }
  for (const [slug, city] of Object.entries(dataset.cities)) {
    const route = routeForCity(slug);
    if (!isRecord(city)) {
      addError(errors, route, 'record must be an object');
      continue;
    }
    for (const field of ['slug', 'name', 'region', 'title', 'metaDescription', 'answerFirst']) validateString(city[field], field, route, errors);
    if (city.slug !== slug) addError(errors, route, `slug must equal city key ${slug}`);
    validateArrays(city, CITY_ARRAY_RULES, route, errors);
    validateRawMetadata(city, 'title', route, errors);
    validateReviewedAt(city.reviewedAt, route, errors);
    validateMetadata(route, city, 'title', route, errors, routeCatalog);
  }

  const serviceCityKeys = Object.keys(dataset.serviceCities);
  const expectedServiceCityCount = routeCatalog?.serviceCities.size ?? EXPECTED_SERVICE_CITY_COUNT;
  if (serviceCityKeys.length !== expectedServiceCityCount) errors.push(`serviceCities must contain exactly ${expectedServiceCityCount} records; found ${serviceCityKeys.length}`);
  if (routeCatalog) {
    for (const key of routeCatalog.serviceCities) if (!Object.hasOwn(dataset.serviceCities, key)) errors.push(`serviceCities is missing generated service-city key: ${key}`);
    for (const key of serviceCityKeys) if (!routeCatalog.serviceCities.has(key)) errors.push(`serviceCities contains unknown generated service-city key: ${key}`);
  }
  for (const [key, page] of Object.entries(dataset.serviceCities)) {
    const route = routeForServiceCity(key);
    if (!isRecord(page)) {
      addError(errors, route, 'record must be an object');
      continue;
    }
    for (const field of ['serviceSlug', 'citySlug', 'serviceTitle', 'shortTitle', 'parentServicePath', 'h1', 'metaTitle', 'metaDescription', 'answerFirst']) validateString(page[field], field, route, errors);
    if (key !== `${page.serviceSlug}/${page.citySlug}`) addError(errors, route, `key must equal ${page.serviceSlug}/${page.citySlug}`);
    if (routeCatalog && !routeCatalog.cities.has(page.citySlug)) addError(errors, route, `citySlug is not in the generated 34-city inventory: ${page.citySlug}`);
    if (routeCatalog && !routeCatalog.serviceSlugs.has(page.serviceSlug)) addError(errors, route, `serviceSlug is not in the generated reviewed service set: ${page.serviceSlug}`);
    validateArrays(page, SERVICE_CITY_ARRAY_RULES, route, errors);
    validateRawMetadata(page, 'metaTitle', route, errors);
    validateReviewedAt(page.reviewedAt, route, errors);
    validateMetadata(route, page, 'metaTitle', route, errors, routeCatalog);
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
    const before = value[match.index - 1] ?? '';
    const after = value[match.index + match[0].length] ?? '';
    const wordBoundaries = !/[a-z]/i.test(before) && !/[a-z]/i.test(after);
    if (!qualifiedClaim(value, match.index) && wordBoundaries) matches.push(match);
    if (match[0] === '') matcher.lastIndex += 1;
  }
  return matches;
}

export function hasUnsafeLocalClaim(value, pattern) { return claimMatches(String(value ?? ''), pattern).length > 0; }

export function validateClaims(dataset, errors, sharedStrings = LOCAL_PAGE_SHARED_STRINGS) {
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
  for (const text of sharedStrings) {
    for (const pattern of UNSAFE_LOCAL_CLAIMS) {
      if (hasUnsafeLocalClaim(text, pattern)) addError(errors, 'shared local-page copy', `unsafe claim ${pattern} in shared local-page copy: ${text}`);
    }
  }
}

export function validateRelationships(dataset, errors, routeCatalog) {
  if (!routeCatalog || !isRecord(dataset) || !isRecord(dataset.cities) || !isRecord(dataset.serviceCities)) return;
  for (const [slug, city] of Object.entries(dataset.cities)) {
    if (!isRecord(city)) continue;
    const route = routeForCity(slug);
    for (const nearbySlug of Array.isArray(city.nearbyCitySlugs) ? city.nearbyCitySlugs : []) {
      if (!routeCatalog.cities.has(nearbySlug)) addError(errors, route, `nearbyCitySlugs references missing generated city route: ${nearbySlug}`);
      if (nearbySlug === slug) addError(errors, route, 'nearbyCitySlugs cannot include its own city');
    }
    for (const guideSlug of Array.isArray(city.relatedGuideSlugs) ? city.relatedGuideSlugs : []) if (!routeCatalog.guides.has(guideSlug)) addError(errors, route, `relatedGuideSlugs references missing frontmatter-derived blog route: ${guideSlug}`);
  }
  for (const [key, page] of Object.entries(dataset.serviceCities)) {
    if (!isRecord(page)) continue;
    const route = routeForServiceCity(key);
    if (!routeCatalog.parentServicePaths.has(page.parentServicePath)) addError(errors, route, 'parentServicePath must reference a generated canonical service route');
    const expectedParent = SERVICE_INTENT_PARENTS[page.serviceSlug]?.path;
    if (!expectedParent) addError(errors, route, `serviceSlug has no approved intent parent: ${page.serviceSlug}`);
    else if (page.parentServicePath !== expectedParent) addError(errors, route, `parentServicePath must match the independent ${page.serviceSlug} parent ${expectedParent}`);
    for (const relatedSlug of Array.isArray(page.relatedServiceSlugs) ? page.relatedServiceSlugs : []) {
      if (!routeCatalog.serviceSlugs.has(relatedSlug)) addError(errors, route, `relatedServiceSlugs references unreviewed generated service: ${relatedSlug}`);
      if (relatedSlug === page.serviceSlug) addError(errors, route, 'relatedServiceSlugs cannot include its own service');
    }
    for (const guideSlug of Array.isArray(page.relatedGuideSlugs) ? page.relatedGuideSlugs : []) if (!routeCatalog.guides.has(guideSlug)) addError(errors, route, `relatedGuideSlugs references missing frontmatter-derived blog route: ${guideSlug}`);
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
  validateDatasetShape(dataset, errors, null);
  if (errors.length > 0) {
    validateClaims(dataset, errors);
    validateSimilarity(dataset, errors);
    return { errors, warnings };
  }
  let routeCatalog;
  try {
    routeCatalog = buildCanonicalAuditCatalog();
  } catch {
    errors.push('canonical route catalog could not be constructed');
  }
  validateDatasetShape(dataset, errors, routeCatalog);
  validateClaims(dataset, errors);
  validateRelationships(dataset, errors, routeCatalog);
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

function parseIpv4(address) {
  if (isIP(address) !== 4) return null;
  return address.split('.').map(Number);
}

function ipv4IsNonPublic(address) {
  const octets = parseIpv4(address);
  if (!octets) return true;
  const [a, b, c] = octets;
  return a === 0
    || a === 10
    || a === 100 && b >= 64 && b <= 127
    || a === 127
    || a === 169 && b === 254
    || a === 172 && b >= 16 && b <= 31
    || a === 192 && b === 0 && (c === 0 || c === 2)
    || a === 192 && b === 168
    || a === 198 && (b === 18 || b === 19)
    || a === 198 && b === 51 && c === 100
    || a === 203 && b === 0 && c === 113
    || a >= 224;
}

function ipv6Words(address) {
  let normalized = address.toLowerCase().split('%')[0];
  const dottedIndex = normalized.lastIndexOf(':');
  if (normalized.includes('.')) {
    const ipv4 = parseIpv4(normalized.slice(dottedIndex + 1));
    if (!ipv4) return null;
    normalized = `${normalized.slice(0, dottedIndex)}:${((ipv4[0] << 8) | ipv4[1]).toString(16)}:${((ipv4[2] << 8) | ipv4[3]).toString(16)}`;
  }
  const halves = normalized.split('::');
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves[1] ? halves[1].split(':') : [];
  const fill = halves.length === 2 ? 8 - left.length - right.length : 0;
  const parts = [...left, ...Array.from({ length: fill }, () => '0'), ...right];
  if (parts.length !== 8 || parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return null;
  return parts.map((part) => Number.parseInt(part, 16));
}

function ipv6IsNonPublic(address) {
  const words = ipv6Words(address);
  if (!words) return true;
  const [first, second] = words;
  const mappedIpv4 = words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff
    ? `${words[6] >> 8}.${words[6] & 255}.${words[7] >> 8}.${words[7] & 255}`
    : null;
  if (mappedIpv4) return ipv4IsNonPublic(mappedIpv4);
  return first === 0
    || (first & 0xfe00) === 0xfc00
    || (first & 0xffc0) === 0xfe80
    || (first & 0xffc0) === 0xfec0
    || (first & 0xff00) === 0xff00
    || first === 0x2001 && second === 0x0db8;
}

function addressIsNonPublic(address) {
  const version = isIP(address);
  return version === 4 ? ipv4IsNonPublic(address) : version === 6 ? ipv6IsNonPublic(address) : true;
}

function officialUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`source URL is invalid: ${rawUrl}`);
  }
  if (parsed.protocol !== 'https:') throw new Error(`source URL must use HTTPS: ${parsed.href}`);
  if (parsed.username || parsed.password) throw new Error(`source URL must not include credentials: ${parsed.href}`);
  if (parsed.port && parsed.port !== '443') throw new Error(`source URL must use the standard HTTPS port: ${parsed.href}`);
  if (!OFFICIAL_SOURCE_HOSTS.has(parsed.hostname)) throw new Error(`source URL must use an approved official source host: ${parsed.hostname}`);
  return parsed;
}

async function assertPublicResolution(hostname, resolveHostname) {
  const answers = await resolveHostname(hostname);
  const records = Array.isArray(answers) ? answers : [answers];
  if (records.length === 0) throw new Error(`official source host did not resolve: ${hostname}`);
  const validated = [];
  for (const record of records) {
    const address = typeof record === 'string' ? record : record?.address;
    if (typeof address !== 'string' || addressIsNonPublic(address)) {
      throw new Error(`official source host resolved to a non-public address: ${hostname} (${address ?? 'unknown'})`);
    }
    validated.push({ address, family: isIP(address) });
  }
  return validated;
}

async function cancelBody(response) {
  try {
    await response?.body?.cancel?.();
  } catch {
    // Response-body cleanup must not hide the actual HTTP validation result.
  }
}

export function pinnedHttpsRequest(url, options, requestFactory = httpsRequest) {
  const parsed = new URL(url);
  const { address, family } = options.resolvedAddress;
  return new Promise((resolve, reject) => {
    const request = requestFactory(parsed, {
      method: 'GET',
      headers: options.headers,
      signal: options.signal,
      agent: false,
      servername: parsed.hostname,
      lookup(_hostname, lookupOptions, callback) {
        const done = typeof lookupOptions === 'function' ? lookupOptions : callback;
        const wantsAll = typeof lookupOptions === 'object' && lookupOptions?.all;
        if (wantsAll) done(null, [{ address, family }]);
        else done(null, address, family);
      },
    }, (response) => {
      const status = response.statusCode ?? 0;
      resolve({
        ok: status >= 200 && status < 300,
        status,
        url: parsed.href,
        headers: {
          get(name) {
            const value = response.headers[String(name).toLowerCase()];
            return Array.isArray(value) ? value[0] ?? null : value ?? null;
          },
        },
        body: { cancel: async () => response.destroy() },
      });
    });
    request.on('error', reject);
    request.end();
  });
}

export async function fetchOfficialSource(initialUrl, options = {}) {
  const requestImpl = options.requestImpl ?? pinnedHttpsRequest;
  const resolveHostname = options.resolveHostname ?? ((hostname) => lookup(hostname, { all: true, verbatim: true }));
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  if (!Number.isInteger(maxRedirects) || maxRedirects < 0 || maxRedirects > 10) {
    throw new Error('maxRedirects must be an integer between 0 and 10');
  }

  let current = officialUrl(initialUrl);
  let redirects = 0;
  while (true) {
    const resolvedAddresses = await assertPublicResolution(current.hostname, resolveHostname);
    const resolvedAddress = resolvedAddresses.find(({ family }) => family === 4) ?? resolvedAddresses[0];
    const response = await requestImpl(current.href, {
      redirect: 'manual',
      headers: LIVE_SOURCE_REQUEST_HEADERS,
      signal: AbortSignal.timeout(20_000),
      resolvedAddress,
    });
    if (!REDIRECT_STATUSES.has(response.status)) {
      await cancelBody(response);
      return { ok: response.ok, status: response.status, url: current.href, redirects };
    }

    const location = response.headers?.get?.('location');
    await cancelBody(response);
    if (!location) throw new Error(`source redirect returned HTTP ${response.status} without a Location header: ${current.href}`);
    if (redirects >= maxRedirects) throw new Error(`source ${initialUrl} exceeded ${maxRedirects} redirects`);
    current = officialUrl(new URL(location, current).href);
    redirects += 1;
  }
}

export async function auditLiveOfficialSources(dataset, options = {}) {
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
      const response = await fetchOfficialSource(url, options);
      if (!response.ok) for (const route of routes) errors.push(`${route}: source ${url} returned HTTP ${response.status} after redirect to ${response.url}`);
    } catch (error) {
      for (const route of routes) errors.push(`${route}: source ${url} could not be checked live: ${error.message}`);
    }
  }));
  return { errors, checked: routesByUrl.size };
}

function loadSourceDataset(sourcePath) {
  let source;
  try {
    source = readFileSync(sourcePath, 'utf8');
  } catch {
    return { dataset: null, errors: ['local landing-content source could not be read'] };
  }
  try {
    return { dataset: JSON.parse(source), errors: [] };
  } catch {
    return { dataset: null, errors: ['local landing-content source is not valid JSON'] };
  }
}

function reportAuditResult(dataset, errors, warnings, liveMode, liveResult) {
  const allErrors = [...errors, ...liveResult.errors];
  for (const error of allErrors) console.error(`ERROR: ${error}`);
  for (const warning of warnings) console.warn(`WARNING: ${warning}`);
  const count = isRecord(dataset?.cities) && isRecord(dataset?.serviceCities) ? Object.keys(dataset.cities).length + Object.keys(dataset.serviceCities).length : 0;
  if (allErrors.length > 0) {
    console.error(`${count} local landing-page records audited; ${allErrors.length} errors`);
    process.exitCode = 1;
    return;
  }
  console.log(`${count} local landing-page records audited; 0 errors${liveMode ? `; ${liveResult.checked} official sources checked live` : ''}`);
}

async function main() {
  const { dataset, errors: inputErrors } = loadSourceDataset(datasetPath);
  if (inputErrors.length > 0) {
    reportAuditResult(dataset, inputErrors, [], false, { errors: [], checked: 0 });
    return;
  }
  const preflightErrors = [];
  validateDatasetShape(dataset, preflightErrors, null);
  if (preflightErrors.length > 0) {
    reportAuditResult(dataset, preflightErrors, [], false, { errors: [], checked: 0 });
    return;
  }
  const { errors, warnings } = auditLocalLandingContent(dataset);
  const liveMode = process.argv.includes('--live-sources');
  const liveResult = liveMode ? await auditLiveOfficialSources(dataset) : { errors: [], checked: 0 };
  reportAuditResult(dataset, errors, warnings, liveMode, liveResult);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
