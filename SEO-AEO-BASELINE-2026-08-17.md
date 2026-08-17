# Bravo Mechanical SEO and AEO baseline — August 17, 2026

## Method and limitations

Baseline captured on 2026-08-17. Production responses were checked with the five required `curl` requests; repository observations are from the current worktree; public organic research used the required Westchester query themes plus bounded NYC and Long Island queries. Competitor evidence links point to competitor-owned pages, not search-result pages.

This is an evidence baseline, not a ranking report. Search result placement is not recorded because results vary by user, device, location, and time; no rank, volume, review count, price, licensing, response-time, or coverage claim has been inferred from a result snippet. Google Search Console access was not provided, so impressions, queries, clicks, indexing reports, and conversion attribution could not be checked. Google Maps/Business Profile data was not reliably accessible in this environment, so Bravo's visible rating and review count are treated as unverified even where the website states them. Competitor pages describe their own offers and are not independent verification of those offers.

## Production technical baseline

| Check | Evidence | Result | Decision |
| --- | --- | --- | --- |
| Canonical host | `curl -sSI https://bravomechanicalny.com/` on 2026-08-17 returned `HTTP/2 308` with `Location: https://www.bravomechanicalny.com/` | Apex host permanently resolves to `www`. | Retain; use `https://www.bravomechanicalny.com` as the canonical origin. |
| Short emergency URL | `curl -sSI https://www.bravomechanicalny.com/emergency-hvac-westchester` returned `HTTP/2 200`; it is also in the live sitemap. | An indexable short URL serves urgent emergency intent. | Redirect after consolidation. |
| Service emergency URL | `curl -sSI https://www.bravomechanicalny.com/services/emergency-hvac-repair-westchester-county-ny` returned `HTTP/2 200`; it is also in the live sitemap. | A second indexable URL serves the same urgent commercial intent. | Retain as the canonical emergency service URL. |
| Crawl access | `curl -sS https://www.bravomechanicalny.com/robots.txt` permits Googlebot, Bingbot, major AI/LLM user agents, and `User-agent: *`; `/admin/` and `/auth` are disallowed. | Public marketing content is crawlable and the robots file declares the `www` sitemap. | Retain; verify private-route response headers in release checks. |
| Sitemap | `curl -sS https://www.bravomechanicalny.com/sitemap.xml` includes the home, service, service-area, blog, and both emergency URLs. | Sitemap is reachable but currently publishes the duplicate emergency URLs. | Improve: remove the short URL when its permanent redirect ships. |
| Search Console and Maps | No authenticated Search Console property or reliable Google Maps profile rendering was available. | Organic performance and Maps-derived claims cannot be baselined from this workspace. | Evidence-required: export dated GSC and Business Profile evidence before setting KPI targets or publishing review-count changes. |

## August 17 release-candidate implementation

- The verified entity source and scoped visible/generated content now retain only the supported legal name, address, phone, email, canonical `www` origin, and Westchester service area. `llms.txt` points agents to company facts, the four priority service URLs, Yonkers, and direct contact details.
- The four priority service pages share answer-first source content across the React experience and crawler-visible generated HTML, including decision factors, safety escalation, and canonical supporting links.
- The release candidate permanently redirects `/emergency-hvac-westchester` to `/services/emergency-hvac-repair-westchester-county-ny`, removes the legacy URL from generated routes and the sitemap, and produces a 140-URL sitemap.
- All analytics events receive `page_path`; priority service actions receive non-PII service context; booking success records a distinct `booking_submit`; and a tracking transport failure cannot interrupt the user flow. No GA4 configuration, call connection, appointment, completed-job, or revenue attribution was verified.
- The homepage and Yonkers generated and hydrated experiences expose canonical pathways to all four priority services; the homepage also links to commercial HVAC.
- Local release evidence after the final claim-integrity and analytics-privacy corrections: the production build passed, Vitest passed 73/73 tests, typecheck and SEO smoke checks passed, and `git diff --check` passed. A pre-existing CRM redundant-operator warning remains nonblocking. The root workspace has no test script, so Vitest was run from the Bravo application package where `test` is defined.
- Evidence holds remain unchanged for licensing/insurance, ratings/reviews, experience, hours and response performance, pricing/financing, brands, warranties, permits, project outcomes, rebate eligibility, and NYC/Long Island scope. Search Console, Google Maps/Business Profile, rankings, review changes, and revenue outcomes were not available for verification.

