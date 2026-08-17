# Revenue-First SEO and AEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Bravo Mechanical's qualified Westchester HVAC lead generation by strengthening verified entity signals, high-intent commercial answers, conversion measurement, and canonical search signals for traditional and AI-assisted discovery.

**Architecture:** Keep `SITE` as the business-identity source, the existing route-data/head-injection pipeline as the prerendering source, and `analytics.ts` as the conversion-event boundary. Add one small JSON content source for priority commercial answer modules so React and non-JavaScript HTML use identical copy, then consolidate the duplicate emergency intent into the canonical service URL.

**Tech Stack:** React 18, TypeScript, Vite, React Router, Vitest, Node.js ESM build scripts, static JSON-LD, GA4, Vercel.

## Global Constraints

- Primary market is Westchester County, New York; NYC and Long Island receive no new landing pages in this phase.
- Do not publish unsupported licenses, certifications, prices, response times, savings, warranties, brands, service areas, rebate eligibility, or ranking claims.
- Do not add a new analytics, SEO, schema, or content dependency.
- Do not send names, phone numbers, email addresses, addresses, or customer message content to analytics.
- Preserve one canonical URL and one H1 for every submitted public page.
- Exclude redirects, noncanonical aliases, private pages, and utility pages from the sitemap.
- Keep `migration-notes/` untouched and uncommitted.
- Use TDD for runtime and build-pipeline changes; each implementation task starts with a failing test.
- Deploy only after the production build, full application test suite, SEO smoke suite, and diff check pass.

---

## File map

- `SEO-AEO-BASELINE-2026-08-17.md`: dated public-search, competitor, claim, and URL-decision evidence.
- `artifacts/bravo-mechanical/src/lib/site.ts`: canonical business identity and verified first-party facts.
- `artifacts/bravo-mechanical/public/llms.txt`: concise discovery file pointing to canonical substantive pages.
- `artifacts/bravo-mechanical/src/content/priorityServiceAnswers.json`: single source for answer-first commercial modules.
- `artifacts/bravo-mechanical/src/lib/priorityServiceAnswers.ts`: typed React-side reader for the JSON content.
- `artifacts/bravo-mechanical/src/pages/HighIntentServicePage.tsx`: visible priority answer and conversion UI.
- `artifacts/bravo-mechanical/scripts/route-data.mjs`: attaches the shared answer content to prerender routes.
- `artifacts/bravo-mechanical/scripts/inject-head-metadata.mjs`: emits shared answer content into raw HTML.
- `artifacts/bravo-mechanical/src/lib/analytics.ts`: non-PII conversion-event interface.
- `artifacts/bravo-mechanical/vercel.json`: permanent emergency-intent consolidation redirect.
- `artifacts/bravo-mechanical/tests/smoke.mjs`: build-output and canonical-signal regression coverage.
- `artifacts/bravo-mechanical/src/test/seo-conversion.test.tsx`: entity, content, and analytics unit coverage.
- `SEO-EXECUTION-PLAN-2026-08-12.md`: cumulative implementation and verification record.

---

### Task 1: Capture the current search, competitor, and claim baseline

**Files:**
- Create: `SEO-AEO-BASELINE-2026-08-17.md`

**Interfaces:**
- Consumes: production URLs, Google Search Console observations when accessible, public organic results, competitor-owned websites, and current repository claims.
- Produces: explicit `retain`, `improve`, `redirect`, or `evidence-required` decisions used by Tasks 2–5.

- [ ] **Step 1: Create the evidence table before making recommendations**

Use this exact document structure:

```markdown
# Bravo Mechanical SEO and AEO baseline — August 17, 2026

## Method and limitations

## Production technical baseline
| Check | Evidence | Result | Decision |

## Claim verification matrix
| Claim | Current source | Verification status | Publishing rule |

## Priority URL decisions
| Intent | Current URL(s) | Evidence | Decision |

## Westchester organic competitors
| Competitor | Query/theme observed | First-party proof/offer | Bravo opportunity | Source |

## NYC and Long Island expansion evidence
| Market | Observed competitor pattern | Evidence Bravo still needs | Decision |

## Conversion baseline
| Action | Current event | Context captured | Gap |
```

