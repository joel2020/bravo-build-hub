# Bravo Mechanical SEO execution plan

**Prepared:** August 12, 2026
**Business:** Bravo Mechanical LLC
**Website:** https://www.bravomechanicalny.com/
**Market priority:** Westchester County (60%), New York City (25%), Long Island (15%)

## Executive conclusion

The dominant indexing problem was a canonical-host migration problem, not a current crawl block. The August 11 Search Console evidence contains 155 excluded URLs, but most of those records refer to the old apex host and predate the production correction. Current production redirects the apex host to `www`, declares `www` canonicals, allows public crawling, references the correct sitemap, returns 200 for all 140 sitemap URLs after the August 17 consolidation, returns a real 404 for fabricated URLs, and applies `noindex, nofollow` to private app routes.

The next indexing gains will come from submitting and validating the current `www` sitemap, inspecting current URLs by template, consolidating overlapping intent, refreshing stale claims, improving the weaker prerendered pages, and earning stronger local authority. Another blanket indexing-request cycle should not be the first move.

Bravo's strongest current search alignment is Westchester. NYC and Long Island should be selective expansion markets rather than immediate city-page factories. Public Google Maps showed a 5.0 rating from 15 reviews. All 15 reviews now have owner responses; the final three responses were published and verified on August 12, 2026.

## What was verified

- Public address: 1 Fowler Avenue, Yonkers, NY 10701.
- Public phone: (914) 361-9142.
- Public listing category: HVAC contractor.
- Google rating observed August 12: 5.0 from 15 reviews.
- Public hours: open 24 hours every day.
- Apparent services: AC repair and installation; boiler and furnace repair and installation; heat pumps and mini-splits; water heaters; emergency HVAC; maintenance; commercial HVAC; ventilation; indoor air quality; oil-to-gas conversion; permit reconciliation.
- Current website emphasis: Westchester County. The public site does not yet substantiate a comparable NYC or Long Island footprint.
- Claims still requiring business documentation: license #8822 and scope, insurance, 30+ combined years, free estimates, brands, financing terms, warranties, 24/7 operating process, rebate/program participation, and the full NYC/Long Island service boundary.

## Indexing diagnosis

### Execution update — August 12, 2026

- Submitted `https://www.bravomechanicalny.com/sitemap.xml` to Google Search Console. Google read it successfully the same day and discovered 148 live URLs.
- Retained the former apex sitemap temporarily while Google processes the host migration.
- Ran a live URL test on the `www` homepage: Google reported that the URL is available and can be indexed.
- Requested indexing for the corrected `www` homepage; Search Console confirmed it was added to the priority crawl queue.
- Inspected representative templates:

| URL | Search Console result | Action |
|---|---|---|
| `https://www.bravomechanicalny.com/` | Not indexed; stale alternate canonical from August 8 apex crawl | Live test passed; recrawl requested |
| `/services/ac-repair-westchester-county-ny` | Not indexed; stale alternate canonical from July 21 apex crawl | Allow new sitemap/canonical processing; do not repeatedly submit |
| `/service-areas/yonkers` | Indexed; stale review-snippet issues remain in historical crawl | Current source removed self-serving aggregate rating; monitor after recrawl |
| `/services/hvac-repair/yonkers` | Indexed with valid HTTPS, breadcrumbs and review snippets | Retain and strengthen with project proof |
| `/blog/ac-not-cooling-westchester` | Discovered, never crawled | Permanently redirect to the already indexed duplicate |
| `/blog/why-is-my-ac-not-cooling-westchester` | Indexed | Retain this URL with the newer, stronger article content |

