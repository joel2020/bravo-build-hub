import { describe, expect, it } from "vitest";
import {
  APPROVED_SERVICE_AREAS,
  CITY_SERVICE_INTENTS,
  LOCAL_PAGE_SHARED_STRINGS,
  SERVICE_INTENT_PARENTS,
  approvedServiceAreaPlaces,
  buildCityPageSemantics,
  buildServiceCityPageSemantics,
  getCityServiceDestinations,
} from "@/lib/localPageModel";
import {
  CITY_LANDING_CONTENT,
  SERVICE_CITY_LANDING_CONTENT,
} from "@/lib/localLandingContent";
import { SITE } from "@/lib/site";

const EXPECTED_SERVICE_AREAS = [
  ["yonkers", "Yonkers"],
  ["white-plains", "White Plains"],
  ["new-rochelle", "New Rochelle"],
  ["mount-vernon", "Mount Vernon"],
  ["scarsdale", "Scarsdale"],
  ["rye", "Rye"],
  ["harrison", "Harrison"],
  ["mamaroneck", "Mamaroneck"],
  ["larchmont", "Larchmont"],
  ["bronxville", "Bronxville"],
  ["tuckahoe", "Tuckahoe"],
  ["eastchester", "Eastchester"],
  ["tarrytown", "Tarrytown"],
  ["sleepy-hollow", "Sleepy Hollow"],
  ["ossining", "Ossining"],
  ["peekskill", "Peekskill"],
  ["mount-kisco", "Mount Kisco"],
  ["chappaqua", "Chappaqua"],
  ["pleasantville", "Pleasantville"],
  ["pound-ridge", "Pound Ridge"],
  ["bedford", "Bedford"],
  ["katonah", "Katonah"],
  ["armonk", "Armonk"],
  ["hastings-on-hudson", "Hastings-on-Hudson"],
  ["dobbs-ferry", "Dobbs Ferry"],
  ["irvington", "Irvington"],
  ["briarcliff-manor", "Briarcliff Manor"],
  ["croton-on-hudson", "Croton-on-Hudson"],
  ["yorktown", "Yorktown"],
  ["somers", "Somers"],
  ["ardsley", "Ardsley"],
  ["hartsdale", "Hartsdale"],
  ["pelham", "Pelham"],
  ["port-chester", "Port Chester"],
] as const;

describe("local-page business model", () => {
  it("keeps the approved 34 service areas in one explicit slug/name inventory", () => {
    expect(APPROVED_SERVICE_AREAS.map(({ slug, name }) => [slug, name])).toEqual(
      EXPECTED_SERVICE_AREAS,
    );
  });

  it("maps generic installation and repair intent to the broad services hub", () => {
    expect(SERVICE_INTENT_PARENTS["hvac-installation"]).toEqual({
      path: "/services",
      breadcrumbLabel: "HVAC Services",
      linkLabel: "All HVAC services in Westchester",
    });
    expect(SERVICE_INTENT_PARENTS["hvac-repair"]).toEqual({
      path: "/services",
      breadcrumbLabel: "HVAC Services",
      linkLabel: "All HVAC services in Westchester",
    });
  });

  it("builds exactly six truthful fallback destinations for a city without service-city pages", () => {
    const destinations = getCityServiceDestinations(
      { slug: "hartsdale", name: "Hartsdale" },
      [],
    );

    expect(destinations.map(({ serviceSlug, path, label }) => ({ serviceSlug, path, label }))).toEqual([
      { serviceSlug: "hvac-installation", path: "/services", label: "HVAC Installation: browse all HVAC services →" },
      { serviceSlug: "hvac-repair", path: "/services", label: "HVAC Repair: browse all HVAC services →" },
      { serviceSlug: "preventive-maintenance", path: "/services/hvac-maintenance-westchester-county-ny", label: "HVAC Maintenance in Westchester →" },
      { serviceSlug: "indoor-air-quality", path: "/services/indoor-air-quality-westchester-county-ny", label: "Indoor Air Quality Services in Westchester →" },
      { serviceSlug: "residential", path: "/services", label: "Residential HVAC: browse all HVAC services →" },
      { serviceSlug: "commercial", path: "/services/commercial-hvac-westchester-county-ny", label: "Commercial HVAC in Westchester →" },
    ]);
    expect(CITY_SERVICE_INTENTS).toHaveLength(6);
  });

  it("uses published service-city destinations without changing the two hub fallbacks", () => {
    const city = CITY_LANDING_CONTENT.yonkers;
    const published = Object.values(SERVICE_CITY_LANDING_CONTENT).filter(
      (page) => page.citySlug === city.slug,
    );
    const destinations = getCityServiceDestinations(city, published);

    expect(destinations.map(({ path }) => path)).toEqual([
      "/services/hvac-installation/yonkers",
      "/services/hvac-repair/yonkers",
      "/services/preventive-maintenance/yonkers",
      "/services/indoor-air-quality/yonkers",
      "/services",
      "/services/commercial-hvac-westchester-county-ny",
    ]);
  });

  it("builds exact shared city and service-city semantics with Place area types", () => {
    const city = CITY_LANDING_CONTENT.yonkers;
    const citySemantics = buildCityPageSemantics(city, SITE.siteUrl);
    expect(citySemantics.h1).toBe("HVAC Services in Yonkers, NY");
    expect(citySemantics.service.areaServed).toEqual({
      "@type": "Place",
      name: "Yonkers, NY",
    });
    expect(citySemantics.faq.mainEntity).toHaveLength(city.faqItems.length);

    const landing = SERVICE_CITY_LANDING_CONTENT["hvac-repair/yonkers"];
    const serviceSemantics = buildServiceCityPageSemantics(
      landing,
      city,
      SITE.siteUrl,
    );
    expect(serviceSemantics.h1).toBe(landing.h1);
    expect(serviceSemantics.service.name).toBe(landing.h1);
    expect(serviceSemantics.service.areaServed).toEqual({
      "@type": "Place",
      name: "Yonkers, NY",
    });
    expect(serviceSemantics.breadcrumb.itemListElement).toHaveLength(3);
    expect(serviceSemantics.breadcrumb.itemListElement[1]).toMatchObject({
      name: "HVAC Services",
      item: `${SITE.siteUrl}/services`,
    });

    const maintenance = SERVICE_CITY_LANDING_CONTENT["preventive-maintenance/yonkers"];
    const maintenanceSemantics = buildServiceCityPageSemantics(maintenance, city, SITE.siteUrl);
    expect(maintenanceSemantics.breadcrumb.itemListElement).toHaveLength(4);
    expect(maintenanceSemantics.breadcrumb.itemListElement[2]).toMatchObject({
      name: "HVAC Maintenance",
      item: `${SITE.siteUrl}/services/hvac-maintenance-westchester-county-ny`,
    });
  });

  it("keeps shared local-page copy neutral and scoped to the approved inventory", () => {
    const copy = LOCAL_PAGE_SHARED_STRINGS.join(" ");
    expect(copy).not.toMatch(/healthier indoor environments?/i);
    expect(copy).not.toMatch(/(?:serve|cover|serving) all of Westchester County/i);
    expect(copy).toContain("34 listed communities");
  });

  it("represents broad service coverage as the approved places, not the whole county", () => {
    expect(approvedServiceAreaPlaces()).toHaveLength(34);
    expect(approvedServiceAreaPlaces()).toEqual(
      APPROVED_SERVICE_AREAS.map(({ name }) => ({ "@type": "Place", name: `${name}, NY` })),
    );
  });
});
