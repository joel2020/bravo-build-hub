# Bravo Mechanical Frontend Remediation Design

**Date:** August 10, 2026

**Status:** Approved for planning

**Source audit:** `FRONTEND-AUDIT.md`

## Goal

Resolve every confirmed public-frontend defect and implement the five approved conversion improvements without changing backend contracts, CRM behavior, business claims, or the established Bravo Mechanical visual identity.

The result must work at 375, 768, 1024, and 1440px, satisfy WCAG 2.2 AA for the affected flows, preserve crawlable route content, and keep existing analytics event names intact.

## Scope

### Included

- Header overflow and navigation information architecture.
- Route scroll restoration and focus management.
- Skip navigation and main landmark targeting.
- Accessible mobile-menu disclosure and keyboard behavior.
- Booking field/group validation and first-error focus.
- Dirty-form navigation protection for booking and contact forms.
- Task-specific booking and contact heroes.
- Contact emergency-link contrast and Google Maps structure.
- Accessible, reduced-motion route loading state.
- Project image dimensions and richer project proof.
- Explicit animation properties in place of `transition-all` in affected public UI.
- Contextual service/location CTAs and removal of avoidable repeated generic actions.
- Automated unit/browser regression coverage for the changes.

### Excluded

- Backend schema, Supabase policies, lead payloads, notifications, and CRM screens.
- New business claims, testimonials, prices, guarantees, or project facts not already present and verified in source.
- Rebranding, a new design system, or wholesale page redesign.
- Production deployment, Search Console, GTM, GA4, and Google Business Profile changes.

## Design

### 1. Shared navigation and route behavior

The compact header remains active until the viewport can safely fit the logo, primary navigation, phone number, and estimate action. The full navigation moves from `lg` to `xl`. Desktop navigation is reduced to the highest-value destinations: Services, Service Areas, Projects, Reviews, Book Online, and Contact. About, Blog, and Español move into a keyboard-accessible “More” disclosure. Home remains available through the logo and may remain explicit only if the available width allows it without overflow.

The mobile menu uses a stable controlled region with `aria-expanded`, `aria-controls`, and state-specific accessible names. Escape closes it and returns focus to the trigger. It also closes on route changes. The menu remains an inline disclosure rather than a modal, so no focus trap is required.

A visible-on-focus “Skip to main content” link targets a focusable `main#main-content`. A route navigation manager observes pathname changes. On new forward navigations it scrolls to the top and focuses the main landmark without showing a persistent outline; hash links retain native anchor behavior. Browser back/forward should use the browser's restored position rather than always forcing the top.

### 2. Task-specific conversion heroes

The shared `PageHero` continues to support a right-side slot, but `/book` and `/contact` stop using the generic Google-rating/estimate card.

Booking receives a compact task summary: “About 1 minute,” “confirmation by text,” and “no payment required.” The booking form follows immediately after the hero and its first fields should begin within or just below the first mobile viewport.

Contact receives a concise contact-method panel emphasizing urgent calls and photo-friendly texting. The form remains the primary mobile content and appears before address, hours, emergency details, and the map. The current-page “Get a Free Estimate” hero link is removed.

No new promises are introduced. Existing claims remain unchanged and continue to require client verification noted in the SEO audit.

### 3. Form behavior and recovery

Booking validation becomes field-aware. Name, phone, service, date, and time window each have an error state. Text fields use linked inline errors; selection fieldsets expose `aria-invalid` and `aria-describedby`. On invalid submission, focus moves to the first invalid control or focusable fieldset/legend target. A polite summary remains for overall guidance.

Contact retains its existing schema validation and inline errors but also focuses the first invalid field. Both booking and contact track whether the user has entered meaningful data. If so, browser unload and in-app navigation prompt before discarding it. The guard turns off during successful submission and after completion. Empty untouched forms never prompt.

Backend insert payloads, analytics, consent language, and success behavior remain unchanged.

### 4. Contact accessibility and map

The emergency phone link uses a foreground color that reaches at least 4.5:1 against its tinted panel at normal text size. The Google Maps iframe is no longer nested inside an anchor. It sits in a labelled figure/container with a separate “Open in Google Maps” external link.

### 5. Loading and motion

The lazy-route fallback exposes a `role="status"` with concise screen-reader text. The spinner is decorative and hidden from assistive technology. A reduced-motion media query disables rotation while preserving a clear loading state. Affected cards transition only the properties that visually change.

