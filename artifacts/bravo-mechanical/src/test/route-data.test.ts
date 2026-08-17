import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const priorityPaths = [
  "/services/ac-repair-westchester-county-ny",
  "/services/boiler-repair-westchester-county-ny",
  "/services/emergency-hvac-repair-westchester-county-ny",
  "/services/heat-pump-installation-westchester-county-ny",
];

const citiesSource = readFileSync(resolve(import.meta.dirname, "../lib/cities.ts"), "utf8");
const yonkersEnd = '    ],\n  },\n  "White Plains": {';

const buildRoutesWithCitiesSource = async (source: string) => {
  vi.resetModules();
  vi.doMock("node:fs/promises", async (importOriginal) => {
    const actual = await importOriginal<typeof import("node:fs/promises")>();
    return {
      ...actual,
      readFile: (file: string | URL, ...args: Parameters<typeof actual.readFile>) =>
        String(file).endsWith("src/lib/cities.ts")
          ? Promise.resolve(source)
          : actual.readFile(file, ...args),
    };
  });

  const { buildAllRoutes } = await import("../../scripts/route-data.mjs");
  return buildAllRoutes();
};

describe("city route data", () => {
  afterEach(() => {
    vi.doUnmock("node:fs/promises");
    vi.resetModules();
  });

  it("retains Yonkers choices when later city fields follow them", async () => {
    expect(citiesSource).toContain(yonkersEnd);
    const formattedSource = citiesSource.replace(
      yonkersEnd,
      '    ],\n    formatNote: "choices can be followed by later city fields",\n  },\n  "White Plains": {',
    ).replace(
      '      {\n        title: "Boiler and hydronic repair",\n        description: "Older steam and hot-water boiler systems need repair guidance matched to the existing equipment and distribution.",\n        href: "/services/boiler-repair-westchester-county-ny",\n      },',
      '      {\n        href: "/services/boiler-repair-westchester-county-ny",\n        description: "Older steam and hot-water boiler systems need repair guidance matched to the existing equipment and distribution.",\n        title: "Boiler and hydronic repair",\n      },',
    );

    const routes = await buildRoutesWithCitiesSource(formattedSource);
    const yonkers = routes.find((route) => route.path === "/service-areas/yonkers");

    const paths = yonkers?.city?.priorityServices.map((service: { href: string }) => service.href) || [];
    expect(paths).toHaveLength(priorityPaths.length);
    expect(paths).toEqual(expect.arrayContaining(priorityPaths));
  });

  it("rejects incomplete configured Yonkers choices", async () => {
    const incompleteSource = citiesSource.replace(
      '        href: "/services/heat-pump-installation-westchester-county-ny",',
      '        href: "/services/not-a-priority-path",',
    );

    await expect(buildRoutesWithCitiesSource(incompleteSource)).rejects.toThrow(
      "Yonkers priority service choices must include the four canonical priority paths",
    );
  });
});