- [ ] **Step 2: Gather current evidence**

Run the production checks below and record the dated output. Search the public web for each market and cite direct competitor pages rather than search-result URLs.

```bash
curl -sSI https://bravomechanicalny.com/
curl -sSI https://www.bravomechanicalny.com/emergency-hvac-westchester
curl -sSI https://www.bravomechanicalny.com/services/emergency-hvac-repair-westchester-county-ny
curl -sS https://www.bravomechanicalny.com/robots.txt
curl -sS https://www.bravomechanicalny.com/sitemap.xml
```

Required competitor query themes: `HVAC contractor Westchester County NY`, `AC repair Westchester County`, `boiler repair Westchester County`, `heat pump installation Westchester`, `emergency HVAC Westchester`, plus one bounded NYC and Long Island market query for expansion context.

- [ ] **Step 3: Make the emergency URL decision explicit**

Record this implementation decision unless current authoritative evidence contradicts it:

```markdown
| Emergency HVAC repair | `/emergency-hvac-westchester` and `/services/emergency-hvac-repair-westchester-county-ny` | Two indexable commercial pages target the same urgent intent; navigation already promotes the service URL | Keep the service URL and permanently redirect the shorter duplicate |
```

- [ ] **Step 4: Validate the baseline document**

Run:

```bash
test -s SEO-AEO-BASELINE-2026-08-17.md
rg -n "Method and limitations|Claim verification matrix|Priority URL decisions|Westchester organic competitors|Conversion baseline" SEO-AEO-BASELINE-2026-08-17.md
rg -n "https://" SEO-AEO-BASELINE-2026-08-17.md
git diff --check -- SEO-AEO-BASELINE-2026-08-17.md
```

Expected: all required sections and direct evidence links are present; no whitespace errors.

- [ ] **Step 5: Commit**

```bash
git add SEO-AEO-BASELINE-2026-08-17.md
git commit -m "docs: capture current SEO and AEO baseline"
```

---

### Task 2: Align verified business identity and LLM discovery content

**Files:**
- Modify: `artifacts/bravo-mechanical/src/lib/site.ts`
- Modify: `artifacts/bravo-mechanical/public/llms.txt`
- Modify: `artifacts/bravo-mechanical/src/pages/CompanyFacts.tsx`
- Modify: `artifacts/bravo-mechanical/src/pages/About.tsx`
- Modify: `artifacts/bravo-mechanical/src/pages/Index.tsx`
- Modify: `artifacts/bravo-mechanical/scripts/route-data.mjs`
- Test: `artifacts/bravo-mechanical/src/test/seo-conversion.test.tsx`
- Test: `artifacts/bravo-mechanical/tests/smoke.mjs`

**Interfaces:**
- Consumes: verified/publishable claims from Task 1 and the existing `SITE` object.
- Produces: consistent visible identity, schema identity, prerendered facts, and canonical discovery links.

- [ ] **Step 1: Write failing entity-consistency tests**

Add to `seo-conversion.test.tsx`:

```tsx
import { SITE } from "@/lib/site";
import CompanyFacts from "@/pages/CompanyFacts";

it("renders canonical company identity from SITE on the facts page", () => {
  const html = renderInRouter(<CompanyFacts />);
  expect(html).toContain(SITE.legalName);
  expect(html).toContain(SITE.phone);
  expect(html).toContain(SITE.address.full);
  expect(html).toContain("Westchester County");
});
```

Add to `tests/smoke.mjs` after loading `llms.txt`:

```js
for (const required of [
  '/company-facts',
  '/services/ac-repair-westchester-county-ny',
  '/services/boiler-repair-westchester-county-ny',
  '/services/heat-pump-installation-westchester-county-ny',
  '/services/emergency-hvac-repair-westchester-county-ny',
  '/service-areas/yonkers',
]) {
  assert(llms.includes(required), `llms.txt missing priority canonical page: ${required}`);
}
assert(!/guaranteed|#1|best HVAC/i.test(llms), 'llms.txt must not contain unsupported superiority claims');
```

