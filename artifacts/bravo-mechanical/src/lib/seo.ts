// Lightweight SEO helper — sets <title>, meta description, canonical, OG/Twitter, and JSON-LD.
import { useEffect } from "react";

type SeoOptions = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
};

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const SITE_URL = "https://www.bravomechanicalny.com";

function clipAtWord(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const clipped = value.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : clipped.length).trim()}…`;
}

export function fitSeoTitle(value: string, maxLength = 65) {
  const compact = value
    .replace(" | Bravo Mechanical LLC", " | Bravo Mechanical")
    .replace(" | Bravo Mechanical Blog", " | Bravo Mechanical");
  if (compact.length <= maxLength) return compact;
  const brand = " | Bravo Mechanical";
  const topic = compact.split(" | ")[0].replace(/\s+—\s+Hablamos Español$/i, "");
  return `${clipAtWord(topic, maxLength - brand.length)}${brand}`;
}

export const fitMetaDescription = (value: string, maxLength = 160) => clipAtWord(value, maxLength);

function toCanonicalUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return `${SITE_URL}${window.location.pathname}`.replace(/\/$/, "") || SITE_URL;
  if (pathOrUrl.startsWith("http")) return pathOrUrl.replace(/\/$/, "");
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`.replace(/\/$/, "");
}

export function useSeo({ title, description, canonical, image, imageAlt, imageWidth, imageHeight, type = "website", jsonLd, noindex = false }: SeoOptions) {
  const serializedJsonLd = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const fittedTitle = fitSeoTitle(title);
    const fittedDescription = fitMetaDescription(description);
    document.title = fittedTitle;
    upsertMeta('meta[name="description"]', "name", "description", fittedDescription);
    upsertMeta('meta[property="og:title"]', "property", "og:title", fittedTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", fittedDescription);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fittedTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", fittedDescription);
    if (image) {
      const absoluteImage = image.startsWith("http") ? image : window.location.origin + image;
      upsertMeta('meta[property="og:image"]', "property", "og:image", absoluteImage);
      upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", absoluteImage);
      upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    }
    for (const [key, value, attr] of [
      ["og:image:alt", image && imageAlt, "property"],
      ["twitter:image:alt", image && imageAlt, "name"],
      ["og:image:width", image && imageWidth, "property"],
      ["og:image:height", image && imageHeight, "property"],
    ] as const) {
      const selector = `meta[${attr}="${key}"]`;
      if (value) upsertMeta(selector, attr, key, String(value));
      else document.head.querySelector(selector)?.remove();
    }
    const url = toCanonicalUrl(canonical);
    upsertLink("canonical", url);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    let scriptEl: HTMLScriptElement | null = null;
    document.head.querySelectorAll('script[data-seo-route="true"]').forEach((script) => script.remove());
    if (jsonLd) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.text = serializedJsonLd;
      scriptEl.dataset.seoJsonLd = "true";
      scriptEl.dataset.seoRoute = "true";
      document.head.appendChild(scriptEl);
    }
    document.documentElement.setAttribute("data-seo-ready", "true");
    return () => {
      if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
      document.documentElement.removeAttribute("data-seo-ready");
    };
  }, [title, description, canonical, image, imageAlt, imageWidth, imageHeight, type, noindex, jsonLd, serializedJsonLd]);
}
