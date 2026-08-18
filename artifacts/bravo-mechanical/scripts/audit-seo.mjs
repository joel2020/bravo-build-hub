#!/usr/bin/env node

const requestedBase = process.argv.slice(2).find((arg) => /^https?:\/\//i.test(arg)) || "https://www.bravomechanicalny.com";
const base = new URL(requestedBase);
const concurrency = 10;
const directoryIndexMode = process.argv.includes("--directory-index");

const extract = (html, pattern) => html.match(pattern)?.[1]?.trim() || "";
const canonicalOf = (html) => extract(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
  || extract(html, /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);

async function auditUrl(productionUrl) {
  const source = new URL(productionUrl);
  const target = new URL(source.pathname + source.search, base);
  if (directoryIndexMode && target.pathname !== "/") target.pathname = `${target.pathname.replace(/\/$/, "")}/`;
  const expectedCanonical = `https://www.bravomechanicalny.com${source.pathname === "/" ? "/" : source.pathname.replace(/\/$/, "")}`;
  try {
    const response = await fetch(target, { redirect: "manual", headers: { "user-agent": "BravoSEOAudit/1.0" } });
    const html = await response.text();
    const canonical = canonicalOf(html).replace(/\/$/, source.pathname === "/" ? "/" : "");
    const title = extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = extract(html, /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const robots = `${response.headers.get("x-robots-tag") || ""} ${extract(html, /<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)}`;
    const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
    const failures = [];
    if (response.status !== 200) failures.push(`status=${response.status}`);
    if (canonical !== expectedCanonical) failures.push(`canonical=${canonical || "missing"}`);
    if (/noindex/i.test(robots)) failures.push("noindex");
    if (h1Count !== 1) failures.push(`h1=${h1Count}`);
    if (!title) failures.push("title=missing");
    if (!description) failures.push("description=missing");
    return { url: productionUrl, failures };
  } catch (error) {
    return { url: productionUrl, failures: [`fetch=${error instanceof Error ? error.message : String(error)}`] };
  }
}

async function main() {
  const sitemapUrl = new URL("/sitemap.xml", base);
  const sitemapResponse = await fetch(sitemapUrl, { headers: { "user-agent": "BravoSEOAudit/1.0" } });
  if (!sitemapResponse.ok) throw new Error(`Sitemap returned ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const results = [];
  for (let index = 0; index < urls.length; index += concurrency) {
    results.push(...await Promise.all(urls.slice(index, index + concurrency).map(auditUrl)));
  }
  const failures = results.filter((result) => result.failures.length);
  console.log(`SEO audit: ${urls.length} sitemap URLs, ${urls.length - failures.length} passed, ${failures.length} failed (${base.origin})`);
  for (const failure of failures) console.log(`${failure.url} :: ${failure.failures.join(", ")}`);
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`SEO audit failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
