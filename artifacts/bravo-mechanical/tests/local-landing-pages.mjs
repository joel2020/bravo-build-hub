import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { buildAllRoutes } from "../scripts/route-data.mjs";
import {
  buildCityPageSemantics,
  buildServiceCityPageSemantics,
  localPageSchemaArray,
} from "../src/lib/localPageModel.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist/public");
const allRoutes = await buildAllRoutes();
const routes = allRoutes.filter((route) => route.type === "city" || route.type === "service-city");
if (routes.length !== 54) throw new Error(`Expected 54 local routes, received ${routes.length}`);

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;");

const decodeHtml = (value) => String(value)
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&#x27;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&amp;/g, "&");

const routeByPath = new Map(allRoutes.map((route) => [route.path, route]));
const cityBySlug = new Map(routes.filter((route) => route.type === "city").map((route) => [route.city.slug, route]));
const blogBySlug = new Map(allRoutes.filter((route) => route.type === "blog").map((route) => [route.post.slug, route]));
const serviceCityRoutes = routes.filter((route) => route.type === "service-city");
const comboByKey = new Map(serviceCityRoutes.map((route) => [`${route.service.slug}/${route.city.slug}`, route]));

function anchorsIn(html) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({
    href: match[1].match(/\bhref="([^"]*)"/i)?.[1],
    text: match[2].replace(/<[^>]*>/g, "").trim(),
  }));
}

function assertMeaningfulRouteLink(html, fromPath, targetPath) {
  const links = anchorsIn(html).filter((anchor) => anchor.href === targetPath);
  if (!links.length) throw new Error(`${fromPath} is missing crawler-visible relationship link: ${targetPath}`);
  if (!links.some((anchor) => anchor.text && !/^(undefined|null)$/i.test(anchor.text))) {
    throw new Error(`${fromPath} has no meaningful anchor text for relationship link: ${targetPath}`);
  }
}

