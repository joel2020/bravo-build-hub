// Lightweight GA4 event helper. GA4 itself is loaded via index.html.
// Safe to call before gtag is ready — events queue into dataLayer.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

const pageContext = (): EventParams =>
  typeof window === "undefined" ? {} : { page_path: window.location?.pathname || "/" };

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  const payload = { ...pageContext(), ...params };
  window.dataLayer = window.dataLayer || [];
  // Push directly so events still queue if gtag.js hasn't loaded yet.
  window.dataLayer.push({ event: name, ...payload });
  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }
}

// Convenience wrappers for the four conversion events.
export const trackCallClick = (location: string, extra: EventParams = {}) =>
  trackEvent("call_click", { event_category: "engagement", location, ...extra });

export const trackSmsClick = (location: string) =>
  trackEvent("sms_click", { event_category: "engagement", location });

export const trackLeadSubmit = (form: string, extra: EventParams = {}) =>
  trackEvent("lead_submit", { event_category: "lead", form, ...extra });

export const trackBookingSubmit = (service: string) =>
  trackEvent("booking_submit", { event_category: "lead", service });

export const trackEmergencyCtaClick = (location: string) =>
  trackEvent("emergency_cta_click", { event_category: "engagement", location });


export const trackRequestServiceClick = (location: string, extra: EventParams = {}) =>
  trackEvent("request_service_click", { event_category: "lead", location, ...extra });
