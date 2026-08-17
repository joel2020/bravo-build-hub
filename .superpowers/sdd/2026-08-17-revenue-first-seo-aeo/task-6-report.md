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
