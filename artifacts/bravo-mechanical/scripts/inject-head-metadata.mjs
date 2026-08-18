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
  SITE_URL,
  SITE_NAME,
  SITE_LEGAL,
  SITE_PHONE,
  OG_IMAGE,
} from "./route-data.mjs";
import { PRIVACY_POLICY_HTML, TERMS_HTML } from "./legal-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist", "public");

function htmlEscape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function jsonScript(obj) {
  // Use </script splitting to defuse any "</script>" sequences in content.
  const json = JSON.stringify(obj).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json" data-seo-route="true">${json}</script>`;
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
        "@type": "Service",
        "@id": `${url}#service`,
        name: `HVAC service in ${route.city.name}, NY`,
        serviceType: "Heating, cooling, installation, repair, and maintenance",
        description: route.description,
        url,
        areaServed: { "@type": "City", name: `${route.city.name}, NY` },
        provider: { "@id": `${SITE_URL}/#localbusiness` },
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
        provider: { "@id": `${SITE_URL}/#localbusiness` },
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
        provider: { "@id": `${SITE_URL}/#localbusiness` },
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

  const canonical = route.canonical || url;
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}" />`,
    `<link rel="canonical" href="${htmlEscape(canonical)}" />`,
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

  // hreflang alternates for routes that exist in both languages.
  if (route.alternates) {
    for (const [hreflang, altPath] of Object.entries(route.alternates)) {
      tags.push(`<link rel="alternate" hreflang="${hreflang}" href="${htmlEscape(`${SITE_URL}${altPath}`)}" />`);
    }
  }

  for (const ld of buildJsonLd(route)) {
    tags.push(jsonScript(ld));
  }

  return `\n    <!-- prerendered SEO head for ${route.path} -->\n    ` + tags.join("\n    ") + "\n";
}

function rewriteHead(html, route, ctx) {
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

  // Spanish routes get lang="es" on the html element.
  if (route.lang) {
    out = out.replace(/<html\s+lang="[^"]*"/i, `<html lang="${route.lang}"`);
  }

  // Per-route static body for crawlers that don't execute JS. React replaces
  // the contents of #root on mount, so browser users still get the app.
  const body = buildBodyInsert(route, ctx);
  out = out.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  return out;
}

// Strips self-serving review markup (review / aggregateRating) from any
// LocalBusiness-family JSON-LD block. Google ignores self-hosted review
// markup for LocalBusiness and it can trigger a manual action; the map-pack
// star rating comes from the Google Business Profile, not schema.
function stripSelfServingReviewMarkup(html) {
  return html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (full, body) => {
      let parsed;
      try { parsed = JSON.parse(body); } catch { return full; }
      if (parsed && (parsed["@type"] === "HVACBusiness" || parsed["@type"] === "LocalBusiness")) {
        delete parsed.review;
        delete parsed.aggregateRating;
        return `<script type="application/ld+json">${JSON.stringify(parsed).replace(/<\/script/gi, "<\\/script")}</script>`;
      }
      return full;
    }
  );
}

// ---- Static body prerendering -------------------------------------------
// Crawlers that do not execute JavaScript (GPTBot, ClaudeBot, PerplexityBot,
// and Googlebot's first-pass fetch) previously saw an EMPTY <div id="root">
// on every URL — the entire content investment was invisible to them. We now
// write real, per-route content into #root. React's createRoot().render()
// replaces it the moment the bundle loads, so browser users see the app.

// Minimal markdown-to-HTML for blog bodies. Imperfect rendering is fine:
// human visitors never see this (React replaces it); it exists so text
// crawlers can read the full article.
function mdToHtml(md) {
  const esc = htmlEscape;
  const inline = (t) =>
    esc(t)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, b) => `<a href="${/^(https?:|\/|tel:|mailto:|sms:)/.test(b) ? b : "#"}">${a}</a>`);
  const blocks = md.split(/\n{2,}/);
  const out = [];
  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;
    const h = b.match(/^(#{1,4})\s+(.*)$/);
    if (h) { const lvl = Math.min(h[1].length + 1, 4); out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); continue; }
    if (/^[-*]\s+/m.test(b)) {
      const items = b.split(/\n/).filter((l) => /^[-*]\s+/.test(l.trim())).map((l) => `<li>${inline(l.trim().replace(/^[-*]\s+/, ""))}</li>`);
      if (items.length) { out.push(`<ul>${items.join("")}</ul>`); continue; }
    }
    if (/^\|/.test(b)) { // markdown table -> flatten to paragraph lines
      out.push(`<p>${b.split(/\n/).map((l) => inline(l.replace(/\|/g, " "))).join("<br/>")}</p>`);
      continue;
    }
    out.push(`<p>${inline(b.replace(/\n/g, " "))}</p>`);
  }
  return out.join("\n");
}

function linkList(items) {
  return `<ul>${items.map((i) => `<li><a href="${htmlEscape(i.path)}">${htmlEscape(i.label)}</a></li>`).join("")}</ul>`;
}

