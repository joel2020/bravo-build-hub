import { describe, expect, it } from "vitest";
import {
  CITY_LANDING_CONTENT,
  SERVICE_CITY_LANDING_CONTENT,
  getCityLanding,
  getServiceCityLanding,
} from "@/lib/localLandingContent";
import { SERVICE_CONTENT } from "@/lib/serviceContent";
import { citySlug } from "@/lib/cities";
import { TOWNS } from "@/lib/site";

const normalizeForDuplication = (value: string, cityName: string) =>
  value
    .toLowerCase()
    .replaceAll(cityName.toLowerCase(), "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const expectUniqueNormalized = (values: { value: string; cityName: string }[]) => {
  const normalized = values.map(({ value, cityName }) => normalizeForDuplication(value, cityName));
  expect(new Set(normalized).size).toBe(normalized.length);
};

const OFFICIAL_SOURCE_HOSTS = new Set([
  "bedfordny.gov",
  "dos.ny.gov",
  "greenburghny.com",
  "mynewcastleny.gov",
  "ny.gov",
  "nyserda.ny.gov",
  "tax.ny.gov",
  "www.bedfordny.gov",
  "www.cpsc.gov",
  "www.greenburghny.com",
  "www.mynewcastleny.gov",
  "www.northcastleny.com",
  "www.ny.gov",
  "www.nyserda.ny.gov",
  "www.tax.ny.gov",
  "www.yonkersny.gov",
  "www.energy.gov",
  "www.energystar.gov",
  "www.epa.gov",
]);

const topCities = ["yonkers", "white-plains", "new-rochelle", "mount-vernon", "scarsdale"];
const services = ["hvac-installation", "hvac-repair", "preventive-maintenance", "indoor-air-quality"];