- Added and deployed a permanent redirect from the unindexed duplicate AC article to the indexed URL, removed the duplicate from the generated sitemap, updated the inbound link and cover mapping, and retained the newer article copy at the indexed slug.
- Demoted the repeated generic no-JavaScript heading from H1 to H2. Generated routes now expose exactly one primary H1.
- Added smoke coverage for the redirect, sitemap consolidation and one-H1 contract.
- Fresh verification: production build passed; Vitest passed 42/42 tests; SEO smoke checks passed; `git diff --check` passed. The build still reports the pre-existing `CRMMyJobs.tsx` unreachable-expression warning recorded elsewhere in the repository.
- Deployed the final verified artifact to Vercel production on August 12, 2026 (`dpl_4PJrpXyCjfYmsuqxaa1c2BTm5VNF`). Vercel reported `READY`, and the release is active on `www.bravomechanicalny.com`.
- Changed the apex-domain redirect setting from temporary to permanent. `https://bravomechanicalny.com/*` now returns HTTP 308 to the same path on `https://www.bravomechanicalny.com/*`.
- A full post-deployment crawl found six equipment-guide URLs in the first sitemap that canonicalized to their matching service pages. Sitemap generation was corrected and protected by a regression test. The final sitemap contains 141 URLs; all 141 returned HTTP 200, self-canonicalized, exposed exactly one H1, and remained indexable. The six guide pages remain available to users but are no longer submitted as canonical URLs.
- Additional public checks confirmed: the duplicate article returns 308; robots.txt names the canonical sitemap; fabricated URLs return 404; and `/auth`, `/admin/*`, and `/proposal/*` return `X-Robots-Tag: noindex, nofollow`.

### Revenue-first SEO/AEO implementation — August 17, 2026

- **Current research baseline and competitor evidence:** captured a dated Westchester-first research baseline with direct competitor-owned sources and bounded NYC/Long Island context. It is an evidence baseline, not a live ranking or Maps report; Search Console and reliable Google Business Profile evidence were unavailable.
- **Entity and `llms.txt` changes:** aligned the legal name, address, phone, email, canonical `www` origin, and Westchester service area across scoped entity content and crawler-visible fallback output. Replaced `llms.txt` with concise canonical navigation to company facts, the four priority services, Yonkers, phone, and email.
- **Priority answer modules:** added one typed source for answer-first AC repair, boiler repair, heat-pump installation, and emergency HVAC content. React and prerendered HTML carry the same summaries, decision factors, safety guidance, and canonical supporting links.
- **Emergency URL consolidation:** made `/services/emergency-hvac-repair-westchester-county-ny` the canonical urgent-service URL, permanently redirects `/emergency-hvac-westchester`, removed the legacy URL from generated routes and the sitemap, and preserved reciprocal English/Spanish alternate metadata. The generated sitemap now contains 140 canonical URLs.
- **Conversion-event coverage:** all client-side events receive `page_path`; priority service calls and request actions receive non-PII service context; online booking records `booking_submit` only after persistence succeeds. Analytics selects one transport and cannot block navigation or form completion if tracking throws.
- **Homepage and Yonkers pathways:** the homepage links directly to all four priority services and commercial HVAC. The Yonkers page and generated HTML expose a locally framed selection path to AC repair, boiler repair, emergency HVAC, and heat-pump evaluation; route generation rejects missing or incorrect canonical paths.
- **Local verification results:** repository production build passed after restoring two locally omitted Darwin native binaries excluded by workspace dependency overrides; Vitest passed 70/70 tests; SEO smoke checks passed; `git diff --check` passed; and sitemap generation reported 140 URLs. The workspace-root `PORT=4173 pnpm test` launcher has no root script and exits silently, so the required Vitest command was run from `artifacts/bravo-mechanical`, where the test interface is defined.
- **Claims still requiring business evidence:** licensing/insurance and jurisdiction, rating/review count, combined experience, emergency hours/dispatch performance, pricing/free-estimate/financing terms, brands, warranties, permit authority, project outcomes, program eligibility, and any NYC or Long Island coverage remain held pending dated evidence. No August 17 Search Console, Maps, ranking, review, or revenue update was verified.
- **Production release evidence:** deployed the verified prebuilt artifact to Vercel production as `dpl_HwPsudx3qaCPKdHgxoCAL7pTMHcy` (`bravo-build-28pwhd54l-joel-carias-projects.vercel.app`). Vercel reported `READY`; deployment inspection listed `www.bravomechanicalny.com`, `bravomechanicalny.com`, `app.bravomechanicalny.com`, and the project aliases. No DNS or domain redirect setting was changed.
- **Full public audit:** the live sitemap returned 200 and contained 140 URLs. All 140 returned HTTP 200, self-canonicalized to the submitted URL, exposed exactly one H1, and had no meta or `X-Robots-Tag` `noindex` directive. The apex `/contact` path returned 308 to the matching `www` path; the legacy emergency URL returned 308 to the canonical service URL; a fabricated URL returned 404; and `/admin/crm` returned `X-Robots-Tag: noindex, nofollow`.

