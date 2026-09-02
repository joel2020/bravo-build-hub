# Bravo Mechanical Local Search Landing Pages — Design Specification

**Date:** 2026-09-02

**Status:** Approved design; implementation pending

**Branch:** `codex/seo-aeo-phase1`

## 1. Purpose

Improve Bravo Mechanical's local search landing pages so that they provide useful, verifiable information to Westchester County homeowners and property managers, satisfy one clear search intent per page, and give Google enough distinct crawler-visible value to evaluate each URL independently.

The project keeps the existing local landing-page inventory. It does not solve the indexing report by deleting valid pages or hiding them from Google. Instead, it strengthens content, internal discovery, rendering, metadata, structured data, and quality controls.

## 2. Evidence and problem statement

The Google Search Console Page Indexing report last updated August 27, 2026 showed 114 indexed pages and 77 non-indexed pages. Of the sitemap's 141 discovered URLs, 63 were non-indexed:

- 40 `Discovered – currently not indexed`
- 18 `Alternate page with proper canonical tag`
- 3 `Duplicate without user-selected canonical`
- 2 `Crawled – currently not indexed`

The 40 discovered-but-not-crawled URLs included 15 city landing pages and 14 service-city pages. These URLs had no recorded crawl date. Current live checks also showed that at least one previously stale canonical record has already been corrected on the deployed site, so the remaining problem is not a single current canonical defect.

The repository explains an important part of the quality gap:

- City pages expose several useful fields in crawler-visible HTML.
- Service-city pages expose titles, descriptions, FAQs, and a generic list of services, but much of their more useful React content is not included in the prerendered crawler body.
- Some existing reusable service copy includes business claims that require verification before it can safely be expanded across generated pages.

This design therefore addresses both rendering and content quality. It does not assume that increasing word count alone will cause indexing.

## 3. Goals

1. Give every valid city and service-city URL a distinct, useful, server-rendered page.
2. Strengthen topical relationships among city hubs, service pages, service-city pages, relevant guides, and adjacent service areas.
3. Prevent doorway-style, city-name-swapped, or unsupported content.
4. Preserve accurate self-referencing canonicals and indexable HTTP behavior.
5. Establish repeatable evidence, editorial, and automated quality gates.
6. Prioritize the 29 local landing pages currently in the discovered-not-indexed group, then apply the validated pattern to the remaining local inventory.

## 4. Non-goals

- No bulk indexing requests or sitemap resubmissions in this phase.
- No deletion, redirect, or `noindex` of valid local landing pages solely because they are not currently indexed.
- No Google Business Profile or GA4 changes.
- No fabricated prices, promotions, licenses, certifications, brands, warranties, financing terms, availability, response times, permit handling, project results, or service-area claims.
- No town-name substitution system that publishes substantially identical pages.
- No arbitrary minimum word count.
- No publication of customer names, addresses, reviews, or photos without documented permission.

## 5. Chosen approach

Use a shared, server-rendered page framework backed by manually reviewed city and service-city content records.

This approach was selected over two alternatives:

1. **Fully handwritten pages:** potentially the most distinctive, but slow to produce, difficult to keep consistent, and prone to structural drift.
2. **Automatic template expansion:** fast, but likely to create repetitive, low-value pages and unsupported local claims.

The chosen framework standardizes technical SEO and conversion elements while requiring page-specific facts, answers, and internal-link decisions. Reusable facts may be shared only when they are genuinely applicable; the visible composition of each page must still serve its own intent.

## 6. Search-intent architecture

### 6.1 City hub pages

Primary intent: find a qualified HVAC company serving a specific Westchester community and understand which services are available there.

Each city page should contain:

1. A concise, answer-first introduction naming the community and describing Bravo's verified service coverage.
2. A service overview linking to applicable service-city or parent service pages.
3. Verified local housing, building, climate, or equipment context that affects HVAC decisions.
4. Common heating, cooling, indoor-air-quality, or controls questions relevant to that community.
5. Safe homeowner checks and clear professional-only boundaries.
6. A municipal resources section when an official building department, permit page, or emergency resource is materially relevant.
7. Relevant Bravo guides or project evidence.
8. Nearby service areas that users may reasonably need.
9. A clear phone and request-service call to action using verified business information.

