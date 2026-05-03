#!/usr/bin/env node
// Post-build SEO step: for every route in the sitemap, write a copy of the
// built index.html to dist/public/<route>/index.html with per-route <title>,
// meta description, canonical, OG/Twitter tags, and JSON-LD pre-injected
// into the <head>.
//
// This is the single biggest fix for "Google isn't crawling all my pages"
// on a Vite SPA: every URL now serves unique, crawler-visible HEAD metadata
// without waiting for JavaScript to execute. The body is still hydrated by
// React on the client, but Google decides whether to index a page based on
// the initial HTML response — and now every URL has a unique, high-signal
// initial response.
//
// Pairs with hosting that serves /foo/index.html when /foo is requested.
// Replit Static Deployments, Vercel, Netlify, Cloudflare Pages, S3+CloudFront
// all do this by default. For SPAs that fall back to /index.html, the file
// will still be served and the <head> tags will be picked up.

import { readFile, writeFile, mkdir, copyFile, access } from "node:fs/promises";
import { constants as FS } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAllRoutes,
  loadGoogleReviews,
  relativeDateToIso,
  SITE_URL,
  SITE_NAME,
  SITE_LEGAL,
  SITE_PHONE,
  SITE_EMAIL,
  SITE_RATING,
  OG_IMAGE,
  BUILD_DATE,
} from "./route-data.mjs";

// Module-level review cache populated once per build, then read by buildJsonLd.
let ALL_REVIEWS = [];
let TOP_REVIEWS = [];

