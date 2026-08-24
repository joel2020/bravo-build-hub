# Bravo Mechanical weekly SEO/AEO content evidence package

**Run date:** August 24, 2026

**Publication candidate:** `https://www.bravomechanicalny.com/blog/furnace-smells-like-burning-westchester`

**Status at drafting:** Local implementation complete; publication requires all local, protected-preview, and production gates.

## Monitoring context

### Current-period KPI retrieval

The requested latest 28 settled days (July 25–August 21, 2026) versus the preceding equivalent period (June 27–July 24, 2026) could not be retrieved. Every connected GSC Wizard call returned `payment_required` because the trial has ended. This blocked totals, page/query comparisons, current sitemap details, tracker state, fresh URL inspections, and the connector's GA4 reports. The authenticated Google browser fallback was attempted three times but timed out before the reports could be read. No KPI value is inferred or carried forward as current.

The baseline from `migration-notes/bravo-seo-aeo-phase-1-2026-08-17.md` remains the comparison reference, not a current result:

- Search: 47 clicks, 11,567 impressions, 0.406% CTR, average position 21.29 for its documented 28-day baseline.
- GA4 settled July 22–August 18: 188 sessions, 72 Organic Search sessions, 3 AI Assistant sessions, and zero reported key events. The overview also showed 16 `request_service_click` and 7 `form_start` events, but no qualified or converted leads.
- Priority baseline: homepage 21 clicks / 2,890 impressions / position 10.56; AC repair 501 impressions / 43.69; boiler repair 410 impressions / 30.21; heat-pump installation 58 impressions / 37.17; emergency HVAC 58 impressions / 12.16. The source note did not contain complete current-period page metrics for every requested URL, so missing values are not reconstructed.

### Live technical health on August 24, 2026

The homepage and all five priority URLs returned HTTP 200, allowed indexing, and exposed exact `https://www.bravomechanicalny.com/...` self-canonicals:

- `/`
- `/services/ac-repair-westchester-county-ny`
- `/services/boiler-repair-westchester-county-ny`
- `/services/heat-pump-installation-westchester-county-ny`
- `/services/emergency-hvac-repair-westchester-county-ny`
- `/service-areas/yonkers`

The live sitemap contained 140 canonical URLs before this article was added.

### Latest available indexing evidence

This is dated evidence, not a fresh August 24 connector result. The canonical sitemap was resubmitted August 19 and Search Console acknowledged Success with 140 discovered URLs. AC repair, boiler repair, heat-pump installation, and emergency HVAC were each requested once; Yonkers was already indexed and was not requested again. The August 20 review found 71 not indexed and 70 indexed in the then-available report snapshot: 46 discovered/not indexed, 19 stale alternate-canonical records, 3 stale duplicate-without-selected-canonical records, 2 crawled/not indexed, and one `/services` Google-selected-apex record. Live tests for `/services` and the zoning article passed on August 20. No sitemap or indexing action was taken during this run.

## Topic and intent decision

**Primary intent:** What should a homeowner do when a furnace smells like burning at first seasonal startup?

**Proposed title/H1:** Furnace Smells Like Burning? What to Do

**Title tag:** Furnace Smells Like Burning? What to Do | Bravo Mechanical

**Meta description:** Learn which furnace odors can happen at first startup, which warning signs require an immediate shutdown, and when Westchester homeowners should call for help.

**Slug:** `furnace-smells-like-burning-westchester`

**Audience:** Westchester County homeowners and residential property managers preparing for heating season.

**Conversion goal:** A safety-qualified furnace diagnostic request after utility or emergency response when applicable.

### Why this topic was selected

- Seasonal timing: late August is early preparation time for the first fall heating startup.
- Clear homeowner need: odor triage combines informational and repair intent while requiring careful safety boundaries.
- Service relevance: it supports the furnace-repair and emergency-HVAC pages without replacing their commercial intent.
- Current query data was unavailable, so selection relied on the documented heating-service priorities, seasonality, existing content inventory, and public search-intent review. It is not presented as a measured current-query winner.

### Duplicate-intent and cannibalization review