### Search Console baseline

The August 11 export, whose page-indexing data was last updated August 6, reported:

| Cause | Pages | Interpretation | Action |
|---|---:|---|---|
| Alternate page with proper canonical | 25 | Mostly `www` pages observed while the former deployment canonicalized to apex | Revalidate after migration; do not request these duplicates individually |
| Duplicate without user-selected canonical | 3 | Three `www` blog posts last crawled in May | Inspect, consolidate overlapping intent, then validate |
| Page with redirect | 3 | Host aliases and one old apex blog URL | Expected exclusion if redirect target is correct |
| Crawled, currently not indexed | 7 | Two service-area pages, one service/city page, four blog posts; several old apex URLs | Inspect the current `www` examples and improve/merge/noindex based on value |
| Discovered, currently not indexed | 117 | Old apex URLs across most templates | Submit current sitemap and monitor current `www` URLs by template |

### Current production checks

| Check | Result | Status |
|---|---|---|
| Apex to `www` | Permanent 308 to the same path on `www` | Pass |
| robots.txt | Public crawling allowed; correct `www` sitemap declared | Pass |
| Sitemap | 140 unique, self-canonical `www` URLs after duplicate and emergency-intent consolidation | Pass |
| Sitemap URL responses | 140/140 returned HTTP 200 in the August 17 production crawl | Pass |
| Canonicals | 140/140 sitemap URLs self-canonicalized to the submitted URL | Pass |
| Meta robots | 140/140 sitemap URLs had no meta or response-header `noindex` directive | Pass |
| Unknown URL | Real HTTP 404 | Pass |
| Private routes | `/auth` and `/admin/users` return `X-Robots-Tag: noindex, nofollow` | Pass |
| Titles | The prior 148-title result predates consolidation; title uniqueness was not part of the August 17 release crawl | Re-audit separately |
| Raw HTML headings | 140/140 sitemap URLs exposed exactly one H1 in the August 17 production crawl | Pass |
| Weak raw-HTML pages | 19 pages contained fewer than 300 visible raw-HTML words in the crawl | Review for fuller server-rendered/prerendered content |

### Confirmed or likely remaining problems

1. **Stale Search Console state:** the old host dominates the exclusion report. Current-host validation has not yet caught up.
2. **Obsolete time-sensitive content:** the 2025 rebate page competes with the 2026 version. Redirect `/blog/ny-heat-pump-rebates-2025` to the verified 2026/current evergreen rebate guide after fact-checking. Refresh 2025 claims in heat-pump cost, boiler cost, refrigerant, smart thermostat, oil-to-gas, and related posts.
3. **Over-expansion risk:** 34 service-area URLs plus 20 service/city combinations and numerous city blog posts create a quality threshold problem even when exact text is unique. Keep only pages with real local proof and distinct demand.
4. **Thin prerendered shells:** reviews, company facts, about, maintenance, contact, financing, projects, booking, emergency and Spanish routes expose limited raw HTML before JavaScript. Strengthen the server-rendered body for pages expected to rank; noindex utility-only routes if they have no search purpose.
5. **Authority gap:** Bravo has excellent ratings but only 15 reviews. Established Westchester competitors signal decades in business, licenses, financing, memberships, rebates, and extensive project evidence.

## Priority URL decisions

