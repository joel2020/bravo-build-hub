# Bravo Mechanical Local Search Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace thin or repetitive local-page output with 34 useful city hubs and 20 distinct service-city pages that share one reviewed content source across React and crawler-visible HTML.

**Architecture:** Store reviewed local copy, sources, FAQs, relationships, and safety guidance in one typed JSON-backed content model. React pages and the static SEO generator consume the same records, while a dedicated quality audit rejects missing routes, unsupported claims, weak internal-link relationships, and near-duplicate local copy.

**Tech Stack:** React 18, TypeScript, Vite, React Router, Node.js ESM build scripts, Vitest, static route generation, JSON-LD, pnpm workspace commands.

## Global Constraints

- Keep all 34 existing city routes and all 20 existing service-city routes canonical, indexable, and in the sitemap.
- Do not create additional city or service-city routes during this phase.
- Do not fabricate prices, promotions, licenses, certifications, brands, warranties, financing terms, availability, response times, permit handling, project results, customer facts, or service-area claims.
- Use official municipal, county, New York State, federal, or primary manufacturer sources for material local or technical claims.
- Distinguish safe homeowner observations from electrical, fuel-gas, combustion, refrigerant, pressure, and equipment-opening work that requires a qualified professional.
- Prefer real Bravo images with documented permission; this phase does not generate or publish new imagery.
- Use one primary intent per page and do not publish city-name-swapped copy.
- Render the same reviewed content for users and non-JavaScript crawlers.
- Preserve unrelated user changes and untracked files.
- Do not request bulk indexing, resubmit the sitemap, change Google Business Profile or GA4, or merge branches.
- Production promotion requires an explicit user approval after the exact preview passes all gates.

## Current Route Inventory

City pages: Yonkers, White Plains, New Rochelle, Mount Vernon, Scarsdale, Rye, Harrison, Mamaroneck, Larchmont, Bronxville, Tuckahoe, Eastchester, Tarrytown, Sleepy Hollow, Ossining, Peekskill, Mount Kisco, Chappaqua, Pleasantville, Pound Ridge, Bedford, Katonah, Armonk, Hastings-on-Hudson, Dobbs Ferry, Irvington, Briarcliff Manor, Croton-on-Hudson, Yorktown, Somers, Ardsley, Hartsdale, Pelham, and Port Chester.

Service-city pages: HVAC installation, HVAC repair, preventive maintenance, and indoor air quality for Yonkers, White Plains, New Rochelle, Mount Vernon, and Scarsdale.

## File Structure

- Create `src/content/localLandingPages.json`: reviewed content and source records for every city and service-city route.
- Create `src/lib/localLandingContent.ts`: TypeScript types and lookup helpers for the JSON data.
- Create `scripts/local-landing-content.mjs`: Node loader, structural validation, unsafe-claim scan, and similarity audit shared by build-time checks.
- Create `src/test/local-landing-content.test.ts`: unit and contract coverage for the complete content inventory.
- Modify `src/lib/cities.ts`: derive city records from the reviewed content model and remove the old duplicated city narrative/fallback copy.
- Modify `src/lib/serviceContent.ts`: remove unsupported reusable claims and retain only safe service taxonomy used outside service-city content.
- Modify `src/lib/serviceCityCombos.ts`: derive combo routes from the reviewed service-city inventory.
- Modify `src/pages/CityPage.tsx`: render reviewed city sections and remove `TOP_CITY_NOTES`.
- Modify `src/pages/ServiceCityPage.tsx`: render page-specific service-city content and links.
- Modify `src/pages/HighIntentServicePage.tsx`: link applicable parent services back to their five service-city pages.
- Modify `scripts/route-data.mjs`: read the shared JSON data rather than scraping local copy out of TypeScript source.
- Modify `scripts/inject-head-metadata.mjs`: prerender the full reviewed city and service-city content and deliberate link graph.
- Modify `scripts/generate-sitemap.mjs`: retain current route generation; change only if the new route record shape requires it.
- Create `tests/local-landing-pages.mjs`: built-HTML assertions for the 54 local routes.
- Modify `tests/smoke.mjs`: invoke or duplicate only release-critical local-page assertions.
- Modify `package.json`: add the content-quality command and include it in the verification sequence.
- Create `docs/seo/2026-09-02-local-landing-page-evidence.md`: source ledger, claims review, route inventory, and release evidence.

---

### Task 1: Lock the local-page inventory and content contract

**Files:**
- Create: `src/test/local-landing-content.test.ts`
- Create: `src/lib/localLandingContent.ts`
- Create: `src/content/localLandingPages.json`

**Interfaces:**
- Produces: `CityLandingContent`, `ServiceCityLandingContent`, `getCityLanding(slug)`, `getServiceCityLanding(serviceSlug, citySlug)`, `CITY_LANDING_CONTENT`, and `SERVICE_CITY_LANDING_CONTENT`.
- Consumes: `TOWNS` from `src/lib/site.ts` only in the test that proves all existing towns have records.

- [ ] **Step 1: Write the failing inventory and shape tests**

Create `src/test/local-landing-content.test.ts` with the first route contract:

```ts
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
```

- [ ] **Step 2: Run the focused test and confirm the missing-module failure**

Run: `pnpm exec vitest run src/test/local-landing-content.test.ts`