### 6.2 Service-city pages

Primary intent: understand and request one specific HVAC service in one specific community.

Each service-city page should contain:

1. A direct answer explaining the service and the local customer problem it addresses.
2. Common symptoms or decision signals, written as guidance rather than a diagnosis.
3. A plain-language description of the likely inspection, repair, maintenance, or installation scope.
4. Safe checks a property owner may perform without opening equipment or working around hazardous systems.
5. Clear boundaries for electrical, fuel-gas, combustion, refrigerant, pressure, and equipment-opening work.
6. Verified local conditions only when they materially change the advice.
7. FAQs that are unique to the service intent and visible in the page body.
8. Links to the parent service, city hub, closely related services, relevant educational content, and reasonable nearby service areas.
9. A service-specific conversion CTA using verified contact information.

### 6.3 Intent separation

- City hubs target broad local-provider intent.
- Parent service pages target county-level service intent.
- Service-city pages target the combination of one service and one city.
- Blog posts answer informational questions and support commercial pages without duplicating them.

Pages must not compete by using the same title, H1, introductory answer, or primary keyword target. Internal links should make the hierarchy explicit.

## 7. Content and evidence model

Each local content record should support the following reviewed fields where applicable:

- `primaryIntent`
- `answerFirst`
- `localContext`
- `commonConcerns`
- `safeChecks`
- `professionalBoundaries`
- `serviceScope`
- `municipalResources`
- `relatedGuideSlugs`
- `relatedServiceSlugs`
- `nearbyCitySlugs`
- `faqItems`
- `ctaVariant`
- `sourceNotes`
- `claimReviewStatus`
- `reviewedAt`

Fields may be omitted when they do not add legitimate user value. Empty sections must not render.

### Evidence rules

- Material technical claims should use current primary or official sources such as the U.S. Department of Energy, ENERGY STAR, EPA, New York State agencies, official municipalities, current codes or guidance, and primary manufacturer documentation when equipment-specific.
- Local facts should come from official municipal, county, state, or federal sources whenever possible.
- Equipment recommendations must be qualified for system type, manufacturer instructions, installation conditions, and professional diagnosis.
- Business-specific claims must be confirmed against an approved Bravo source of truth before publication.
- Source notes support editorial review; external citations should appear on-page when they materially help the user verify the advice.

## 8. Technical rendering and metadata

Every local landing page must provide the following in the initial production HTML:

- One crawler-visible H1.
- The answer-first introduction and substantial intent-specific body content.
- Unique title and meta description within the project's tested limits.
- A self-referencing `https://www.bravomechanicalny.com/...` canonical.
- Index-follow robots behavior.
- Breadcrumb navigation and key internal links.
- A visible, usable phone CTA and request-service link.

The prerendering pipeline must render the same approved content model used by the interactive page. It should not create a separate crawler-only narrative.

## 9. Structured data

- Retain one accurate sitewide Organization/HVAC business entity rather than duplicating competing business entities on every route.
- Use `BreadcrumbList` where the breadcrumb is visible.
- Represent the page's service only when the structured data accurately matches the visible content.
- Use `FAQPage` only for visible, page-specific FAQs and only where it remains appropriate under current search guidelines.
- Never add self-serving aggregate ratings or review markup.
- Do not claim a physical location in a town unless Bravo has a verified eligible location there.

Structured data is a machine-readable reflection of the page, not a substitute for useful visible content.

## 10. Internal-link design

The local page network should form a deliberate hierarchy:

```text
Services hub
  -> Parent service
       -> Service-city page
            -> City hub
            -> Closely related service
            -> Relevant informational guide

Service areas hub
  -> City hub
       -> Applicable service-city page
       -> Nearby city hub
       -> Relevant informational guide
```

Link labels should describe the destination. Large, generic lists of every service and every town should not be used as the only discovery method.

## 11. Images and trust signals

- Prefer real Bravo project, team, vehicle, or equipment images with documented usage permission.
- Match images to the service or local context instead of reusing one decorative image everywhere.
- Write concise alt text that describes the image's useful content; do not stuff city and service keywords.
- AI-generated imagery, if later authorized, must be clearly controlled for realism and must not imply a real Bravo project, customer, technician, certification, or result.
- Project evidence must not expose private customer information or exact residential locations.

