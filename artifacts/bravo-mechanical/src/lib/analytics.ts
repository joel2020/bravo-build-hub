// Lightweight GA4 event helper. GA4 itself is loaded via index.html.
// Safe to call before gtag is ready — events queue into dataLayer.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

const blockedAnalyticsKey = /(?:email|phone|name|message|address|referrer|landing_url|page_location|gclid|fbclid)/i;
const privatePath = /^\/(?:auth(?:\/|$)|admin(?:\/|$)|proposal(?:\/|$))/i;
const SITE_ORIGIN = "https://www.bravomechanicalny.com";
const looksSensitive = (value: string) =>
  /https?:\/\//i.test(value) || /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(value) || /\+?\d[\d().\s-]{8,}\d/.test(value);

function privacySafeParams(params: EventParams): EventParams {
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => {
      if (blockedAnalyticsKey.test(key)) return false;
      if (typeof value === "string" && (value.length > 100 || looksSensitive(value))) return false;
      return true;
    }),
  );
}

function analyticsPagePath(): string | undefined {
  const pathname = window.location.pathname || "/";
  return privatePath.test(pathname) ? undefined : pathname;
}

function analyticsPageContext(pathname: string) {
  const origin = window.location.origin?.startsWith("http") ? window.location.origin : SITE_ORIGIN;
  return {
    page_path: pathname,
    page_location: `${origin}${pathname}`,
    page_referrer: "",
  };
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const safeParams = privacySafeParams(params);
  const pagePath = analyticsPagePath();
  if (!pagePath) return;
  Object.assign(safeParams, analyticsPageContext(pagePath));
  if (typeof window.gtag === "function") {
    window.gtag("event", name, safeParams);
  } else {
    // Fallback for pages that initialize analytics after a user interaction.
    window.dataLayer.push({ event: name, ...safeParams });
  }
}

// Convenience wrappers for the four conversion events.
export const trackCallClick = (location: string) =>
  trackEvent("call_click", { event_category: "engagement", location });

export const trackSmsClick = (location: string) =>
  trackEvent("sms_click", { event_category: "engagement", location });

export const trackLeadSubmit = (form: string, extra: EventParams = {}) =>
  trackEvent("lead_submit", { event_category: "lead", form, ...extra });

export const trackEmergencyCtaClick = (location: string) =>
  trackEvent("emergency_cta_click", { event_category: "engagement", location });

export const trackRequestServiceClick = (location: string) =>
  trackEvent("request_service_click", { event_category: "lead", location });

export const trackPageView = () =>
  analyticsPagePath() && trackEvent("page_view", { event_category: "navigation" });