| URL | Decision | Primary target | Reason |
|---|---|---|---|
| `/` | Improve and defend | HVAC contractor Westchester County NY | Already the strongest aligned and publicly surfaced Bravo result |
| `/services/ac-repair-westchester-county-ny` | Improve | AC repair Westchester County NY | High urgency and summer lead intent |
| `/services/boiler-repair-westchester-county-ny` | Improve | Boiler repair Westchester County NY | Strong fit with existing reviews and local housing stock |
| `/services/heat-pump-installation-westchester-county-ny` | Improve | Heat pump installation Westchester County NY | High-ticket growth category; competitors invest heavily here |
| `/services/emergency-hvac-repair-westchester-county-ny` | Consolidated; improve the canonical page | Emergency HVAC repair Westchester County | The legacy URL now permanently redirects and is absent from the sitemap; monitor Search Console migration and canonical processing |
| `/service-areas/yonkers` | Improve first among city pages | HVAC contractor Yonkers NY | Headquarters and strongest location proof |
| Two “AC not cooling” posts | Merge and redirect | AC running but not cooling | Duplicate intent |
| 2025 and 2026 rebate posts | Consolidate into one maintained evergreen URL | NY heat pump rebates | Avoid stale claims and annual URL churn |

### Recommended page format for priority service pages

1. Direct emergency/service answer and call CTA.
2. Symptoms and jobs handled.
3. Diagnostic process and written-pricing process.
4. Repair-versus-replace decision factors.
5. Westchester-specific equipment/building considerations.
6. Two or more verified local projects with problem, work, equipment, municipality, and outcome.
7. Applicable credentials, warranty, financing, and program participation after verification.
8. Service-area links limited to locations with proof.
9. Original photographs with descriptive alt text.
10. Five to eight concise FAQs based on customer questions.
11. Clear call, booking and estimate actions.

## Keyword map

No paid keyword-volume dataset was available, so priority is based on observed search competition, commercial intent, Bravo's services, seasonality, and existing proof—not fabricated volume numbers.

| Priority | Market | Keyword cluster | Target |
|---:|---|---|---|
| 1 | Westchester | HVAC contractor, HVAC company, heating and cooling contractor | Homepage |
| 1 | Westchester | AC repair, emergency AC repair, AC not cooling | AC repair service page; one supporting diagnostic guide |
| 1 | Westchester | Boiler repair, no heat, boiler leaking/short cycling/noise | Boiler repair page plus problem guides |
| 1 | Westchester | Heat pump installation, cold-climate heat pump, rebates, cost | Heat-pump service page plus verified cost/rebate guides |
| 1 | Yonkers | HVAC contractor/repair/installation Yonkers | Yonkers hub with local projects and links to service pages |
| 2 | Westchester | Mini-split installation, ductless AC, permit/reconciliation | Mini-split page and permit guide |
| 2 | Westchester | AC/boiler/furnace installation and replacement cost | Existing installation pages and refreshed cost guides |
| 2 | Westchester | Commercial HVAC, rooftop units, service contracts, multifamily | Commercial hub plus property/equipment subsections |
| 2 | Westchester towns | White Plains, New Rochelle, Mount Vernon, Scarsdale HVAC | Retain only with unique projects/testimonials/local detail |
| 3 | NYC | Bronx or selected borough + exact service/building type | Create only after service capacity, licensing, projects and testimonials are verified |
| 3 | Long Island | Nassau/Suffolk + exact service | Create only after licensing/program participation and completed local work are verified |

## Competitor findings

This was an independent public-web scan of the businesses surfacing for relevant local service searches and of the positioning on their own websites. It is an organic competitor set, not a claimed live Google Maps rank report; exact map-pack positions and review counts should be measured later from a localized grid-tracking session.

### Westchester

Primary organic competitors include G.C. Reliable, J. Daher, A. Borrelli, Robin Aire, Maselli, Phoenix Mechanical, Nu-Way, Royal Comfort, Yost & Campbell, and Euro Comfort. Their recurring advantages are longevity, visible licensing, emergency availability, financing/membership programs, plumbing breadth, heat-pump authority, and deeper project/reputation signals.

