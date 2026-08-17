# Bravo Mechanical revenue-first SEO and AEO design

**Date:** August 17, 2026
**Status:** Approved design awaiting written-spec review
**Primary market:** Westchester County, New York
**Secondary markets:** New York City, then Long Island

## Objective

Increase qualified HVAC calls, estimate requests, online bookings, and profitable jobs by strengthening Bravo Mechanical's highest-intent Westchester pages for traditional search and AI-assisted discovery. The phase must improve machine-readable business clarity, supporting evidence, conversion paths, and measurement without publishing unsupported claims or expanding into thin geographic content.

## Success criteria

The phase is successful when:

1. Every submitted public URL remains crawlable, indexable, self-canonical, and represented correctly in the sitemap.
2. Bravo's core identity, services, market, contact information, and verified differentiators are consistent in visible copy, metadata, structured data, `llms.txt`, and the company-facts page.
3. The homepage and five priority commercial destinations answer their target buying questions clearly in raw HTML and provide a direct call, estimate, or booking path.
4. Calls, estimate requests, booking actions, and successful lead submissions emit distinct analytics events with page and placement context.
5. Current competitor evidence and URL-level decisions are documented without claiming unverified local-pack positions or keyword volumes.
6. No new NYC or Long Island landing page is published without location-specific operational and customer evidence.
7. The production release passes automated tests and a full public sitemap crawl.

## Scope

### Priority destinations

1. Homepage — Westchester HVAC contractor intent
2. AC repair — urgent no-cool and repair intent
3. Boiler repair — no-heat, leak, short-cycling, and repair intent
4. Emergency HVAC — urgent dispatch intent
5. Heat-pump installation — high-value replacement and electrification intent
6. Yonkers — the first location hub supported by existing visibility and local relevance

The exact canonical URLs already in production will be preserved unless current evidence proves that consolidation is necessary.

### Workstreams

#### 1. Current-state research

- Recheck production crawling, canonicals, sitemap membership, headings, robots directives, raw HTML, structured data, and key conversion paths.
- Review current organic competitors separately for Westchester, NYC, and Long Island using public search results and competitor-owned websites.
- Record observed positioning, content architecture, proof, offers, trust signals, and conversion patterns.
- Treat map-pack rank, review counts, and search volume as unknown unless verified with a suitable localized or paid data source.

#### 2. Entity and AI-readable facts

- Keep a concise `llms.txt` that points systems toward canonical, substantive pages rather than attempting to rank through keyword repetition.
- Align the homepage, About, Company Facts, and site-wide structured data around the same verified company identity.
- State service scope and geographic priority precisely: Westchester first; NYC and Long Island only as verified secondary coverage.
- Add source links for time-sensitive public facts such as rebates, regulations, and equipment standards.
- Keep business-controlled ratings out of self-serving LocalBusiness aggregate-rating markup.
- Ensure meaningful facts and answer blocks are present in prerendered HTML, not only client-rendered JavaScript.

#### 3. High-intent commercial content

Each priority destination will receive only the modules needed for its search and buying intent:

- A concise answer-first summary
- Symptoms or situations Bravo handles
- Repair-versus-replace or service-selection guidance
- A clear process and expectation setting
- Verified Westchester-specific context
- Original project evidence where available
- Relevant FAQs written for customers, not keyword density
- Internal links to the next useful commercial or educational page
- One dominant primary CTA and a suitable secondary CTA

Copy will not claim guaranteed response times, guaranteed savings, certifications, licenses, brands, financing terms, warranties, prices, or service boundaries without support already present in approved business records.

#### 4. Structured data and technical signals

- Maintain one canonical URL and one primary H1 per indexable page.
- Keep Organization/HVACBusiness identity consistent and non-duplicated.
- Use Service, BreadcrumbList, Article, and FAQPage structures only where the visible page supports them.
- Keep schema generation synchronized between client metadata and prerendered route metadata.
- Exclude redirecting, noncanonical, private, and utility URLs from the sitemap.
- Preserve permanent apex and duplicate-content redirects.

#### 5. Conversion system

- Audit phone, estimate, booking, and lead-submit interactions on the priority destinations.
- Use existing analytics utilities rather than adding a new analytics dependency.
- Standardize event names and attach page path, CTA placement, service context, and action type when available.
- Track successful submissions separately from CTA clicks and form starts.
- Keep phone and booking actions obvious on mobile without adding obstructive interstitials.
- Do not send customer message content, phone numbers, email addresses, or other personally identifiable information to analytics.