function reviewToSchema(r) {
  return {
    "@type": "Review",
    author: { "@type": "Person", name: r.reviewerName },
    reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" },
    reviewBody: r.reviewText,
    datePublished: relativeDateToIso(r.reviewDate),
    publisher: { "@type": "Organization", name: "Google" },
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist", "public");

function htmlEscape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function jsonScript(obj) {
  // Use </script splitting to defuse any "</script>" sequences in content.
  const json = JSON.stringify(obj).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">${json}</script>`;
}

function buildJsonLd(route) {
  const url = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
  const breadcrumbs = (segments) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      item: s.url,
    })),
  });

  if (route.type === "blog" && route.post) {
    const out = [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: route.post.title,
        description: route.post.excerpt,
        datePublished: route.post.date,
        dateModified: route.post.date,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        publisher: { "@type": "Organization", name: SITE_LEGAL, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.webp` } },
        image: [OG_IMAGE],
        url,
      },
      breadcrumbs([
        { name: "Home", url: `${SITE_URL}/` },
        { name: "Blog", url: `${SITE_URL}/blog` },
        { name: route.post.title, url },
      ]),
    ];
    if (route.howto) {
      out.push({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: route.howto.name,
        description: route.howto.description,
        totalTime: route.howto.totalTime,
        image: [OG_IMAGE],
        step: route.howto.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
          url: `${url}#step-${i + 1}`,
        })),
      });
    }
    return out;
  }

  if (route.type === "city" && route.city) {
    const out = [
      {
        "@context": "https://schema.org",
        "@type": "HVACBusiness",
        "@id": `${url}#localbusiness`,
        name: SITE_LEGAL,
        url,
        telephone: SITE_PHONE,
        email: SITE_EMAIL,
        image: OG_IMAGE,
        priceRange: "$$",
        address: { "@type": "PostalAddress", addressLocality: route.city.name, addressRegion: "NY", addressCountry: "US" },
        areaServed: { "@type": "City", name: `${route.city.name}, NY` },
        openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "00:00", closes: "23:59" }],
        aggregateRating: { "@type": "AggregateRating", ratingValue: String(SITE_RATING.score), reviewCount: String(SITE_RATING.count), bestRating: "5", worstRating: "1" },
        review: TOP_REVIEWS.map(reviewToSchema),
        // Freshness signal — Google rewards recently-updated local-business entities for competitive city queries.
        dateModified: BUILD_DATE,
      },
      breadcrumbs([
        { name: "Home", url: `${SITE_URL}/` },
        { name: "Service Areas", url: `${SITE_URL}/service-areas` },
        { name: route.city.name, url },
      ]),
    ];
    if (route.faqs && route.faqs.length) out.push(buildFaqPage(route.faqs, url));
    return out;
  }

  if (route.type === "service" && route.service) {
    const out = [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: route.service.seoTitle,
        description: route.service.metaDescription,
        url,
        serviceType: route.service.seoTitle,
        areaServed: { "@type": "AdministrativeArea", name: "Westchester County, NY" },
        provider: { "@type": "HVACBusiness", "@id": `${SITE_URL}/#localbusiness`, name: SITE_LEGAL, telephone: SITE_PHONE, url: SITE_URL, aggregateRating: { "@type": "AggregateRating", ratingValue: String(SITE_RATING.score), reviewCount: String(SITE_RATING.count) } },
        dateModified: BUILD_DATE,
      },
      breadcrumbs([
        { name: "Home", url: `${SITE_URL}/` },
        { name: "Services", url: `${SITE_URL}/services` },
        { name: route.service.seoTitle, url },
      ]),
    ];
    if (route.faqs && route.faqs.length) out.push(buildFaqPage(route.faqs, url));
    return out;
  }

  if (route.type === "service-city" && route.city && route.service) {
    const out = [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: `${route.service.title} in ${route.city.name}, NY`,
        serviceType: route.service.title,
        description: route.description,
        url,
        areaServed: { "@type": "City", name: `${route.city.name}, NY` },
        provider: { "@type": "HVACBusiness", "@id": `${SITE_URL}/#localbusiness`, name: SITE_LEGAL, telephone: SITE_PHONE, url: SITE_URL, aggregateRating: { "@type": "AggregateRating", ratingValue: String(SITE_RATING.score), reviewCount: String(SITE_RATING.count) } },
        dateModified: BUILD_DATE,
      },
      breadcrumbs([
        { name: "Home", url: `${SITE_URL}/` },
        { name: "Services", url: `${SITE_URL}/services` },
        { name: route.service.title, url: `${SITE_URL}/services` },
        { name: `${route.service.title} in ${route.city.name}`, url },
      ]),
    ];
    if (route.faqs && route.faqs.length) out.push(buildFaqPage(route.faqs, url));
    return out;
  }

  if (route.path === "/") {
    const out = [breadcrumbs([{ name: "Home", url }])];
    if (route.faqs && route.faqs.length) out.push(buildFaqPage(route.faqs, url));
    return out;
  }
  if (route.path === "/services") {
    return [breadcrumbs([{ name: "Home", url: `${SITE_URL}/` }, { name: "Services", url }])];
  }
  if (route.path === "/service-areas") {
    return [breadcrumbs([{ name: "Home", url: `${SITE_URL}/` }, { name: "Service Areas", url }])];
  }
  if (route.path === "/blog") {
    return [breadcrumbs([{ name: "Home", url: `${SITE_URL}/` }, { name: "Blog", url }])];
  }

  return [];
}