## 12. Conversion design

Each page should make the next step obvious without fear-based selling:

- Verified phone number in a tap-to-call link.
- Request-service or booking CTA using the site's established destination.
- CTA text matched to the page intent.
- No false urgency, invented availability, or guaranteed outcome.
- No unnecessary form or visual changes outside the landing-page scope.

## 13. Quality gates and automated tests

### Route and indexability

- Route returns HTTP 200.
- Initial HTML is indexable and contains no accidental `noindex`.
- Canonical is unique, self-referencing, HTTPS, and `www` normalized.
- The URL appears once in the sitemap and is not also emitted as a redirect target variant.

### Content uniqueness and usefulness

- Exactly one H1.
- Unique title, description, answer-first text, and FAQ set.
- Required useful sections exist for the route type.
- Content similarity or fingerprint tests flag near-duplicate city substitutions for review.
- No empty headings, placeholder text, or unsupported statements.
- A service-city page contains more than metadata and generic link lists in crawler-visible HTML.

### Claim safety

- Automated checks flag risky terms such as guarantees, free estimates, fixed pricing, training/certification, subcontractor status, permits, warranties, response times, rebates, and financing for manual evidence review.
- Technical safety language does not instruct users to open equipment or perform electrical, gas, combustion, refrigerant, or pressurized-system work.
- All business-specific statements have an approved source.

### Links and schema

- Required parent, city, service, and supporting-content links resolve successfully.
- Structured data parses, matches visible content, and does not duplicate the sitewide business entity.
- Breadcrumbs match the route hierarchy.

### Release validation

- Relevant automated tests pass.
- Type checking and production build pass.
- A local crawl confirms metadata, canonicals, status codes, internal links, and crawler-visible body content.
- A protected preview passes the same checks before production promotion.
- A small public sample passes live verification after deployment.

## 14. Rollout plan

### Phase 1: Foundation and priority remediation

1. Establish the reviewed content model and verified business-claim source of truth.
2. Update the prerendering path so city and service-city page content is fully available in initial HTML.
3. Add the automated quality gates above.
4. Upgrade the 15 city pages and 14 service-city pages identified in the discovered-not-indexed group.
5. Review the two current crawled-not-indexed guides for uniqueness, internal support, and crawler-visible content.
6. Validate a representative mix of city and service-city previews before release.

### Phase 2: Remaining local inventory

1. Audit all remaining city and service-city records against the approved model.
2. Fill verified content gaps and remove unsupported claims.
3. Apply the same tests and release gates in bounded batches.
4. Improve links from parent services, the service-area hub, and relevant informational guides.

### Phase 3: Measurement and iteration

1. Record deployment dates and affected URLs.
2. Monitor crawl activity, Page Indexing classifications, impressions, queries, and landing-page clicks over settled reporting windows.
3. Inspect a small priority sample after deployment rather than requesting indexing for every URL.
4. Revise weak pages based on real query and engagement evidence, not merely whether indexing occurred immediately.

## 15. Acceptance criteria

The implementation is complete when:

1. All in-scope local pages have distinct, useful, server-rendered content and pass the automated gates.
2. No unverified business or technical claim is introduced.
3. Every page has correct metadata, canonical, indexability, structured data, sitemap membership, and intentional internal links.
4. The 29 priority local pages pass preview and public production checks.
5. Baseline and post-release monitoring records identify the exact URLs and release date.
6. No unrelated application behavior or user-owned work is changed.

Indexing itself is not an immediate release acceptance criterion because Google controls crawl scheduling and index selection. The measurable release criterion is that every page is technically accessible, internally discoverable, unique, useful, and eligible for indexing.

## 16. Reference guidance

- Google Search Central, Creating helpful, reliable, people-first content: <https://developers.google.com/search/docs/fundamentals/creating-helpful-content>
- Google Search Central, Search Essentials: <https://developers.google.com/search/docs/essentials>
- Google Search Central, Local business structured data: <https://developers.google.com/search/docs/appearance/structured-data/local-business>
- Google Search Central, General structured data guidelines: <https://developers.google.com/search/docs/appearance/structured-data/sd-policies>
- Google Search Central, Establish business details: <https://developers.google.com/search/docs/appearance/establish-business-details>