| Existing page | Primary intent | Separation from this article |
|---|---|---|
| `/services/furnace-repair-westchester-county-ny` | Hire furnace repair service | The article answers odor triage; it links to the service page for diagnosis. |
| `/services/emergency-hvac-repair-westchester-county-ny` | Request urgent HVAC service | The article explains which odor conditions require emergency responders or the utility first. |
| `/blog/winter-furnace-prep-westchester` | Pre-season maintenance checklist | The new article focuses only on odor recognition and safe response. |
| `/blog/is-furnace-short-cycling-dangerous` | Repeated on/off cycling and associated risks | The new article does not target cycling; it links there when cycling is also present. |
| `/blog/24-7-emergency-furnace-repair-westchester` | No-heat emergency triage | The new article targets a running furnace that produces an odor, not a no-heat outage. |

Repository searches found no existing page dedicated to the burning-smell intent. The new slug does not duplicate an existing route.

## AEO-ready direct answers

**Primary answer:** A light dusty odor can occur when a furnace starts after months of sitting idle, and it should fade rather than grow stronger. Turn the system off and call a qualified HVAC professional if the odor persists, intensifies, smells electrical or plastic-like, or comes with smoke, soot, unusual noises, or repeated shutdowns. For rotten-egg odor, a carbon monoxide alarm, or fire, leave the building and call 911 from a safe location.

**Carbon monoxide answer:** Carbon monoxide has no smell. If a carbon monoxide alarm sounds, move outside, call 911, and do not re-enter until responders say it is safe.

**Homeowner boundary:** A homeowner can observe the odor pattern, check a readily accessible filter, clear combustibles, and test alarms according to their instructions. Burner, combustion, gas, oil, electrical, venting, and internal-equipment work requires a qualified professional.

## FAQ and structured-data recommendation

Visible FAQs answer:

1. How long should a dusty furnace smell last?
2. Can a dirty furnace filter cause a burning smell?
3. Does carbon monoxide smell like something burning?
4. Should I keep running the furnace to see whether the smell goes away?

The established build automatically emits `BlogPosting` and `BreadcrumbList` JSON-LD for the article. Do not add `HowTo` schema because this is safety triage, not a procedure users should complete. Do not add separate `FAQPage` markup in this release: visible answer-first FAQs provide AEO value, while Google's FAQ rich-result eligibility is generally limited and extra schema would add maintenance risk without changing the article's user value.

## Internal-link plan

- `furnace repair in Westchester County` → `/services/furnace-repair-westchester-county-ny`
- `emergency HVAC repair page` → `/services/emergency-hvac-repair-westchester-county-ny`
- `Westchester furnace preparation checklist` → `/blog/winter-furnace-prep-westchester`
- `furnace short cycling` → `/blog/is-furnace-short-cycling-dangerous`

The article is automatically included on the blog index, sitemap, build-time route catalog, and related-post surfaces through the existing markdown loader. The slug is added to full-body static prerendering for non-JavaScript crawlers.

## Conversion CTA

For diagnosis and repair options, visit the furnace-repair service page. For smoke, fire, a gas odor, or a carbon monoxide alarm, contact emergency responders or the utility first. For urgent HVAC help after the site is safe, use the emergency-HVAC page or call (914) 361-9142.

This CTA avoids response-time, price, availability, warranty, licensing, financing, and outcome promises.

## Factual-claims review

| Claim | Evidence | Review outcome |
|---|---|---|
| Light dust odor can occur at first seasonal startup and should fade | Trane and Carrier furnace guidance | Qualified as a possible, temporary condition; not a diagnosis or blanket safety assurance. |
| Rotten-egg odor requires leaving and calling from a safe location; avoid switches/electronics inside | Con Edison gas-safety guidance | Included with the official Con Edison emergency number and 911. |
| Carbon monoxide is odorless; alarm response is fresh air/911/no re-entry until cleared | U.S. CPSC carbon-monoxide fact sheet | Included in emergency and FAQ sections. |
| Keep combustibles at least three feet from heating equipment | NFPA heating-safety sheet | Included as a safe homeowner action. |
| Pre-season professional inspection covers combustion/fuel connections/heat exchanger | ENERGY STAR maintenance checklist | Included as professional-only context. |
| Electrical/plastic odors require shutdown and professional inspection | Trane and Carrier manufacturer guidance | Included without naming a specific failed part as a diagnosis. |

No prices, rebates, warranties, financing terms, brands serviced, inventory, response times, customer outcomes, or new geographic claims were added.

## Sources reviewed August 24, 2026

