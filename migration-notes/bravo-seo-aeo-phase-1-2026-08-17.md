# Bravo Mechanical SEO, AEO, Local and Conversion Phase 1

**Prepared:** August 17, 2026
**Scope:** Evidence collection, implementation, build and preview verification, GA4 configuration, production launch, corrective deployment, and post-launch validation.
**Production state:** Corrected deployment `dpl_4wuEL7hxR71zTMHS4QzVmGGxzNxF` is live and passed the final production gate. Production promotion and the GA4 stream change were separately approved. No Git push/merge, Search Console indexing request, Business Profile edit, or public review response has been made.

## Completed outcomes

- Built a deploy-ready 140-URL canonical sitemap. Eight redirect-only or duplicate URLs were removed while the consolidated AC article remained at its existing indexed URL.
- Added permanent redirects for the old emergency page, six noncanonical equipment guides, and the duplicate AC article.
- Added crawler-visible direct answers, symptoms, process, repair-versus-replacement guidance, and safety information for AC repair, boiler repair, heat-pump installation, and emergency HVAC repair.
- Updated the public rating fact to **5.0 from 16 Google reviews, verified August 17, 2026**. No review or aggregate-rating markup is used on the HVACBusiness node.
- Replaced unsupported public statements about insurance, free estimates, response guarantees, same-day scheduling, broad brand support, and generic pricing in the priority templates and several supporting articles. Claims still requiring business evidence are listed below.
- Added privacy filtering to analytics. Names, emails, phone numbers, messages, addresses, full referrers, landing URLs, `gclid`, `fbclid`, URL-like values, phone-like values, email-like values, and long free text are rejected before analytics dispatch.
- Disabled automatic GA4 page views in code, replaced the initial loader with a privacy-gated loader, suppressed analytics on `/auth`, `/admin/*`, and `/proposal/*`, disabled analytics loading for entries containing a query string or hash, and explicitly sends only a query-free pathname, sanitized page location, and empty referrer. On August 18, 2026, Enhanced Measurement's browser-history page-change option was disabled and saved in the Bravo GA4 stream with explicit approval.
- Added page-path measurement and SPA page views, plus tracked service-page calls and request-service placements. Form and online-booking success events remain tracked without sending the submitted contact fields.
- Added `X-Robots-Tag: noindex, nofollow` coverage for every `app.bravomechanicalny.com` response in addition to `/auth`, `/admin/*`, and `/proposal/*`.
- Verified the current local build: type checking passed, 52/52 tests passed, production build passed, SEO smoke checks passed, and all 140 built sitemap pages passed the crawler audit.

## Search Console findings

Property: `sc-domain:bravomechanicalny.com`.

### Performance baseline

| Metric | Jul 18–Aug 14, 2026 | Previous 28 days | Change |
|---|---:|---:|---:|
| Clicks | 47 | 64 | -17 (-26.6%) |
| Impressions | 11,567 | 9,973 | +1,594 (+16.0%) |
| CTR | 0.406% | 0.642% | -0.236 percentage points |
| Average position | 21.29 | 17.75 | 3.54 positions worse |

Interpretation: visibility expanded, but the new impressions are appearing at weaker positions and producing fewer clicks. This is primarily a ranking and snippet-quality problem, not a demand problem.

Current leading pages include the homepage (21 clicks, 2,890 impressions, position 10.56), the permit article at `/blog/do-i-need-permit-hvac-westchester` (16 clicks, 732 impressions, position 6.78), and the heat-pump cost article (2 clicks, 41 impressions, position 4.54). The priority commercial pages have material upside: AC repair had 501 impressions at average position 43.69; boiler repair had 410 impressions at 30.21; heat-pump installation had 58 impressions at 37.17; and emergency HVAC service had 58 impressions at 12.16.

### Historical exclusion groups

The August 11 Search Console export grouped every reported excluded URL as follows. Detailed exported evidence is preserved in `migration-notes/evidence/`.