Bravo's opportunity is to be more specific and more evidentiary: written diagnostic process, real project outcomes, Westchester building knowledge, boiler and cold-climate heat-pump expertise, and stronger city-level proof.

### New York City

The market splits into commercial/mechanical firms and residential mini-split retrofit specialists. Relevant competitors include Vinco Mechanical, AFGO, Commercial HVAC Company, Gotham HVAC, Viking HVAC, Mr. Air NYC, Heatspan, and Euro Comfort.

Do not launch one generic “NYC HVAC” page. Start with one verified borough and one building/service niche—such as Bronx multifamily boilers, retail RTUs, or Brooklyn mini-split retrofits—only if operations and project evidence support it.

### Long Island

Relevant competitors include Elm Air, Around the Clock Refrigeration, B.A.C. Systems, Icon Aire, Mustang Heating & Air, and All Season Climate Pros. Search competitors emphasize separate Nassau/Suffolk coverage, local licensing, PSEG participation, same-day service, boilers, ductless systems and rebates.

Do not publish Nassau or Suffolk landing pages until Bravo can demonstrate the relevant local licensing, program eligibility, response capability, completed projects, and reviews.

## Local SEO and review plan

### Google Business Profile actions

1. Verify the primary category and add only accurate secondary categories.
2. Populate all verified services with concise descriptions and matching landing pages.
3. Add new, original project photos every week with accurate service and location context.
4. Add one project-oriented Google post weekly.
5. Ask every completed customer for an honest review using one consistent SMS/email workflow; never gate by predicted sentiment.
6. Respond within two business days. Escalate safety, liability, employee, insurance and property-damage complaints.
7. Track review requests, review arrival, response status and service mentioned.

### Review-response operating process

1. Assign one primary owner and one backup to check the Google Business Profile inbox every business day.
2. Log each new review in a simple tracker with reviewer, date, rating, service, town, sentiment, response owner, due date, reply date and escalation status.
3. Respond to routine reviews within two business days. Use the customer's first name when available, mention one genuine service detail, thank them, and avoid repeating the exact same template.
4. For neutral or negative reviews, acknowledge the concern without debating facts publicly, move account-specific details offline, and give a monitored phone or email contact.
5. Escalate safety, injury, property damage, discrimination, employee allegations, insurance, legal threats and requests involving private customer information before replying.
6. Never disclose addresses, equipment serial numbers, invoice details or other private information. Never offer compensation in exchange for editing or removing a review.
7. Audit the tracker every Friday. The operating target is 100% response coverage, no routine review older than two business days, and documented resolution follow-up for every escalated review.
8. Continue asking every completed customer for an honest review through the same non-gated SMS/email request, then measure request-to-review conversion and service/location coverage monthly.

### Review audit, August 12

| Reviewer | Rating | Status |
|---|---:|---|
| michael link | 5 | Answered August 12, 2026 |
| Frank | 5 | Answered August 12, 2026 |
| Yalanda Gaston | 5 | Answered August 12, 2026 |
| Tishaily Lora | 5 | Answered |
| Julio Cerda | 5 | Answered |
| Carlos Alvarez | 5 | Answered |
| jeffrey | 5 | Answered |
| Gilberto Gutierrez | 5 | Answered |
| Joel Carias | 5 | Answered |
| shaisky urena | 5 | Answered |
| Dwight Cooper | 5 | Answered |
| Gyongyi Meggyes | 5 | Answered |
| Gabriel Rivera | 5 | Answered |
| Edward Rivera | 5 | Answered |
| Jake Reyes | 5 | Answered |

### Responses published August 12, 2026

**michael link**

> Thank you, Michael. We’re glad Brahyan could get there quickly, diagnose the boiler problem thoroughly, and make the repair at a fair price. We appreciate you trusting Bravo and sharing the photo.

**Frank**