- [U.S. Consumer Product Safety Commission — Carbon Monoxide Fact Sheet](https://www.cpsc.gov/safety-education/safety-guides/carbon-monoxide/carbon-monoxide-fact-sheet)
- [U.S. Consumer Product Safety Commission — Keep Warm and Safe This Winter](https://www.cpsc.gov/Newsroom/News-Releases/2026/Keep-Warm-and-Safe-This-Winter-Tips-for-Using-Generators-Furnaces-and-Space-Heaters)
- [ENERGY STAR — HVAC Maintenance Checklist](https://www.energystar.gov/saveathome/heating-cooling/maintenance-checklist)
- [Con Edison — Gas Safety](https://prodcdc10.coned.com/en/safety/energy-safety/gas-safety)
- [Con Edison — Contact Us](https://www.coned.com/en/contact-us)
- [National Fire Protection Association — Heating Safety](https://content.nfpa.org/-/media/project/storefront/catalog/files/safety-tip-sheets/heatingsafetytips.pdf?rev=28632068e8784f83bc0092317fa78672)
- [Trane — Why Does My Furnace Smell Like Burning?](https://www.trane.com/residential/en/resources/troubleshooting/gas-furnaces/furnace-smells-like-burning/)
- [Carrier — Burning Smell in House?](https://www.carrier.com/us/en/residential/hvac-resources/furnaces/burning-smell-in-house/)

## Image brief and alt text

**Brief:** Original horizontal photo, 16:9, of a residential furnace in a clean Westchester basement or mechanical room. Show a homeowner observing from several feet away while a qualified technician examines the exterior controls. No smoke, flames, open burner compartment, unsafe tool use, visible customer information, fabricated branded equipment, or text overlay. The image should communicate cautious inspection, not panic.

**Accessible alt text:** `HVAC technician inspecting a residential furnace after the homeowner noticed an unusual odor`

No new image is published in this release because no documented original/customer-approved asset matching the brief is available. The article remains usable and accessible without decorative media.

## Social drafts — not authorized for publication

### Facebook

Turning on the furnace for the first time this fall and noticing a burning smell? A light dusty odor may fade after seasonal startup—but electrical, plastic, smoky, oily, or rotten-egg odors need a different response.

Our new Westchester guide explains what homeowners can check safely, when to turn the system off, and when to leave the building and call 911 or Con Edison first.

Read the guide: https://www.bravomechanicalny.com/blog/furnace-smells-like-burning-westchester

For furnace diagnosis after the site is safe, call Bravo Mechanical at (914) 361-9142.

### Instagram

Furnace smells like burning at first startup? Know the difference between a light dusty odor that fades and warning signs that mean stop.

Leave and call 911 from a safe location for a rotten-egg odor, a carbon monoxide alarm, smoke, sparks, or fire. For persistent electrical, plastic, oily, or smoky odors, keep the system off and request professional service.

The full Westchester homeowner guide is at the link in bio.

#WestchesterNY #FurnaceSafety #HeatingSeason #HVACTips #HomeSafety #BravoMechanical

**Publication restriction:** These captions are drafts only. This run does not authorize posting to Facebook or Instagram.

## Release evidence

Local verification completed August 24, 2026:

- Type check: passed.
- Automated tests: 56/56 passed.
- Production build: passed; generated 141 canonical sitemap URLs and 141 prerendered route files.
- Build smoke checks: passed, including article sitemap presence, full safety-body prerendering, Con Edison emergency number, and `BlogPosting` schema.
- Local crawler audit: 141/141 sitemap URLs passed with zero failures.
- Rendered article: correct H1, August 24 display date, 58-character title, 159-character description, self-canonical, index/follow directive, answer-first copy, internal service links, and Article/BlogPosting structured data.
- Browser snapshot audit: 100 accessibility, 100 best practices, 100 SEO, and 100 agentic browsing; 40 checks passed and zero failed.
- Source availability: the cited CPSC, ENERGY STAR, Con Edison, Trane, and Carrier pages returned HTTP 200 when checked.
- Internal links: all four article destinations returned HTTP 200 locally.
- Duplicate-intent check: no duplicate route or title; highest word-set similarity to an existing article was 0.20.

The first rendered review exposed a one-day date shift caused by UTC parsing in the shared blog template. The display parser was corrected, a regression test was added, and the complete local gate was rerun successfully.

Protected-preview and production deployment IDs are recorded in the automation result rather than backfilled here, preserving this evidence package inside the exact source commit that is deployed and promoted. Any failed required preview or production check blocks publication or triggers rollback under the automation authorization.