| Google reason | Count | Current diagnosis |
|---|---:|---|
| Alternate page with proper canonical | 25 | Mostly migration-era host/canonical evidence. Priority URLs currently return 200 with a self-canonical `www` URL. |
| Duplicate without user-selected canonical | 3 | Three blog URLs last crawled in May. The newly identified no-cooling duplicate is now consolidated locally with a permanent redirect. |
| Page with redirect | 3 | Expected exclusions for host aliases and an old blog URL; redirect destinations belong in the sitemap, sources do not. |
| Crawled, currently not indexed | 7 | Two service-area pages, one service/city page, and four articles. Review content usefulness and evidence before requesting another crawl. |
| Discovered, currently not indexed | 117 | All reported URLs used the old apex host: 45 articles, 31 city pages, 19 service/city pages, 10 service pages, and 12 static/index pages. |
| Google chose a different canonical | 0 in export | No separate group reported. |
| Unknown to Google | 0 in export | No separate group reported. |
| Blocked, noindex, soft 404, or other | 0 in export | No separate group reported. |

Most exclusions are stale evidence from before the apex-to-`www` migration. Google’s last crawls for AC repair (July 21), boiler repair (July 18), heat-pump installation (May 9), and the canonical emergency page (May 9) predate this remediation. Current live comparisons show those URLs are 200, indexable, and self-canonical. The correct next step is to deploy and validate the tested build, not to change canonicals again.

### URL inspection sample, August 17

| URL | Google state | Last crawl | Current live comparison |
|---|---|---|---|
| `/` | Indexed / pass | Aug 16 | 200, indexable, self-canonical |
| `/services/ac-repair-westchester-county-ny` | Alternate with proper canonical | Jul 21 | 200, indexable, self-canonical |
| `/services/boiler-repair-westchester-county-ny` | Alternate with proper canonical | Jul 18 | 200, indexable, self-canonical |
| `/services/heat-pump-installation-westchester-county-ny` | Alternate with proper canonical | May 9 | 200, indexable, self-canonical |
| `/services/emergency-hvac-repair-westchester-county-ny` | Alternate with proper canonical | May 9 | 200, indexable, self-canonical |
| `/emergency-hvac-westchester` | Indexed / pass | Jul 4 | Obsolete duplicate; locally redirected to canonical service page |
| `/service-areas/yonkers` | Indexed / pass | Jun 20 | 200, indexable, self-canonical |

### Sitemap and submission log

| Date | Action/state | Result |
|---|---|---|
| Aug 17, 2026 | Observed `https://www.bravomechanicalny.com/sitemap.xml` in Search Console | Success; 140 submitted; 0 indexed shown in the sitemap record. The zero is a lagging/incomplete sitemap report, not consistent with URL Inspection. |
| Aug 17, 2026 | Observed active sitemap state | Only the canonical `www` sitemap was present when checked; no sitemap removal action was taken in this phase. |
| Aug 17, 2026 | URL Inspection API read | Seven priority/reference URLs inspected; no indexing requests submitted. |
| Aug 18, 2026 | Production crawl passed; canonical sitemap refresh is eligible | No Search Console submission made yet. |
| 7–14 days after deployment | Re-inspect commercial URLs and record Google decision | Prioritize AC repair, boiler repair, heat-pump installation, emergency HVAC, and Yonkers. Do not repeatedly submit URLs already queued. |

Core Web Vitals/CrUX, enhancements, and GA4 reports could not be retrieved from the connected Search Console workflow. No manual-action warning was surfaced by the available connector, but the connector did not expose a standalone manual-actions report; verify that screen directly before deployment sign-off.

## Technical and content diagnosis

1. **Stale host migration evidence is suppressing confidence in the commercial pages.** Current HTML is correct, but Google has not recrawled several priority URLs since May–July.
2. **Redirect-only URLs were still in the sitemap.** Six equipment guides declared canonicals to different money pages, while the sitemap still advertised them. The old emergency URL and duplicate AC article added two more conflicting signals.
3. **Important content was too dependent on client rendering.** Initial HTML had unique metadata and FAQs but not the full symptoms/process/safety/decision content for priority services.
4. **Unsupported statements weakened trust and policy safety.** The site contained unverified insurance, free-estimate, same-day, response-time, brand, price, inventory, financing, and warranty statements. Priority templates and prominent sitewide claims are corrected; a second evidence audit is still warranted for legacy articles and nonpriority service copy.
5. **Conversion measurement could leak attribution fields and duplicate events.** Lead-form analytics previously spread full landing/referrer/click-ID attribution into GA4. The event helper also risked sending both a direct data-layer object and a `gtag` event.
6. **The app host needed host-wide noindex coverage.** Path-only controls protected admin/auth/proposal routes, but the root and other responses on `app.bravomechanicalny.com` lacked an explicit noindex header.