describe("local landing content inventory", () => {
  it("returns records by canonical route keys", () => {
    expect(getCityLanding("yonkers")?.name).toBe("Yonkers");
    expect(getServiceCityLanding("hvac-repair", "yonkers")?.h1).toBe("HVAC Repair in Yonkers, NY");
    expect(getServiceCityLanding("not-a-service", "yonkers")).toBeUndefined();
  });

  it("covers every existing service-city route exactly once", () => {
    const expected = topCities.flatMap((city) => services.map((service) => `${service}/${city}`)).sort();
    expect(Object.keys(SERVICE_CITY_LANDING_CONTENT).sort()).toEqual(expected);
    expect(expected).toHaveLength(20);
  });

  it("gives every service-city route distinct reviewed guidance", () => {
    for (const [key, page] of Object.entries(SERVICE_CITY_LANDING_CONTENT)) {
      expect(key).toBe(`${page.serviceSlug}/${page.citySlug}`);
      expect(page.h1).toContain(CITY_LANDING_CONTENT[page.citySlug].name);
      expect(page.metaTitle.length).toBeLessThanOrEqual(65);
      expect(page.metaDescription.length).toBeLessThanOrEqual(160);
      expect(page.localConsiderations.length).toBeGreaterThanOrEqual(2);
      expect(page.commonConcerns.length).toBeGreaterThanOrEqual(3);
      expect(page.serviceScope.length).toBeGreaterThanOrEqual(3);
      expect(page.safeChecks.length).toBeGreaterThanOrEqual(2);
      expect(page.professionalBoundaries.length).toBeGreaterThanOrEqual(2);
      expect(page.faqItems.length).toBeGreaterThanOrEqual(3);
      expect(page.sourceNotes.length).toBeGreaterThanOrEqual(1);
    }

    const pages = Object.values(SERVICE_CITY_LANDING_CONTENT);
    expectUniqueNormalized(pages.map((page) => ({ value: page.answerFirst, cityName: CITY_LANDING_CONTENT[page.citySlug].name })));
    expectUniqueNormalized(pages.flatMap((page) => page.localConsiderations.map((value) => ({ value, cityName: CITY_LANDING_CONTENT[page.citySlug].name }))));
    expectUniqueNormalized(pages.flatMap((page) => page.commonConcerns.map((value) => ({ value, cityName: CITY_LANDING_CONTENT[page.citySlug].name }))));
    expectUniqueNormalized(pages.flatMap((page) => page.faqItems.flatMap(({ q, a }) => [q, a].map((value) => ({ value, cityName: CITY_LANDING_CONTENT[page.citySlug].name })))));
  });

  it("links every service-city page to real parent and supporting routes", () => {
    const cityKeys = new Set(Object.keys(CITY_LANDING_CONTENT));
    for (const page of Object.values(SERVICE_CITY_LANDING_CONTENT)) {
      expect(cityKeys.has(page.citySlug)).toBe(true);
      expect(page.parentServicePath).toMatch(/^\/services\/[a-z0-9-]+$/);
      expect(page.relatedServiceSlugs).not.toContain(page.serviceSlug);
    }
  });

  it("uses official technical sources for service-city guidance", () => {
    for (const page of Object.values(SERVICE_CITY_LANDING_CONTENT)) {
      for (const source of page.sourceNotes) {
        expect(OFFICIAL_SOURCE_HOSTS.has(new URL(source.url).hostname)).toBe(true);
      }
    }
  });

  it("keeps reusable service copy conditional and free of unsupported promises", () => {
    const rendered = Object.values(SERVICE_CONTENT)
      .flatMap((service) => [
        service.metaDescription("Yonkers"),
        service.intro("Yonkers"),
        ...service.scope,
        ...service.signals,
        ...service.faqs("Yonkers").flatMap(({ q, a }) => [q, a]),
      ])
      .join(" ");

    expect(rendered).not.toMatch(/free quotes|manufacturer-trained|not subcontractors|manual j .*every install/i);
    expect(rendered).not.toMatch(/permits pulled|inspections coordinated|fixed pricing|take one day|2[–-]4 days/i);
    expect(rendered).not.toMatch(/12[–-]15\+|exceed 30%|15[–-]20 years|20[–-]30 years/i);
    expect(rendered).not.toMatch(/healthier|allergy and asthma-friendly|respiratory issues|(?:will|does|can) guarantee|guaranteed (?:results|savings|health|reliability)/i);
  });

  it("covers every existing city route exactly once", () => {
    const expected = TOWNS.map(citySlug).sort();
    expect(Object.keys(CITY_LANDING_CONTENT).sort()).toEqual(expected);
    expect(expected).toHaveLength(34);
  });

  it("gives every city route useful reviewed sections and sources", () => {
    for (const [slug, city] of Object.entries(CITY_LANDING_CONTENT)) {
      expect(city.slug).toBe(slug);
      expect(city.answerFirst).not.toMatch(/part of Westchester County/i);
      expect(city.localContext.length).toBeGreaterThanOrEqual(2);
      expect(city.commonConcerns.length).toBeGreaterThanOrEqual(3);
      expect(city.safeChecks.length).toBeGreaterThanOrEqual(2);
      expect(city.professionalBoundaries.length).toBeGreaterThanOrEqual(2);
      expect(city.faqItems.length).toBeGreaterThanOrEqual(3);
      expect(city.sourceNotes.length).toBeGreaterThanOrEqual(1);
      expect(city.reviewedAt).toMatch(/^2026-09-\d{2}$/);
      for (const source of city.sourceNotes) expect(new URL(source.url).protocol).toBe("https:");
    }
  });

  it("uses only existing cities in nearby-city links", () => {
    const cityKeys = new Set(Object.keys(CITY_LANDING_CONTENT));
    for (const city of Object.values(CITY_LANDING_CONTENT)) {
      expect(city.nearbyCitySlugs).not.toContain(city.slug);
      for (const slug of city.nearbyCitySlugs) expect(cityKeys.has(slug)).toBe(true);
    }
  });

  it("contains no blank editorial or source entries", () => {
    for (const city of Object.values(CITY_LANDING_CONTENT)) {
      const strings = [
        city.slug,
        city.name,
        city.region,
        city.title,
        city.metaDescription,
        city.answerFirst,
        city.reviewedAt,
        ...city.zips,
        ...city.neighborhoods,
        ...city.localContext,
        ...city.commonConcerns,
        ...city.safeChecks,
        ...city.professionalBoundaries,
        ...city.relatedGuideSlugs,
        ...city.nearbyCitySlugs,
        ...city.faqItems.flatMap(({ q, a }) => [q, a]),
        ...city.municipalResources.flatMap(({ label, url }) => [label, url]),
        ...city.sourceNotes.flatMap(({ label, url, supports }) => [label, url, supports]),
      ];
      for (const value of strings) expect(value.trim()).not.toBe("");
    }
  });

  it("does not reuse normalized local context, concerns, or FAQ copy across cities", () => {
    const cities = Object.values(CITY_LANDING_CONTENT);
    expectUniqueNormalized(cities.flatMap((city) => city.localContext.map((value) => ({ value, cityName: city.name }))));
    expectUniqueNormalized(cities.flatMap((city) => city.commonConcerns.map((value) => ({ value, cityName: city.name }))));
    expectUniqueNormalized(cities.flatMap((city) => city.faqItems.flatMap(({ q, a }) => [q, a].map((value) => ({ value, cityName: city.name })))));
  });

  it("uses only reviewed official government sources", () => {
    for (const city of Object.values(CITY_LANDING_CONTENT)) {
      for (const source of city.sourceNotes) {
        expect(OFFICIAL_SOURCE_HOSTS.has(new URL(source.url).hostname)).toBe(true);
      }
    }
    expect(getCityLanding("armonk")?.sourceNotes.map(({ url }) => url)).toContain(
      "https://www.northcastleny.com/DocumentCenter/View/291/Town-of-North-Castle-Hamlet-Design-Guidelines-PDF",
    );
  });
});