- [ ] **Step 2: Run tests and confirm the new assertions fail**

Run:

```bash
PORT=4173 pnpm test -- src/test/seo-conversion.test.tsx
pnpm run test:e2e
```

Expected: at least the `llms.txt` priority-page assertion fails before implementation.

- [ ] **Step 3: Make `SITE` the page-level identity source**

Replace duplicated name, URL, address, phone, email, rating, license, and experience literals in the scoped pages with `SITE` properties. If Task 1 marks a claim `evidence-required`, remove it from persuasive UI and schema or qualify it without inventing evidence.

Do not add NYC or Long Island to `SITE.area`. Keep:

```ts
area: "Westchester County, NY",
```

- [ ] **Step 4: Rewrite `llms.txt` as a canonical navigation file**

Keep the file concise and use this hierarchy:

```markdown
# Bravo Mechanical LLC

> HVAC repair, installation, emergency dispatch, and maintenance for homes and light-commercial properties in Westchester County, New York.

Official website: https://www.bravomechanicalny.com/
Company facts: https://www.bravomechanicalny.com/company-facts
Phone: +1-914-361-9142
Email: info@bravomechanicalny.com

## Priority services
- [AC repair](https://www.bravomechanicalny.com/services/ac-repair-westchester-county-ny)
- [Boiler repair](https://www.bravomechanicalny.com/services/boiler-repair-westchester-county-ny)
- [Emergency HVAC repair](https://www.bravomechanicalny.com/services/emergency-hvac-repair-westchester-county-ny)
- [Heat-pump installation](https://www.bravomechanicalny.com/services/heat-pump-installation-westchester-county-ny)

## Primary service area
- [Westchester service areas](https://www.bravomechanicalny.com/service-areas)
- [HVAC service in Yonkers](https://www.bravomechanicalny.com/service-areas/yonkers)

## Customer actions
- [Request an estimate](https://www.bravomechanicalny.com/contact)
- [Book service online](https://www.bravomechanicalny.com/book)
```

Add only verified identity statements from Task 1; do not turn this file into a keyword list.

- [ ] **Step 5: Keep prerendered homepage facts synchronized**

Update `HOMEPAGE_FAQS` and static route descriptions in `route-data.mjs` only where Task 1 found a mismatch with visible React copy. The direct answer to service-area and contact questions must match the visible homepage wording.

- [ ] **Step 6: Run focused and smoke tests**

Run:

```bash
PORT=4173 pnpm test -- src/test/seo-conversion.test.tsx
pnpm run build
pnpm run test:e2e
```

Expected: entity and `llms.txt` assertions pass; generated titles and descriptions remain within limits.

- [ ] **Step 7: Commit**

```bash
git add artifacts/bravo-mechanical/src/lib/site.ts artifacts/bravo-mechanical/public/llms.txt artifacts/bravo-mechanical/src/pages/CompanyFacts.tsx artifacts/bravo-mechanical/src/pages/About.tsx artifacts/bravo-mechanical/src/pages/Index.tsx artifacts/bravo-mechanical/scripts/route-data.mjs artifacts/bravo-mechanical/src/test/seo-conversion.test.tsx artifacts/bravo-mechanical/tests/smoke.mjs
git commit -m "feat(seo): align verified entity and LLM discovery content"
```

---

### Task 3: Add one-source answer modules to priority service pages

**Files:**
- Create: `artifacts/bravo-mechanical/src/content/priorityServiceAnswers.json`
- Create: `artifacts/bravo-mechanical/src/lib/priorityServiceAnswers.ts`
- Modify: `artifacts/bravo-mechanical/src/pages/HighIntentServicePage.tsx`
- Modify: `artifacts/bravo-mechanical/scripts/route-data.mjs`
- Modify: `artifacts/bravo-mechanical/scripts/inject-head-metadata.mjs`
- Test: `artifacts/bravo-mechanical/src/test/seo-conversion.test.tsx`
- Test: `artifacts/bravo-mechanical/tests/smoke.mjs`

