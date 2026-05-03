import { Router, type IRouter } from "express";
import { CITATION_SEED } from "../lib/citations-seed";
import {
  getCitations,
  updateCitations,
  type CitationStatus,
  type CitationRecord,
} from "../lib/citations-storage";
import { fetchHtml } from "../lib/backlink-scanner";
import { BRAVO } from "../lib/site-config";
import { batchProcess } from "@workspace/integrations-anthropic-ai/batch";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function nowIso(): string { return new Date().toISOString(); }

/** The copy/paste-ready NAP + business package the user pastes into every signup form. */
function buildNapPackage() {
  const services = [
    "Furnace installation & repair",
    "Boiler installation & repair",
    "Central air conditioning installation & service",
    "Heat pump installation",
    "Ductless mini-split installation",
    "24/7 emergency HVAC dispatch",
    "Annual maintenance plans",
    "Indoor air quality solutions",
  ];
  const categories = [
    "HVAC contractor",
    "Heating contractor",
    "Air conditioning contractor",
    "Furnace repair service",
  ];
  const shortDescription = `${BRAVO.brand} is a licensed and insured HVAC contractor serving Westchester County, NY. Furnace, boiler, central AC, heat pump, and ductless mini-split installation, repair, and 24/7 emergency service.`;
  const longDescription = `${BRAVO.brand} is a family-owned, fully licensed and insured HVAC contractor serving 30+ municipalities across Westchester County, NY. We install, service, and repair furnaces, boilers, central air conditioning, heat pumps, and ductless mini-split systems for residential and light-commercial customers. Our technicians are NATE-certified and on-call 24/7 for emergency dispatch. We're proud of our 5.0-star Google rating and stand behind every installation with a written warranty. Free estimates on system replacements. Call ${BRAVO.phone} or visit ${BRAVO.siteUrl}.`;

  return {
    businessName: BRAVO.brand,
    legalName: BRAVO.legalName,
    phone: BRAVO.phone,
    email: BRAVO.email,
    website: BRAVO.siteUrl,
    serviceArea: BRAVO.area,
    serviceAreaList: [
      "Yonkers", "White Plains", "New Rochelle", "Mount Vernon",
      "Bronxville", "Tarrytown", "Sleepy Hollow", "Mount Kisco",
      "Katonah", "Ossining", "Peekskill", "Pleasantville",
      "Rye", "Mamaroneck", "Larchmont", "Armonk",
      "Yorktown", "Scarsdale", "Eastchester", "Hartsdale",
    ],
    /** Service-area business: no public street address. */
    addressType: "service-area-business" as const,
    hours: {
      monday: "Open 24 hours (24/7 emergency dispatch)",
      tuesday: "Open 24 hours (24/7 emergency dispatch)",
      wednesday: "Open 24 hours (24/7 emergency dispatch)",
      thursday: "Open 24 hours (24/7 emergency dispatch)",
      friday: "Open 24 hours (24/7 emergency dispatch)",
      saturday: "Open 24 hours (24/7 emergency dispatch)",
      sunday: "Open 24 hours (24/7 emergency dispatch)",
    },
    categories,
    services,
    shortDescription,
    longDescription,
    yearFounded: undefined as number | undefined,
    paymentMethods: ["Cash", "Check", "Credit card", "Financing available"],
    licenses: ["NY State licensed HVAC contractor", "Fully insured"],
    socialProfiles: {
      facebook: "",
      instagram: "",
      linkedin: "",
    },
    logoSuggestion: `${BRAVO.siteUrl}/logo.png`,
    keywords: [
      "HVAC Westchester County",
      "furnace repair Westchester",
      "boiler installation Westchester",
      "AC repair Westchester",
      "heat pump installation NY",
      "ductless mini-split Westchester",
      "24/7 emergency HVAC",
    ],
  };
}

router.get("/citations/data", async (_req, res) => {
  const records = await getCitations();
  const recordById = new Map(records.map((r) => [r.id, r]));
  const merged = CITATION_SEED.map((seed) => {
    const r = recordById.get(seed.id);
    return {
      ...seed,
      record: r ?? { id: seed.id, status: "not-started" as CitationStatus },
    };
  }).sort((a, b) => a.priority - b.priority);
  res.json({ sites: merged, nap: buildNapPackage() });
});

router.post("/citations/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, publicUrl, notes } = req.body as {
    status?: CitationStatus;
    publicUrl?: string;
    notes?: string;
  };
  const allowed: CitationStatus[] = [
    "not-started","in-progress","claimed","verified","live","skipped","needs-update",
  ];
  if (!status || !allowed.includes(status)) {
    res.status(400).json({ error: "invalid status" });
    return;
  }
  if (!CITATION_SEED.find((s) => s.id === id)) {
    res.status(404).json({ error: "unknown citation site" });
    return;
  }
  let updated: CitationRecord | undefined;
  await updateCitations((items) => {
    let r = items.find((x) => x.id === id);
    if (!r) {
      r = { id, status };
      items.push(r);
    }
    r.status = status;
    if (typeof publicUrl === "string") r.publicUrl = publicUrl || undefined;
    if (typeof notes === "string") r.notes = notes;
    const at = nowIso();
    if (status === "claimed" && !r.claimedAt) r.claimedAt = at;
    if (status === "verified" && !r.verifiedAt) r.verifiedAt = at;
    if (status === "live" && !r.liveAt) r.liveAt = at;
    updated = r;
    return items;
  });
  res.json(updated);
});

/** Detect whether the brand is already listed on each citation site by
 *  fetching its search-results page and looking for the brand + phone. */
let citationScanRunning = false;
router.post("/citations/scan", async (_req, res) => {
  if (citationScanRunning) {
    res.json({ message: "Citation scan already in progress" });
    return;
  }
  citationScanRunning = true;
  res.json({ message: "Citation scan started" });
  void runCitationScan()
    .catch((err) => logger.error({ err }, "Citation scan failed"))
    .finally(() => { citationScanRunning = false; });
});

async function runCitationScan(): Promise<void> {
  const phoneDigits = BRAVO.phone.replace(/\D/g, "");
  const phoneTail = phoneDigits.slice(-7);
  const brandPattern = new RegExp(BRAVO.brand.replace(/\s+/g, "\\s+"), "i");

  const results = await batchProcess(
    CITATION_SEED,
    async (site) => {
      const q = encodeURIComponent(BRAVO.brand);
      const url = site.searchUrlTemplate.replace("{q}", q);
      const html = await fetchHtml(url, 10000);
      let detected = false;
      if (html) {
        const lower = html.toLowerCase();
        const brandHit = brandPattern.test(html);
        const phoneHit = phoneTail.length >= 7 && lower.includes(phoneTail);
        detected = brandHit || phoneHit;
      }
      return { id: site.id, detected, at: nowIso() };
    },
    { concurrency: 4, retries: 1 },
  );
  await updateCitations((items) => {
    const map = new Map(items.map((r) => [r.id, r]));
    for (const r of results) {
      let rec = map.get(r.id);
      if (!rec) { rec = { id: r.id, status: "not-started" }; map.set(r.id, rec); }
      rec.detected = r.detected;
      rec.lastCheckedAt = r.at;
      // If we detected it but it's still marked not-started, advance to claimed
      if (r.detected && rec.status === "not-started") rec.status = "claimed";
    }
    return Array.from(map.values());
  });
}

export default router;
