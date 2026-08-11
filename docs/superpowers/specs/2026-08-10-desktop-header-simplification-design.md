# Bravo Mechanical Desktop Header Simplification

## Goal

Reduce the desktop header from a crowded directory of pages to a clear path for homeowners who need service, want proof of work, or need to confirm coverage. Preserve access to all existing pages without competing with the primary conversion action.

## Research basis

Six nearby HVAC contractors were reviewed at desktop widths. The clearest comparable pattern was One Hour Westchester: four meaningful navigation groups and one booking action. Maselli and Flotechs showed the same crowding problem as Bravo with seven or more flat links. Robison demonstrated that named dropdowns are clearer than a generic `More` menu. AMHAC's desktop hamburger was rejected because it hides too much.

## Desktop information architecture

The header remains one row:

`Logo | Services ▾ | Projects | Reviews | Service Areas ▾ | Phone | Request Service`

- The logo is the Home link; no separate Home label appears.
- `Projects` and `Reviews` remain visible because they provide conversion proof.
- The phone number remains a direct `tel:` link.
- `Request Service` is the only button and links to `/contact`.
- `Book Online`, `Contact`, `About`, `Blog`, `Español`, and `More` do not appear as top-level desktop items.
- About and Blog are added as simple links in the footer's existing brand column. Contact remains available through the header CTA and footer contact details; Español and Book Online remain linked from the footer. All current destinations remain in the mobile navigation.

## Services dropdown

The dropdown is task-oriented rather than a complete sitemap. It contains two short groups:

**Repair and maintain**

- 24/7 Emergency HVAC
- AC Repair
- Boiler Repair
- HVAC Maintenance

**Install and upgrade**

- AC Installation
- Boiler Installation
- Heat Pump Installation
- All Services

Every item links directly to its existing page. The dropdown trigger itself may link to `/services` only if the existing menu component supports a combined link and trigger without creating ambiguous keyboard behavior; otherwise `All Services` provides that route.

## Service Areas dropdown

Show the five highest-priority markets from the site's existing town order:

- Yonkers
- White Plains
- New Rochelle
- Mount Vernon
- Scarsdale
- View All Service Areas

Each city links to its existing `/service-areas/:slug` page; the final item links to `/service-areas`.

## Interaction and responsive behavior

- Desktop dropdowns work with pointer and keyboard input, expose their expanded state, close on selection and Escape, and return focus predictably.
- Active styling applies when the current route belongs to Services or Service Areas.
- Existing phone-click analytics remain intact.
- The mobile menu remains comprehensive and retains direct access to all current destinations. Only the desktop information hierarchy changes.
- Existing sticky positioning, logo treatment, colors, spacing, and height remain unless small spacing adjustments are needed to prevent wrapping at the current desktop breakpoint.

## SEO and conversion constraints

- Removing links from the desktop header does not remove pages or change URLs.
- Footer and mobile links preserve crawlable access to About, Blog, Contact, Español, and booking pages. Adding the two missing footer links is part of this change; no footer layout redesign is required.
- Use one unambiguous header CTA, `Request Service`, to cover both urgent repair and planned estimate intent.
- Do not introduce a new intake flow, page, dependency, or analytics event as part of this change.

## Verification

- Component tests assert the four visible desktop navigation choices, one CTA, correct dropdown destinations, active states, and keyboard behavior.
- Existing mobile navigation, phone analytics, accessibility, and route tests continue to pass.
- Verify at 1280, 1440, and 1920 pixel desktop widths with no wrapping or overlap.
- Run the Bravo test suite, typecheck, production/SEO build, smoke checks, and `git diff --check`.

## Out of scope

- Footer redesign beyond adding the About and Blog links needed to support the simplified header
- Mobile navigation redesign
- New booking or lead-intake flows
- Changes to service or city page content
- Changes to the Spanish site header
