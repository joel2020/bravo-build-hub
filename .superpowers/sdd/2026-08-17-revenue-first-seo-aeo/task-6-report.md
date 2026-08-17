# Task 6 report — Westchester and Yonkers conversion pathways

## Status

Complete.

Commit: `feat(seo): strengthen Westchester conversion pathways` on `codex/bravo-seo-aeo-growth`.

## Red/green evidence

- The original four-priority-path homepage assertion already passed because the featured-service links were added by earlier work. Per the task guidance, the new focused React tests covered the missing behavior instead.
- **RED:** `PORT=4173 pnpm test -- src/test/frontend-remediation.test.tsx` failed with two expected missing-path failures: the homepage lacked an accessible `Explore Commercial HVAC services →` route, and Yonkers lacked the context-specific service-selection heading and links.
- **GREEN:** After adding the commercial service route and the Yonkers selection data/UI, the same test command passed: 3 files, 67 tests.
- Build-route self-check initially found that the new Yonkers service data was not being parsed; the route-data parser was corrected to accept trailing commas. The final check confirmed all four canonical paths in the Yonkers route context.

## Delivered

- Added a direct commercial HVAC service route to the homepage while retaining the existing request-service analytics action.
- Added a concise Yonkers selection section based only on existing boiler/hydronic and no-duct housing context, with canonical AC repair, boiler repair, emergency HVAC, and heat-pump evaluation links.
- Extended build-time city-route parsing and fallback HTML so the same Yonkers selection context and four links are available in generated HTML.
- Added focused rendered and generated-HTML regression coverage.

## Files

- `artifacts/bravo-mechanical/src/pages/Index.tsx`
- `artifacts/bravo-mechanical/src/lib/cities.ts`
- `artifacts/bravo-mechanical/src/pages/CityPage.tsx`
- `artifacts/bravo-mechanical/scripts/route-data.mjs`
- `artifacts/bravo-mechanical/scripts/inject-head-metadata.mjs`
- `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`
- `artifacts/bravo-mechanical/tests/smoke.mjs`

## Verification

- `PORT=4173 pnpm test -- src/test/frontend-remediation.test.tsx` — passed (3 files, 67 tests)
- `pnpm run build` — passed
- `pnpm run test:e2e` — passed
- `pnpm typecheck` — passed
- `git diff --check` — passed

## Concerns

- The build retains a pre-existing esbuild warning in `src/components/crm/CRMMyJobs.tsx` about a redundant `||` operand; it is outside Task 6.

## Fix Round 1 — durable Yonkers route parsing and homepage coverage

Commit: `fix(seo): harden Yonkers pathway generation` on `codex/bravo-seo-aeo-growth`.

### Red/green evidence

- **RED:** `PORT=4173 pnpm test -- src/test/route-data.test.ts src/test/frontend-remediation.test.tsx` failed as expected: a Yonkers `priorityServices` field followed by another city field produced an empty route-data list, and a wrong canonical path did not reject route generation.
- **GREEN:** Replaced the formatting-dependent parser with quote-aware, bracket-balanced extraction and order-independent service-field reads. `buildAllRoutes` now rejects missing, incomplete, or wrong Yonkers priority paths before metadata generation.

### Added coverage

- The new route-data test exercises the actual `buildAllRoutes` interface with a formatting variation: the priority field is followed by another city field and one service entry has reordered properties. It verifies all four canonical paths remain in the Yonkers route context.
- A second route-data test proves an incorrect configured Yonkers path fails loudly.
- The rendered homepage test now asserts all four exact priority hrefs, complementing the existing generated-HTML smoke checks.

### Verification

- `PORT=4173 pnpm test -- src/test/route-data.test.ts src/test/frontend-remediation.test.tsx` — passed (4 files, 70 tests)
- `pnpm run build` — passed
- `pnpm run test:e2e` — passed
- `pnpm typecheck` — passed
- `git diff --check` — passed

### Concern

- The existing CRM esbuild warning remains outside this fix round.