Expected: FAIL because `@/lib/localLandingContent` does not exist.

- [ ] **Step 3: Add the typed interface and seed records**

Create `src/lib/localLandingContent.ts` with these exact public types and helpers:

```ts
import raw from "@/content/localLandingPages.json";

export type LocalSource = { label: string; url: string; supports: string };
export type LocalFaq = { q: string; a: string };
export type MunicipalResource = { label: string; url: string };

export type CityLandingContent = {
  slug: string;
  name: string;
  region: "Lower Westchester" | "Sound Shore" | "Rivertowns" | "Central Westchester" | "Northern Westchester";
  zips: string[];
  neighborhoods: string[];
  title: string;
  metaDescription: string;
  answerFirst: string;
  localContext: string[];
  commonConcerns: string[];
  safeChecks: string[];
  professionalBoundaries: string[];
  municipalResources: MunicipalResource[];
  relatedGuideSlugs: string[];
  nearbyCitySlugs: string[];
  faqItems: LocalFaq[];
  sourceNotes: LocalSource[];
  reviewedAt: string;
};

export type ServiceCityLandingContent = {
  serviceSlug: "hvac-installation" | "hvac-repair" | "preventive-maintenance" | "indoor-air-quality";
  citySlug: string;
  serviceTitle: string;
  shortTitle: string;
  parentServicePath: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  answerFirst: string;
  localConsiderations: string[];
  commonConcerns: string[];
  serviceScope: string[];
  safeChecks: string[];
  professionalBoundaries: string[];
  relatedGuideSlugs: string[];
  relatedServiceSlugs: string[];
  faqItems: LocalFaq[];
  sourceNotes: LocalSource[];
  reviewedAt: string;
};

const dataset = raw as {
  cities: Record<string, CityLandingContent>;
  serviceCities: Record<string, ServiceCityLandingContent>;
};

export const CITY_LANDING_CONTENT = dataset.cities;
export const SERVICE_CITY_LANDING_CONTENT = dataset.serviceCities;
export const getCityLanding = (slug: string) => CITY_LANDING_CONTENT[slug];
export const getServiceCityLanding = (serviceSlug: string, citySlug: string) =>
  SERVICE_CITY_LANDING_CONTENT[`${serviceSlug}/${citySlug}`];
```

Create `src/content/localLandingPages.json` with `cities` and `serviceCities` objects. Add one complete, evidence-reviewed Yonkers city record and leave `serviceCities` as an empty object. Task 2 expands the city inventory only after its evidence ledger is written; Task 3 adds the service-city inventory only after its technical claims are reviewed.

- [ ] **Step 4: Run the focused test and verify the inventory passes**

Run: `pnpm exec vitest run src/test/local-landing-content.test.ts`

Expected: PASS with the reviewed Yonkers city key and no service-city keys.

- [ ] **Step 5: Commit the content contract**

```bash
git add src/content/localLandingPages.json src/lib/localLandingContent.ts src/test/local-landing-content.test.ts
git commit -m "test: define local landing page content contract"
```

---

### Task 2: Research and review all 34 city records

**Files:**
- Modify: `src/content/localLandingPages.json`
- Create: `docs/seo/2026-09-02-local-landing-page-evidence.md`
- Modify: `src/test/local-landing-content.test.ts`

**Interfaces:**
- Consumes: `CityLandingContent` from Task 1.
- Produces: evidence-reviewed records for all keys in `CITY_LANDING_CONTENT`.

- [ ] **Step 1: Add failing city evidence and usefulness tests**

Append tests that enforce the editorial minimum without imposing a word-count target:

```ts
import { TOWNS } from "@/lib/site";
import { citySlug } from "@/lib/cities";

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
```

- [ ] **Step 2: Run the city content tests and record every failing route**

Run: `pnpm exec vitest run src/test/local-landing-content.test.ts`

Expected: FAIL with the first seeded record that lacks the required evidence or useful sections.

- [ ] **Step 3: Build the evidence ledger before revising copy**

Create `docs/seo/2026-09-02-local-landing-page-evidence.md` with one row per city:

```md
| City route | Primary intent | Official sources checked | Claims retained | Claims removed or qualified | Reviewed |
|---|---|---|---|---|---|
| `/service-areas/yonkers` | HVAC company serving Yonkers | U.S. Census QuickFacts; City of Yonkers building department | Verified service area; mixed building context | Removed guaranteed timing and blanket permit handling | 2026-09-02 |
```

Research and record the same fields for all 34 routes listed in **Current Route Inventory**. Use official local building-department links only when the page helps a property owner understand where to verify requirements. Do not state that Bravo pulls or coordinates permits unless a verified business source explicitly supports it.

- [ ] **Step 4: Replace seeded city records with evidence-reviewed content**

For each city, write a unique answer-first passage, two or more substantiated local-context paragraphs, three common concerns, safe checks, professional boundaries, municipal resources when useful, at least three FAQs, related guides, and geographically reasonable nearby-city links. Remove the old unsupported claims about recurring job frequency, equipment life, exact temperatures, corrosion resistance, guaranteed sizing methods, health outcomes, and maintenance preventing breakdowns unless supported and carefully qualified.

Use this completed shape for every record:

