import { describe, expect, it } from "vitest";
import {
  CITY_LANDING_CONTENT,
  SERVICE_CITY_LANDING_CONTENT,
  getCityLanding,
  getServiceCityLanding,
} from "@/lib/localLandingContent";

describe("local landing content inventory", () => {
  it("returns records by canonical route keys", () => {
    expect(getCityLanding("yonkers")?.name).toBe("Yonkers");
    expect(Object.keys(CITY_LANDING_CONTENT)).toEqual(["yonkers"]);
    expect(Object.keys(SERVICE_CITY_LANDING_CONTENT)).toEqual([]);
    expect(getServiceCityLanding("not-a-service", "yonkers")).toBeUndefined();
  });
});
