// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  CITY_LANDING_CONTENT,
  SERVICE_CITY_LANDING_CONTENT,
} from "@/lib/localLandingContent";
import {
  buildCityPageSemantics,
  buildServiceCityPageSemantics,
  getCityServiceDestinations,
  localPageSchemaArray,
} from "@/lib/localPageModel";
import { SITE } from "@/lib/site";
import CityPage from "@/pages/CityPage";
import ServiceCityPage from "@/pages/ServiceCityPage";

function renderRoute(element: React.ReactNode, path: string, routePath: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

async function renderedSchemas() {
  await waitFor(() => {
    expect(document.head.querySelector('script[data-seo-route="true"]')).not.toBeNull();
  });
  const script = document.head.querySelector<HTMLScriptElement>(
    'script[data-seo-route="true"]',
  );
  return JSON.parse(script?.textContent ?? "[]") as Record<string, unknown>[];
}

describe("React local-page semantic parity", () => {
  afterEach(() => cleanup());

  it("renders the shared H1, schemas, and six service destinations for all 34 city routes", async () => {
    const published = Object.values(SERVICE_CITY_LANDING_CONTENT);

    for (const city of Object.values(CITY_LANDING_CONTENT)) {
      renderRoute(
        <CityPage />,
        `/service-areas/${city.slug}`,
        "/service-areas/:slug",
      );

      const semantics = buildCityPageSemantics(city, SITE.siteUrl);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        semantics.h1,
      );
      expect(await renderedSchemas()).toEqual(localPageSchemaArray(semantics));

      const serviceHeading = screen.getByRole("heading", {
        name: `HVAC service pages for ${city.name}`,
      });
      const section = serviceHeading.closest("section");
      expect(section).not.toBeNull();
      const actualLinks = within(section as HTMLElement)
        .getAllByRole("link")
        .map((link) => ({
          path: link.getAttribute("href"),
          label: link.textContent?.trim(),
        }));
      const expectedLinks = getCityServiceDestinations(city, published).map(
        ({ path, label }) => ({ path, label }),
      );
      expect(actualLinks).toEqual(expectedLinks);

      const faqHeading = screen.getByRole("heading", {
        name: `${city.name} HVAC questions, answered`,
      });
      const faqSection = faqHeading.closest("section");
      expect(faqSection).not.toBeNull();
      expect(
        within(faqSection as HTMLElement)
          .getAllByRole("button")
          .map((button) => button.textContent?.trim()),
      ).toEqual(city.faqItems.map((faq) => faq.q));

      cleanup();
    }
  });

  it("renders the shared H1, parent, and schemas for all 20 service-city routes", async () => {
    for (const landing of Object.values(SERVICE_CITY_LANDING_CONTENT)) {
      const city = CITY_LANDING_CONTENT[landing.citySlug];
      renderRoute(
        <ServiceCityPage />,
        `/services/${landing.serviceSlug}/${landing.citySlug}`,
        "/services/:serviceSlug/:citySlug",
      );

      const semantics = buildServiceCityPageSemantics(
        landing,
        city,
        SITE.siteUrl,
      );
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        semantics.h1,
      );
      expect(await renderedSchemas()).toEqual(localPageSchemaArray(semantics));
      const parentLink = screen.getByRole("link", {
        name: semantics.parent.linkLabel,
      });
      expect(parentLink.getAttribute("href")).toBe(semantics.parent.path);

      const faqHeading = screen.getByRole("heading", {
        name: `${landing.serviceTitle} in ${city.name} — common questions`,
      });
      const faqSection = faqHeading.closest("section");
      expect(faqSection).not.toBeNull();
      expect(
        within(faqSection as HTMLElement)
          .getAllByRole("button")
          .map((button) => button.textContent?.trim()),
      ).toEqual(landing.faqItems.map((faq) => faq.q));

      cleanup();
    }
  });

  it("does not render an unsupported all-county or indoor-health claim on a local page", () => {
    renderRoute(
      <CityPage />,
      "/service-areas/hartsdale",
      "/service-areas/:slug",
    );

    expect(document.body.textContent).not.toMatch(
      /(?:serve|serves|serving|cover|covers|covering) all of Westchester County/i,
    );
    expect(document.body.textContent).not.toMatch(/healthier indoor environments?/i);
  });
});