```json
{
  "slug": "yonkers",
  "name": "Yonkers",
  "region": "Lower Westchester",
  "zips": ["10701", "10703", "10704", "10705", "10706", "10707", "10708", "10710"],
  "neighborhoods": ["Getty Square", "Bryn Mawr", "Park Hill", "Ludlow", "Crestwood"],
  "title": "HVAC Yonkers, NY — Heating, Cooling & Repair | Bravo Mechanical",
  "metaDescription": "HVAC service in Yonkers, NY for heating, cooling, repair, maintenance, and indoor air quality. Call Bravo Mechanical or request a written estimate.",
  "answerFirst": "Bravo Mechanical provides heating, cooling, maintenance, and indoor-air-quality service for homes and light-commercial properties in Yonkers. The right next step depends on the equipment, building layout, symptoms, and safety conditions at the property.",
  "localContext": [
    "Yonkers includes detached homes, multifamily buildings, apartments, and mixed-use properties, so equipment access, distribution, controls, and owner or building requirements can differ by address.",
    "Older buildings may use steam or hot-water heat and may not have central ductwork. A site assessment should identify the existing distribution before repair or replacement options are compared."
  ],
  "commonConcerns": ["Uneven heat or cooling between floors", "A boiler or furnace that does not start reliably", "Adding cooling where usable ductwork is limited"],
  "safeChecks": ["Confirm the thermostat mode and setpoint", "Check whether a replaceable filter is visibly loaded and whether supply registers are open"],
  "professionalBoundaries": ["Leave repeated breaker trips, damaged wiring, and equipment-panel access to a qualified professional", "For a gas odor, smoke, fire, or carbon-monoxide alarm, leave the building and contact 911 or the gas utility from a safe location"],
  "municipalResources": [{"label": "City of Yonkers building permits and forms", "url": "https://www.yonkersny.gov/229/Forms-Permits"}],
  "relatedGuideSlugs": ["multi-family-hvac-yonkers", "hvac-permits-yonkers-guide"],
  "nearbyCitySlugs": ["mount-vernon", "bronxville", "tuckahoe", "hastings-on-hudson"],
  "faqItems": [
    {"q": "What HVAC systems are common in older Yonkers buildings?", "a": "System type varies by property, but older buildings may use steam or hot-water boilers and may lack central ductwork. Confirm the equipment and distribution at the site before choosing repair, replacement, or add-on cooling options."},
    {"q": "Can a Yonkers home without ducts add air conditioning?", "a": "Potential options include ductless, small-duct, or a new conventional duct system. Feasibility depends on the building layout, electrical capacity, comfort goals, and installation constraints."},
    {"q": "Who should verify permit requirements for HVAC work in Yonkers?", "a": "Permit and inspection requirements depend on the project. Check the current City of Yonkers guidance and identify filing, fee, inspection, and closeout responsibilities in the written project scope."}
  ],
  "sourceNotes": [{"label": "City of Yonkers forms and permits", "url": "https://www.yonkersny.gov/229/Forms-Permits", "supports": "Official municipal permit-resource reference"}],
  "reviewedAt": "2026-09-02"
}
```

- [ ] **Step 5: Run the city content tests**

Run: `pnpm exec vitest run src/test/local-landing-content.test.ts`

Expected: PASS for inventory, evidence, useful sections, and nearby-city relationships.

- [ ] **Step 6: Commit the reviewed city records and evidence**

```bash
git add src/content/localLandingPages.json src/test/local-landing-content.test.ts docs/seo/2026-09-02-local-landing-page-evidence.md
git commit -m "content: review Westchester city landing pages"
```

---

### Task 3: Research and review all 20 service-city records

**Files:**
- Modify: `src/content/localLandingPages.json`
- Modify: `docs/seo/2026-09-02-local-landing-page-evidence.md`
- Modify: `src/test/local-landing-content.test.ts`
- Modify: `src/lib/serviceContent.ts`

**Interfaces:**
- Consumes: `ServiceCityLandingContent` from Task 1 and reviewed city context from Task 2.
- Produces: 20 distinct service-city records and safe reusable service taxonomy.

- [ ] **Step 1: Add failing service-city usefulness and relationship tests**

```ts
const topCities = ["yonkers", "white-plains", "new-rochelle", "mount-vernon", "scarsdale"];
const services = ["hvac-installation", "hvac-repair", "preventive-maintenance", "indoor-air-quality"];

it("covers every existing service-city route exactly once", () => {
  const expected = topCities.flatMap((city) => services.map((service) => `${service}/${city}`)).sort();
  expect(Object.keys(SERVICE_CITY_LANDING_CONTENT).sort()).toEqual(expected);
  expect(expected).toHaveLength(20);
});

it("gives every service-city route distinct reviewed guidance", () => {
  for (const [key, page] of Object.entries(SERVICE_CITY_LANDING_CONTENT)) {
    expect(key).toBe(`${page.serviceSlug}/${page.citySlug}`);
    expect(page.h1).toContain(CITY_LANDING_CONTENT[page.citySlug].name);
    expect(page.metaTitle.length).toBeLessThanOrEqual(65);
    expect(page.metaDescription.length).toBeLessThanOrEqual(160);
    expect(page.localConsiderations.length).toBeGreaterThanOrEqual(2);
    expect(page.commonConcerns.length).toBeGreaterThanOrEqual(3);
    expect(page.serviceScope.length).toBeGreaterThanOrEqual(3);
    expect(page.safeChecks.length).toBeGreaterThanOrEqual(2);
    expect(page.professionalBoundaries.length).toBeGreaterThanOrEqual(2);
    expect(page.faqItems.length).toBeGreaterThanOrEqual(3);
    expect(page.sourceNotes.length).toBeGreaterThanOrEqual(1);
  }
});

it("links every service-city page to real parent and supporting routes", () => {
  const cityKeys = new Set(Object.keys(CITY_LANDING_CONTENT));
  for (const page of Object.values(SERVICE_CITY_LANDING_CONTENT)) {
    expect(cityKeys.has(page.citySlug)).toBe(true);
    expect(page.parentServicePath).toMatch(/^\/services\/[a-z0-9-]+$/);
    expect(page.relatedServiceSlugs).not.toContain(page.serviceSlug);
  }
});
```

