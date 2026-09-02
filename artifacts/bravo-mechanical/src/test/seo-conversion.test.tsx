import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { LeadForm } from "@/components/LeadForm";
import BookOnline from "@/pages/BookOnline";
import { trackCallClick, trackEvent, trackLeadSubmit, trackPageView } from "@/lib/analytics";
import { formatBlogDate } from "@/lib/blog";
// Build scripts are plain ESM and intentionally do not ship TypeScript declarations.
// @ts-expect-error test-only import of the real metadata generator
import { buildAllRoutes } from "../../scripts/route-data.mjs";

type GeneratedRoute = {
  path: string;
  title: string;
  description: string;
  canonical?: string;
  localContent?: {
    answerFirst: string;
    safeChecks: string[];
    professionalBoundaries: string[];
    faqItems: { q: string; a: string }[];
  };
};

const renderInRouter = (node: React.ReactNode) => {
  const router = createMemoryRouter([{ path: "*", element: node }]);
  return renderToStaticMarkup(<RouterProvider router={router} />);
};

describe("SEO generation", () => {
  it("renders frontmatter dates without shifting to the prior local day", () => {
    expect(formatBlogDate("2026-08-24")).toBe("August 24, 2026");
  });

  it("keeps every generated search snippet within its display budget", async () => {
    const routes = await buildAllRoutes() as GeneratedRoute[];
    expect(routes.filter((route) => route.title.length > 65)).toEqual([]);
    expect(routes.filter((route) => route.description.length > 160)).toEqual([]);
  });

  it("carries reviewed local content into city and service-city routes", async () => {
    const routes = await buildAllRoutes() as GeneratedRoute[];
    for (const path of ["/service-areas/yonkers", "/services/hvac-repair/yonkers"]) {
      const route = routes.find((candidate) => candidate.path === path);
      expect(route?.localContent?.answerFirst.length).toBeGreaterThan(80);
      expect(route?.localContent?.safeChecks.length).toBeGreaterThanOrEqual(2);
      expect(route?.localContent?.professionalBoundaries.length).toBeGreaterThanOrEqual(2);
      expect(route?.localContent?.faqItems.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("does not publish redirected or noncanonical routes", async () => {
    const routes = await buildAllRoutes() as GeneratedRoute[];
    const paths = routes.map((route) => route.path);
    expect(paths).not.toContain("/emergency-hvac-westchester");
    expect(paths).not.toContain("/blog/ac-not-cooling-westchester");
    expect(paths).not.toContain("/services/heat-pumps");
    expect(routes.filter((route) => route.canonical && route.canonical !== route.path)).toEqual([]);
  });
});

describe("lead conversion semantics", () => {
  it("renders the estimate request as an autofill-friendly required form", () => {
    const html = renderInRouter(<LeadForm />);
    expect(html).toContain('name="name"');
    expect(html).toContain('autoComplete="name"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('autoComplete="tel"');
    expect(html).toContain('name="email"');
    expect(html).toContain('autoComplete="email"');
    expect(html).toContain('name="message"');
    expect(html).toContain('name="consent"');
    expect(html.match(/required=""/g)?.length).toBeGreaterThanOrEqual(6);
  });

  it("renders online booking as a semantic form with actionable validation", () => {
    const html = renderInRouter(<BookOnline />);
    expect(html).toContain("<form");
    expect(html).toContain('name="name"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('<fieldset');
    expect(html).toContain('<legend');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('type="submit"');
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Book My Visit/);
  });
});

describe("sitewide accessibility", () => {
  it("uses sequential footer headings and readable legal text", () => {
    const html = renderInRouter(<Footer />);
    expect(html).toContain("<h2");
    expect(html).not.toContain("<h3");
    expect(html).toContain("text-primary-foreground/90");
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/blog"');
    expect(html).toContain("About Bravo");
    expect(html).toContain("HVAC Resources");
  });

  it("keeps sticky CTA accessible names aligned with visible labels", () => {
    const html = renderInRouter(<StickyMobileCTA />);
    expect(html).toContain('aria-label="Call Now"');
    expect(html).toContain('aria-label="Text Us"');
  });
});

describe("conversion analytics", () => {
  beforeEach(() => {
    Object.assign(globalThis, { window: { dataLayer: [], location: { pathname: "/services/ac-repair-westchester-county-ny", search: "?email=customer@example.com", hash: "#private" } } });
  });

  it("emits one canonical call event per click", () => {
    trackCallClick("header");
    expect(window.dataLayer).toEqual([
      { event: "call_click", page_path: "/services/ac-repair-westchester-county-ny", page_location: "https://www.bravomechanicalny.com/services/ac-repair-westchester-county-ny", page_referrer: "", event_category: "engagement", location: "header" },
    ]);
  });

  it("emits one canonical lead event per successful submission", () => {
    trackLeadSubmit("contact");
    expect(window.dataLayer).toEqual([
      { event: "lead_submit", page_path: "/services/ac-repair-westchester-county-ny", page_location: "https://www.bravomechanicalny.com/services/ac-repair-westchester-county-ny", page_referrer: "", event_category: "lead", form: "contact" },
    ]);
  });

  it("strips PII, click identifiers, full URLs, and long messages", () => {
    trackEvent("privacy_check", {
      location: "contact_form",
      email: "customer@example.com",
      phone: "914-555-0100",
      message: "Please call me",
      referrer: "https://example.com/customer?id=123",
      landing_url: "https://www.bravomechanicalny.com/contact?gclid=secret",
      gclid: "secret",
      service: "boiler_repair",
    });
    expect(window.dataLayer).toEqual([
      {
        event: "privacy_check",
        page_path: "/services/ac-repair-westchester-county-ny",
        page_location: "https://www.bravomechanicalny.com/services/ac-repair-westchester-county-ny",
        page_referrer: "",
        location: "contact_form",
        service: "boiler_repair",
      },
    ]);
  });

  it("queues exactly one sanitized event when gtag is initialized", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    trackCallClick("footer");
    expect(window.dataLayer).toEqual([]);
    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith("event", "call_click", {
      page_path: "/services/ac-repair-westchester-county-ny",
      page_location: "https://www.bravomechanicalny.com/services/ac-repair-westchester-county-ny",
      page_referrer: "",
      event_category: "engagement",
      location: "footer",
    });
  });

  it("does not send private proposal, admin, or auth paths", () => {
    for (const pathname of ["/proposal/private-bearer-token", "/admin/crm", "/auth"]) {
      Object.assign(window.location, { pathname, search: "?email=customer@example.com" });
      window.dataLayer = [];
      trackPageView();
      trackCallClick("private_route");
      expect(window.dataLayer).toEqual([]);
    }
  });
});
