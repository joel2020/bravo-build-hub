#!/usr/bin/env node
// Auto-generates public/sitemap.xml from the live data tables in src/lib.
// Run as part of `pnpm build` so the sitemap is always in sync with routes.
//
// Output: artifacts/bravo-mechanical/public/sitemap.xml

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAllRoutes, SITE_URL } from "./route-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "public", "sitemap.xml");

function xmlEscape(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

function urlEntry({ path: p, changefreq, priority, lastmod }) {
  const loc = `${SITE_URL}${p === "/" ? "/" : p}`;
  const parts = [
    `  <url>`,
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>` : "",
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    `  </url>`,
  ].filter(Boolean);
  return parts.join("\n");
}

async function main() {
  const routes = await buildAllRoutes();
  const today = new Date().toISOString().slice(0, 10);
  const enriched = routes.map((r) => ({ ...r, lastmod: r.lastmod || today }));

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    enriched.map(urlEntry).join("\n") +
    `\n</urlset>\n`;

  await writeFile(OUT, xml, "utf8");
  console.log(`✅ sitemap.xml written: ${enriched.length} URLs → ${path.relative(process.cwd(), OUT)}`);
}

main().catch((err) => {
  console.error("❌ generate-sitemap failed:", err);
  process.exit(1);
});
