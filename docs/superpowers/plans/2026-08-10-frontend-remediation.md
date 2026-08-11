# Bravo Mechanical Frontend Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every confirmed frontend defect and implement the approved conversion improvements without changing backend contracts, business claims, or analytics event names.

**Architecture:** Add two focused shared behavior units—`NavigationEffects` for route scroll/focus and `useUnsavedChangesGuard` for dirty forms—then keep page-specific presentation inside the existing header, hero slot, booking, contact, and project components. Component tests cover semantic/interactive behavior; the production build, route smoke suite, and browser matrix verify integration.

**Tech Stack:** React 19, TypeScript, React Router 7, Tailwind CSS 3, Radix UI, Vitest 4, Testing Library, jsdom, Vite 7, Chrome DevTools.

## Global Constraints

- Preserve Supabase payloads, RLS assumptions, CRM behavior, consent copy, and existing analytics event names.
- Add no new business claims, locations, outcomes, prices, guarantees, testimonials, or project facts.
- Preserve the Bravo Mechanical red/blue identity and existing design tokens.
- Support 375, 768, 1024, and 1440px; also test 1100 and 1280px around the header breakpoint.
- Meet WCAG 2.2 AA for affected controls and content.
- Preserve crawlable route content and existing SEO metadata/schema behavior.
- Do not deploy production, push, or create a pull request without user approval.
- Every production behavior starts with a failing test and follows red-green-refactor.

## File Structure

- Create `src/components/NavigationEffects.tsx`: pathname-aware scroll/focus behavior.
- Create `src/hooks/useUnsavedChangesGuard.ts`: reusable browser/in-app dirty-form guard.
- Create `src/test/frontend-remediation.test.tsx`: component/behavior regressions.
- Modify `src/App.tsx`: mount navigation behavior and accessible loader.
- Modify `src/components/Layout.tsx`: skip link and focusable main target.
- Modify `src/components/Header.tsx`: responsive information architecture and disclosures.
- Modify `src/components/LeadForm.tsx`: first-error focus and dirty protection.
- Modify `src/pages/BookOnline.tsx`: task hero, validation, dirty protection.
- Modify `src/pages/Contact.tsx`: task hero, content order, contrast, and map.
- Modify `src/pages/Projects.tsx`: dimensions and verified project proof.
- Modify `src/pages/Services.tsx`, `src/pages/CityPage.tsx`, `src/pages/Index.tsx`: contextual CTAs and motion.
- Modify `src/index.css`: skip-link, loader, focus, and reduced-motion styles.
- Modify app `package.json` and root lockfile: test dependencies/script only.

---

### Task 1: Navigation shell and route behavior

**Files:**
- Create: `artifacts/bravo-mechanical/src/components/NavigationEffects.tsx`
- Create: `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`
- Modify: `artifacts/bravo-mechanical/src/components/Layout.tsx:7-18`
- Modify: `artifacts/bravo-mechanical/src/App.tsx:100-110`
- Modify: `artifacts/bravo-mechanical/src/index.css:78-90`
- Modify: `artifacts/bravo-mechanical/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces `NavigationEffects(): null` inside `BrowserRouter`.
- Produces `main#main-content[tabIndex=-1]` and `a[href="#main-content"]`.
- Consumes `useLocation()` and `useNavigationType()`.

- [ ] **Step 1: Add DOM testing support**

```bash
pnpm --filter @workspace/bravo-mechanical add -D @testing-library/react @testing-library/user-event jsdom
```

Add `"test": "vitest run"` to app scripts.

- [ ] **Step 2: Write failing shell tests**

```tsx
// @vitest-environment jsdom
it("offers a keyboard skip link and focusable main target", () => {
  render(<MemoryRouter><Layout><h1>Page</h1></Layout></MemoryRouter>);
  expect(screen.getByRole("link", { name: /skip to main content/i })).toHaveAttribute("href", "#main-content");
  expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
});

it("scrolls forward navigation to top and focuses main", async () => {
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<MemoryRouter initialEntries={["/"]}><NavigationEffects /><Layout><TestRoutes /></Layout></MemoryRouter>);
  await userEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  expect(screen.getByRole("main")).toHaveFocus();
});
```