> Thank you, Frank. Replacing a nearly 30-year-old system is a major project, and we’re glad the team made the installation professional, comfortable, and reassuring from start to finish. We hope the new system serves you efficiently for many years.

**Yalanda Gaston**

> Thank you, Yalanda. We’re glad our technician could accurately diagnose the R-22 system and solve the immediate problem without pushing an unnecessary replacement. We appreciate the referral and your trust in Bravo Mechanical.

## Authority plan

1. Verify and correct NAP data across Google, Bing Places, Apple Business Connect, Yelp, BBB, Angi and relevant HVAC directories.
2. Pursue memberships/listings with local chambers and legitimate trade associations.
3. Build manufacturer/dealer profiles only for verified relationships.
4. Publish detailed project pages that local partners, suppliers and property managers can cite.
5. Seek supplier spotlights, community sponsorship mentions, real-estate/property-management partnerships, and local media expert commentary.
6. For heat pumps, verify NYS Clean Heat/Con Edison/PSEG eligibility before making program claims.
7. Avoid purchased links, mass directories, reciprocal-link schemes and fake location profiles.

## 90-day roadmap

| Timing | Action | Success measure |
|---|---|---|
| Days 1–3 | ~~Approve and publish the three pending Google responses~~ Completed August 12 | 15/15 response coverage achieved |
| Days 1–7 | Submit the canonical `www` sitemap in Search Console; retain the old entry until the new one is successfully read | New sitemap status Success; 148 discovered URLs |
| Days 1–10 | Inspect representative current URLs from homepage, service, service-area, service/city and blog templates | Current canonical, rendered HTML and indexing decision recorded |
| Days 1–14 | ~~Merge the duplicate AC-not-cooling posts~~ Completed August 12; consolidate rebate URLs after fact-checking | One canonical URL per intent; redirects verified |
| Days 1–14 | Refresh or remove stale 2025 pricing, rebate and regulatory claims | No obsolete claim remains live |
| Days 8–21 | ~~Remove the repeated fallback H1~~ Completed August 12; strengthen prerendered content on ranking pages | One primary H1 per page; meaningful raw HTML |
| Days 15–30 | Upgrade homepage, AC repair, boiler repair, heat pump and emergency pages | Complete briefs, project proof and CTAs live |
| Days 15–30 | Upgrade Yonkers page and select only four additional high-proof Westchester locations | Unique local proof on each retained priority page |
| Days 15–30 | Fully optimize GBP services, photos and categories | All verified fields complete |
| Days 31–60 | Publish 4–6 project case studies and build service-to-location internal links | Case studies indexed; priority URLs gain relevant links |
| Days 31–60 | Establish weekly review request and GBP post workflows | Response time under two business days; steady review velocity |
| Days 31–60 | Build qualified citation and partnership list | NAP consistency; first legitimate new referring domains |
| Days 61–90 | Launch one NYC pilot only if operational proof is approved | One focused borough/building/service page, not a city-page set |
| Days 61–90 | Collect Long Island licensing/program/project evidence; do not publish prematurely | Go/no-go decision for Nassau and Suffolk |
| Weekly | Monitor page indexing by reason and query/page performance | Current `www` valid-page count rises; stale apex exclusions decline |
| Monthly | Review calls, forms, bookings and qualified leads by landing page | SEO decisions tied to qualified leads, not traffic alone |

## Measurement dashboard

Track Search Console valid/excluded URLs, impressions, clicks, CTR and query/page position; GA4 organic calls/forms/bookings; Google Business Profile calls, website clicks and direction requests; review count, rating, velocity and response coverage; referring domains; and Core Web Vitals.

Use a weekly indexing dashboard and a monthly lead/revenue review. Record a fresh baseline after the canonical `www` sitemap has been read, because the current exclusion totals are migration-contaminated.

## Immediate approvals and access needed

1. Confirmation/documentation for all public business claims.
2. GA4/GTM access and call-tracking data to establish lead baselines.
3. Verified NYC boroughs and Long Island counties actually served, plus licenses, response capacity and completed jobs in each.
