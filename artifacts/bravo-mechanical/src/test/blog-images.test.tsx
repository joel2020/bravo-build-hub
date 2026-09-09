// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { getAllPosts } from "@/lib/blog";
import { useSeo } from "@/lib/seo";
// @ts-expect-error Build-time JavaScript catalog has no declaration file.
import { buildAllRoutes } from "../../scripts/route-data.mjs";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
});

describe("blog image SEO", () => {
  it("keeps build-time image data aligned with client frontmatter", async () => {
    const posts = getAllPosts().filter((post) => post.cover?.startsWith("/images/blog/"));
    expect(posts.map((post) => post.slug)).toEqual(expect.arrayContaining([
      "boiler-repair-vs-replacement-westchester",
      "heat-pump-estimate-checklist-westchester",
      "merv-8-11-13-air-filter-westchester",
      "boiler-tune-up-checklist-westchester",
      "furnace-smells-like-burning-westchester",
      "why-is-my-ac-not-cooling-westchester",
      "hvac-warranty-guide-westchester",
      "garage-heating-ossining",
      "old-house-hvac-irvington",
    ]));
    const routes = await buildAllRoutes();
    for (const post of posts) {
      const route = routes.find((candidate: { path: string }) => candidate.path === `/blog/${post.slug}`);
      expect(route.post.cover).toBe(post.cover);
      expect(route.post.coverSmall).toBe(post.coverSmall);
      expect(route.post.coverAlt).toBe(post.coverAlt);
      expect(route.post.coverWidth).toBe(1600);
      expect(route.post.coverHeight).toBe(900);
      expect(post.coverCaption).toContain("illustration");
    }
  });

  it("updates image descriptions on navigation and clears missing details", () => {
    const initialProps = {
      title: "Guide", description: "A homeowner guide", image: "https://www.bravomechanicalny.com/images/blog/boiler.webp",
      imageAlt: "Boiler illustration", imageWidth: 1600, imageHeight: 900,
    };
    const { rerender } = renderHook((props) => useSeo(props), { initialProps });
    const content = (selector: string) => document.head.querySelector(selector)?.getAttribute("content");
    expect(content('meta[property="og:image:alt"]')).toBe("Boiler illustration");
    expect(content('meta[property="og:image:width"]')).toBe("1600");
    expect(content('meta[name="robots"]')).toContain("max-image-preview:large");
    rerender({ ...initialProps, imageAlt: "Filter illustration" });
    expect(content('meta[name="twitter:image:alt"]')).toBe("Filter illustration");
    rerender({ ...initialProps, imageAlt: "", imageWidth: 0, imageHeight: 0 });
    expect(content('meta[property="og:image:alt"]')).toBeUndefined();
    expect(content('meta[property="og:image:width"]')).toBeUndefined();
  });

  it("preserves private-page noindex when image previews are enabled", () => {
    renderHook(() => useSeo({ title: "Private", description: "Private", noindex: true }));
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex, nofollow");
  });
});