#### 6. Measurement and operating handoff

- Extend the existing execution report with a current baseline and implemented changes.
- Define weekly Search Console, Google Business Profile, conversion, review, and technical-health checks.
- Maintain the existing two-business-day review-response target and 100% response-coverage audit.
- Separate leading indicators such as visibility and click-through rate from outcomes such as qualified leads, estimates, close rate, and revenue.

## Approaches considered

### Recommended: revenue-first Westchester foundation

Strengthen verified entity signals and the pages closest to a booked job. This approach has the best balance of revenue potential, evidence quality, implementation risk, and measurement clarity.

### Rejected for this phase: immediate NYC and Long Island expansion

Publishing broader geographic pages before collecting location-specific projects, reviews, licensing evidence, and response-capacity proof risks doorway-page quality, diluted authority, and inaccurate promises.

### Rejected for this phase: blog-volume growth

Publishing many informational articles would increase crawl and maintenance overhead before the strongest commercial destinations are fully evidenced and conversion-ready. Supporting content may be refreshed only when it directly strengthens a priority commercial page.

## Component boundaries

### Research record

A dated project document will hold current competitor observations, search-result caveats, URL decisions, and the evidence behind each recommendation. It will not be used as runtime application data.

### Business identity source

Existing site configuration remains the runtime source for canonical company name, phone, email, URL, and approved service-area identity. Page components and schema should consume or mirror this source consistently; no parallel configuration system will be introduced unless duplication cannot be removed safely.

### Route metadata pipeline

The existing route-data and head-injection pipeline remains responsible for prerendered titles, descriptions, canonicals, structured data, and raw-HTML answer content. Changes must preserve its agreement with client-side `useSeo` behavior.

### Conversion instrumentation

The existing analytics module remains the single interface for marketing events. UI components call named tracking functions; analytics-provider details remain isolated inside that module.

## Data flow

1. Verified business facts and approved page content feed the page components and route metadata.
2. The build produces prerendered HTML, structured data, sitemap, robots, and `llms.txt` assets.
3. Search engines and AI crawlers receive canonical, visible, evidence-aligned content without requiring client-side execution.
4. Visitors choose phone, estimate, or booking actions.
5. The analytics layer records non-PII conversion events with page and placement context.
6. Search Console, GBP, analytics, and CRM outcomes are reviewed against the dated baseline.

## Error handling and safeguards

- Missing evidence blocks publication of the associated claim; it does not invite a plausible placeholder.
- A page that canonicalizes elsewhere cannot remain in the sitemap.
- A failed lead submission must not emit a success event.
- Analytics failure must never block calling, booking, navigation, or form submission.
- Invalid or private routes retain correct 404 or `noindex, nofollow` behavior.
- Current user-owned work, including `migration-notes/`, remains outside this phase.
- Existing unrelated build warnings will be reported but not refactored unless they break the release.

## Testing strategy

### Automated

- Unit tests for analytics event functions and CTA integrations
- Smoke tests for sitemap self-canonicalization, robots, redirects, H1 count, private-route directives, and required raw-HTML content
- Structured-data assertions for non-duplication and visible-content agreement
- Production build and existing full test suite

### Public verification

- Crawl every sitemap URL after deployment
- Confirm 200 response, self-canonical, one H1, and indexable directives
- Confirm apex and content redirects remain permanent
- Confirm fabricated paths return 404 and private routes return noindex headers
- Exercise priority mobile conversion paths without submitting test customer data to production

## Rollout

1. Capture the dated baseline and competitor evidence.
2. Implement entity and `llms.txt` alignment.
3. Improve the six priority destinations and internal links.
4. Complete conversion-event coverage.
5. Run the full test and build suite.
6. Deploy the verified artifact to Vercel production.
7. Run the public verification crawl and record the deployment evidence.
8. Submit or request recrawling only for changed canonical priority URLs; avoid repetitive bulk indexing requests.

## Out of scope

- Mass generation of city or neighborhood pages
- Unverified NYC or Long Island commercial landing pages
- Paid-media campaign creation
- CRM redesign
- Automated review posting or templated mass replies
- Purchasing backlinks, review gating, fake citations, or fabricated authorship
- Guaranteed ranking, lead, or revenue claims

## Deliverables

1. Dated competitor and search baseline
2. Updated entity and LLM-readable assets
3. Improved priority commercial pages
4. Verified conversion instrumentation
5. Regression tests and production verification results
6. Updated SEO execution report with the next 30/60/90-day actions
