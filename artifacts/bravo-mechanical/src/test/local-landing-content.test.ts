import { describe, expect, it } from "vitest";
import {
  CITY_LANDING_CONTENT,
  SERVICE_CITY_LANDING_CONTENT,
  getCityLanding,
  getServiceCityLanding,
} from "@/lib/localLandingContent";
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
]);

describe("local landing content inventory", () => {
  it("returns records by canonical route keys", () => {
    expect(getCityLanding("yonkers")?.name).toBe("Yonkers");
    expect(Object.keys(SERVICE_CITY_LANDING_CONTENT)).toEqual([]);
    expect(getServiceCityLanding("not-a-service", "yonkers")).toBeUndefined();
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
