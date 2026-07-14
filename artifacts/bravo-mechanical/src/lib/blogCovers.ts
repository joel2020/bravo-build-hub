// Static map of post slug → imported cover image URL.
// Add a new entry when you add a new post with a cover.
import winterFurnacePrep from "@/assets/blog/winter-furnace-prep.jpg";
import nyHeatPumpRebates from "@/assets/blog/ny-heat-pump-rebates.jpg";
import boilerShortCycling from "@/assets/blog/boiler-short-cycling.jpg";
import hvacPermitsYonkers from "@/assets/blog/hvac-permits-yonkers.jpg";
import r410aPhaseOut from "@/assets/blog/r410a-phase-out.svg";
import centralAcCost from "@/assets/blog/central-ac-cost.svg";
import acSizing from "@/assets/blog/ac-sizing.svg";
import highAcBill from "@/assets/blog/high-ac-bill.svg";
import jobWaterHeater from "@/assets/job-water-heater.webp";
import jobMitsubishi from "@/assets/job-mitsubishi-install.webp";
import jobRadiator from "@/assets/job-radiator-repair.webp";

export const BLOG_COVERS: Record<string, string> = {
  "winter-furnace-prep-westchester": winterFurnacePrep,
  "ny-heat-pump-rebates-2025": nyHeatPumpRebates,
  "why-is-my-boiler-short-cycling": boilerShortCycling,
  "hvac-permits-yonkers-guide": hvacPermitsYonkers,
  // New 2026 AC-season posts
  "ny-heat-pump-rebates-2026": nyHeatPumpRebates,
  "r410a-phase-out-2026-westchester": r410aPhaseOut,
  "central-ac-replacement-cost-westchester": centralAcCost,
  "what-size-central-ac-westchester": acSizing,
  "why-is-my-ac-bill-so-high-westchester": highAcBill,
  // July 2026 summer/troubleshooting series
  "ac-not-cooling-westchester": highAcBill,
  "ac-repair-cost-westchester": centralAcCost,
  "ac-freezing-up-westchester": r410aPhaseOut,
  "hot-upstairs-cold-downstairs-westchester": acSizing,
  "water-heater-leaking-what-to-do": jobWaterHeater,
  "mini-split-vs-window-ac-westchester": jobMitsubishi,
  "hvac-maintenance-checklist-westchester": winterFurnacePrep,
  "boiler-banging-noises-westchester": jobRadiator,
  "mini-split-permit-reconciliation-westchester": hvacPermitsYonkers,
};

export const getCoverForSlug = (slug: string): string | undefined => BLOG_COVERS[slug];
