// Shared route + metadata catalog used by build-time SEO scripts.
// Read from TS source via lightweight regex parsing so we never need a TS runtime
// or to duplicate slug/content data. If you add a new route type, update both
// generate-sitemap.mjs and inject-head-metadata.mjs.

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

export const SITE_URL = "https://bravomechanicalny.com";
export const SITE_NAME = "Bravo Mechanical";
export const SITE_LEGAL = "Bravo Mechanical LLC";
export const SITE_PHONE = "(914) 361-9142";
export const SITE_EMAIL = "Bravomechanicalllc@gmail.com";
export const SITE_RATING = { score: 5.0, count: 7 };
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// Static (non-templated) routes with hand-tuned titles/descriptions.
// Mirrors useSeo() calls in the corresponding page components.
export const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0",
    title: "HVAC Contractor Westchester County, NY | Bravo Mechanical",
    description: "Bravo Mechanical is a local HVAC contractor in Westchester County, NY for AC repair, AC installation, furnace repair, boiler repair, heat pumps, and maintenance plans." },
  { path: "/about", changefreq: "monthly", priority: "0.7",
    title: "About Bravo Mechanical | Local HVAC in Westchester County, NY",
    description: "Bravo Mechanical LLC is a licensed Westchester HVAC contractor focused on honest sizing, clear written quotes, and dependable installs." },
  { path: "/services", changefreq: "monthly", priority: "0.9",
    title: "HVAC Services in Westchester County, NY | Bravo Mechanical",
    description: "Full HVAC services in Westchester County: AC repair and installation, boiler service, furnace repair, heat pumps, mini-splits, and indoor air quality." },
  { path: "/service-areas", changefreq: "monthly", priority: "0.8",
    title: "Westchester County HVAC Service Areas | Bravo Mechanical",
    description: "Local HVAC service for cities and towns across Westchester County, NY — Yonkers, White Plains, New Rochelle, Mount Vernon, Scarsdale and more." },
  { path: "/reviews", changefreq: "monthly", priority: "0.7",
    title: "Customer Reviews | Bravo Mechanical HVAC Westchester County",
    description: "Read recent customer reviews of Bravo Mechanical LLC, a 5.0-rated HVAC contractor serving Westchester County, NY." },
  { path: "/blog", changefreq: "weekly", priority: "0.8",
    title: "HVAC Blog & Guides | Bravo Mechanical Westchester County",
    description: "Practical HVAC guides for Westchester homeowners — boiler costs, heat pump rebates, AC troubleshooting, and seasonal maintenance tips." },
  { path: "/contact", changefreq: "monthly", priority: "0.8",
    title: "Contact Bravo Mechanical HVAC | Westchester County, NY",
    description: "Request a free HVAC estimate or schedule service in Westchester County, NY. Call (914) 361-9142 or send a message — fast local response." },
  { path: "/emergency-hvac-westchester", changefreq: "weekly", priority: "0.95",
    title: "24/7 Emergency HVAC Repair in Westchester County, NY | Bravo Mechanical",
    description: "Emergency HVAC repair in Westchester County, NY. No-heat and no-cool dispatch, safety-first diagnostics, and clear next steps. Call (914) 361-9142." },
  { path: "/company-facts", changefreq: "monthly", priority: "0.5",
    title: "Company Facts | Bravo Mechanical LLC",
    description: "Public reference page for Bravo Mechanical LLC — service areas, licensing notes, and how to verify our HVAC business in Westchester County, NY." },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.4",
    title: "Privacy Policy | Bravo Mechanical",
    description: "How Bravo Mechanical LLC collects, uses, and protects your information." },
  { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.4",
    title: "Terms and Conditions | Bravo Mechanical",
    description: "Terms governing use of the Bravo Mechanical website and services." },
];

// Routes never to expose in sitemap or prerender.
export const EXCLUDED_PATHS = new Set(["/auth", "/admin/comments", "/admin/crm"]);

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function readSource(rel) {
  return readFile(path.join(SRC, rel), "utf8");
}