- [ ] **Step 3: Verify RED**

```bash
PORT=5173 pnpm --filter @workspace/bravo-mechanical exec vitest run src/test/frontend-remediation.test.tsx
```

Expected: missing `NavigationEffects`, skip link, and main attributes.

- [ ] **Step 4: Implement minimal behavior**

```tsx
export const NavigationEffects = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (navigationType === "POP" || hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }));
  }, [pathname, hash, navigationType]);
  return null;
};
```

Add the skip link and focusable main to `Layout`, mount effects inside the router, and style `.skip-link` to appear only on focus.

- [ ] **Step 5: Verify GREEN and commit**

Run the targeted test, then:

```bash
git add artifacts/bravo-mechanical/src artifacts/bravo-mechanical/package.json pnpm-lock.yaml
git commit -m "fix: restore accessible route navigation"
```

---

### Task 2: Responsive header and accessible menus

**Files:**
- Modify: `artifacts/bravo-mechanical/src/components/Header.tsx:1-121`
- Test: `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`

**Interfaces:**
- Produces `button[aria-controls="mobile-navigation"]` with stateful labels.
- Produces full navigation only at `xl`; compact controls remain below `xl`.
- Produces accessible desktop “More” disclosure for About, Blog, and Español.

- [ ] **Step 1: Write failing disclosure tests**

```tsx
it("announces and dismisses the mobile menu", async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><Header /></MemoryRouter>);
  const trigger = screen.getByRole("button", { name: /open menu/i });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveAttribute("aria-controls", "mobile-navigation");
  await user.click(trigger);
  expect(trigger).toHaveAccessibleName(/close menu/i);
  await user.keyboard("{Escape}");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
});
```

Assert primary navigation uses `xl:flex` and secondary links are inside “More.”

- [ ] **Step 2: Verify RED**

Run the targeted test. Expected failures: missing state attributes, Escape behavior, and breakpoint class.

- [ ] **Step 3: Implement header IA**

Keep Services, Service Areas, Projects, Reviews, Book Online, and Contact primary. Put About, Blog, and Español in the existing Radix dropdown primitives. Change desktop `lg:*` classes to `xl:*`, give the mobile panel ID and labelled nav, close on Escape/pathname change, and return focus.

- [ ] **Step 4: Verify GREEN and commit**

```bash
git add artifacts/bravo-mechanical/src/components/Header.tsx artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx
git commit -m "fix: make public navigation responsive and accessible"
```

---

### Task 3: Recoverable, loss-safe lead forms

**Files:**
- Create: `artifacts/bravo-mechanical/src/hooks/useUnsavedChangesGuard.ts`
- Modify: `artifacts/bravo-mechanical/src/pages/BookOnline.tsx:31-200`
- Modify: `artifacts/bravo-mechanical/src/components/LeadForm.tsx:318-387`
- Test: `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`

**Interfaces:**
- Produces `useUnsavedChangesGuard(isDirty: boolean, message?: string): void`.
- Booking produces errors keyed by `name | phone | service | date | window`.
- Contact consumes its existing Zod errors and focuses the first matching control.

- [ ] **Step 1: Write failing guard and focus tests**

```tsx
it("protects only a dirty unfinished request", () => {
  render(<RouterHarness><GuardHarness dirty /></RouterHarness>);
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
});

it("focuses and describes the first invalid booking field", async () => {
  render(<MemoryRouter><BookOnline /></MemoryRouter>);
  await userEvent.click(screen.getByRole("button", { name: /book my visit/i }));
  expect(screen.getByLabelText(/name/i)).toHaveFocus();
  expect(screen.getByLabelText(/name/i)).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByRole("group", { name: /what do you need/i })).toHaveAttribute("aria-describedby", "booking-service-error");
});
```

Add the equivalent empty-submit focus assertion for `LeadForm`.

- [ ] **Step 2: Verify RED**