## August 17 production verification

- The corrected prebuilt artifact superseded the earlier release as Vercel production deployment `dpl_EQdm5AryneKx6vt1XyYjvQStaTNk` (`bravo-build-lwwc91hvg-joel-carias-projects.vercel.app`) and reached `READY`. Deployment inspection listed `https://www.bravomechanicalny.com`, the apex domain, the application domain, and the project aliases. No DNS or apex redirect setting was changed.
- `https://www.bravomechanicalny.com/sitemap.xml` returned HTTP 200 with 140 URLs. A full crawl found 140/140 HTTP 200 responses, 140/140 exact self-canonicals, exactly one H1 on every URL, and no public meta or response-header `noindex` directive.
- `https://bravomechanicalny.com/contact` returned 308 to the same path on `www`. `/emergency-hvac-westchester` returned 308 to `/services/emergency-hvac-repair-westchester-county-ny`. `/seo-verification-nonexistent-20260817` returned 404. `/admin/crm` returned 200 with `X-Robots-Tag: noindex, nofollow`.
- Live raw HTML on the corrected release exposes the claim-safe Yonkers description and none of the held availability, pricing, licensing/insurance, or generic-brand variants on the canonical AC-repair page. Hydrated regression coverage also verifies Yonkers head, Service schema, visible copy, and all four priority service links. Lead analytics now omit full landing/referrer URLs and accept only bounded, allowlisted campaign identifiers while CRM attribution remains available for lead operations.
- This verifies deployment and crawl contracts only. No Search Console indexing change, Google Maps/Business Profile update, ranking movement, review change, analytics configuration, lead outcome, or revenue result was observed or inferred.

## Claim verification matrix

| Claim | Current source | Verification status | Publishing rule |
| --- | --- | --- | --- |
| Residential and light-commercial HVAC services in Westchester County | Public service pages and sitemap; `src/lib/site.ts` sets the primary area to Westchester County. | Visible on production; scope is internally consistent. | Retain for the named Westchester services and towns actually published. |
| Licensed and insured; License #8822 | `src/lib/site.ts`, `src/pages/CompanyFacts.tsx`, and visible trust copy. | Evidence-required: no issuing-authority record or current insurance evidence was supplied for this baseline. | Remove or hold all existing license, insurance, permit-authority, and legal-scope wording pending dated source documentation; then use the exact jurisdiction and credential wording. |
| 5.0 Google rating based on 7 reviews | `src/lib/site.ts` and `src/pages/CompanyFacts.tsx` (dated there as May 2026). | Evidence-required: Maps/Business Profile data could not be reliably verified here. | Remove or hold the existing rating and review-count copy, including schema, pending a dated profile capture or authorized export; then use a date-qualified value only. |
| 30+ years of combined experience | `src/lib/site.ts` labels this owner-stated as of 2026-07-14. | Evidence-required: owner statement is present, but no independent proof package was supplied. | Remove or hold the existing experience claim pending a dated owner attestation or equivalent evidence; that attestation is the required source evidence, not an exception. If received, use only the narrow owner-stated wording. |
| 24/7 emergency dispatch and open 24 hours | `src/lib/site.ts`, contact page, company-facts page, and emergency pages. | Operational assertion visible on production, but no dispatch logs or coverage/SLA evidence were available. | Remove or hold the existing 24/7/open-hours assertion pending dated operational confirmation; once confirmed, say customers should call for the next available response window and do not promise an SLA. |
| Most emergency calls fixed same visit; 60–120 minute arrival | `src/pages/EmergencyHVAC.tsx` currently makes both claims. | Evidence-required: no job or dispatch evidence was supplied. | Remove or hold the exact arrival and same-visit claims pending dated dispatch/job evidence. Preserve only safety-first triage guidance. |
| Free written estimates, written/fixed pricing, financing | `src/components/PageHero.tsx`, `src/lib/site.ts`, and service content. | Evidence-required: no dated terms, exclusions, lender terms, or pricing policy was supplied. | Remove or hold the existing universal pricing, free-estimate, and financing promises pending approved dated terms; then state the documented scope and exclusions. |
| 30 Westchester towns/municipalities served | `src/pages/CompanyFacts.tsx` says 30, while the `TOWNS` array in `src/lib/site.ts` contains 34 names. | Contradicted by current repository content. | Improve: reconcile the count, list, sitemap, schema, and service-area copy before repeating a numeric coverage claim. |
| Brand, system, permit, and performance specifics | Company-facts, city, and service-content copy names brands, permit handling, equipment performance, and technical methods. | Mixed; no manufacturer authorization, permit records, or project-level evidence was supplied. | Remove or hold claimed credentials, universal permit handling, warranties, exact performance, and broad brand scope pending dated source evidence. Keep only service descriptions supported by that evidence. |
| NYC and Long Island service coverage | The live sitemap and `SITE.area` are Westchester-focused; no Bravo NYC or Long Island service-area route was observed. | No Bravo operating-coverage evidence supplied. | Remove or hold any NYC or Long Island coverage claim; do not create location pages, add `areaServed`, or market those areas pending operating evidence. |

