# Desktop Header Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Bravo Mechanical's crowded desktop navigation with four homeowner-focused choices, two useful dropdowns, a visible phone number, and one `Request Service` action.

**Architecture:** Keep the existing responsive `Header` component and Radix dropdown primitives. Replace the flat desktop arrays and generic `More` menu with explicit service and service-area datasets rendered by two named dropdowns; leave the comprehensive mobile menu intact. Add About and Blog to the existing footer so removing them from the desktop header does not reduce desktop discoverability.

**Tech Stack:** React 19, TypeScript, React Router, Radix Dropdown Menu, Tailwind CSS, Vitest, Testing Library

## Global Constraints

- Desktop header: `Logo | Services ▾ | Projects | Reviews | Service Areas ▾ | Phone | Request Service`.
- `Request Service` is the only desktop header button and links to `/contact`.
- Do not add a generic `More` menu, new page, dependency, intake flow, URL, or analytics event.
- Preserve the existing mobile navigation, sticky header, phone links, and `header_desktop` / `header_mobile_icon` call analytics locations.
- Preserve keyboard access, Escape dismissal, visible focus, route-active styling, and crawlable links.
- Add only About and Blog links to the existing footer; do not redesign it.

---

## File map

- Modify `artifacts/bravo-mechanical/src/components/Header.tsx`: desktop navigation datasets, two accessible dropdowns, active-route styling, and CTA copy.
- Modify `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`: component regressions for visible desktop choices, dropdown destinations, keyboard closure, active routes, CTA uniqueness, and preserved mobile links.
- Modify `artifacts/bravo-mechanical/src/components/Footer.tsx`: add About and Blog links to the existing brand column.
- Modify `artifacts/bravo-mechanical/src/test/seo-conversion.test.tsx`: prove the supporting footer destinations remain crawlable.

### Task 1: Simplify and regroup the desktop header

**Files:**
- Modify: `artifacts/bravo-mechanical/src/components/Header.tsx`
- Test: `artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx`

**Interfaces:**
- Consumes: existing `SITE.phoneHref`, `SITE.phone`, `trackCallClick`, `DropdownMenu*`, `NavLink`, and `useLocation` interfaces.
- Produces: desktop triggers named `Services` and `Service Areas`; direct links named `Projects` and `Reviews`; one desktop CTA named `Request Service` linking to `/contact`.

- [ ] **Step 1: Replace the old desktop-navigation test with failing intent-based coverage**

Replace `keeps primary navigation at xl and places secondary links in More` with these tests:

```tsx
it("shows four focused desktop choices and one request action", () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

  const primary = screen.getByRole("navigation", { name: /primary navigation/i });
  expect(primary.classList.contains("hidden")).toBe(true);
  expect(primary.classList.contains("xl:flex")).toBe(true);
  expect(within(primary).getByRole("button", { name: /services/i })).toBeTruthy();
  expect(within(primary).getByRole("link", { name: "Projects" }).getAttribute("href")).toBe("/projects");
  expect(within(primary).getByRole("link", { name: "Reviews" }).getAttribute("href")).toBe("/reviews");
  expect(within(primary).getByRole("button", { name: /service areas/i })).toBeTruthy();
  expect(primary.textContent).not.toMatch(/Book Online|Contact|About|Blog|Español|More/);

  const requestService = screen.getByRole("link", { name: "Request Service" });
  expect(requestService.getAttribute("href")).toBe("/contact");
});

it("links service and coverage dropdowns to existing destination pages", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

  const servicesTrigger = screen.getByRole("button", { name: /services/i });
  await user.click(servicesTrigger);
  expect(screen.getByRole("menuitem", { name: "24/7 Emergency HVAC" }).getAttribute("href")).toBe(
    "/services/emergency-hvac-repair-westchester-county-ny",
  );
  expect(screen.getByRole("menuitem", { name: "All Services" }).getAttribute("href")).toBe("/services");
  await user.keyboard("{Escape}");
  expect(document.activeElement).toBe(servicesTrigger);

  const serviceAreasTrigger = screen.getByRole("button", { name: /service areas/i });
  await user.click(serviceAreasTrigger);
  expect(screen.getByRole("menuitem", { name: "Yonkers" }).getAttribute("href")).toBe(
    "/service-areas/yonkers",
  );
  expect(screen.getByRole("menuitem", { name: "View All Service Areas" }).getAttribute("href")).toBe(
    "/service-areas",
  );
});
```

Add a route-active regression:

```tsx
it("marks a desktop group active for one of its child routes", () => {
  render(
    <MemoryRouter initialEntries={["/services/ac-repair-westchester-county-ny"]}>
      <Header />
    </MemoryRouter>,
  );

  expect(screen.getByRole("button", { name: /services/i }).getAttribute("aria-current")).toBe("page");
});

it("marks service areas active for a city route", () => {
  render(
    <MemoryRouter initialEntries={["/service-areas/yonkers"]}>
      <Header />
    </MemoryRouter>,
  );

  expect(screen.getByRole("button", { name: /service areas/i }).getAttribute("aria-current")).toBe(
    "page",
  );
});
```

- [ ] **Step 2: Run the focused test to prove the old header fails the new contract**

Run:

```bash
PORT=8080 pnpm --filter @workspace/bravo-mechanical test -- frontend-remediation.test.tsx
```

Expected: FAIL because the old header still exposes `Book Online`, `Contact`, and `More`, lacks the two named dropdown contracts, and uses `Get a Free Estimate`.

- [ ] **Step 3: Define the exact desktop datasets and imports**

In `Header.tsx`, keep `nav` unchanged for mobile. Replace `primaryNav` and `secondaryNav` with:

```tsx
const desktopLinks = [
  { to: "/projects", label: "Projects" },
  { to: "/reviews", label: "Reviews" },
];

const serviceGroups = [
  {
    label: "Repair and maintain",
    items: [
      { to: "/services/emergency-hvac-repair-westchester-county-ny", label: "24/7 Emergency HVAC" },
      { to: "/services/ac-repair-westchester-county-ny", label: "AC Repair" },
      { to: "/services/boiler-repair-westchester-county-ny", label: "Boiler Repair" },
      { to: "/services/hvac-maintenance-westchester-county-ny", label: "HVAC Maintenance" },
    ],
  },
  {
    label: "Install and upgrade",
    items: [
      { to: "/services/ac-installation-westchester-county-ny", label: "AC Installation" },
      { to: "/services/boiler-installation-westchester-county-ny", label: "Boiler Installation" },
      { to: "/services/heat-pump-installation-westchester-county-ny", label: "Heat Pump Installation" },
      { to: "/services", label: "All Services" },
    ],
  },
];

const priorityServiceAreas = [
  { to: "/service-areas/yonkers", label: "Yonkers" },
  { to: "/service-areas/white-plains", label: "White Plains" },
  { to: "/service-areas/new-rochelle", label: "New Rochelle" },
  { to: "/service-areas/mount-vernon", label: "Mount Vernon" },
  { to: "/service-areas/scarsdale", label: "Scarsdale" },
  { to: "/service-areas", label: "View All Service Areas" },
];
```

Import `DropdownMenuLabel` and `DropdownMenuSeparator` from the existing local dropdown module; add no dependency.

- [ ] **Step 4: Render the focused desktop order and active dropdown states**

Inside the existing desktop `<nav>`, render in this order:

1. Services dropdown.
2. `desktopLinks` Projects and Reviews.
3. Service Areas dropdown.

Use the current `pathname` to calculate:

```tsx
const servicesActive = pathname === "/services" || pathname.startsWith("/services/");
const serviceAreasActive = pathname === "/service-areas" || pathname.startsWith("/service-areas/");
```