**Interfaces:**
- Produces: `getPriorityServiceAnswer(slug: string): PriorityServiceAnswer | undefined`.
- `PriorityServiceAnswer` is `{ answer: string; decisionFactors: string[]; proofLinks: { label: string; href: string }[] }`.
- Route objects receive `priorityAnswer` with the identical JSON shape.

- [ ] **Step 1: Write failing content-source tests**

Add to `seo-conversion.test.tsx`:

```tsx
import { getPriorityServiceAnswer } from "@/lib/priorityServiceAnswers";

it.each([
  "ac-repair-westchester-county-ny",
  "boiler-repair-westchester-county-ny",
  "heat-pump-installation-westchester-county-ny",
  "emergency-hvac-repair-westchester-county-ny",
])("provides an answer-first module for %s", (slug) => {
  const content = getPriorityServiceAnswer(slug);
  expect(content?.answer.length).toBeGreaterThan(120);
  expect(content?.decisionFactors.length).toBeGreaterThanOrEqual(3);
  expect(content?.proofLinks.length).toBeGreaterThanOrEqual(2);
});
```

Add to `tests/smoke.mjs`:

```js
for (const slug of [
  'ac-repair-westchester-county-ny',
  'boiler-repair-westchester-county-ny',
  'heat-pump-installation-westchester-county-ny',
  'emergency-hvac-repair-westchester-county-ny',
]) {
  const html = await readDist(`services/${slug}/index.html`);
  assert(html.includes('data-answer-summary'), `${slug} missing prerendered answer summary`);
  assert(html.includes('data-decision-factor'), `${slug} missing prerendered decision guidance`);
}
```

- [ ] **Step 2: Run tests and confirm missing-module failures**

Run:

```bash
PORT=4173 pnpm test -- src/test/seo-conversion.test.tsx
pnpm run test:e2e
```

Expected: module import or generated answer-summary assertions fail.

- [ ] **Step 3: Create the typed shared content source**

Create `priorityServiceAnswers.ts`:

```ts
import raw from "@/content/priorityServiceAnswers.json";

export type PriorityServiceAnswer = {
  answer: string;
  decisionFactors: string[];
  proofLinks: { label: string; href: string }[];
};

const answers = raw as Record<string, PriorityServiceAnswer>;

export const getPriorityServiceAnswer = (slug: string) => answers[slug];
```

Populate the JSON for the four slugs using claim-safe, answer-first copy. Each answer must state what Bravo evaluates, what the customer can expect, and when urgent safety escalation is appropriate. Proof links may reference only existing canonical pages such as `/projects`, `/reviews`, `/company-facts`, or a relevant verified guide.

- [ ] **Step 4: Render the module for customers**

In `HighIntentServicePage.tsx`, retrieve by `service.slug` and render immediately after `PageHero`:

```tsx
{priorityAnswer && (
  <section className="container mx-auto px-4 pt-10" aria-labelledby="service-answer-heading">
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 id="service-answer-heading" className="text-2xl font-extrabold">What to know first</h2>
      <p data-answer-summary className="mt-3 text-muted-foreground">{priorityAnswer.answer}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {priorityAnswer.decisionFactors.map((factor) => (
          <li data-decision-factor key={factor}>{factor}</li>
        ))}
      </ul>
    </div>
  </section>
)}
```

Render the proof links near the existing related-links section.

- [ ] **Step 5: Attach the same JSON to prerender routes**

In `route-data.mjs`, read the JSON with the existing filesystem utilities and attach by slug:

```js
const priorityAnswers = JSON.parse(await readSource("content/priorityServiceAnswers.json"));
// inside the high-intent route push
priorityAnswer: priorityAnswers[s.slug],
```

In `inject-head-metadata.mjs`, before the generic service links:

```js
if (route.priorityAnswer) {
  parts.push(`<h2>What to know first</h2><p data-answer-summary>${esc(route.priorityAnswer.answer)}</p>`);
  parts.push(`<ul>${route.priorityAnswer.decisionFactors.map((factor) => `<li data-decision-factor>${esc(factor)}</li>`).join("")}</ul>`);
}
```

- [ ] **Step 6: Run focused tests and build**

Run:

```bash
PORT=4173 pnpm test -- src/test/seo-conversion.test.tsx
pnpm run build
pnpm run test:e2e
```