Run the targeted test. Expected: missing hook, group error associations, and focus behavior.

- [ ] **Step 3: Implement the guard**

Use React Router's blocker API plus `beforeunload`. Prompt only when navigation occurs and dirty is true. Default message:

```ts
"You have an unfinished service request. Leave this page and discard it?"
```

- [ ] **Step 4: Implement booking validation**

Create pure `validateBooking(form)` returning the typed partial error map. Link text errors with `aria-describedby`; make selection fieldsets focusable with `tabIndex={-1}`, `aria-invalid`, and group error IDs. Focus the first invalid target and clear individual errors as values become valid.

- [ ] **Step 5: Implement contact recovery**

After current schema validation fails, focus the first error field. Derive dirty state from meaningful values and disable protection during/after successful submission. Do not alter persistence, notifications, consent, or analytics.

- [ ] **Step 6: Verify GREEN and commit**

```bash
git add artifacts/bravo-mechanical/src/hooks/useUnsavedChangesGuard.ts artifacts/bravo-mechanical/src/pages/BookOnline.tsx artifacts/bravo-mechanical/src/components/LeadForm.tsx artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx
git commit -m "fix: make lead forms recoverable and loss-safe"
```

---

### Task 4: Task-specific heroes and contact accessibility

**Files:**
- Modify: `artifacts/bravo-mechanical/src/components/PageHero.tsx:9-47`
- Modify: `artifacts/bravo-mechanical/src/pages/BookOnline.tsx:82-198`
- Modify: `artifacts/bravo-mechanical/src/pages/Contact.tsx:45-144`
- Test: `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`

**Interfaces:**
- Reuses `PageHero.rightSlot`; adds optional `compact?: boolean` presentation only.
- Booking summary contains exactly “About 1 minute,” “Confirmation by text,” and “No payment required.”
- Contact produces separate map iframe and external Google Maps link.

- [ ] **Step 1: Write failing presentation tests**

Assert booking includes the three task statements and no generic hero estimate card. Assert contact renders a call/text hero panel, form content before location content, an AA-intended emergency class, and no anchor containing an iframe.

- [ ] **Step 2: Verify RED**

Run targeted tests. Expected failures on generic heroes, order, contrast class, and nested map.

- [ ] **Step 3: Implement booking/contact heroes**

Pass page-specific `rightSlot` cards. Booking uses the three approved statements. Contact uses existing call/text copy. Use `compact` to reduce mobile hero spacing without page-name conditionals.

- [ ] **Step 4: Fix content order, contrast, and map**

Keep the contact form first in DOM order and place it visually via grid classes. Change emergency phone to a browser-verified 4.5:1 color. Render the iframe inside a figure and a separate “Open in Google Maps” external link.

- [ ] **Step 5: Verify GREEN and commit**

```bash
git add artifacts/bravo-mechanical/src/components/PageHero.tsx artifacts/bravo-mechanical/src/pages/BookOnline.tsx artifacts/bravo-mechanical/src/pages/Contact.tsx artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx
git commit -m "fix: focus booking and contact on their primary tasks"
```

---

### Task 5: Loader, motion, project proof, and contextual CTAs

**Files:**
- Modify: `artifacts/bravo-mechanical/src/App.tsx:44-49`
- Modify: `artifacts/bravo-mechanical/src/index.css`
- Modify: `artifacts/bravo-mechanical/src/pages/Projects.tsx:18-97`
- Modify: `artifacts/bravo-mechanical/src/pages/Index.tsx:383-390`
- Modify: `artifacts/bravo-mechanical/src/pages/Services.tsx:123-154`
- Modify: `artifacts/bravo-mechanical/src/pages/CityPage.tsx:148-202`
- Test: `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`

**Interfaces:**
- Produces `PageLoader` with `role="status"` and “Loading page…” label.
- Project records may have verified `town`, `problem`, `solution`, `result`, and `servicePath` only.
- CTA labels derive only from the known current service.

- [ ] **Step 1: Write failing tests**