- [ ] **Step 2: Run the focused test and record incomplete service-city records**

Run: `pnpm exec vitest run src/test/local-landing-content.test.ts`

Expected: FAIL until all 20 records meet the service-specific contract.

- [ ] **Step 3: Extend the evidence ledger for all 20 routes**

Add one row for each combination of the four services and five top cities. Record the official technical sources used, the city-specific reason the advice differs, and every business claim removed or qualified. For indoor-air-quality claims, use EPA or other authoritative health/environment guidance and avoid promising health outcomes. For installation and maintenance, qualify manufacturer-specific intervals, sizing, commissioning, and warranty statements.

- [ ] **Step 4: Write 20 distinct service-city records**

Each record must combine one service intent with one substantiated local consideration. The unique sections are `answerFirst`, `localConsiderations`, `commonConcerns`, and `faqItems`; shared safety statements may repeat when the hazard is identical. Use `/contact` and the verified site phone through the page components rather than embedding changing contact data in JSON.

Use this completed structure for each route:

```json
{
  "serviceSlug": "hvac-repair",
  "citySlug": "yonkers",
  "serviceTitle": "HVAC Repair",
  "shortTitle": "Repair",
  "parentServicePath": "/services/emergency-hvac-repair-westchester-county-ny",
  "h1": "HVAC Repair in Yonkers, NY",
  "metaTitle": "HVAC Repair Yonkers, NY | Bravo Mechanical",
  "metaDescription": "HVAC repair in Yonkers for no-heat, no-cool, airflow, control, boiler, furnace, and AC problems. Request diagnosis and written repair options.",
  "answerFirst": "For HVAC repair in Yonkers, record the equipment type, symptoms, error codes, and any water, odor, smoke, or electrical warning signs before calling. Bravo Mechanical can then confirm current availability and diagnose the property-specific fault.",
  "localConsiderations": ["Multifamily properties may require access coordination and a clear record of which spaces or zones are affected.", "Steam, hot-water, forced-air, and ductless systems require different diagnostic steps; identify the equipment and distribution before comparing repair options."],
  "commonConcerns": ["No heat or cooling", "Uneven temperatures between floors or zones", "Leaks, repeated lockouts, or unusual equipment noise"],
  "serviceScope": ["Document symptoms, equipment, and operating conditions", "Inspect the applicable safety, control, airflow, fuel, electrical, or refrigerant systems", "Explain the diagnosed fault and obtain approval for the written repair scope"],
  "safeChecks": ["Confirm thermostat settings and replaceable-filter condition", "Note error codes and whether the problem affects one zone or the entire building"],
  "professionalBoundaries": ["Do not repeatedly reset a breaker or open electrical or equipment panels", "Leave gas, combustion, refrigerant, and pressurized-system work to qualified professionals"],
  "relatedGuideSlugs": ["multi-family-hvac-yonkers", "furnace-not-igniting-mount-vernon"],
  "relatedServiceSlugs": ["hvac-installation", "preventive-maintenance"],
  "faqItems": [
    {"q": "What information helps diagnose an HVAC problem in Yonkers?", "a": "Provide the equipment type, make and model when accessible without opening panels, symptoms, error codes, affected areas, and any recent work or power interruption."},
    {"q": "Should I keep resetting HVAC equipment that locks out?", "a": "No. Repeated lockouts or breaker trips can indicate a fault that needs diagnosis. Leave the equipment off if operation creates smoke, burning odor, water near electrical parts, or another safety concern."},
    {"q": "When should a Yonkers property owner compare repair and replacement?", "a": "Compare options when the fault is costly, failures are recurring, parts are unavailable, safety is affected, or the equipment no longer meets the property's needs. Use property-specific written scopes rather than a universal age rule."}
  ],
  "sourceNotes": [{"label": "U.S. Department of Energy — Maintaining Your Air Conditioner", "url": "https://www.energy.gov/energysaver/maintaining-your-air-conditioner", "supports": "Professional maintenance and airflow context"}],
  "reviewedAt": "2026-09-02"
}
```

- [ ] **Step 5: Remove unsupported reusable service claims**

In `src/lib/serviceContent.ts`, retain slug/title taxonomy needed by menus, but replace or remove claims such as “Free quotes,” “manufacturer-trained installers,” “not subcontractors,” “Manual J on every install,” blanket permit coordination, fixed pricing, universal installation timelines, universal equipment lifespans, health outcomes, and guaranteed maintenance benefits. Keep language conditional and property-specific.