Expected: the React data and generated raw HTML both contain all four answer modules.

- [ ] **Step 7: Commit**

```bash
git add artifacts/bravo-mechanical/src/content/priorityServiceAnswers.json artifacts/bravo-mechanical/src/lib/priorityServiceAnswers.ts artifacts/bravo-mechanical/src/pages/HighIntentServicePage.tsx artifacts/bravo-mechanical/scripts/route-data.mjs artifacts/bravo-mechanical/scripts/inject-head-metadata.mjs artifacts/bravo-mechanical/src/test/seo-conversion.test.tsx artifacts/bravo-mechanical/tests/smoke.mjs
git commit -m "feat(seo): add answer-first priority service content"
```

---

### Task 4: Consolidate emergency search intent into one canonical service URL

**Files:**
- Modify: `artifacts/bravo-mechanical/vercel.json`
- Modify: `artifacts/bravo-mechanical/scripts/route-data.mjs`
- Modify: `artifacts/bravo-mechanical/src/lib/highIntentServices.ts`
- Modify: `artifacts/bravo-mechanical/src/lib/site.ts`
- Modify: `artifacts/bravo-mechanical/src/components/StickyMobileCTA.tsx`
- Modify: `artifacts/bravo-mechanical/src/App.tsx`
- Modify: `artifacts/bravo-mechanical/src/components/Footer.tsx`
- Modify: `artifacts/bravo-mechanical/src/pages/CompanyFacts.tsx`
- Delete: `artifacts/bravo-mechanical/src/pages/EmergencyHVAC.tsx`
- Modify: `artifacts/bravo-mechanical/src/content/blog/24-7-emergency-furnace-repair-westchester.md`
- Modify: `artifacts/bravo-mechanical/src/content/blog/ac-not-cooling-westchester.md`
- Modify: `artifacts/bravo-mechanical/src/content/blog/boiler-banging-noises-westchester.md`
- Modify: `artifacts/bravo-mechanical/src/content/blog/water-heater-leaking-what-to-do.md`
- Generated: `artifacts/bravo-mechanical/public/sitemap.xml`
- Test: `artifacts/bravo-mechanical/tests/smoke.mjs`
- Test: `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`

**Interfaces:**
- Canonical destination: `/services/emergency-hvac-repair-westchester-county-ny`.
- Redirect source: `/emergency-hvac-westchester`.

- [ ] **Step 1: Write the failing redirect and sitemap tests**

Add to `tests/smoke.mjs`:

```js
const emergencyRedirect = deploymentConfig.redirects?.find(
  (rule) => rule.source === '/emergency-hvac-westchester',
);
assert(
  emergencyRedirect?.destination === '/services/emergency-hvac-repair-westchester-county-ny' && emergencyRedirect.permanent === true,
  'legacy emergency URL must permanently redirect to the canonical emergency service page',
);
assert(!sitemap.includes(`${canonicalOrigin}/emergency-hvac-westchester`), 'sitemap must exclude redirected emergency URL');
assert(sitemap.includes(`${canonicalOrigin}/services/emergency-hvac-repair-westchester-county-ny`), 'sitemap must retain canonical emergency service URL');
```

