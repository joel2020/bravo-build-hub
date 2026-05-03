import dns from "node:dns/promises";
import net from "node:net";
import { logger } from "./logger";
import { BRAVO } from "./site-config";

/** Block fetches to private, loopback, link-local, and metadata IPs (SSRF). */
async function isSafePublicHost(hostname: string): Promise<boolean> {
  function ipIsPublic(ip: string): boolean {
    if (net.isIPv4(ip)) {
      const [a, b] = ip.split(".").map(Number);
      if (a === 10 || a === 127 || a === 0) return false;
      if (a === 169 && b === 254) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 192 && b === 168) return false;
      if (a === 100 && b >= 64 && b <= 127) return false;
      if (a >= 224) return false;
      return true;
    }
    if (net.isIPv6(ip)) {
      const lower = ip.toLowerCase();
      if (lower === "::1" || lower === "::") return false;
      if (lower.startsWith("fc") || lower.startsWith("fd")) return false;
      if (lower.startsWith("fe80")) return false;
      if (lower.startsWith("::ffff:")) return ipIsPublic(lower.slice(7));
      return true;
    }
    return false;
  }

  if (!hostname) return false;
  if (hostname === "localhost") return false;
  if (net.isIP(hostname)) return ipIsPublic(hostname);
  try {
    const records = await dns.lookup(hostname, { all: true });
    if (records.length === 0) return false;
    return records.every((r) => ipIsPublic(r.address));
  } catch {
    return false;
  }
}

export async function fetchHtml(url: string, timeoutMs = 12000): Promise<string | null> {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return null; }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!(await isSafePublicHost(parsed.hostname))) {
    logger.info({ url }, "fetchHtml refused: non-public host");
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BravoBacklinkAgent/1.0; +https://bravomechanicalny.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) {
      logger.info({ url, status: res.status }, "fetchHtml non-OK");
      return null;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("xml") && !ct.includes("text/plain")) {
      return null;
    }
    return await res.text();
  } catch (err) {
    logger.info({ err: (err as Error).message, url }, "fetchHtml error");
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const ANCHOR_RE = /<a\b([^>]*?)>/gi;
const HREF_RE = /\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i;
const REL_RE = /\brel\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i;

const DOMAIN_HOSTS = BRAVO.altDomains.map((d) => d.replace(/^www\./, "").toLowerCase());
const BRAND_PATTERN = new RegExp(`\\b${BRAVO.brand.replace(/\s+/g, "\\s+")}\\b`, "i");

function hrefMatchesBravo(href: string, baseUrl: string): boolean {
  try {
    const u = new URL(href, baseUrl);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    return DOMAIN_HOSTS.includes(host);
  } catch {
    return false;
  }
}

function relIsNofollow(rel: string | undefined): boolean {
  if (!rel) return false;
  const tokens = rel.toLowerCase().split(/\s+/);
  return (
    tokens.includes("nofollow") ||
    tokens.includes("sponsored") ||
    tokens.includes("ugc")
  );
}

export interface ScanResult {
  hasBacklink: boolean;
  hasDofollowBacklink: boolean;
  hasNofollowBacklink: boolean;
  brandMentioned: boolean;
  reachable: boolean;
}

export async function scanUrlForBravo(url: string): Promise<ScanResult> {
  const html = await fetchHtml(url);
  if (html === null) {
    return {
      hasBacklink: false,
      hasDofollowBacklink: false,
      hasNofollowBacklink: false,
      brandMentioned: false,
      reachable: false,
    };
  }
  let hasDofollow = false;
  let hasNofollow = false;
  for (const m of html.matchAll(ANCHOR_RE)) {
    const attrs = m[1] ?? "";
    const href = HREF_RE.exec(attrs)?.[2] ?? HREF_RE.exec(attrs)?.[3] ?? HREF_RE.exec(attrs)?.[4];
    if (!href) continue;
    if (!hrefMatchesBravo(href, url)) continue;
    const relMatch = REL_RE.exec(attrs);
    const rel = relMatch ? (relMatch[2] ?? relMatch[3] ?? relMatch[4]) : undefined;
    if (relIsNofollow(rel)) hasNofollow = true;
    else hasDofollow = true;
  }
  const brandMentioned = BRAND_PATTERN.test(html);
  return {
    hasBacklink: hasDofollow || hasNofollow,
    hasDofollowBacklink: hasDofollow,
    hasNofollowBacklink: hasNofollow && !hasDofollow,
    brandMentioned,
    reachable: true,
  };
}

const MAILTO_RE = /mailto:([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
const TEXT_EMAIL_RE = /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/gi;

const EMAIL_BLOCKLIST = [
  "@example.com",
  "@example.org",
  "@example.net",
  "@domain.com",
  "@yourdomain.com",
  "@email.com",
  "@test.com",
  "@sentry.io",
  "@wixpress.com",
  "@2x.png",
  ".png@",
  ".jpg@",
  "user@",
  "name@",
  "youremail@",
  "your.email@",
  "email@example",
];
const EMAIL_PREFERRED_PREFIXES = [
  "info@",
  "contact@",
  "hello@",
  "office@",
  "membership@",
  "members@",
  "admin@",
  "info.",
  "press@",
  "editor@",
  "tips@",
  "news@",
];

function pickBestEmail(candidates: string[]): string | null {
  const cleaned = candidates
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e && !EMAIL_BLOCKLIST.some((b) => e.includes(b)));
  if (cleaned.length === 0) return null;
  for (const prefix of EMAIL_PREFERRED_PREFIXES) {
    const found = cleaned.find((e) => e.startsWith(prefix));
    if (found) return found;
  }
  return cleaned[0];
}

/** Try to find a contact email by scanning a contact page then the homepage. */
export async function discoverContactEmail(homepage: string, contactUrl?: string): Promise<string | null> {
  const urls = [contactUrl, homepage].filter(Boolean) as string[];
  for (const url of urls) {
    const html = await fetchHtml(url);
    if (!html) continue;
    const found = new Set<string>();
    for (const m of html.matchAll(MAILTO_RE)) found.add(m[1]);
    for (const m of html.matchAll(TEXT_EMAIL_RE)) found.add(m[1]);
    const best = pickBestEmail(Array.from(found));
    if (best) return best;
  }
  return null;
}
