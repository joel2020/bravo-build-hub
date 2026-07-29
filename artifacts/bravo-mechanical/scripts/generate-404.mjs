// Emits dist/public/404.html.
//
// Vercel serves 404.html with a real HTTP 404 status for any path that matches
// no static file and no rewrite. Before this existed, the SPA catch-all rewrite
// sent every unknown URL to index.html with HTTP 200 — so Google saw an
// unlimited supply of duplicate homepages ("soft 404s") and stale inbound links
// never signalled that they were dead.
//
// It has to be generated rather than committed to public/, because it must
// reference the content-hashed asset filenames from the current build.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../dist/public");

const TITLE = "Page not found — Bravo Mechanical";
const DESC =
  "That page doesn't exist. Bravo Mechanical provides HVAC service across Westchester County, NY — call (914) 361-9142 or request a free written estimate.";

function setTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

async function main() {
  const src = path.join(DIST, "index.html");
  let html = await readFile(src, "utf8");

  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${TITLE}</title>`);
  html = setTag(
    html,
    /<meta name="description" content="[\s\S]*?"\s*\/>/,
    `<meta name="description" content="${DESC}" />`,
  );

  // A 404 must never be indexed, and must not claim to be the homepage.
  html = setTag(
    html,
    /<meta name="robots" content="[\s\S]*?"\s*\/>/,
    `<meta name="robots" content="noindex, follow" />`,
  );
  html = html.replace(/<link rel="canonical"[^>]*>\s*/g, "");

  await writeFile(path.join(DIST, "404.html"), html, "utf8");
  console.log("✅ generate-404: wrote dist/public/404.html (noindex, no canonical)");
}

main().catch((err) => {
  console.error("❌ generate-404 failed:", err);
  process.exit(1);
});