Update the navigation test expectation so every emergency link targets the canonical service URL.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
PORT=4173 pnpm test -- src/test/frontend-remediation.test.tsx
pnpm run test:e2e
```

Expected: missing permanent redirect and legacy sitemap membership fail.

- [ ] **Step 3: Add the permanent redirect before the catch-all host redirect**

Add to `vercel.json`:

```json
{
  "source": "/emergency-hvac-westchester",
  "destination": "/services/emergency-hvac-repair-westchester-county-ny",
  "permanent": true
}
```

Remove the legacy static route from `STATIC_ROUTES` in `route-data.mjs` so it cannot enter the sitemap or prerender output.

- [ ] **Step 4: Move only verified useful emergency guidance**

Update the canonical emergency service entry to include safety-first guidance. Replace unsupported exact arrival and same-visit claims with:

```ts
"Emergency response timing depends on weather, call volume, technician availability, and the customer's location in Westchester County. Call first so Bravo can triage the situation and confirm the next available response window."
```

For gas odor or suspected carbon monoxide, visible copy must instruct customers to leave the building and call 911 or the utility before contacting Bravo.

- [ ] **Step 5: Update internal links and emergency detection**

Replace legacy internal links with the canonical service path. Replace the legacy React route with `<Navigate to="/services/emergency-hvac-repair-westchester-county-ny" replace />`, delete the now-unused `EmergencyHVAC.tsx`, and update `StickyMobileCTA`:

```ts
const isEmergency = pathname.startsWith("/services/emergency-hvac-repair-westchester-county-ny");
```

- [ ] **Step 6: Run focused tests and build**

Run:

```bash
PORT=4173 pnpm test -- src/test/frontend-remediation.test.tsx
pnpm run build
pnpm run test:e2e
rg -n 'emergency-hvac-westchester' artifacts/bravo-mechanical/src artifacts/bravo-mechanical/public
```

Expected: remaining legacy references are limited to intentional router compatibility or redirect tests; sitemap contains only the canonical service URL.

- [ ] **Step 7: Commit**

```bash
git add artifacts/bravo-mechanical/vercel.json artifacts/bravo-mechanical/scripts/route-data.mjs artifacts/bravo-mechanical/src/lib/highIntentServices.ts artifacts/bravo-mechanical/src/lib/site.ts artifacts/bravo-mechanical/src/components/StickyMobileCTA.tsx artifacts/bravo-mechanical/src/App.tsx artifacts/bravo-mechanical/src/components/Footer.tsx artifacts/bravo-mechanical/src/pages/CompanyFacts.tsx artifacts/bravo-mechanical/src/pages/EmergencyHVAC.tsx artifacts/bravo-mechanical/src/content/blog/24-7-emergency-furnace-repair-westchester.md artifacts/bravo-mechanical/src/content/blog/ac-not-cooling-westchester.md artifacts/bravo-mechanical/src/content/blog/boiler-banging-noises-westchester.md artifacts/bravo-mechanical/src/content/blog/water-heater-leaking-what-to-do.md artifacts/bravo-mechanical/public/sitemap.xml artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx artifacts/bravo-mechanical/tests/smoke.mjs
git commit -m "fix(seo): consolidate emergency HVAC search intent"
```

---

### Task 5: Complete non-PII conversion context on priority pages

**Files:**
- Modify: `artifacts/bravo-mechanical/src/lib/analytics.ts`
- Modify: `artifacts/bravo-mechanical/src/pages/HighIntentServicePage.tsx`
- Modify: `artifacts/bravo-mechanical/src/components/CTABand.tsx`
- Modify: `artifacts/bravo-mechanical/src/components/PageHero.tsx`
- Modify: `artifacts/bravo-mechanical/src/pages/BookOnline.tsx`
- Test: `artifacts/bravo-mechanical/src/test/seo-conversion.test.tsx`

**Interfaces:**
- Produces: `trackBookingSubmit(service: string)`.
- Existing wrappers automatically add `page_path` and retain current event names.
- CTA components accept an optional non-PII `trackingContext?: string` where service context is not inferable.

- [ ] **Step 1: Write failing analytics tests**

Replace the test window fixture with a location-aware fixture and add booking coverage:

```tsx
import { trackBookingSubmit, trackCallClick, trackLeadSubmit } from "@/lib/analytics";

beforeEach(() => {
  Object.assign(globalThis, { window: { dataLayer: [], location: { pathname: "/services/ac-repair-westchester-county-ny" } } });
});

it("adds page context without customer data", () => {
  trackCallClick("service_sidebar");
  expect(window.dataLayer).toEqual([{
    event: "call_click",
    event_category: "engagement",
    location: "service_sidebar",
    page_path: "/services/ac-repair-westchester-county-ny",
  }]);
});