// ---- Cities ------------------------------------------------------------
export async function loadCities() {
  const txt = await readSource("lib/cities.ts");
  const cities = [];
  const blockRe = /"([A-Za-z][A-Za-z .'-]+)":\s*{/g;
  let m;
  while ((m = blockRe.exec(txt)) !== null) {
    const name = m[1];
    if (name === "addressLocality" || name === "addressRegion" || name === "@type") continue;
    if (name === "PostalAddress" || name === "City") continue;
    if (cities.find((c) => c.name === name)) continue;
    cities.push({ name, slug: slugify(name) });
  }
  return cities;
}

// ---- Top cities --------------------------------------------------------
export async function loadTopCitySlugs() {
  const txt = await readSource("lib/serviceCityCombos.ts");
  const arrMatch = txt.match(/TOP_CITY_SLUGS\s*=\s*\[([\s\S]*?)\]/);
  if (!arrMatch) return [];
  return [...arrMatch[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

// ---- Service-content slugs (for combo pages) ---------------------------
export async function loadServiceContentSlugs() {
  const txt = await readSource("lib/serviceContent.ts");
  const slugs = [];
  for (const m of txt.matchAll(/^\s*"([a-z][a-z0-9-]*)":\s*\{/gm)) {
    if (!slugs.includes(m[1])) slugs.push(m[1]);
  }
  return slugs;
}

// Returns { slug, title, metaTitle(name), metaDescription(name) }
export async function loadServiceContent() {
  const txt = await readSource("lib/serviceContent.ts");
  const services = [];
  // Find each top-level service entry block.
  const slugRe = /^\s*"([a-z][a-z0-9-]*)":\s*\{[\s\S]*?slug:\s*"([a-z0-9-]+)",[\s\S]*?title:\s*"([^"]+)",[\s\S]*?metaTitle:\s*\(c\)\s*=>\s*`([^`]+)`,[\s\S]*?metaDescription:\s*\(c\)\s*=>\s*`([^`]+)`/gm;
  let m;
  while ((m = slugRe.exec(txt)) !== null) {
    const [, , slug, title, metaTitleTpl, metaDescTpl] = m;
    services.push({
      slug,
      title,
      metaTitle: (city) => metaTitleTpl.replace(/\$\{c\}/g, city),
      metaDescription: (city) => metaDescTpl.replace(/\$\{c\}/g, city),
    });
  }
  return services;
}

// ---- High-intent service pages -----------------------------------------
export async function loadHighIntentServices() {
  const txt = await readSource("lib/highIntentServices.ts");
  const services = [];
  // Each `mk({ slug: "...", ..., seoTitle: "...", metaDescription: "..." })`
  // or first two literal entries, parsed via a forgiving regex.
  const re = /slug:\s*"([a-z0-9-]+)"[\s\S]*?seoTitle:\s*"([^"]+)"[\s\S]*?metaDescription:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    services.push({ slug: m[1], seoTitle: m[2], metaDescription: m[3] });
  }
  return services;
}

// ---- Blog posts (markdown frontmatter) ---------------------------------
export async function loadBlogPosts() {
  const dir = path.join(SRC, "content", "blog");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  const posts = [];
  for (const f of files) {
    const raw = await readFile(path.join(dir, f), "utf8");
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) continue;
    const data = {};
    for (const line of match[1].split("\n")) {
      const lm = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (!lm) continue;
      let v = lm[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      data[lm[1]] = v;
    }
    const slug = data.slug || f.replace(/\.md$/, "");
    posts.push({
      slug,
      title: data.title || slug,
      date: data.date || "1970-01-01",
      excerpt: data.excerpt || "",
      city: data.city || "",
    });
  }
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

// ---- Build the full URL catalog ----------------------------------------
export async function buildAllRoutes() {
  const [cities, topCities, serviceSlugs, hiServices, posts] = await Promise.all([
    loadCities(),
    loadTopCitySlugs(),
    loadServiceContentSlugs(),
    loadHighIntentServices(),
    loadBlogPosts(),
  ]);

  const services = await loadServiceContent();
  const cityByslug = new Map(cities.map((c) => [c.slug, c]));

  const routes = [];

  for (const r of STATIC_ROUTES) {
    routes.push({ ...r, type: "static" });
  }

  // City pages
  for (const c of cities) {
    routes.push({
      path: `/service-areas/${c.slug}`,
      changefreq: "monthly",
      priority: topCities.includes(c.slug) ? "0.85" : "0.7",
      title: `HVAC ${c.name}, NY — Heating, Cooling & Repair | ${SITE_NAME}`,
      description: `Local HVAC service in ${c.name}, NY. Heating, cooling, repair, and installation by licensed Westchester County technicians. 24/7 emergency service. Call ${SITE_PHONE}.`,
      type: "city",
      city: c,
    });
  }

  // High-intent service pages
  for (const s of hiServices) {
    routes.push({
      path: `/services/${s.slug}`,
      changefreq: "monthly",
      priority: "0.9",
      title: s.seoTitle,
      description: s.metaDescription,
      type: "service",
      service: s,
    });
  }

  // Service-city combo pages
  for (const citySlug of topCities) {
    const c = cityByslug.get(citySlug);
    if (!c) continue;
    for (const sSlug of serviceSlugs) {
      const sc = services.find((s) => s.slug === sSlug);
      if (!sc) continue;
      routes.push({
        path: `/services/${sSlug}/${citySlug}`,
        changefreq: "monthly",
        priority: "0.85",
        title: sc.metaTitle(c.name),
        description: sc.metaDescription(c.name),
        type: "service-city",
        city: c,
        service: sc,
      });
    }
  }

  // Blog posts
  for (const p of posts) {
    routes.push({
      path: `/blog/${p.slug}`,
      changefreq: "monthly",
      priority: "0.7",
      lastmod: p.date,
      title: `${p.title} | ${SITE_NAME} Blog`,
      description: p.excerpt,
      type: "blog",
      post: p,
    });
  }

  // Dedupe by path (last wins).
  const byPath = new Map();
  for (const r of routes) {
    if (EXCLUDED_PATHS.has(r.path)) continue;
    byPath.set(r.path, r);
  }
  return [...byPath.values()];
}
