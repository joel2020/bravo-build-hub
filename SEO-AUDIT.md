# Bravo Mechanical SEO & Conversion Review

**Review date:** August 10, 2026

**Site:** https://www.bravomechanicalny.com/

**Source:** `artifacts/bravo-mechanical`

**Fix branch:** `codex/seo-conversion-fixes`
**Validated preview:** https://bravo-build-9ukc42m9k-joel-carias-projects.vercel.app

## Outcome

The technical SEO and lead-path defects found in the initial live-site audit have been fixed in source and verified on an isolated Vercel preview. Production has not been changed.

The final preview returns a real 404 for unknown URLs, serves route-specific crawlable HTML, uses the `www` canonical everywhere, has one canonical business entity, and exposes accessible contact and booking forms. A mobile Lighthouse navigation audit scored 100 for SEO, accessibility, best practices, and agentic browsing on a representative location page.

## Remediation status

| Initial finding | Resolution | Verification |
|---|---|---|
| Non-`www` canonicals conflicted with the live `www` host | Canonicals, hreflang, schema, robots, sitemap, and `llms.txt` now use `https://www.bravomechanicalny.com`; Vercel config adds a permanent non-`www` redirect | 148-route build smoke test and preview canonical checks pass |
| Unknown and private URLs fell through to homepage HTML | Removed the catch-all SPA rewrite; retained explicit app/private rewrites and added `X-Robots-Tag: noindex, nofollow` to private routes | Preview `d702f41`: known URL 200, fabricated URL 404; `/auth`, `/admin/users`, and `/proposal/test` each returned 200 with `X-Robots-Tag: noindex, nofollow` |
| Location pages were highly templated | Prerendered pages now include verified town intro, housing/system notes, climate notes, neighborhoods, and ZIPs | 34 pages, zero exact local-content duplicates; average five-word Jaccard 0.006, maximum 0.049 |
| Titles and descriptions exceeded search display budgets | Central build-time and client-side fitting limits titles to 65 and descriptions to 160 characters | All 148 generated routes pass regression checks |
| FAQ and `HVACBusiness` schema were duplicated | Route schema is replaced on hydration; service pages reference one canonical business node; self-serving `aggregateRating` markup was removed | Hydrated preview: FAQ 1, HVACBusiness 1, AggregateRating 0 |
| Contact form lacked robust semantics | Added stable names, autocomplete, required constraints, `aria-invalid`, linked errors, and live validation | Browser submission test exposes six actionable alerts; regression tests pass |
| Booking was not a semantic form | Added `<form>`, fieldsets/legends, pressed states, named values, inline guidance, and submit behavior | Regression tests pass and the CTA stays actionable before validation |
| Footer/sticky CTA accessibility defects | Corrected heading order, contrast, and accessible names | Mobile Lighthouse accessibility 100 |
| Analytics could double-count aliases | Removed duplicate call and lead-submit aliases; one canonical event remains per action | Analytics regression tests pass |
| Several images were oversized | Converted/compressed the logo, mini-split, boiler, furnace, burner, and project photos to WebP/AVIF | Emitted images are 5.6–492 KB; build rejects emitted images above 750 KB |

## Verification evidence

- Vitest: 8/8 targeted SEO/conversion tests passing.
- Production Vite build: passing.
- Vercel production-mode build: passing.
- Route smoke test: 148 generated URLs passing metadata, schema, local-copy, and image assertions.
- Preview HTTP checks: `/` 200, `/service-areas/yonkers` 200, fabricated route 404, `/auth` noindex/nofollow.
- Hydrated browser check: correct `www` canonical, one FAQ, one HVAC business entity, zero aggregate ratings, no console warnings/errors.
- Mobile Lighthouse on the representative Yonkers page: SEO 100, accessibility 100, best practices 100, agentic browsing 100.
- Local performance trace: LCP 481 ms and CLS 0.00. This is lab evidence, not field data.

## Remaining client/account work

These items cannot be responsibly inferred or completed from source alone:

1. Refresh or remove five article titles/content that still make 2025-specific claims after checking 2026 program details.
2. Confirm the public claims: 5.0 Google rating, 24/7 availability, license #8822, licensed/insured status, free estimates, service brands, and pricing ranges.
3. Validate GA4/GTM key events in Preview/DebugView and confirm only completed leads are marked as key events.
4. Review Google Search Console indexing and query data after production release; prioritize pages by impressions and conversions.
5. Confirm Google Business Profile details and citation consistency.

## Known unrelated repository issues

- Full TypeScript checking still reports two pre-existing `AdminComments.tsx` Supabase generated-type errors.
- The build emits a pre-existing unreachable-expression warning in `CRMMyJobs.tsx`.

## Release note

The current deployment is a preview only. Promote or deploy to production only after reviewing the preview and confirming the business claims above. After release, resubmit the sitemap in Search Console and monitor 404s, indexing, calls, form completions, and booking completions.
