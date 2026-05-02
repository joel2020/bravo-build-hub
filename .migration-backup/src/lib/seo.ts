// Lightweight SEO helper — sets <title>, meta description, canonical, OG/Twitter, and JSON-LD.
import { useEffect } from "react";

type SeoOptions = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
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

const SITE_URL = "https://bravomechanicalny.com";

function toCanonicalUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return `${SITE_URL}${window.location.pathname}`.replace(/\/$/, "") || SITE_URL;
  if (pathOrUrl.startsWith("http")) return pathOrUrl.replace(/\/$/, "");
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`.replace(/\/$/, "");
}

export function useSeo({ title, description, canonical, image, type = "website", jsonLd, noindex = false }: SeoOptions) {
  const serializedJsonLd = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    document.title = title;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    if (image) {
      const absoluteImage = image.startsWith("http") ? image : window.location.origin + image;
      upsertMeta('meta[property="og:image"]', "property", "og:image", absoluteImage);
      upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", absoluteImage);
      upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    }
    const url = toCanonicalUrl(canonical);
    upsertLink("canonical", url);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.text = serializedJsonLd;
      scriptEl.dataset.seoJsonLd = "true";
      document.head.appendChild(scriptEl);
    }
    document.documentElement.setAttribute("data-seo-ready", "true");
    return () => {
      if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
      document.documentElement.removeAttribute("data-seo-ready");
    };
  }, [title, description, canonical, image, type, noindex, jsonLd, serializedJsonLd]);
}