// FAQPage with Speakable — Google AI Overviews and voice assistants can both
// extract from this. Speakable indicates which fields are TTS-friendly.
function buildFaqPage(faqs, pageUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["[data-faq-question]", "[data-faq-answer]"] },
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function buildHeadInsert(route) {
  const url = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
  const title = htmlEscape(route.title);
  const desc = htmlEscape(route.description);
  const ogType = route.type === "blog" ? "article" : "website";

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}" />`,
    `<link rel="canonical" href="${htmlEscape(url)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${htmlEscape(url)}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  ];

  for (const ld of buildJsonLd(route)) {
    tags.push(jsonScript(ld));
  }

  return `\n    <!-- prerendered SEO head for ${route.path} -->\n    ` + tags.join("\n    ") + "\n";
}

function rewriteHead(html, route) {
  // Remove the default <title> and a few default meta tags so per-route
  // versions take precedence (keep all the static JSON-LD blocks intact
  // for the homepage, but for non-homepage routes we still keep them —
  // crawlers handle multiple JSON-LD blocks fine).
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, "");
  out = out.replace(/<meta\s+name="description"[^>]*>\s*/i, "");
  out = out.replace(/<link\s+rel="canonical"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+name="robots"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+property="og:title"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+property="og:description"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+property="og:url"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+property="og:type"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+property="og:image"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+name="twitter:title"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+name="twitter:description"[^>]*>\s*/i, "");
  out = out.replace(/<meta\s+name="twitter:image"[^>]*>\s*/i, "");

  const insert = buildHeadInsert(route);
  out = out.replace("</head>", `${insert}</head>`);
  return out;
}

// Splices `review` array into the homepage HVACBusiness JSON-LD inside the
// built index.html. The hand-authored block lives between
// "@id":"https://bravomechanicalny.com/#localbusiness" and the closing
// </script>. We parse, mutate, and re-stringify rather than regex-injecting
// to guarantee valid JSON.
async function injectHomepageReviews(html, reviews) {
  const reviewSchemas = reviews.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.reviewerName },
    reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" },
    reviewBody: r.reviewText,
    datePublished: relativeDateToIso(r.reviewDate),
    publisher: { "@type": "Organization", name: "Google" },
  }));

  // Find every <script type="application/ld+json">...</script> block.
  return html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (full, body) => {
      let parsed;
      try { parsed = JSON.parse(body); } catch { return full; }
      if (parsed && parsed["@type"] === "HVACBusiness" && parsed["@id"] && parsed["@id"].endsWith("#localbusiness")) {
        parsed.review = reviewSchemas;
        parsed.dateModified = BUILD_DATE;
        return `<script type="application/ld+json">${JSON.stringify(parsed).replace(/<\/script/gi, "<\\/script")}</script>`;
      }
      return full;
    }
  );
}

async function exists(p) {
  try { await access(p, FS.F_OK); return true; } catch { return false; }
}

async function main() {
  const indexPath = path.join(DIST, "index.html");
  if (!(await exists(indexPath))) {
    console.warn(`⚠️  ${indexPath} not found. Skipping head-metadata injection.`);
    return;
  }
  const baseHtml = await readFile(indexPath, "utf8");

  // Load Google reviews once and pick the featured top 3 for city pages.
  ALL_REVIEWS = await loadGoogleReviews();
  TOP_REVIEWS = ALL_REVIEWS.filter((r) => r.isFeatured).slice(0, 3);
  console.log(`ℹ️  loaded ${ALL_REVIEWS.length} Google reviews (${TOP_REVIEWS.length} featured for city pages).`);

  // Splice the full review array into the homepage HVACBusiness JSON-LD that
  // is hand-authored in index.html. We do this here (after the build) instead
  // of editing index.html directly so the source-of-truth review data lives
  // in src/lib/googleReviews.ts and any update flows through automatically
  // on the next build.
  const homepageHtml = await injectHomepageReviews(baseHtml, ALL_REVIEWS);
  const baseHtmlWithReviews = homepageHtml;

  // Also copy sitemap into dist/public so deployment serves the latest.
  const sitemapSrc = path.join(ROOT, "public", "sitemap.xml");
  if (await exists(sitemapSrc)) {
    await copyFile(sitemapSrc, path.join(DIST, "sitemap.xml"));
  }

  const routes = await buildAllRoutes();
  let written = 0;
  for (const route of routes) {
    const html = rewriteHead(baseHtmlWithReviews, route);
    const dest =
      route.path === "/"
        ? path.join(DIST, "index.html")
        : path.join(DIST, route.path.replace(/^\//, ""), "index.html");
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, html, "utf8");
    written++;
  }
  console.log(`✅ inject-head-metadata: wrote ${written} per-route HTML files under dist/public/`);
}

main().catch((err) => {
  console.error("❌ inject-head-metadata failed:", err);
  process.exit(1);
});
