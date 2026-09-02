import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAllRoutes } from "../scripts/route-data.mjs";

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

const routeByPath = new Map(allRoutes.map((route) => [route.path, route]));
const cityBySlug = new Map(routes.filter((route) => route.type === "city").map((route) => [route.city.slug, route]));
const blogBySlug = new Map(allRoutes.filter((route) => route.type === "blog").map((route) => [route.post.slug, route]));
const comboByKey = new Map(routes.filter((route) => route.type === "service-city").map((route) => [`${route.service.slug}/${route.city.slug}`, route]));

for (const route of routes) {
  const html = await readFile(path.join(dist, route.path.slice(1), "index.html"), "utf8");
  const content = route.localContent;
  const reviewedCopy = route.type === "city"
    ? [content.answerFirst, ...content.localContext, ...content.commonConcerns, ...content.safeChecks, ...content.professionalBoundaries, ...content.municipalResources.flatMap((resource) => [resource.label]), ...content.sourceNotes.flatMap((source) => [source.label, source.supports])]
    : [content.answerFirst, ...content.localConsiderations, ...content.commonConcerns, ...content.serviceScope, ...content.safeChecks, ...content.professionalBoundaries, ...content.sourceNotes.flatMap((source) => [source.label, source.supports])];

  for (const value of reviewedCopy) {
    const escaped = escapeHtml(value);
    if (!html.includes(escaped)) throw new Error(`${route.path} is missing crawler-visible reviewed copy: ${value}`);
  }
  const visibleHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  for (const faq of content.faqItems) {
    const question = escapeHtml(faq.q);
    const answer = escapeHtml(faq.a);
    if (visibleHtml.split(question).length - 1 !== 1 || visibleHtml.split(answer).length - 1 !== 1) {
      throw new Error(`${route.path} must contain one crawler-visible copy of FAQ: ${faq.q}`);
    }
  }
  if (!html.includes('href="/contact"')) throw new Error(`${route.path} is missing the request-service link`);
  if (!html.includes('href="tel:+19143619142"')) throw new Error(`${route.path} is missing the verified phone link`);

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
        ...routes.filter((candidate) => candidate.type === "service-city" && candidate.city.slug === route.city.slug && candidate.path !== route.path).map((candidate) => candidate.path),
      ];

  for (const relatedPath of relatedPaths) {
    if (!relatedPath || !routeByPath.has(relatedPath)) throw new Error(`${route.path} has a relationship without a generated route: ${relatedPath}`);
    if (!html.includes(`href="${escapeHtml(relatedPath)}"`)) throw new Error(`${route.path} is missing crawler-visible relationship link: ${relatedPath}`);
  }
}

for (const serviceRoute of routeByPath.values()) {
  if (serviceRoute.type !== "service") continue;
  const expectedCombos = routes.filter((route) => route.type === "service-city" && route.localContent.parentServicePath === serviceRoute.path);
  if (!expectedCombos.length) continue;
  const html = await readFile(path.join(dist, serviceRoute.path.slice(1), "index.html"), "utf8");
  for (const combo of expectedCombos) {
    if (!html.includes(`href="${combo.path}"`)) throw new Error(`${serviceRoute.path} is missing crawler-visible local service link: ${combo.path}`);
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