- [ ] **Step 6: Run the content contract and existing unit suite**

Run: `pnpm exec vitest run src/test/local-landing-content.test.ts src/test/seo-conversion.test.tsx`

Expected: PASS for all 54 content records and existing SEO/conversion behavior.

- [ ] **Step 7: Commit the reviewed service-city records**

```bash
git add src/content/localLandingPages.json src/lib/serviceContent.ts src/test/local-landing-content.test.ts docs/seo/2026-09-02-local-landing-page-evidence.md
git commit -m "content: review local HVAC service pages"
```

---

### Task 4: Make the reviewed model authoritative for route generation

**Files:**
- Modify: `scripts/route-data.mjs`
- Modify: `src/lib/cities.ts`
- Modify: `src/lib/serviceCityCombos.ts`
- Modify: `src/test/seo-conversion.test.tsx`

**Interfaces:**
- Consumes: `src/content/localLandingPages.json` from Tasks 1–3.
- Produces: route records whose `city.content` or `localContent` fields contain the approved data consumed by renderers.

- [ ] **Step 1: Change route-generation tests to require the shared content**

Replace the old Yonkers substring assertions in `src/test/seo-conversion.test.tsx` with:

```ts
type GeneratedRoute = {
  path: string;
  title: string;
  description: string;
  canonical?: string;
  localContent?: {
    answerFirst: string;
    safeChecks: string[];
    professionalBoundaries: string[];
    faqItems: { q: string; a: string }[];
  };
};

it("carries reviewed local content into city and service-city routes", async () => {
  const routes = await buildAllRoutes() as GeneratedRoute[];
  for (const path of ["/service-areas/yonkers", "/services/hvac-repair/yonkers"]) {
    const route = routes.find((candidate) => candidate.path === path);
    expect(route?.localContent?.answerFirst.length).toBeGreaterThan(80);
    expect(route?.localContent?.safeChecks.length).toBeGreaterThanOrEqual(2);
    expect(route?.localContent?.professionalBoundaries.length).toBeGreaterThanOrEqual(2);
    expect(route?.localContent?.faqItems.length).toBeGreaterThanOrEqual(3);
  }
});
```

- [ ] **Step 2: Run the focused test and verify the missing-field failure**

Run: `pnpm exec vitest run src/test/seo-conversion.test.tsx`

Expected: FAIL because existing route objects do not expose `localContent`.

- [ ] **Step 3: Load JSON directly in the Node route builder**

Add a loader to `scripts/route-data.mjs`:

```js
export async function loadLocalLandingPages() {
  const raw = await readFile(path.join(SRC, "content/localLandingPages.json"), "utf8");
  return JSON.parse(raw);
}
```

Use `dataset.cities` to build city routes and `dataset.serviceCities` to build service-city routes. Set `title`, `description`, `faqs`, and `localContent` from each record. Remove the regex-based local-copy extraction paths once no caller uses them. Continue to use `fitSeoTitle` and `fitMetaDescription` as final guards.

- [ ] **Step 4: Derive browser-side city and combo inventories from the same model**

In `src/lib/cities.ts`, retain `citySlug`, `City`, `CITIES`, and `getCity`, but build `CITIES` from `CITY_LANDING_CONTENT` in `TOWNS` order. Map `faqItems` to `faqs`; expose the richer record as `content`. Until Task 5 changes the consuming page, derive the compatibility fields from the reviewed record: `intro` from `answerFirst`, `housing` from `localContext[0]`, and `climateNote` from `localContext[1]`. No independent legacy copy remains.

In `src/lib/serviceCityCombos.ts`, build `SERVICE_CITY_COMBOS` from `SERVICE_CITY_LANDING_CONTENT` and retain the current public fields `citySlug`, `cityName`, `serviceSlug`, `serviceTitle`, and `path`. Keep `TOP_CITY_SLUGS` as the five currently published combo cities.

- [ ] **Step 5: Run focused route and inventory tests**

Run: `pnpm exec vitest run src/test/local-landing-content.test.ts src/test/seo-conversion.test.tsx`

Expected: PASS; route counts remain 34 city and 20 service-city.

- [ ] **Step 6: Commit the authoritative route model**

```bash
git add scripts/route-data.mjs src/lib/cities.ts src/lib/serviceCityCombos.ts src/test/seo-conversion.test.tsx
git commit -m "refactor: share reviewed local SEO route content"
```

---

### Task 5: Render the reviewed content in the interactive pages

**Files:**
- Modify: `src/pages/CityPage.tsx`
- Modify: `src/pages/ServiceCityPage.tsx`
- Modify: `src/pages/HighIntentServicePage.tsx`
- Modify: `src/test/frontend-remediation.test.tsx`

**Interfaces:**
- Consumes: `getCityLanding` and `getServiceCityLanding` from Task 1.
- Produces: visible city and service-city sections with matching FAQs, relationships, municipal links, and CTAs.

- [ ] **Step 1: Add failing page-rendering tests**

Add route-specific tests using `createMemoryRouter`:

```tsx
it("renders useful reviewed Yonkers city guidance", async () => {
  renderAt(<CityPage />, "/service-areas/yonkers");
  expect(await screen.findByRole("heading", { name: "HVAC Services in Yonkers, NY" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /What Yonkers property owners can check safely/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /City of Yonkers building permits and forms/i })).toHaveAttribute("href", "https://www.yonkersny.gov/229/Forms-Permits");
  expect(screen.getByRole("link", { name: /Call \(914\) 361-9142/i })).toHaveAttribute("href", "tel:+19143619142");
});

it("renders distinct reviewed HVAC repair guidance for Yonkers", async () => {
  renderAt(<ServiceCityPage />, "/services/hvac-repair/yonkers");
  expect(await screen.findByRole("heading", { name: "HVAC Repair in Yonkers, NY" })).toBeInTheDocument();
  expect(screen.getByText(/Multifamily properties may require access coordination/i)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /Leave these HVAC checks to a professional/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /HVAC services in Yonkers/i })).toHaveAttribute("href", "/service-areas/yonkers");
});
```

If the current test helper has a different name, extend that helper rather than creating a second router harness.

- [ ] **Step 2: Run the two page tests and verify they fail on missing sections**

Run: `pnpm exec vitest run src/test/frontend-remediation.test.tsx`

Expected: FAIL because the safe-check, professional-boundary, and municipal-resource sections are not rendered.

- [ ] **Step 3: Update `CityPage.tsx`**

Remove `TOP_CITY_NOTES`. Render `answerFirst`, `localContext`, `commonConcerns`, `safeChecks`, `professionalBoundaries`, optional `municipalResources`, related guides, applicable service-city links, nearby cities, visible FAQs, and the existing verified phone/request CTA. Build JSON-LD from the same visible `faqItems`; do not emit an FAQ item that is absent from the page.

- [ ] **Step 4: Update `ServiceCityPage.tsx`**

Use `getServiceCityLanding(serviceSlug, citySlug)` for metadata and visible content. Replace `service.intro`, `service.scope`, `service.signals`, and `service.faqs` with the reviewed record's answer, considerations, concerns, scope, safe checks, boundaries, and FAQs. Link to `parentServicePath`, `/service-areas/{citySlug}`, related guides, related services in the same city, and the same service in other published combo cities.

- [ ] **Step 5: Add parent-to-local discovery links**

In `src/pages/HighIntentServicePage.tsx`, select records whose `parentServicePath` equals the current canonical service path and render a compact “Service in Westchester communities” section linking to each matching service-city page. Add a rendering assertion for the mapped parent path so the link relationship works in both directions.

- [ ] **Step 6: Run page and accessibility tests**

Run: `pnpm exec vitest run src/test/frontend-remediation.test.tsx src/test/local-landing-content.test.ts`

Expected: PASS with one visible H1 and no duplicate page sections.

- [ ] **Step 7: Commit interactive rendering**

```bash
git add src/pages/CityPage.tsx src/pages/ServiceCityPage.tsx src/pages/HighIntentServicePage.tsx src/test/frontend-remediation.test.tsx
git commit -m "feat: render useful local HVAC landing pages"
```

---

### Task 6: Render the same content for crawlers and strengthen discovery

**Files:**
- Modify: `scripts/inject-head-metadata.mjs`
- Modify: `scripts/generate-sitemap.mjs` only if required by the route record change
- Create: `tests/local-landing-pages.mjs`

**Interfaces:**
- Consumes: `route.localContent` and the route catalog from Task 4.
- Produces: initial HTML containing the complete reviewed narrative and deliberate internal links.

- [ ] **Step 1: Create a failing built-HTML test**

Create `tests/local-landing-pages.mjs` to read every generated local HTML file and assert:

```js
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAllRoutes } from "../scripts/route-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist/public");
const routes = (await buildAllRoutes()).filter((route) => route.type === "city" || route.type === "service-city");
if (routes.length !== 54) throw new Error(`Expected 54 local routes, received ${routes.length}`);

for (const route of routes) {
  const html = await readFile(path.join(dist, route.path.slice(1), "index.html"), "utf8");
  for (const value of [route.localContent.answerFirst, ...route.localContent.safeChecks, ...route.localContent.professionalBoundaries]) {
    const escaped = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
    if (!html.includes(escaped)) throw new Error(`${route.path} is missing crawler-visible reviewed copy: ${value}`);
  }
  if (!html.includes(`href=\"/contact\"`)) throw new Error(`${route.path} is missing the request-service link`);
  if (!html.includes(`href=\"tel:+19143619142\"`)) throw new Error(`${route.path} is missing the verified phone link`);
}