### 6. Project proof and images

Bundled project images receive declared intrinsic dimensions. Remote CRM photos use stored dimensions when available; because the current public photo record does not include dimensions, the component reserves the existing 4:3 box and supplies safe fallback dimensions until metadata is available.

Project cards include the verified town/system information already present in the homepage project proof where a reliable match exists. Cards without verified details retain neutral captions. Each card links contextually to the relevant service or estimate route. No fabricated outcomes or locations are added.

### 7. CTA hierarchy

Long service and city pages keep one prominent page-level conversion action and use descriptive service links elsewhere. Repeated generic “Request Service” actions become contextual labels such as “Request AC Service” or “Get a Boiler Estimate” where the service is already known. Emergency paths continue to prioritize calling.

The change does not introduce a multi-step intent wizard. Instead, existing service-page context supplies intent automatically, avoiding added friction.

## Component boundaries

- `Header`: responsive navigation, desktop “More” disclosure, mobile disclosure behavior.
- `Layout`: skip link and main landmark only.
- `NavigationEffects` (new small component/hook): route scroll and focus behavior.
- `UnsavedChangesGuard` (new reusable hook): dirty-form browser and in-app navigation protection.
- `PageHero`: existing slot API reused; no new page-specific conditional logic.
- `BookOnline`: task summary, field-aware validation, dirty state.
- `LeadForm`/`Contact`: first-error focus, dirty state, task-specific contact panel, map structure.
- `PageLoader`: semantic status and reduced-motion styling.
- `Projects`: intrinsic dimensions and verified proof metadata.

Each unit stays independently testable and avoids coupling route behavior to page content.

## Error handling

- Validation errors remain local and actionable; the first invalid field receives focus.
- Submission/network errors retain the existing call/text fallback.
- Navigation guards fail open if the browser does not support a routing blocker API; `beforeunload` still protects full-page exits.
- Remote project photos without dimensions or captions use safe presentational fallbacks and never block the gallery.

## Testing

### Unit/component tests

- Header breakpoint classes and disclosure ARIA state.
- Escape dismissal and route-change closure.
- Skip link and main target.
- Booking field/group errors and first-invalid focus.
- Contact first-invalid focus.
- Dirty-state guard activation/deactivation.
- Accessible PageLoader and reduced-motion class/style behavior.
- Contact map iframe/link separation.
- Project image dimension attributes.

### Browser tests

- No horizontal overflow at 375, 768, 1024, 1100, 1280, and 1440px.
- Header actions remain reachable at all supported widths.
- Forward route navigation starts at the top and moves focus meaningfully.
- Back navigation restores position.
- Mobile menu announces state and closes with Escape.
- Booking/contact primary forms appear earlier on mobile and remain usable with the sticky CTA.
- Empty submissions identify and focus the first error.
- No console warnings/errors on the six audited routes.

### Verification gates

- Targeted Vitest suite.
- Full production build and existing 148-route smoke test.
- Typecheck with unrelated pre-existing failures explicitly separated.
- Mobile Lighthouse accessibility on booking and contact.
- Manual visual checks at the four requested widths.
- `git diff --check`.

## Acceptance criteria

1. No audited route exceeds viewport width at any supported breakpoint.
2. Header phone and primary CTA remain reachable at 1024px.
3. New forward route navigation starts at the top and has meaningful focus; browser history restoration remains usable.
4. Skip navigation works by keyboard.
5. Mobile menu exposes state and closes by Escape, route change, and link activation.
6. Invalid booking/contact submissions focus and describe the first error.
7. Dirty forms warn before losing meaningful user input.
8. Booking and contact no longer display a competing generic estimate card; primary actions appear earlier on mobile.
9. Emergency phone text meets WCAG AA contrast.
10. Map iframe and external navigation are separate controls.
11. Route loading is announced and respects reduced motion.
12. Project images reserve dimensions and cards use only verified proof details.
13. Contextual CTAs replace avoidable generic repetition without changing analytics contracts.
14. Tests, production build, smoke checks, and browser verification pass, aside from documented unrelated repository errors.

## Release boundary

Implementation will remain on `codex/seo-conversion-fixes` and may use a preview deployment for verification. Production deployment, push, or pull request creation requires separate user approval.
