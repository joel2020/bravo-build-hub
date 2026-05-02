// Static map of post slug → imported cover image URL.
// Add a new entry when you add a new post with a cover.
import winterFurnacePrep from "@/assets/blog/winter-furnace-prep.jpg";
import nyHeatPumpRebates from "@/assets/blog/ny-heat-pump-rebates.jpg";
import boilerShortCycling from "@/assets/blog/boiler-short-cycling.jpg";
import hvacPermitsYonkers from "@/assets/blog/hvac-permits-yonkers.jpg";

export const BLOG_COVERS: Record<string, string> = {
  "winter-furnace-prep-westchester": winterFurnacePrep,
  "ny-heat-pump-rebates-2025": nyHeatPumpRebates,
  "why-is-my-boiler-short-cycling": boilerShortCycling,
  "hvac-permits-yonkers-guide": hvacPermitsYonkers,
};

export const getCoverForSlug = (slug: string): string | undefined => BLOG_COVERS[slug];
