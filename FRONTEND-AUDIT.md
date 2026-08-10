# Bravo Mechanical Frontend Review

**Review date:** August 10, 2026

**Application:** `artifacts/bravo-mechanical`

**Branch:** `codex/seo-conversion-fixes`

**Reviewed preview:** https://bravo-build-9ukc42m9k-joel-carias-projects.vercel.app

## Executive summary

The public frontend has a strong foundation: the brand is consistent, calls to action are prominent, typography is readable, cards and forms share a coherent visual system, route splitting is in place, and the mobile call/text bar is useful without covering page content. All six representative routes rendered with one H1, no broken images, no console warnings or errors, and no horizontal overflow at 375, 768, or 1440 pixels.

There are no confirmed critical issues. Two high-impact defects should be fixed first:

1. The full desktop header activates at 1024px even though it is about 258px too wide. The phone number and estimate CTA render off-screen on every tested route.
2. Client-side navigation preserves the old page's scroll position and does not move focus. A user navigating from 2,500px down the homepage landed 2,500px down `/services`, bypassing its headline and primary actions.

The largest conversion opportunity is to stop using the same generic trust/estimate card on task-specific pages. At 375×812, the booking form begins at 809px and the contact form at 1,451px. On `/book`, the hero promotes “Get a Free Estimate” before users reach “Book My Visit”; on `/contact`, the same CTA links back to the current page. Page-specific heroes would shorten the path and reduce competing choices.

## Scope and method

Reviewed routes:

- `/`
- `/services`
- `/service-areas/yonkers`
- `/projects`
- `/book`
- `/contact`

Browser checks covered 375, 768, 1024, and 1440px widths; keyboard/menu behavior; empty-form submission; layout overflow; images; console output; route navigation; and representative mobile Lighthouse audits. Source inspection focused on shared shell, hero, form, project, and route components rather than generated output or dependencies.

The preview is protected by Vercel and intentionally sends `noindex`, so its Lighthouse SEO score of 69 is not treated as a production SEO defect. Vercel's preview toolbar and the Google Maps embed also generate third-party-cookie best-practice findings that are not application regressions.

## Confirmed defects

### Critical

No critical frontend defects were confirmed.

### High

#### H1. Desktop navigation overflows at 1024px

**Evidence:** All six tested routes had `scrollWidth - clientWidth = 258px` at 1024px. The navigation extended to x=1029; the header action group began at x=1045 and ended at x=1267. The phone number and “Get a Free Estimate” action were outside the viewport. No overflow occurred at 375, 768, or 1440px.

**Impact:** Tablet-landscape and small-laptop users can encounter horizontal scrolling and lose the two highest-intent header actions. This damages navigation, perceived quality, and conversion.

**Source:** `artifacts/bravo-mechanical/src/components/Header.tsx:27-85`

**Fix:** Keep the compact menu through the `lg` range and activate the full navigation at `xl`, or reduce/group the 10 desktop links. Re-test at 1024, 1100, 1280, and 1440px. Do not hide the defect with `overflow-x-hidden`.

#### H2. Internal navigation preserves stale scroll and loses meaningful focus

**Evidence:** After scrolling the homepage to y=2500 and activating an internal `/services` link, the new route remained at y=2500. Focus moved to `BODY`; the new H1 was not focused.

**Impact:** Users can land halfway down a destination page and miss its context, trust signals, and CTA. Screen-reader and keyboard users receive no clear route-change announcement.

**Source:** `artifacts/bravo-mechanical/src/App.tsx:100-110`, `artifacts/bravo-mechanical/src/components/Layout.tsx:12-16`

**Fix:** Add a route-aware navigation manager that scrolls new pathname navigations to the top and focuses a labelled main landmark or H1. Preserve hash navigation and browser back/forward restoration deliberately.

### Medium

#### M1. Booking errors do not identify or focus the missing controls

**Evidence:** Submitting the empty booking form produced one generic message, left focus on `BODY`, set zero `aria-invalid` states, and did not associate an error with the service, date, or time fieldsets. The fieldsets expose a visual asterisk but no programmatic invalid state.

**Impact:** Users must scan a long form to discover what is missing. The problem is worse for keyboard, screen-reader, and cognitive-accessibility users.

**Source:** `artifacts/bravo-mechanical/src/pages/BookOnline.tsx:48-53`, `artifacts/bravo-mechanical/src/pages/BookOnline.tsx:112-185`