## Priority URL decisions

| Intent | Current URL(s) | Evidence | Decision |
| --- | --- | --- | --- |
| Emergency HVAC repair | `/emergency-hvac-westchester` and `/services/emergency-hvac-repair-westchester-county-ny` | Two indexable commercial pages target the same urgent intent; navigation already promotes the service URL | Keep the service URL and permanently redirect the shorter duplicate |
| AC repair | `/services/ac-repair-westchester-county-ny` | Published in the sitemap and defined as a high-intent service page with a Westchester-specific title and CTA. | Retain; improve only with answer-first, claim-safe proof and conversion context. |
| Boiler repair | `/services/boiler-repair-westchester-county-ny` | Published in the sitemap and defined as a high-intent service page. | Retain; improve only with verified proof and safety-first urgent guidance. |
| Heat-pump installation | `/services/heat-pump-installation-westchester-county-ny` | Published in the sitemap and defined as a high-intent service page. Competitor pages make evaluation, rebates, sizing, and ducted/ductless choices prominent. | Retain; improve with documented local process and accurate incentive/permit conditions, not savings or eligibility guarantees. |
| Westchester service-area cluster | `/service-areas` and city routes | Sitemap has city pages; current source has a 30-versus-34 coverage-count conflict. | Improve after count and local-operating evidence are reconciled. |
| Company facts / AEO reference | `/company-facts` | It centralizes business claims but repeats claims that lack independently available evidence. | Improve: retain the URL but publish only reconciled, date-qualified, source-backed facts. |
| NYC and Long Island expansion | No Bravo NYC or Long Island market route observed in the live sitemap. | Bounded competitor research shows market-specific service, credential, and dispatch messaging, not proof that Bravo operates there. | Evidence-required: no indexable expansion page, schema coverage, or paid/organic targeting until operating evidence exists. |

## Westchester organic competitors