## Implemented URL consolidation

| Redirect source | Permanent destination |
|---|---|
| `/emergency-hvac-westchester` | `/services/emergency-hvac-repair-westchester-county-ny` |
| `/services/gas-boilers` | `/services/boiler-installation-westchester-county-ny` |
| `/services/mini-splits` | `/services/mini-split-installation-westchester-county-ny` |
| `/services/heat-pumps` | `/services/heat-pump-installation-westchester-county-ny` |
| `/services/central-ac` | `/services/ac-installation-westchester-county-ny` |
| `/services/gas-furnaces` | `/services/furnace-installation-westchester-county-ny` |
| `/services/water-heaters` | `/services/water-heater-installation-westchester-county-ny` |
| `/blog/ac-not-cooling-westchester` | `/blog/why-is-my-ac-not-cooling-westchester` |

Internal links now point directly to destination pages. The sitemap generator also rejects any route whose declared canonical differs from its own URL.

## Structured data and AEO

- One stable `HVACBusiness` node identifies the company; `Organization`, `WebSite`, `Service`, `BreadcrumbList`, and visible-content-matched `FAQPage` nodes support applicable routes.
- Self-serving `review` and `aggregateRating` properties are stripped from the LocalBusiness-family markup.
- Company identity, canonical host, phone, email, Westchester focus, license number, public hours, and current Google rating are aligned across prominent content, metadata, schema, and `llms.txt`.
- The priority service HTML now exposes concise direct answers to non-JavaScript crawlers and LLM search agents.
- Official implementation references: [canonical consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [blocking indexing](https://developers.google.com/search/docs/crawling-indexing/block-indexing), [LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business), and [AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

## Competitor and keyword opportunities

The reviewed Westchester set was [Bruni & Campisi](https://www.bruniandcampisi.com/), [Innovative Air](https://innovativeairsolutions.com/), [All State Air Control](https://www.allstateair.com/), [G.C. Reliable](https://gcreliable.com/), [Comfort Experts](https://www.comfortexpertsny.com/), [Cottam](https://cottamhvac.com/), [Clover](https://www.clovercool.com/), [Bell Mechanical](https://www.bellmech.com/), [EXTRAVE](https://www.extraves.com/), [Galaxy HVAC](https://www.galaxy914.com/), and [Maselli](https://masellihvac.com/). Exact map-pack placement and backlink-gap counts were not available without a location-controlled map rank tool and backlink index, so no rank or link-count claim is inferred.

Common competitor strengths are larger review profiles, prominent financing/rebate offers, symptom-led service pages, strong emergency CTAs, equipment/brand detail, and repeated municipal coverage. Bravo should compete with verifiable job evidence and clarity rather than unverified superlatives.

| Priority cluster | Search intent and content opportunity | Recommended destination |
|---|---|---|
| HVAC contractor Westchester County | Entity proof, license verification, service scope, real projects, review proof, direct contact | Homepage |
| AC repair Westchester County | AC running/not cooling, weak airflow, frozen coil, breaker trips, repair vs replacement | AC repair page + consolidated no-cooling guide |
| Boiler repair Westchester County | No heat, pressure loss, banging, lockouts, safety and older hydronic systems | Boiler repair page + supporting troubleshooting guides |
| Heat-pump installation Westchester | Cold-climate design, building load, electrical capacity, ducted/ductless/hybrid choices, current program links | Heat-pump installation page |
| Emergency HVAC Westchester | Gas/CO/fire/water safety, information to have ready, availability-qualified dispatch request | Canonical emergency service page |
| Yonkers HVAC | Older boiler/radiator housing context, permit workflow, verified project evidence | Yonkers service-area page + permit guide |

The permit topic is already Bravo’s strongest nonbrand organic proof. Build adjacent, evidence-backed guides around municipality-specific permit sources and project documentation. Heat-pump content should link to current [NYS Clean Heat](https://cleanheat.ny.gov/) and local program authorities after eligibility statements are verified at publication time.

## Google Business Profile audit and plan

Public profile facts observed August 17, 2026:

- Name: Bravo Mechanical LLC
- Primary category: HVAC contractor
- Rating: 5.0 from 16 reviews; all observed ratings were five stars
- Hours: open 24 hours
- Phone: (914) 361-9142
- Website link: `https://bravomechanicalny.com/` (should be changed to canonical `https://www.bravomechanicalny.com/`)
- Attributes shown: online estimates, installation service, repair services

The connected Google account manages only two unrelated Alivio profiles, so no Bravo profile edit was possible. With owner access, use Google’s [profile guidelines](https://support.google.com/business/answer/3038177) and complete this sequence:

1. Change the website URL to the canonical `www` homepage and set the appointment URL to the canonical booking page.
2. Verify the primary category remains HVAC contractor; add only categories that exactly match real services.
3. Reconcile services against the website and remove any service, price, brand, or availability claim that lacks evidence.
4. Confirm the 24-hour setting represents actual phone intake/dispatch capability; otherwise set accurate staffed hours and use special hours.
5. Review service areas in the dashboard. Keep Westchester municipalities; do not add NYC or Long Island until operating coverage, credentials, and dispatch evidence are confirmed.
6. Add current, original job photos with municipality, equipment, and outcome notes only when customer/privacy permissions allow.
7. Publish factual posts tied to seasonal service, project proof, permit education, and current authoritative rebate/program pages. Avoid repeated keyword/location templates.
8. Add owner-approved questions and answers only for real, recurring customer questions.

## Review-response queue

Public Google reviews were inspected. Fifteen already had an owner response and one was unanswered. No other review platform connector was available, so this queue does not claim coverage of Yelp, Facebook, Angi, or other accounts.

| Reviewer | Rating | Response state |
|---|---:|---|
| Gabriel Popian | 5 | **Draft awaiting final approval** |
| Jake Reyes | 5 | Already answered |
| michael link | 5 | Already answered |
| Tishaily Lora | 5 | Already answered |
| Julio Cerda | 5 | Already answered |
| Carlos Alvarez | 5 | Already answered |
| Yalanda Gaston | 5 | Already answered |
| Gilberto Gutierrez | 5 | Already answered |
| shaisky urena | 5 | Already answered |
| Joel Carias | 5 | Already answered |
| Dwight Cooper | 5 | Already answered |
| Gyongyi Meggyes | 5 | Already answered |
| Gabriel Rivera | 5 | Already answered |
| jeffrey | 5 | Already answered |
| Edward Rivera | 5 | Already answered |
| Frank | 5 | Already answered |

Gabriel Popian’s review: “I called bravo mechanical LLC for an emergency on the weekend and they came right away. Thank you!”

**Draft—do not publish without immediate final approval:**
“Thank you, Gabriel. We’re glad we could help with the weekend emergency and get to you quickly. We appreciate you calling Bravo Mechanical and sharing your experience.”

## KPI dashboard baseline

| KPI | Baseline | Source/status | 30-day target method |
|---|---:|---|---|
| Search clicks | 47 / 28 days | Search Console | Compare rolling 28 days and nonbrand/service segments |
| Search impressions | 11,567 / 28 days | Search Console | Track priority page impressions separately |
| CTR | 0.406% | Search Console | Improve commercial titles/descriptions; compare like-for-like query groups |
| Average position | 21.29 | Search Console | Track homepage, AC, boiler, heat pump, emergency, Yonkers |
| Sitemap URLs | 140 tested locally | Build + crawler | Require 140/140 pass after production deploy |
| Indexed pages | Aggregate unavailable; sitemap record says 0 | Search Console record is lagging/incomplete | Weekly page-indexing export plus sampled URL inspections |
| Google rating | 5.0 / 16 reviews | Public Business Profile | Track count, average, and owner-response coverage |
| Review response coverage | 15/16 (93.75%) | Public Business Profile | 100% after approved response is posted |
| Calls | Not connected | GA4/phone provider access needed | `call_click` by page path and CTA location; reconcile with call logs |
| Forms | Not connected | GA4 access needed | `lead_submit` where `form=contact_lead_form` |
| Online bookings | Not connected | GA4/CRM access needed | `lead_submit` where `form=online_booking` |
| Jobs and revenue | Not connected | CRM/accounting access needed | Join source/landing data to booked job and collected revenue |

Use qualified calls, submitted forms, confirmed bookings, booked jobs, and collected revenue as separate funnel stages. Do not treat CTA clicks as leads or leads as revenue.

## 30/60/90-day plan

### Days 0–30

- Approve and deploy the exact tested build; repeat the production 140-URL crawl and redirect/header checks.
- Refresh the canonical sitemap now that production has passed; request indexing once for the four commercial priorities and Yonkers, then record dates.
- Obtain Bravo Business Profile owner/manager access and GA4 read access. Correct the GBP website/appointment URLs and confirm hours, categories, services, and service areas.
- Approve and post the one pending review response; establish a same-week response workflow with customer privacy rules.
- Verify or remove remaining legacy price, warranty, financing, brand, inventory, rebate, permit-handling, and response-time claims.
- Establish weekly KPI export for Search Console, GA4 events, call logs, CRM bookings/jobs, reviews, and revenue.

### Days 31–60

- Recheck Google decisions 7–14 days after indexing requests; compare live HTML against Google’s last crawl before any further canonical change.
- Improve AC and boiler pages using verified job photos, equipment/fault details, municipality, work performed, and outcome.
- Add authoritative external references to heat-pump and permit pages; refresh time-sensitive program information only from current primary sources.
- Consolidate or noindex thin city/service combinations that cannot demonstrate unique housing, municipality, project, or operational value.
- Build local citations and link opportunities from trade associations, municipal/vendor directories, community sponsorships, suppliers, and project partners only where the relationship is real.

### Days 61–90

- Measure priority-page impressions, CTR, position, calls, forms, bookings, jobs, and revenue against the baseline.
- Expand only the content clusters that show qualified impressions or conversions. Do not create NYC or Long Island landing pages without verified operating evidence.
- Publish a small cadence of evidence-backed project case studies and troubleshooting resources rather than templated location pages.
- Audit NAP, canonical URLs, categories, and service descriptions across the Business Profile, major directories, social profiles, and relevant trade listings.
- Review AI-search citations manually across multiple engines using factual brand/service prompts; correct inconsistent entity facts at the source rather than adding keyword-heavy schema.

## Release-readiness checkpoint

- The local workspace is linked to Vercel project `bravo-build-hub`, and the authenticated CLI can read and deploy to the project.
- Production previously resolved to ready deployment `dpl_EQdm5AryneKx6vt1XyYjvQStaTNk`, created August 17, 2026 at 2:00:58 PM EDT. Preserve it as the rollback reference.
- With approval, source fingerprint `92e9ac8a787da62900b959a58f47da08c23fab8a6244fb0a211b045abe059e35` was deployed to protected preview `dpl_FxeDQ8jZuNb93mAbQWLehte17F1g` at `https://bravo-build-ar5gzlmhy-joel-carias-projects.vercel.app`. The deployment is ready and remains separate from production.
- The authenticated preview crawl found 140 sitemap URLs, with 140/140 returning 200, one H1, a title, a meta description, an indexable HTML robots directive, and the expected `www` canonical. All eight redirect rules returned the expected permanent redirect and destination.
- The preview correctly retained Vercel's preview-level `X-Robots-Tag: noindex`, but it exposed a deployment-config blocker: `X-Content-Type-Options`, `Referrer-Policy`, and `X-Frame-Options` were missing because Vercel builds from `artifacts/bravo-mechanical/vercel.json`, while those rules existed only in the repository-root config.
- A failing regression test reproduced the nested-config gap. The nested config now includes the three security headers, one-year immutable asset caching, and one-day caching for public SEO/image files; the regression and full 51-test suite pass locally. This fix was made after the approved preview upload, so the existing preview is not eligible for promotion.
- The replacement-ready local tree fingerprint is `69036c8a77d39b94a7221a4e16d59dc27ca7d7537385a5e6183b376eab7ca3b3`. The protected preview HTML confirms the privacy-gated GA loader rejects private paths and any query/hash entry, uses `send_page_view: false`, sends an empty referrer, and enables `ignore_referrer`; local conversion tests confirm one sanitized `call_click` or `lead_submit` event and no dispatch on private routes.
- With separate approval, that exact replacement fingerprint was deployed August 18, 2026 at 11:25:44 AM EDT to protected preview `dpl_8AMwsGn6pTuVU84q7rvsMT5U3daD` at `https://bravo-build-ou1qowbkd-joel-carias-projects.vercel.app`. Vercel reported the preview ready in 39 seconds.
- The replacement preview passed the complete authenticated gate: 140/140 sitemap URLs, 8/8 permanent redirects, 4/4 required preview/security headers, immutable one-year caching on fingerprinted assets, one-day sitemap caching, and 6/6 analytics-loader privacy assertions. The deployed bundle contains the `call_click` and `lead_submit` instrumentation validated by the 51-test local suite.
- On August 18, 2026, browser-authenticated access was confirmed for Analytics account `391923715`, Bravo property `533683001`, and active web stream `Bravo` (stream ID `14399158885`, measurement ID `G-JK03MS9MZN`). With explicit approval, Enhanced Measurement's “Page changes based on browser history events” option was unchecked and saved. Reopening the advanced settings confirmed the saved option remained unchecked. The GSC workflow separately still reports that no Google Analytics OAuth scope is connected.
- With explicit production approval, Vercel promoted the passing replacement preview on August 18, 2026 at 5:13:57 PM EDT as ready production deployment `dpl_GxY56ofhDD7ikhj4FRK6EVfq9mWi`. The `www`, apex, `app`, and project production aliases now resolve to that deployment.
- The production sitemap crawl passed 140/140 URLs; all eight path redirects and the apex-to-`www` redirect passed; the three global security headers, three private-route noindex headers, immutable asset caching, one-day sitemap caching, and the privacy-gated analytics loader passed. Vercel's one-hour error-log scan returned no errors.
- The production gate exposed one narrow nested-config defect missed by the preview assertion: `app.bravomechanicalny.com/admin/crm` is noindexed, but the bare `app.bravomechanicalny.com/` response lacks `X-Robots-Tag`. The host rule used `/:path*`, which Vercel did not apply to the root. A regression test failed on that rule, and the local correction changes only the host-specific header source to root-inclusive `/(.*)`. The corrected tree passes type checking, 52/52 tests, the production build, smoke checks, and a 140/140 local crawl.
- With separate approval, the corrective tree was deployed August 18, 2026 at 5:20:02 PM EDT to protected preview `dpl_8zQqu2oQVmFHDgg25HTPH7LiJe5Z` at `https://bravo-build-9yad6xpb6-joel-carias-projects.vercel.app`. The authenticated preview gate passed 140/140 sitemap URLs, 8/8 permanent redirects, 3/3 security headers, 3/3 private-route noindex headers, immutable asset caching, one-day sitemap caching, and 6/6 analytics privacy assertions.
- Vercel blocks overriding the request host on a protected preview, so the exact `app.bravomechanicalny.com/` host-conditioned response cannot be exercised without moving that production alias. The deployed root-inclusive rule is covered by the red/green regression test. A separately approved promotion must be followed immediately by a live `app`-root header check; the current production deployment remains the rollback target if that check fails.
- With explicit approval for promotion and conditional rollback, Vercel promoted corrective preview `dpl_8zQqu2oQVmFHDgg25HTPH7LiJe5Z` on August 18, 2026 at 5:29:27 PM EDT as ready production deployment `dpl_4wuEL7hxR71zTMHS4QzVmGGxzNxF`. The immediate live check confirmed `app.bravomechanicalny.com/` returns HTTP 200 with `X-Robots-Tag: noindex, nofollow`, so rollback was not triggered.
- The final production gate passed with no failures: 140/140 sitemap URLs, 8/8 path redirects, the apex redirect, 3/3 security headers, 5/5 private/app noindex checks, immutable asset caching, one-day sitemap caching, and 6/6 analytics privacy assertions. Vercel's one-hour error-log scan returned no errors.
- A production-dependency audit of the Bravo package then identified advisories in React Router and the Supabase WebSocket chain. The local completion tree upgrades `react-router-dom` to `^7.18.2`, `@supabase/supabase-js` to `^2.112.3`, Vite to `^7.3.6`, Vitest to `^4.1.10`, and PostCSS to `^8.5.23`; Vitest is now correctly classified as a development dependency. A pinned-pnpm production audit reports zero high/critical advisories attributable to the Bravo package. Five high advisories remain in the separate `artifacts/api-server` package and are outside this phase's application scope. This dependency-only maintenance tree has not been deployed, so the live production artifact remains `dpl_4wuEL7hxR71zTMHS4QzVmGGxzNxF` pending separate deployment approval.

## Remaining evidence holds and access blockers

- **Deployment — resolved August 18, 2026:** corrected production deployment `dpl_4wuEL7hxR71zTMHS4QzVmGGxzNxF` is ready and passed the final production gate. `dpl_GxY56ofhDD7ikhj4FRK6EVfq9mWi` remains the rollback reference.
- **Version control:** the phase source and local dependency-maintenance tree are preserved by the local completion commit on `codex/seo-aeo-phase1`. Root-level `.env.local` and `.vercel/` are excluded. Remote push/merge remains a separate external action.
- **Indexing requests:** the corrected build and final production gate now qualify for the planned sitemap refresh and priority URL requests. No Search Console submission action has occurred; publishing those requests remains a separate external action.
- **Business Profile:** Bravo is not present in the connected Google account.
- **Review publishing:** final approval is required immediately before posting.
- **GA4/CrUX/CWV:** browser-authenticated Bravo GA4 access is available and the active stream was verified. The GSC workflow still has no Analytics OAuth scope connected, and no CrUX property was available.
- **GA4 stream configuration — resolved August 18, 2026:** “Page changes based on browser history events” was unchecked and saved with explicit approval, then independently rechecked by reopening the advanced settings. The code suppresses automatic page views and protects private/query-bearing entries.
- **Maps rank/backlinks:** a location-controlled map-rank tracker and backlink index were unavailable.
- **Business proof:** provide current certificate of insurance, license verification source, written warranty/estimate policy, financing provider/terms, supported equipment brands, current price sheet, stocked inventory, rebate credentials, permit-service boundaries, project permissions, and NYC/Long Island operating evidence before those claims are published.

## Verification record

- `pnpm --filter @workspace/bravo-mechanical run typecheck` — passed
- `PORT=4173 pnpm --filter @workspace/bravo-mechanical test` — 52/52 passed, including the root-inclusive `app` host noindex regression
- `pnpm --filter @workspace/bravo-mechanical run build` — passed; 140 route-specific HTML files generated
- `pnpm --filter @workspace/bravo-mechanical run test:e2e` — passed
- `pnpm --filter @workspace/bravo-mechanical run audit:seo:local` against the exact static build — 140/140 passed
- `pnpm audit --prod` scoped to the Bravo dependency graph — zero Bravo high/critical advisories after the dependency upgrade; separate `artifacts/api-server` advisories remain outside this phase
- Initial production post-promotion audit — 140/140 sitemap URLs, 8/8 path redirects, apex redirect, global security headers, private-route noindex headers, asset/sitemap cache policies, and 6/6 corrected analytics privacy assertions passed. The separate `app` root noindex check failed and triggered the correction described above.
- Corrective protected-preview audit — 140/140 sitemap URLs, 8/8 path redirects, 3/3 global security headers, 3/3 private-route noindex headers, asset/sitemap cache policies, and 6/6 analytics privacy assertions passed with no failures.
- Final corrected-production audit — 140/140 sitemap URLs, 8/8 path redirects, apex redirect, 3/3 global security headers, 5/5 private/app noindex headers, asset/sitemap cache policies, and 6/6 analytics privacy assertions passed with no failures; Vercel returned no error logs.
- Existing unrelated build warning remains in `src/components/crm/CRMMyJobs.tsx` about a redundant `||` expression.
