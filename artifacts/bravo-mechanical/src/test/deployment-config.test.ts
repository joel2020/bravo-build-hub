import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type HeaderRule = {
  source: string;
  has?: Array<{ type: string; value: string }>;
  headers: Array<{ key: string; value: string }>;
};

const config = JSON.parse(
  readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
) as { headers?: HeaderRule[] };

const headerMap = (rule: HeaderRule | undefined) =>
  new Map(rule?.headers.map(({ key, value }) => [key.toLowerCase(), value]) ?? []);

describe("Vercel deployment configuration", () => {
  it("applies required security headers to every public route", () => {
    const globalHeaders = headerMap(
      config.headers?.find(
        ({ source, has }) => !has?.length && (source === "/(.*)" || source === "/:path*"),
      ),
    );

    expect(Object.fromEntries(globalHeaders)).toMatchObject({
      "referrer-policy": "strict-origin-when-cross-origin",
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
    });
  });

  it("gives fingerprinted assets an immutable one-year cache policy", () => {
    const assetHeaders = headerMap(
      config.headers?.find(({ source }) => source === "/assets/(.*)"),
    );

    expect(assetHeaders.get("cache-control")).toBe(
      "public, max-age=31536000, immutable",
    );
  });

  it("uses a root-inclusive wildcard for host-wide app noindex coverage", () => {
    const appHostRule = config.headers?.find(({ has }) =>
      has?.some(
        ({ type, value }) =>
          type === "host" && value === "app.bravomechanicalny.com",
      ),
    );

    expect(appHostRule).toMatchObject({
      source: "/(.*)",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    });
  });
});
