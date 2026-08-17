import { beforeEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { LeadForm } from "@/components/LeadForm";
import BookOnline from "@/pages/BookOnline";
import CompanyFacts from "@/pages/CompanyFacts";
import Index from "@/pages/Index";
import { trackCallClick, trackLeadSubmit } from "@/lib/analytics";
import { getPriorityServiceAnswer } from "@/lib/priorityServiceAnswers";
import { SITE } from "@/lib/site";
// Build scripts are plain ESM and intentionally do not ship TypeScript declarations.
// @ts-expect-error test-only import of the real metadata generator
import { buildAllRoutes } from "../../scripts/route-data.mjs";

type GeneratedRoute = {
  path: string;
  title: string;
  description: string;
  city?: { intro?: string; housing?: string; climateNote?: string };
};

const renderInRouter = (node: React.ReactNode) => {
  const router = createMemoryRouter([{ path: "*", element: node }]);
  return renderToStaticMarkup(<RouterProvider router={router} />);
};

describe("SEO generation", () => {
  it.each([
    "ac-repair-westchester-county-ny",
    "boiler-repair-westchester-county-ny",
    "heat-pump-installation-westchester-county-ny",
    "emergency-hvac-repair-westchester-county-ny",
  ])("provides an answer-first module for %s", (slug) => {
    const content = getPriorityServiceAnswer(slug);
    expect(content?.answer.length).toBeGreaterThan(120);
    expect(content?.decisionFactors.length).toBeGreaterThanOrEqual(3);
    expect(content?.proofLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("renders canonical company identity from SITE on the facts page", () => {
    const html = renderInRouter(<CompanyFacts />);
    expect(html).toContain(SITE.legalName);
    expect(html).toContain(SITE.phone);
    expect(html).toContain(SITE.address.full);
    expect(html).toContain("Westchester County");
  });

  it("withholds evidence-required claims from shared and company-facts output", () => {
    const html = `${renderInRouter(<Footer />)}${renderInRouter(<CompanyFacts />)}`;
    expect(html).not.toMatch(/licensed|insured|license #8822|open 24|24\/7|5\.0|google rating|30\+ years|same-day|prevent breakdowns/i);
  });

  it("withholds uncited project provenance, brand, and performance claims from the homepage", () => {
    const html = renderInRouter(<Index />);
    expect(html).not.toMatch(/at a westchester property|recent installs and service jobs|before & after|roth|weil-mclain|mitsubishi\s|ao smith|savings|projected efficiency|written recommendation/i);
  });

  it("keeps every generated search snippet within its display budget", async () => {
    const routes = await buildAllRoutes() as GeneratedRoute[];
    expect(routes.filter((route) => route.title.length > 65)).toEqual([]);
    expect(routes.filter((route) => route.description.length > 160)).toEqual([]);
  });

  it("carries verified town-specific content into city prerenders", async () => {
    const routes = await buildAllRoutes() as GeneratedRoute[];
    const yonkers = routes.find((route) => route.path === "/service-areas/yonkers");
    expect(yonkers?.city?.intro).toContain("largest city in Westchester County");
    expect(yonkers?.city?.housing).toContain("steam or hot-water boilers");
    expect(yonkers?.city?.climateNote).toContain("humid summers");
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
    Object.assign(globalThis, { window: { dataLayer: [] } });
  });

  it("emits one canonical call event per click", () => {
    trackCallClick("header");
    expect(window.dataLayer).toEqual([
      { event: "call_click", event_category: "engagement", location: "header" },
    ]);
  });

  it("emits one canonical lead event per successful submission", () => {
    trackLeadSubmit("contact");
    expect(window.dataLayer).toEqual([
      { event: "lead_submit", event_category: "lead", form: "contact" },
    ]);
  });
});