it("records a successful booking separately", () => {
  trackBookingSubmit("AC Repair");
  expect(window.dataLayer).toEqual([{
    event: "booking_submit",
    event_category: "lead",
    service: "AC Repair",
    page_path: "/services/ac-repair-westchester-county-ny",
  }]);
});
```

- [ ] **Step 2: Run the analytics tests and confirm failure**

Run:

```bash
PORT=4173 pnpm test -- src/test/seo-conversion.test.tsx
```

Expected: `page_path` and `trackBookingSubmit` assertions fail.

- [ ] **Step 3: Add safe automatic page context**

In `analytics.ts`:

```ts
const pageContext = (): EventParams =>
  typeof window === "undefined" ? {} : { page_path: window.location?.pathname || "/" };

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  const payload = { ...pageContext(), ...params };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
  if (typeof window.gtag === "function") window.gtag("event", name, payload);
}

export const trackBookingSubmit = (service: string) =>
  trackEvent("booking_submit", { event_category: "lead", service });
```

- [ ] **Step 4: Instrument missing commercial actions**

- Track the HighIntentServicePage sidebar estimate link with placement `service_sidebar` and service slug.
- Track its phone link with placement `service_sidebar`.
- Track CTABand estimate and phone actions with placement `cta_band`.
- Replace the booking success call in `BookOnline.tsx` with `trackBookingSubmit(form.service)` after the database operation succeeds.
- Retain `trackLeadSubmit` for successful contact/estimate forms only.

Do not attach form values other than the selected service and existing non-PII attribution fields.

- [ ] **Step 5: Run focused and full tests**

Run:

```bash
PORT=4173 pnpm test -- src/test/seo-conversion.test.tsx
PORT=4173 pnpm test
```

Expected: all analytics assertions and all 42+ tests pass.

- [ ] **Step 6: Commit**

```bash
git add artifacts/bravo-mechanical/src/lib/analytics.ts artifacts/bravo-mechanical/src/pages/HighIntentServicePage.tsx artifacts/bravo-mechanical/src/components/CTABand.tsx artifacts/bravo-mechanical/src/components/PageHero.tsx artifacts/bravo-mechanical/src/pages/BookOnline.tsx artifacts/bravo-mechanical/src/test/seo-conversion.test.tsx
git commit -m "feat(analytics): measure priority SEO conversions"
```

---

### Task 6: Strengthen homepage and Yonkers commercial pathways

**Files:**
- Modify: `artifacts/bravo-mechanical/src/pages/Index.tsx`
- Modify: `artifacts/bravo-mechanical/src/lib/cities.ts`
- Modify: `artifacts/bravo-mechanical/src/pages/CityPage.tsx`
- Modify: `artifacts/bravo-mechanical/scripts/route-data.mjs`
- Test: `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`
- Test: `artifacts/bravo-mechanical/tests/smoke.mjs`

**Interfaces:**
- Consumes: priority canonical URLs and verified proof from Tasks 1–4.
- Produces: visible and prerendered Westchester/Yonkers paths to AC, boiler, emergency, and heat-pump conversion pages.

- [ ] **Step 1: Write failing pathway tests**

Add assertions that the homepage and Yonkers output each link to the four priority canonical services:

```tsx
const priorityPaths = [
  "/services/ac-repair-westchester-county-ny",
  "/services/boiler-repair-westchester-county-ny",
  "/services/emergency-hvac-repair-westchester-county-ny",
  "/services/heat-pump-installation-westchester-county-ny",
];
for (const href of priorityPaths) expect(html).toContain(`href="${href}"`);
```

Add the equivalent generated Yonkers HTML check in `tests/smoke.mjs`.

- [ ] **Step 2: Run focused tests and confirm the missing-path failure**

Run:

```bash
PORT=4173 pnpm test -- src/test/frontend-remediation.test.tsx
pnpm run test:e2e
```

- [ ] **Step 3: Improve the pathways using existing proof**

- Keep the homepage focused on Westchester-wide contractor intent.
- Link existing original project cards to the relevant commercial service where a verified match exists.
- Add a concise Yonkers service-selection section using existing city housing facts: boiler/hydronic repair for older buildings, AC/ductless options for homes without ducts, emergency HVAC, and heat-pump evaluation.
- Do not invent a Yonkers project, neighborhood result, or testimonial.
- Ensure the same four paths are present in the city prerender context generated by `route-data.mjs`.

- [ ] **Step 4: Run focused tests, build, and smoke tests**

Run:

```bash
PORT=4173 pnpm test -- src/test/frontend-remediation.test.tsx
pnpm run build
pnpm run test:e2e
```

Expected: visible and raw-HTML priority paths pass without introducing a second H1.

- [ ] **Step 5: Commit**

```bash
git add artifacts/bravo-mechanical/src/pages/Index.tsx artifacts/bravo-mechanical/src/lib/cities.ts artifacts/bravo-mechanical/src/pages/CityPage.tsx artifacts/bravo-mechanical/scripts/route-data.mjs artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx artifacts/bravo-mechanical/tests/smoke.mjs
git commit -m "feat(seo): strengthen Westchester conversion pathways"
```

---

### Task 7: Verify, document, deploy, and audit production

**Files:**
- Modify: `SEO-EXECUTION-PLAN-2026-08-12.md`
- Modify: `SEO-AEO-BASELINE-2026-08-17.md`
- Generated: `artifacts/bravo-mechanical/public/sitemap.xml`

**Interfaces:**
- Consumes: all prior task commits.
- Produces: verified production release, deployment evidence, and current operating backlog.

- [ ] **Step 1: Run the complete local release gate**

Run:

```bash
pnpm run build
PORT=4173 pnpm test
pnpm run test:e2e
git diff --check
```

Expected: build succeeds, all tests pass, SEO smoke checks pass, and diff check is clean. Record any pre-existing unrelated warning separately.

- [ ] **Step 2: Review the release diff and secrets boundary**

Run:

```bash
git status --short
git diff --stat
git diff -- artifacts/bravo-mechanical/public/llms.txt artifacts/bravo-mechanical/vercel.json artifacts/bravo-mechanical/src/lib/analytics.ts
```

Expected: no `.env*`, `.vercel/`, customer data, or `migration-notes/` content is staged.

- [ ] **Step 3: Update the execution report before deployment**

Add an August 17 section containing:

```markdown
### Revenue-first SEO/AEO implementation — August 17, 2026