**Fix:** Track field/group errors, add `aria-invalid` and `aria-describedby`, render errors beside each group, and focus the first invalid field or group legend. Retain the live summary for overall guidance.

#### M2. Mobile menu does not expose or manage disclosure state

**Evidence:** When open, the menu button had no `aria-expanded` or `aria-controls`. Pressing Escape left the menu open. The control's accessible name remained “Toggle menu” in both states.

**Impact:** Assistive-technology users cannot reliably determine menu state; keyboard users lack the standard Escape dismissal behavior.

**Source:** `artifacts/bravo-mechanical/src/components/Header.tsx:83-116`

**Fix:** Add a stable menu ID, `aria-expanded`, `aria-controls`, state-specific labels, Escape handling, and focus return to the trigger. Close on route change as well as link activation.

#### M3. No skip link is available on public pages

**Evidence:** None of the six routes contains a skip-to-content link. The shared layout's `<main>` has no focus target or ID.

**Impact:** Keyboard and switch users must traverse the entire sticky header on every route.

**Source:** `artifacts/bravo-mechanical/src/components/Layout.tsx:12-16`, `artifacts/bravo-mechanical/src/components/Header.tsx:26-119`

**Fix:** Add a visually hidden, focus-visible “Skip to main content” link and a focusable `#main-content` landmark.

#### M4. Emergency contact link misses WCAG AA contrast

**Evidence:** Mobile Lighthouse measured the emergency phone link at 4.16:1 (`#db1200` on `#f8e3e0`); normal-size text requires 4.5:1. The rest of the audited booking page scored 100 for accessibility; contact scored 97 because of this element.

**Impact:** Low-vision users may struggle to read a high-urgency phone action.

**Source:** `artifacts/bravo-mechanical/src/pages/Contact.tsx:100-107`

**Fix:** Use a darker accent/text token in the tinted emergency panel or make the linked number sufficiently bold/large while verifying the resulting ratio.

#### M5. Lazy-route loader is visually silent to assistive technology and always animates

**Evidence:** The Suspense fallback is an unlabelled animated `<div>` with no `role="status"`, text, or `aria-live`; its inline keyframes do not honor reduced motion.

**Impact:** On slower connections, screen-reader users receive no loading status and motion-sensitive users cannot suppress the spinner.

**Source:** `artifacts/bravo-mechanical/src/App.tsx:44-49`

**Fix:** Add a concise status label, semantic live status, and a reduced-motion variant. Keep the loader lightweight.

#### M6. Google Maps iframe is nested inside a link

**Evidence:** The contact page wraps an interactive Google Maps iframe in an anchor.

**Impact:** Nested interactive content creates ambiguous click and keyboard behavior and can make the map harder to operate.

**Source:** `artifacts/bravo-mechanical/src/pages/Contact.tsx:112-119`

**Fix:** Render the iframe as its own element and add a separate, clearly labelled “Open in Google Maps” link.

### Low

#### L1. Project-gallery images omit intrinsic dimensions

**Evidence:** Eight displayed project images lacked `width` and `height` attributes. CSS `aspect-[4/3]` currently reserves the shape, so no visible shift was confirmed, but intrinsic dimensions remain more robust for dynamic images and partial CSS loading.

**Impact:** Layout stability depends on the utility CSS arriving and on every remote image conforming to the assumed ratio; explicit metadata provides a safer browser fallback.

**Source:** `artifacts/bravo-mechanical/src/pages/Projects.tsx:73-85`

**Fix:** Store or derive image dimensions for CRM photos and declare dimensions for bundled images.

#### L2. A homepage card animates every changed property

**Evidence:** The NY systems card uses `transition-all`.

**Impact:** Future property changes can accidentally animate layout-affecting values and make motion harder to control.

**Source:** `artifacts/bravo-mechanical/src/pages/Index.tsx:383-390`

**Fix:** Transition only border color, box shadow, color, transform, or opacity as needed.

#### L3. Partially completed public forms have no navigation-loss warning

**Evidence:** Contact and booking hold user input in component state but register no route blocker or `beforeunload` guard.

**Impact:** An accidental link or browser navigation can discard a detailed service request.

**Source:** `artifacts/bravo-mechanical/src/components/LeadForm.tsx:328-386`, `artifacts/bravo-mechanical/src/pages/BookOnline.tsx:38-80`

**Fix:** Add a warning only after meaningful input exists, and disable it after successful submission.

## Conversion and design recommendations