Assert loader status/label/decorative spinner and reduced-motion CSS. Assert project images have dimensions, `transition-all` is gone from the system card, and service CTAs include their service title.

- [ ] **Step 2: Verify RED**

Run targeted tests. Expected failures on loader semantics, dimensions, transition, and CTA copy.

- [ ] **Step 3: Implement loader and motion**

```tsx
<div className="page-loader" role="status" aria-live="polite">
  <span className="page-loader__spinner" aria-hidden="true" />
  <span className="sr-only">Loading page…</span>
</div>
```

Move animation to CSS and disable it under `prefers-reduced-motion: reduce`. Replace affected `transition-all` with explicit properties.

- [ ] **Step 4: Implement project proof/dimensions**

Give bundled images real dimensions and CRM photos a 1200×900 fallback matching the reserved 4:3 box. Reuse only project facts already present in homepage proof; omit proof rows when facts are absent. Link declared service paths contextually.

- [ ] **Step 5: Contextualize CTAs**

Change service actions to `Request ${s.title}` (or existing-title installation estimate wording). Retain one prominent city-page sidebar CTA and descriptive service-detail links without adding repeated generic buttons.

- [ ] **Step 6: Verify GREEN and commit**

```bash
git add artifacts/bravo-mechanical/src/App.tsx artifacts/bravo-mechanical/src/index.css artifacts/bravo-mechanical/src/pages/Projects.tsx artifacts/bravo-mechanical/src/pages/Index.tsx artifacts/bravo-mechanical/src/pages/Services.tsx artifacts/bravo-mechanical/src/pages/CityPage.tsx artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx
git commit -m "fix: strengthen project proof and contextual actions"
```

---

### Task 6: Full verification and preview audit

**Files:**
- Modify if needed: `artifacts/bravo-mechanical/tests/smoke.mjs`
- Modify after evidence: `FRONTEND-AUDIT.md`

**Interfaces:**
- Consumes every earlier deliverable.
- Produces a verified branch and isolated preview, not a production release.

- [ ] **Step 1: Add durable smoke assertions**

Extend the static smoke suite only for build-time invariants: skip target/loader CSS, no oversized images, no schema regression. Keep runtime focus tests in Vitest/browser verification.

- [ ] **Step 2: Run all automated checks**

```bash
cd artifacts/bravo-mechanical
PORT=5173 pnpm test
pnpm run build
pnpm run test:e2e
pnpm run typecheck
git diff --check
```

Expected: new tests/build/smoke pass. Typecheck may report only the two documented `AdminComments.tsx` Supabase generated-type errors; any new error blocks completion.

- [ ] **Step 3: Run browser viewport matrix**

Check the six audited routes at 375, 768, 1024, 1100, 1280, and 1440px:

```js
({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  h1: document.querySelectorAll("h1").length,
  main: Boolean(document.querySelector("#main-content")),
  brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).length,
})
```

Expected: overflow 0, h1 1, main true, brokenImages 0.

- [ ] **Step 4: Verify interactions**

Check menu state/Escape/focus, skip link, forward scroll/focus, Back restoration, first-error focus, dirty prompts, sticky CTA clearance, and clean console output.

- [ ] **Step 5: Run Lighthouse/performance**

Run mobile Lighthouse on booking/contact. Expect no application-owned accessibility failures. Trace a representative route and ensure CLS stays 0.00 with no material LCP regression.

- [ ] **Step 6: Deploy isolated Vercel preview**

Deploy preview only. Verify known 200s, unknown 404, private noindex, canonical URLs, and one hydrated FAQ/business entity with no aggregate rating.

- [ ] **Step 7: Record evidence and commit**

Update `FRONTEND-AUDIT.md` with measured remediation status, then:

```bash
git add artifacts/bravo-mechanical/tests/smoke.mjs FRONTEND-AUDIT.md
git commit -m "test: verify frontend remediation"
```

- [ ] **Step 8: Finish branch safely**

Invoke the finishing-a-development-branch skill and present its integration choices. Do not push, merge, or deploy production without the user's selection.