- Current research baseline and competitor evidence
- Entity and llms.txt changes
- Priority answer modules
- Emergency URL consolidation
- Conversion-event coverage
- Homepage and Yonkers pathways
- Local verification results
- Claims still requiring business evidence
```

- [ ] **Step 4: Commit the verified release state**

```bash
git add SEO-EXECUTION-PLAN-2026-08-12.md SEO-AEO-BASELINE-2026-08-17.md artifacts/bravo-mechanical/public/sitemap.xml
git diff --cached --check
git commit -m "docs(seo): record revenue-first release evidence"
```

- [ ] **Step 5: Build the exact Vercel production artifact and deploy**

From the repository root:

```bash
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod --yes
```

Expected: deployment state `READY` and aliases include `www.bravomechanicalny.com`.

- [ ] **Step 6: Run the full public sitemap audit**

Fetch the live sitemap and check every URL for:

```text
HTTP 200
canonical equals sitemap URL
exactly one H1
no meta or X-Robots noindex directive
```

Also verify:

```bash
curl -sSI https://bravomechanicalny.com/contact
curl -sSI https://www.bravomechanicalny.com/emergency-hvac-westchester
curl -sSI https://www.bravomechanicalny.com/seo-verification-nonexistent-20260817
curl -sSI https://www.bravomechanicalny.com/admin/crm
```

Expected: apex and emergency redirects are permanent, fabricated URL is 404, and private route has `X-Robots-Tag: noindex, nofollow`.

- [ ] **Step 7: Record deployment evidence and commit the final report update**

Add the deployment ID, live sitemap count, crawl result, redirect statuses, and any remaining nonblocking warning to the execution report.

```bash
git add SEO-EXECUTION-PLAN-2026-08-12.md SEO-AEO-BASELINE-2026-08-17.md
git diff --cached --check
git commit -m "docs(seo): record production verification"
```

- [ ] **Step 8: Preserve the branch for integration**

Run:

```bash
git status --short
git log --oneline -8
```

Expected: only pre-existing user-owned untracked work remains. Do not push, merge, or remove the branch without explicit user direction.
