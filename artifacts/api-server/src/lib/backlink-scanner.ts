import dns from "node:dns/promises";
import net from "node:net";
import { logger } from "./logger";
import { BRAVO } from "./site-config";

/** Block fetches to private, loopback, link-local, and metadata IPs (SSRF). */
async function isSafePublicHost(hostname: string): Promise<boolean> {
  // Reject literal IPs that are private/loopback/link-local
  function ipIsPublic(ip: string): boolean {
    if (net.isIPv4(ip)) {
      const [a, b] = ip.split(".").map(Number);
      if (a === 10 || a === 127 || a === 0) return false;
      if (a === 169 && b === 254) return false; // link-local + AWS metadata
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 192 && b === 168) return false;
      if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
      if (a >= 224) return false; // multicast/reserved
      return true;
    }
    if (net.isIPv6(ip)) {
      const lower = ip.toLowerCase();
      if (lower === "::1" || lower === "::") return false;
      if (lower.startsWith("fc") || lower.startsWith("fd")) return false; // ULA
      if (lower.startsWith("fe80")) return false; // link-local
      if (lower.startsWith("::ffff:")) {
        return ipIsPublic(lower.slice(7));
      }
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

/**
 * Fetch a URL with timeout, SSRF protection, and a friendly UA. Returns the
 * HTML body or null.
 */
export async function fetchHtml(url: string, timeoutMs = 12000): Promise<string | null> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
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

const DOMAIN_PATTERNS = BRAVO.altDomains.map(
  (d) => new RegExp(`https?:\\/\\/(?:www\\.)?${d.replace(/^www\./, "")}`, "i"),
);
const BRAND_PATTERN = new RegExp(`\\b${BRAVO.brand.replace(/\s+/g, "\\s+")}\\b`, "i");

export interface ScanResult {
  hasBacklink: boolean;
  brandMentioned: boolean;
  reachable: boolean;
}

export async function scanUrlForBravo(url: string): Promise<ScanResult> {
  const html = await fetchHtml(url);
  if (html === null) {
    return { hasBacklink: false, brandMentioned: false, reachable: false };
  }
  const hasBacklink = DOMAIN_PATTERNS.some((re) => re.test(html));
  const brandMentioned = BRAND_PATTERN.test(html);
  return { hasBacklink, brandMentioned, reachable: true };
}