function buildBodyInsert(route, ctx) {
  const esc = htmlEscape;
  const h1 = esc(String(route.title).split("|")[0].replace(/—\s*Buyer's Guide/i, "").trim());
  const parts = [];
  parts.push(`<header><p><strong>Bravo Mechanical LLC</strong> — Licensed HVAC contractor (License #8822) · 30+ years of combined HVAC experience · 1 Fowler Avenue, Yonkers, NY 10701 · Serving all of Westchester County · <a href="tel:+19143619142">${esc(SITE_PHONE)}</a> · 24/7 emergency service requests · <a href="/contact">Request an estimate</a></p></header>`);
  parts.push(`<main>`);
  parts.push(`<h1>${h1}</h1>`);
  parts.push(`<p>${esc(route.description)}</p>`);

  if (route.type === "blog" && route.post) {
    if (route.post.date) parts.push(`<p><em>Published ${esc(route.post.date)} · Bravo Mechanical, Westchester County, NY</em></p>`);
    if (route.post.body) parts.push(mdToHtml(route.post.body));
  }

  if (route.type === "service" && route.service?.crawlerCopy) {
    const copy = route.service.crawlerCopy;
    parts.push(`<h2>Direct answer</h2><p>${esc(copy.directAnswer)}</p>`);
    parts.push(`<h2>Symptoms and warning signs</h2><ul>${copy.symptoms.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`);
    parts.push(`<h2>Service process</h2><ol>${copy.process.map((item) => `<li>${esc(item)}</li>`).join("")}</ol>`);
    parts.push(`<h2>Repair, replacement, and safety guidance</h2><p>${esc(copy.guidance)}</p>`);
  }

  // Legal pages must serve their FULL text to non-JS crawlers — automated
  // compliance verifiers (e.g. Twilio A2P 10DLC vetting) fetch these URLs
  // without executing JavaScript.
  if (route.path === "/privacy-policy") parts.push(PRIVACY_POLICY_HTML);
  if (route.path === "/terms-and-conditions") parts.push(TERMS_HTML);

  if (route.faqs && route.faqs.length) {
    parts.push(`<h2>Frequently asked questions</h2>`);
    for (const f of route.faqs) {
      parts.push(`<h3 data-faq-question>${esc(f.q)}</h3><p data-faq-answer>${esc(f.a)}</p>`);
    }
  }

  if (route.type === "city" && route.city) {
    if (route.city.intro) parts.push(`<h2>Local HVAC experience in ${esc(route.city.name)}</h2><p>${esc(route.city.intro)}</p>`);
    if (route.city.housing) parts.push(`<h2>Heating and cooling needs in ${esc(route.city.name)}</h2><p>${esc(route.city.housing)}</p>`);
    if (route.city.climateNote) parts.push(`<h2>Local climate considerations</h2><p>${esc(route.city.climateNote)}</p>`);
    if (route.city.neighborhoods?.length) parts.push(`<p><strong>Neighborhoods served:</strong> ${route.city.neighborhoods.map(esc).join(", ")}.</p>`);
    if (route.city.zips?.length) parts.push(`<p><strong>ZIP codes served:</strong> ${route.city.zips.map(esc).join(", ")}.</p>`);
    parts.push(`<h2>HVAC services in ${esc(route.city.name)}, NY</h2>`);
    parts.push(linkList(ctx.services));
  } else if (route.type === "service" || route.type === "guide" || route.type === "service-city") {
    parts.push(`<h2>All Westchester HVAC services</h2>`);
    parts.push(linkList(ctx.services));
  } else if (route.path === "/" || route.path === "/services") {
    parts.push(`<h2>HVAC services</h2>`);
    parts.push(linkList(ctx.services));
    parts.push(`<h2>Equipment guides</h2>`);
    parts.push(linkList(ctx.guides));
    parts.push(`<h2>Westchester service areas</h2>`);
    parts.push(linkList(ctx.cities));
  } else if (route.path === "/service-areas") {
    parts.push(`<h2>Westchester service areas</h2>`);
    parts.push(linkList(ctx.cities));
  } else if (route.path === "/blog") {
    parts.push(`<h2>Latest guides</h2>`);
    parts.push(linkList(ctx.posts));
  }

  parts.push(`<p><a href="/contact">Request service or an estimate</a> or call <a href="tel:+19143619142">${esc(SITE_PHONE)}</a>. Serving all of Westchester County, NY.</p>`);
  parts.push(`</main>`);
  parts.push(`<nav><a href="/">Home</a> · <a href="/services">Services</a> · <a href="/service-areas">Service Areas</a> · <a href="/services/emergency-hvac-repair-westchester-county-ny">24/7 Emergency</a> · <a href="/reviews">Reviews</a> · <a href="/blog">Blog</a> · <a href="/contact">Contact</a></nav>`);

  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:960px;margin:0 auto;padding:24px;line-height:1.65;color:#0f172a">${parts.join("\n")}</div>`;
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

  // Remove any self-serving review/aggregateRating markup from LocalBusiness
  // JSON-LD (see stripSelfServingReviewMarkup).
  const baseHtmlWithReviews = stripSelfServingReviewMarkup(baseHtml);

  // Also copy sitemap into dist/public so deployment serves the latest.
  const sitemapSrc = path.join(ROOT, "public", "sitemap.xml");
  if (await exists(sitemapSrc)) {
    await copyFile(sitemapSrc, path.join(DIST, "sitemap.xml"));
  }

  const routes = await buildAllRoutes();

  // Link context for the prerendered bodies.
  const ctx = {
    services: routes.filter((r) => r.type === "service").map((r) => ({ path: r.path, label: String(r.title).split("|")[0].trim() })),
    guides: routes.filter((r) => r.type === "guide").map((r) => ({ path: r.path, label: String(r.title).split("—")[0].trim() })),
    cities: routes.filter((r) => r.type === "city").map((r) => ({ path: r.path, label: `HVAC ${r.city.name}, NY` })),
    posts: routes.filter((r) => r.type === "blog").slice(0, 12).map((r) => ({ path: r.path, label: r.post.title })),
  };

  let written = 0;
  for (const route of routes) {
    const html = rewriteHead(baseHtmlWithReviews, route, ctx);
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