| Competitor | Query/theme observed | First-party proof/offer | Bravo opportunity | Source |
| --- | --- | --- | --- | --- |
| G.C. Reliable Service | `AC repair Westchester County` | A New Rochelle AC-repair service page promotes around-the-clock emergency response and repair diagnostics. | Publish a clearly scoped repair-to-replacement path and documented estimate/maintenance terms; do not imitate offer values without approved terms. | [G.C. Reliable AC repair in New Rochelle](https://www.gcreliable.com/amana/air-conditioning/ac-repair) |
| Gleason Plumbing & Heating | `boiler repair Westchester County` | Boiler-repair page names Westchester towns and a dedicated boiler service offer. | Strengthen Bravo's boiler page around observable symptoms, safe next steps, and a verified service process for the actual coverage area. | [Gleason boiler repair](https://www.armonkplumbing.com/boiler-repair/) |
| Bell Mechanical | `heat pump installation Westchester` | Heat-pump page describes home evaluation, system selection, ducted/ductless options, rebates, and FAQs. | Add decision support rooted in Bravo's verified assessment and permit process; link only to current incentive sources when eligibility is confirmed. | [Bell Mechanical heat-pump installation](https://www.bellmech.com/heating/heat-pumps/heat-pump-installation/) |
| Cottam Heating & Air Conditioning | `emergency HVAC Westchester` | Dedicated emergency page uses an urgent call CTA, 24/7 service language, a maintenance offer, and emergency explanations. | Consolidate Bravo's duplicate emergency intent, keep safety triage and a direct call CTA, and remove unsupported arrival/repair promises. | [Cottam emergency HVAC](https://cottamhvac.com/emergency/) |
| A. Borrelli Mechanical | `HVAC contractor Westchester County NY` | AC page packages installation, maintenance, repair, emergency repair, a town list, financing, and related boiler service. | Make the four priority pages easier to compare and navigate; verify all terms before adding financing or coverage claims. | [A. Borrelli AC installation and repair](https://www.aborrelli.com/residential/ac-installation-repair/) |

## NYC and Long Island expansion evidence

| Market | Observed competitor pattern | Evidence Bravo still needs | Decision |
| --- | --- | --- | --- |
| NYC (bounded query: `HVAC contractor New York City emergency HVAC`) | Competitor pages focus on borough/neighborhood scope, residential/commercial building context, emergency dispatch, and jurisdiction-specific contractor credentials. | Written service-area authorization, dispatcher/technician coverage, applicable NYC credentials and insurance, service evidence, and market-specific customer/support process. | Evidence-required: do not claim NYC coverage or create NYC city/borough pages. See [Rigney HVAC NYC](https://rigneyac.com/) and [Vinco Mechanical emergency HVAC NYC](https://www.vincomechanical.com/emergency-hvac-nyc). |
| Long Island (bounded query: `HVAC contractor Long Island NY emergency service`) | Competitor pages distinguish Nassau and Suffolk coverage and pair emergency service with local licensing, availability, financing, or county/town service pages. | Written Nassau/Suffolk coverage, applicable local licensing/insurance, dispatch capacity, approved price/financing terms, and completed-work proof. | Evidence-required: do not add Long Island to Bravo service-area claims or structured data. See [Able Air Heat](https://ableairheat.com/) and [Pelican Heating & Air service area](https://www.pelicanheatandair.com/service-area-long-island-suffolk-nassau/). |

## Conversion baseline

| Action | Current event | Context captured | Gap |
| --- | --- | --- | --- |
| Phone click | `call_click` through `src/lib/analytics.ts` | `location` only. | Add page path, service, city, urgency, and outcome/offline call matching before evaluating lead quality or revenue. |
| SMS click | `sms_click` | `location` only. | Add the same landing and intent context; no delivery, reply, or booked-job outcome is captured in the web event. |
| Emergency call CTA | `emergency_cta_click` on the legacy emergency page | Named hero/footer location. | Preserve emergency intent and page context on the canonical URL; distinguish a click from a connected call, dispatch, or completed repair. |
| Request-service CTA | `request_service_click` | `location` only. | Add destination/page/service context and connect completed forms or booked jobs to the initiating CTA. |
| Contact lead form | `lead_submit` (`contact_lead_form`) | Service, form source, duplicate flag, source page, landing URL, referrer, UTM fields, `gclid`, and `fbclid`; the lead record receives the same attribution fields. | Confirm GA4 conversion configuration and join successful leads to booked/completed revenue without sending customer PII to analytics. |
| Online booking | `lead_submit` (`online_booking`) | Service and source in the event; booking data is stored as an online-booking lead. | Capture landing/referrer/campaign context consistently and connect the booking to confirmation, attendance, job value, and revenue. |
| Organic reporting | GA4 loader exists in `index.html`; no Search Console export was available. | Page views and client-side events are implemented. | Evidence-required: configure/report GSC query-to-landing-page data and an approved offline conversion process before assigning organic revenue targets. |