Render the Services dropdown with this structure:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button
      type="button"
      aria-current={servicesActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        servicesActive ? "text-accent" : "text-foreground hover:text-accent",
      )}
    >
      Services
      <ChevronDown className="h-4 w-4" aria-hidden="true" />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start" className="w-64">
    {serviceGroups.map((group, groupIndex) => (
      <div key={group.label}>
        {groupIndex > 0 && <DropdownMenuSeparator />}
        <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
        {group.items.map((item) => (
          <DropdownMenuItem key={item.to} asChild>
            <NavLink to={item.to}>{item.label}</NavLink>
          </DropdownMenuItem>
        ))}
      </div>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

Render Projects and Reviews from `desktopLinks` using the existing `NavLink` active classes. Then render the Service Areas trigger as:

```tsx
<DropdownMenuTrigger asChild>
  <button
    type="button"
    aria-current={serviceAreasActive ? "page" : undefined}
    className={cn(
      "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      serviceAreasActive ? "text-accent" : "text-foreground hover:text-accent",
    )}
  >
    Service Areas
    <ChevronDown className="h-4 w-4" aria-hidden="true" />
  </button>
</DropdownMenuTrigger>
```

Use this content:

```tsx
<DropdownMenuContent align="start" className="w-56">
  {priorityServiceAreas.map((item, index) => (
    <div key={item.to}>
      {index === priorityServiceAreas.length - 1 && <DropdownMenuSeparator />}
      <DropdownMenuItem asChild>
        <NavLink to={item.to}>{item.label}</NavLink>
      </DropdownMenuItem>
    </div>
  ))}
</DropdownMenuContent>
```

Keep Projects and Reviews as direct `NavLink` elements with the current active-link classes. Change only the desktop CTA copy:

```tsx
<Button asChild size="sm" className="hidden sm:inline-flex bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
  <Link to="/contact">Request Service</Link>
</Button>
```

Do not change the mobile `nav` array, mobile trigger, phone behavior, or mobile CTA copy.

- [ ] **Step 5: Run the header tests and fix only contract failures**

Run:

```bash
PORT=8080 pnpm --filter @workspace/bravo-mechanical test -- frontend-remediation.test.tsx
```

Expected: all tests in `frontend-remediation.test.tsx` pass, including existing mobile Escape/focus and route-change coverage.

- [ ] **Step 6: Commit the independently working header change**

```bash
git add artifacts/bravo-mechanical/src/components/Header.tsx artifacts/bravo-mechanical/src/test/frontend-remediation.test.tsx
git commit -m "feat: simplify desktop navigation"
```

### Task 2: Preserve supporting destinations and verify the complete change

**Files:**
- Modify: `artifacts/bravo-mechanical/src/components/Footer.tsx`
- Test: `artifacts/bravo-mechanical/src/test/seo-conversion.test.tsx`

**Interfaces:**
- Consumes: existing footer `Link`, logo, and brand-column markup.
- Produces: crawlable `/about` and `/blog` links outside the simplified desktop header.

- [ ] **Step 1: Add a failing footer-discoverability assertion**

Extend `uses sequential footer headings and readable legal text`:

```tsx
expect(html).toContain('href="/about"');
expect(html).toContain('href="/blog"');
expect(html).toContain("About Bravo");
expect(html).toContain("HVAC Resources");
```

- [ ] **Step 2: Run the focused test to prove the links are absent**

Run:

```bash
PORT=8080 pnpm --filter @workspace/bravo-mechanical test -- seo-conversion.test.tsx
```

Expected: FAIL because the current footer has neither `/about` nor `/blog`.

- [ ] **Step 3: Add the two supporting links without redesigning the footer**

After the two brand-description paragraphs in `Footer.tsx`, add:

```tsx
<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
  <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground hover:underline">
    About Bravo
  </Link>
  <Link to="/blog" className="text-primary-foreground/80 hover:text-primary-foreground hover:underline">
    HVAC Resources
  </Link>
</div>
```

Do not move or rename existing Book Online, Español, service, area, legal, or contact links.

- [ ] **Step 4: Run focused and full automated verification**

Run:

```bash
PORT=8080 pnpm --filter @workspace/bravo-mechanical test -- seo-conversion.test.tsx
PORT=8080 pnpm --filter @workspace/bravo-mechanical test
pnpm --filter @workspace/bravo-mechanical typecheck
PORT=8080 pnpm --filter @workspace/bravo-mechanical build
pnpm --filter @workspace/bravo-mechanical test:e2e
git diff --check
```

Expected: all component tests pass; typecheck exits 0; production/SEO build writes 148 routes; smoke checks pass; no whitespace errors.

- [ ] **Step 5: Verify desktop layout and interaction at required widths**

Start the site:

```bash
PORT=8080 pnpm --filter @workspace/bravo-mechanical dev
```

At 1280×900, 1440×900, and 1920×1080, verify:

- One header row with no overlap or wrapping.
- Order is Services, Projects, Reviews, Service Areas, phone, Request Service.
- Both dropdowns open by keyboard and pointer, Escape closes them, and focus returns to the trigger.
- Service and area child routes mark the matching dropdown trigger active.
- Mobile navigation remains hidden at desktop sizes.

At 390×844, verify the existing menu opens, closes on Escape, retains all ten destination links, and keeps the call button and estimate CTA usable.

- [ ] **Step 6: Commit the supporting links and verified result**

```bash
git add artifacts/bravo-mechanical/src/components/Footer.tsx artifacts/bravo-mechanical/src/test/seo-conversion.test.tsx
git commit -m "feat: preserve company links in footer"
```
