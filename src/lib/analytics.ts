// Lightweight GA4 event helper. GA4 itself is loaded via index.html.
// Safe to call before gtag is ready — events queue into dataLayer.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // Push directly so events still queue if gtag.js hasn't loaded yet.
  window.dataLayer.push({ event: name, ...params });
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

// Convenience wrappers for the four conversion events.
export const trackCallClick = (location: string) =>
{
  trackEvent("call_click", { event_category: "engagement", location });
  trackEvent("click_call", { event_category: "engagement", location });
};

export const trackSmsClick = (location: string) =>
  trackEvent("sms_click", { event_category: "engagement", location });

export const trackLeadSubmit = (form: string, extra: EventParams = {}) =>
{
  trackEvent("lead_submit", { event_category: "lead", form, ...extra });
  trackEvent("form_submit", { event_category: "lead", form, ...extra });
};

export const trackRebateEstimate = (extra: EventParams = {}) =>
{
  trackEvent("rebate_estimate", { event_category: "lead", ...extra });
  trackEvent("rebate_estimate_submit", { event_category: "lead", ...extra });
};

export const trackEmergencyCtaClick = (location: string) =>
  trackEvent("emergency_cta_click", { event_category: "engagement", location });
