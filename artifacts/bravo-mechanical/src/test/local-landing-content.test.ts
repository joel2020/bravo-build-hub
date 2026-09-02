import { describe, expect, it } from "vitest";
import {
  CITY_LANDING_CONTENT,
  SERVICE_CITY_LANDING_CONTENT,
  getCityLanding,
  getServiceCityLanding,
} from "@/lib/localLandingContent";
import { citySlug } from "@/lib/cities";
import { TOWNS } from "@/lib/site";

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
});