These are informed recommendations, not confirmed functional defects.

### 1. Give booking and contact task-specific heroes

At 375×812, `/book` starts its form at 809px and `/contact` starts its form at 1,451px. `PageHero` inserts the same rating/estimate card unless explicitly overridden. On booking, “Get a Free Estimate” competes with “Book My Visit”; on contact, it links to the current route.

Use `rightSlot` or `hideRightSlot` on these pages. For booking, show a compact “1 minute · confirmation by text · no payment required” summary and move the first fields into the initial viewport. For contact, show the form or its first two inputs beside the headline on desktop and immediately after it on mobile.

**Source:** `artifacts/bravo-mechanical/src/components/PageHero.tsx:14-43`, `artifacts/bravo-mechanical/src/pages/BookOnline.tsx:103-112`, `artifacts/bravo-mechanical/src/pages/Contact.tsx:45-55`

### 2. Reduce the desktop header to primary decisions

Ten top-level links create both the 1024px defect and a high cognitive load. Keep `Services`, `Service Areas`, `Projects/Reviews`, `Book Online`, and `Contact` prominent; group secondary editorial/company links under one accessible disclosure. Preserve the phone action.

### 3. Triage the lead path by intent

The same estimate CTA appears across repair, emergency, installation, and informational contexts. Introduce one early choice—“Repair now,” “Plan a replacement,” or “Maintenance”—then tailor proof, urgency, and the next form fields. Do not add steps after a user has already chosen a specific service page.

### 4. Turn projects into stronger decision proof

The gallery is visually credible but most cards provide only a caption and equipment tag. Add town, problem, solution, outcome, and an optional before/after pairing; link each project to the relevant service and a contextual estimate action. Only publish details the client can verify.

**Source:** `artifacts/bravo-mechanical/src/pages/Projects.tsx:18-29`, `artifacts/bravo-mechanical/src/pages/Projects.tsx:71-97`

### 5. Reduce repeated generic CTAs on long pages

The services and location pages repeat broad “Request Service” or “Get a Free Estimate” actions. Prefer one persistent page-level CTA plus service-specific links such as “AC repair details” or “Boiler installation options.” This makes the information scent clearer without increasing visual noise.

**Source:** `artifacts/bravo-mechanical/src/pages/Services.tsx:111-155`, `artifacts/bravo-mechanical/src/pages/CityPage.tsx:148-168`

## Strengths to preserve

- Clear red/blue visual identity and consistent card, border, radius, and typography treatments.
- Mobile call/text actions remain visible and respect bottom safe-area insets.
- One H1 and a semantic main landmark appeared on every fully loaded audited route.
- No console warnings/errors or broken images across the six tested routes.
- No horizontal overflow at 375, 768, or 1440px.
- Homepage lazy loading worked: only 3 of 30 DOM images loaded in the initial mobile viewport.
- Route-level code splitting keeps non-home features out of the first route bundle.
- Contact form labels, autocomplete, native types, consent, and inline validation are generally strong.
- Representative mobile Lighthouse accessibility: booking 100; contact 97 with one specific contrast failure.
- Calls, texts, booking, and estimate paths are visible throughout the journey.

## Recommended implementation order

### Phase 1 — shared navigation and route behavior

1. Fix the 1024px header breakpoint/information architecture.
2. Add route scroll restoration and focus management.
3. Add the skip link and complete mobile-menu disclosure behavior.
4. Add Playwright regressions for overflow, scroll, focus, and Escape dismissal.

### Phase 2 — lead-path clarity

1. Replace the generic hero card on `/book` and `/contact`.
2. Move the primary form higher on mobile.
3. Add field/group-specific booking errors and first-error focus.
4. Test booking and contact at 375, 768, 1024, and 1440px.

### Phase 3 — polish

1. Correct emergency-link contrast.
2. Make the route loader accessible and reduced-motion safe.
3. Separate the map iframe from its external link.
4. Add image dimensions, narrow transitions, and optional dirty-form guards.

## Safe bounded coding phase

The following can be implemented together without changing backend behavior or business claims:

- Header breakpoint and menu ARIA/Escape handling.
- Skip link and `main` focus target.
- Route scroll/focus manager.
- Booking group errors and focus recovery.
- Contact emergency-link contrast.
- Accessible reduced-motion route loader.
- Targeted browser tests for the above.

Keep the task-specific hero/CRO redesign as a separate visual phase so it can be reviewed against client preferences before release.
