import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");
const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");
const SITE_ORIGIN = "https://bravomechanicalny.com";
const EXCLUDED_ROUTES = new Set(["/auth", "/admin/comments", "/admin/crm"]);
const REQUIRE_BROWSER = process.env.PRERENDER_REQUIRED === "true";

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js" || ext === ".mjs") return "application/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".woff") return "font/woff";
  if (ext === ".woff2") return "font/woff2";
  return "application/octet-stream";
}

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  const withoutTrailingSlash = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return withoutTrailingSlash || "/";
}

async function readRoutesFromSitemap() {
  const xml = await readFile(SITEMAP_PATH, "utf8");
  const locPattern = /<loc>(.*?)<\/loc>/g;
  const routes = new Set();

  for (const match of xml.matchAll(locPattern)) {
    const rawUrl = match[1]?.trim();
    if (!rawUrl) continue;

    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      continue;
    }

    if (parsed.origin !== SITE_ORIGIN) continue;

    const route = normalizePathname(parsed.pathname);
    if (EXCLUDED_ROUTES.has(route)) continue;
    routes.add(route);
  }

  if (!routes.has("/")) routes.add("/");

  return [...routes].sort((a, b) => a.localeCompare(b));
}

function createStaticServer() {
  return createServer(async (req, res) => {
    try {
      const requestPath = req.url ? new URL(req.url, "http://localhost").pathname : "/";
      const safePath = decodeURIComponent(requestPath).replace(/^\/+/, "");

      let filePath = path.join(DIST_DIR, safePath);
      if (requestPath === "/") {
        filePath = path.join(DIST_DIR, "index.html");
      } else if (existsSync(filePath) && !filePath.endsWith("/")) {
        // Leave as-is
      } else if (existsSync(`${filePath}.html`)) {
        filePath = `${filePath}.html`;
      } else {
        filePath = path.join(DIST_DIR, "index.html");
      }

      const body = await readFile(filePath);
      res.writeHead(200, { "content-type": getContentType(filePath) });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  });
}

async function writePrerenderedHtml(route, html) {
  const destination =
    route === "/"
      ? path.join(DIST_DIR, "index.html")
      : path.join(DIST_DIR, route.replace(/^\//, ""), "index.html");

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, html, "utf8");
}

async function waitForRouteToRender(page) {
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  await page
    .waitForFunction(
      () => {
        const hasContent = Boolean(document.querySelector("main, h1"));
        const hasCanonical = Boolean(document.head.querySelector('link[rel="canonical"]'));
        const hasTitle = Boolean(document.title);
        return hasContent && hasCanonical && hasTitle;
      },
      { timeout: 15000 },
    )
    .catch(() => {});

  await page.waitForTimeout(250);
}

function isBrowserMissingError(error) {
  const text = `${error?.message || ""}`.toLowerCase();
  return text.includes("executable doesn't exist") || text.includes("browser has not been found");
}

async function prerender() {
  if (!existsSync(DIST_DIR)) {
    throw new Error("dist directory does not exist. Run `vite build` before prerendering.");
  }

  const routes = await readRoutesFromSitemap();
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    await new Promise((resolve, reject) => server.close((closeError) => (closeError ? reject(closeError) : resolve())));
    if (!REQUIRE_BROWSER && isBrowserMissingError(error)) {
      console.warn("⚠️ Skipping prerender because Playwright Chromium is not installed in this environment.");
      console.warn("   To enable prerender output, run: npm run prerender:install");
      return;
    }
    throw error;
  }

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`Prerendering ${routes.length} public routes from sitemap.xml...`);

    for (const route of routes) {
      const url = `http://127.0.0.1:4173${route}`;
      console.log(`- ${route}`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await waitForRouteToRender(page);
      const html = await page.content();
      await writePrerenderedHtml(route, html);
    }
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }

  console.log("Prerender complete.");
}

prerender().catch((error) => {
  console.error("Prerender failed:", error);
  process.exitCode = 1;
});
