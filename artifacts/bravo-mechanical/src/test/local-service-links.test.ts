import { describe, expect, it } from "vitest";
import { SERVICE_CITY_LANDING_CONTENT } from "@/lib/localLandingContent";
import { LOCAL_SERVICE_LINKS } from "@/generated/localServiceLinks";

describe("compact local-service reverse-link index", () => {
  it("matches every published service-city record without carrying editorial copy", () => {
    const expected = Object.values(SERVICE_CITY_LANDING_CONTENT)
      .map((page) => ({
        parentServicePath: page.parentServicePath,
        path: `/services/${page.serviceSlug}/${page.citySlug}`,
        label: page.h1.replace(", NY", ""),
      }))
      .sort((a, b) => a.path.localeCompare(b.path));

    expect([...LOCAL_SERVICE_LINKS].sort((a, b) => a.path.localeCompare(b.path))).toEqual(expected);
    expect(LOCAL_SERVICE_LINKS).toHaveLength(20);
    expect(Object.keys(LOCAL_SERVICE_LINKS[0]).sort()).toEqual([
      "label",
      "parentServicePath",
      "path",
    ]);
  });
});