console.log(`Local landing-page checks passed for ${routes.length} routes.`);
```

- [ ] **Step 2: Build and confirm crawler-visible tests fail**

Run: `pnpm run build && node tests/local-landing-pages.mjs`

Expected: FAIL on a service-city page because the current prerender contains only generic service links, metadata, and FAQs.

- [ ] **Step 3: Add local-section render helpers**

In `scripts/inject-head-metadata.mjs`, add escaped helpers that render arrays, resources, and route links. For `city`, render the answer, local context, common concerns, safe checks, professional boundaries, municipal resources, FAQs, related guides, nearby cities, and applicable service-city pages. For `service-city`, render the answer, local considerations, concerns, scope, safe checks, professional boundaries, FAQs, parent service, city hub, guides, related services, and nearby combo cities. For a county-level service route, render the service-city records whose `parentServicePath` matches that route so the parent-to-local discovery link is also present without JavaScript.

Remove the generic `All Westchester HVAC services` list as the sole service-city body. Keep the sitewide navigation and contact CTA.

- [ ] **Step 4: Build and run the crawler-visible test**

Run: `pnpm run build && node tests/local-landing-pages.mjs`

Expected: PASS for exactly 54 local routes.

- [ ] **Step 5: Confirm sitemap and canonical stability**

Run: `pnpm run test:e2e`

Expected: PASS; every local route has one H1, one self-referencing `www` canonical, index-follow metadata, and one sitemap entry.

- [ ] **Step 6: Commit crawler rendering**

```bash
git add scripts/inject-head-metadata.mjs scripts/generate-sitemap.mjs tests/local-landing-pages.mjs
git commit -m "feat: prerender complete local landing page content"
```

---

### Task 7: Add the duplicate-intent and unsafe-claim quality gate

**Files:**
- Create: `scripts/local-landing-content.mjs`
- Modify: `package.json`
- Modify: `tests/smoke.mjs`

**Interfaces:**
- Produces: `auditLocalLandingContent(dataset)` returning `{ errors: string[], warnings: string[] }` and CLI exit code 1 when errors exist.
- Consumes: `src/content/localLandingPages.json` and the canonical route catalog.

- [ ] **Step 1: Write failing audit assertions in the smoke test**

Add a child-process call in `tests/smoke.mjs` that runs `node scripts/local-landing-content.mjs` and requires exit code 0. Add built-output assertions rejecting these unverified claim families on local routes:

```js
const unsafeLocalClaims = [
  /free (?:quote|estimate)/i,
  /manufacturer[- ]trained/i,
  /not subcontractors/i,
  /manual j.{0,30}every/i,
  /permits? (?:pulled|handled|coordinated)/i,
  /fixed pricing/i,
  /same[- ]day/i,
  /guaranteed/i,
  /prevents? breakdowns/i,
  /keeps? (?:your )?warranty valid/i,
  /cures?|prevents? (?:allergies|asthma|illness)/i,
];
```

- [ ] **Step 2: Run the smoke test and verify the missing-auditor failure**

Run: `pnpm run test:e2e`

Expected: FAIL because `scripts/local-landing-content.mjs` does not exist.

- [ ] **Step 3: Implement structural, claim, link, and similarity audits**

Create `scripts/local-landing-content.mjs` that:

1. Loads and parses `src/content/localLandingPages.json`.
2. Verifies 34 city and 20 service-city keys.
3. Validates required arrays, HTTPS source URLs, reviewed dates, metadata limits, and link targets.
4. Applies the unsafe-claim expressions to all visible copy fields.
5. Normalizes city names and route labels out of the unique fields and computes pairwise Jaccard similarity for city-to-city and same-service service-city copy.
6. Emits an error when normalized unique-copy similarity is at or above `0.72`.
7. Emits an error when a service-city answer is identical after city-name normalization.
8. Prints each error with the two affected route keys and exits 1; otherwise prints the audited record count and exits 0.

Use these public functions so unit tests can import them later:

```js
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function normalizeUniqueCopy(value, locationNames) {
  return value.toLowerCase()
    .replace(new RegExp(locationNames.map(escapeRegex).join("|"), "gi"), " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function jaccard(left, right) {
  const a = new Set(left);
  const b = new Set(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
}

export function auditLocalLandingContent(dataset) {
  const errors = [];
  const warnings = [];
  validateDatasetShape(dataset, errors);
  validateClaims(dataset, errors);
  validateRelationships(dataset, errors);
  validateSimilarity(dataset, errors);
  return { errors, warnings };
}
```

Define `validateDatasetShape(dataset, errors)`, `validateClaims(dataset, errors)`, `validateRelationships(dataset, errors)`, and `validateSimilarity(dataset, errors)` in the same module. Each function mutates the supplied error array with route-specific messages and implements the corresponding numbered checks above.

- [ ] **Step 4: Add the package command and run the audit**

Add: `"audit:local-content": "node scripts/local-landing-content.mjs"`.

Run: `pnpm run audit:local-content`

Expected: PASS with `54 local landing-page records audited; 0 errors`.

- [ ] **Step 5: Run the build and smoke suite**

Run: `pnpm run build && pnpm run test:e2e && node tests/local-landing-pages.mjs`

Expected: PASS with no unsafe claims or duplicate-intent pairs.

- [ ] **Step 6: Commit the quality gate**

```bash
git add scripts/local-landing-content.mjs package.json tests/smoke.mjs
git commit -m "test: enforce local landing page quality"
```

---

### Task 8: Run full local verification and document the release candidate

**Files:**
- Modify: `docs/seo/2026-09-02-local-landing-page-evidence.md`

**Interfaces:**
- Consumes: all implementation tasks.
- Produces: a locally verified commit ready for protected preview deployment.

- [ ] **Step 1: Run content and unit checks**

Run:

```bash
pnpm run audit:local-content
pnpm run typecheck
pnpm run test
```

Expected: all commands exit 0; record exact test counts in the evidence document.

- [ ] **Step 2: Run production build and static checks**

Run:

```bash
pnpm run build
pnpm run test:e2e
node tests/local-landing-pages.mjs
```

Expected: all commands exit 0; 54 local routes pass the dedicated test.

- [ ] **Step 3: Run the local crawler audit**

Start the existing Vite preview on port 4174, then run:

```bash
pnpm run audit:seo:local
```

Expected: every sitemap URL returns 200 with one H1, valid title and description, index-follow robots, and the expected self-canonical.

- [ ] **Step 4: Review the scoped diff and update evidence**

Confirm only the files named in this plan changed for this work. Add the exact commands, results, route counts, known Search Console baseline, and remaining Google-controlled indexing uncertainty to `docs/seo/2026-09-02-local-landing-page-evidence.md`.

- [ ] **Step 5: Commit the verified release candidate**

```bash
git add docs/seo/2026-09-02-local-landing-page-evidence.md
git commit -m "docs: record local landing page verification"
```

---

### Task 9: Deploy and verify a protected preview

**Files:**
- No source changes expected.
- Modify `docs/seo/2026-09-02-local-landing-page-evidence.md` only to record deployment evidence.

**Interfaces:**
- Consumes: exact verified release-candidate commit from Task 8.
- Produces: authenticated preview URL and pass/fail evidence; production remains unchanged.

- [ ] **Step 1: Confirm branch and exact commit**

Run: `git status --short --branch && git rev-parse HEAD`

Expected: isolated implementation branch `codex/local-landing-pages` with no task-related uncommitted changes. The original checkout and its unrelated changes remain untouched.

- [ ] **Step 2: Push the scoped commits to the same remote branch**

Run: `git fetch origin codex/seo-aeo-phase1 && git merge-base --is-ancestor origin/codex/seo-aeo-phase1 HEAD && git push origin HEAD:codex/seo-aeo-phase1`

Expected: the ancestry guard passes and the remote `codex/seo-aeo-phase1` branch advances by fast-forward to the exact locally verified commit. If the guard or push fails, stop and reconcile the remote change without force-pushing or merging.

- [ ] **Step 3: Deploy the exact commit to a protected Vercel preview**

Use the repository's established authenticated preview workflow. Record deployment ID, URL, commit SHA, and ready time in the evidence document.

- [ ] **Step 4: Verify the preview**

Run the authenticated preview gate against:

- all sitemap URLs;
- all 54 local landing pages;
- all configured redirects;
- preview-wide `noindex` isolation;
- canonical, metadata, schema, and internal links;
- global security and privacy headers;
- asset and sitemap cache policies;
- analytics privacy assertions;
- the local duplicate/claim audit.

Expected: zero failures. If any check fails, do not promote; correct the issue in a new test-driven task and repeat local verification.

- [ ] **Step 5: Commit preview evidence if the document changed**

```bash
git add docs/seo/2026-09-02-local-landing-page-evidence.md
git commit -m "docs: record local landing page preview"
git push origin HEAD:codex/seo-aeo-phase1
```

---

### Task 10: Obtain approval, promote, and verify production

**Files:**
- Modify: `docs/seo/2026-09-02-local-landing-page-evidence.md`

**Interfaces:**
- Consumes: exact passing preview from Task 9 and explicit user approval.
- Produces: verified production deployment or rollback to the previously live production deployment.

- [ ] **Step 1: Present the exact promotion target for approval**

Report preview deployment ID, URL, commit SHA, complete gate result, and the production deployment currently live. Ask the user to approve promotion of that exact preview and rollback if release-critical checks fail.

- [ ] **Step 2: Promote only after explicit approval**

Promote the exact passing preview. Do not rebuild from a different working tree or merge branches.

- [ ] **Step 3: Run the immediate production gate**

Verify all 54 local pages, sitemap membership, canonicals, robots directives, metadata, structured data, internal links, redirects, security/privacy headers, assets, and the normal production crawler gate.

Expected: zero failures.

- [ ] **Step 4: Roll back on a release-critical failure**

If a local page, sitemap, canonical, indexability, security/privacy header, redirect, or live-build integrity check fails, restore the production deployment that was live immediately before Step 2 and report the failed assertion.

- [ ] **Step 5: Record production evidence and monitoring date**

Add production deployment ID, commit SHA, verification results, rollback status, and the first settled Search Console review date to the evidence document. Do not request indexing or resubmit the sitemap.

- [ ] **Step 6: Commit and push the final evidence note**

```bash
git add docs/seo/2026-09-02-local-landing-page-evidence.md
git commit -m "docs: record local landing page production release"
git push origin HEAD:codex/seo-aeo-phase1
```

## Completion Criteria

- 34 city pages and 20 service-city pages use reviewed records from one content source.
- Interactive pages and initial crawler HTML expose the same factual content.
- Every local page has one H1, unique metadata, index-follow behavior, a self-referencing canonical, visible FAQs matching schema, and intentional internal links.
- The unsafe-claim and normalized-similarity audits pass.
- Unit tests, type checking, production build, smoke checks, dedicated local-page checks, and the full local crawler pass.
- A protected preview passes before any production change.
- Production is promoted only with explicit approval and is immediately verified or rolled back.
- The evidence ledger records sources, removed or qualified claims, commands, test counts, commit SHA, deployment IDs, and the future Search Console comparison date.