for (const route of routes) {
  const html = await readFile(path.join(dist, route.path.slice(1), "index.html"), "utf8");
  const visibleHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const content = route.localContent;
  const semantics = route.type === "city"
    ? buildCityPageSemantics(content, "https://www.bravomechanicalny.com")
    : buildServiceCityPageSemantics(content, route.city, "https://www.bravomechanicalny.com");
  const h1 = decodeHtml(visibleHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, "") ?? "");
  assert.equal(h1, semantics.h1, `${route.path} crawler H1 must match the React semantic model`);

  const routeSchemas = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]+data-seo-route="true"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
  assert.deepEqual(routeSchemas, localPageSchemaArray(semantics), `${route.path} crawler schemas must match the React semantic model exactly`);
  const faqSchemas = routeSchemas.filter((schema) => schema["@type"] === "FAQPage");
  assert.equal(faqSchemas.length, 1, `${route.path} must contain exactly one FAQPage schema`);
  const schemaFaqs = faqSchemas[0].mainEntity.map((question) => ({
    q: question.name,
    a: question.acceptedAnswer?.text,
  }));
  const visibleQuestions = [...visibleHtml.matchAll(/<h3\s+data-faq-question[^>]*>([\s\S]*?)<\/h3>\s*<p\s+data-faq-answer[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => ({ q: decodeHtml(match[1].replace(/<[^>]*>/g, "")), a: decodeHtml(match[2].replace(/<[^>]*>/g, "")) }));
  assert.deepEqual(visibleQuestions, content.faqItems, `${route.path} visible FAQs must match reviewed content exactly`);
  assert.deepEqual(schemaFaqs, visibleQuestions, `${route.path} FAQ schema must match its visible FAQs exactly`);
  const reviewedCopy = route.type === "city"
    ? [content.answerFirst, ...content.localContext, ...content.commonConcerns, ...content.safeChecks, ...content.professionalBoundaries, ...content.municipalResources.flatMap((resource) => [resource.label])]
    : [content.answerFirst, ...content.localConsiderations, ...content.commonConcerns, ...content.serviceScope, ...content.safeChecks, ...content.professionalBoundaries];

  for (const value of reviewedCopy) {
    const escaped = escapeHtml(value);
    if (!html.includes(escaped)) throw new Error(`${route.path} is missing crawler-visible reviewed copy: ${value}`);
  }
  for (const anchor of anchorsIn(visibleHtml)) {
    if (!anchor.text || /^(undefined|null)$/i.test(anchor.text)) {
      throw new Error(`${route.path} has a blank or invalid crawler-visible anchor label for ${anchor.href || "an anchor without href"}`);
    }
  }
  if (visibleHtml.includes("Sources and references")) throw new Error(`${route.path} must not prerender editorial source notes`);
  for (const source of content.sourceNotes) {
    if (visibleHtml.includes(escapeHtml(source.supports))) throw new Error(`${route.path} must not prerender source-note editorial support text`);
  }
  for (const faq of content.faqItems) {
    const question = escapeHtml(faq.q);
    const answer = escapeHtml(faq.a);
    if (visibleHtml.split(question).length - 1 !== 1 || visibleHtml.split(answer).length - 1 !== 1) {
      throw new Error(`${route.path} must contain one crawler-visible copy of FAQ: ${faq.q}`);
    }
  }
  if (!html.includes('href="/contact"')) throw new Error(`${route.path} is missing the request-service link`);
  if (!html.includes('href="tel:+19143619142"')) throw new Error(`${route.path} is missing the verified phone link`);

  if (route.type === "city") {
    const visibleAnchors = anchorsIn(visibleHtml);
    assert.equal(route.serviceDestinations.length, 6, `${route.path} must define six city-service destinations`);
    for (const destination of route.serviceDestinations) {
      const matches = visibleAnchors.filter((anchor) => anchor.href === destination.path && anchor.text === destination.label);
      assert.equal(matches.length, 1, `${route.path} must contain exactly one service destination ${destination.label} -> ${destination.path}`);
    }
  }

  const relatedPaths = route.type === "city"
    ? [
        ...content.relatedGuideSlugs.map((slug) => blogBySlug.get(slug)?.path),
        ...content.nearbyCitySlugs.map((slug) => cityBySlug.get(slug)?.path),
        ...routes.filter((candidate) => candidate.type === "service-city" && candidate.city.slug === route.city.slug).map((candidate) => candidate.path),
      ]
    : [
        content.parentServicePath,
        cityBySlug.get(route.city.slug)?.path,
        ...content.relatedGuideSlugs.map((slug) => blogBySlug.get(slug)?.path),
        ...content.relatedServiceSlugs.map((slug) => comboByKey.get(`${slug}/${route.city.slug}`)?.path),
      ];

  for (const relatedPath of relatedPaths) {
    if (!relatedPath || !routeByPath.has(relatedPath)) throw new Error(`${route.path} has a relationship without a generated route: ${relatedPath}`);
    assertMeaningfulRouteLink(html, route.path, relatedPath);
  }
}

let expectedCrossCityLinks = 0;
for (const route of serviceCityRoutes) {
  const html = await readFile(path.join(dist, route.path.slice(1), "index.html"), "utf8");
  const expectedOtherCities = serviceCityRoutes.filter((candidate) => candidate.service.slug === route.service.slug && candidate.city.slug !== route.city.slug);
  for (const target of expectedOtherCities) {
    expectedCrossCityLinks++;
    assertMeaningfulRouteLink(html, route.path, target.path);
  }
}
if (expectedCrossCityLinks !== 80) throw new Error(`Expected 80 same-service cross-city links, received ${expectedCrossCityLinks}`);

for (const serviceRoute of routeByPath.values()) {
  const expectedCombos = routes.filter((route) => route.type === "service-city" && route.localContent.parentServicePath === serviceRoute.path);
  if (!expectedCombos.length) continue;
  const html = await readFile(path.join(dist, serviceRoute.path.slice(1), "index.html"), "utf8");
  for (const combo of expectedCombos) {
    const expectedLabel = combo.localContent.h1.replace(", NY", "");
    const matches = anchorsIn(html).filter((anchor) => anchor.href === combo.path && anchor.text === expectedLabel);
    assert.equal(matches.length, 1, `${serviceRoute.path} must contain one local service link ${expectedLabel} -> ${combo.path}`);
  }
}

for (const [routePath, obsoleteCopy] of Object.entries({
  "/service-areas/yonkers": "Yonkers is the largest city in Westchester County.",
  "/service-areas/white-plains": "White Plains is Westchester's commercial hub.",
})) {
  const html = await readFile(path.join(dist, routePath.slice(1), "index.html"), "utf8");
  if (html.includes(obsoleteCopy)) throw new Error(`${routePath} must not prerender obsolete local copy outside route.localContent`);
}

console.log(`Local landing-page checks passed for ${routes.length} routes.`);
