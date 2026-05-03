# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Bravo Mechanical (`artifacts/bravo-mechanical/`)
- **Type**: react-vite
- **Preview Path**: `/`
- **Description**: HVAC business website for Bravo Mechanical LLC serving Westchester County, NY
- **Tech**: React 18, React Router DOM, Tailwind CSS v3, shadcn/ui, Supabase (external), @tanstack/react-query
- **Key features**: Multi-page HVAC website with blog, CRM admin (Supabase-backed), contact/lead forms, SEO, Google Analytics, service area pages
- **Routing**: All public pages + admin routes at /admin/crm (requires Supabase auth)
- **Env vars needed**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (for admin/CRM features)
- **Canonical origin**: `https://bravomechanicalny.com` (NO `www`). Must match across `src/lib/site.ts`, `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt`, and `index.html` JSON-LD.
- **SEO build pipeline** (runs automatically on `pnpm build`):
  - `scripts/generate-sitemap.mjs` — auto-generates `public/sitemap.xml` from cities, services, service-city combos, and blog markdown frontmatter (currently 113 URLs).
  - `scripts/inject-head-metadata.mjs` — for every URL in the sitemap, writes `dist/public/<route>/index.html` with per-route `<title>`, meta description, canonical, OG/Twitter tags, and JSON-LD pre-injected. This is the fix for "Google not crawling all pages" on the SPA — every URL now serves unique, crawler-visible metadata in the initial HTML response without waiting for JavaScript.
  - `scripts/route-data.mjs` — shared catalog that reads city/service/blog source via lightweight regex parsing (no TS runtime needed).
  - To rebuild only the SEO outputs after edits: `pnpm --filter @workspace/bravo-mechanical run build:seo`.
- **Adding new routes**: For routes that match the existing types (city, high-intent service, service-city combo, blog post), the sitemap and head injection update automatically. For new static routes, add an entry to `STATIC_ROUTES` in `scripts/route-data.mjs` AND a `useSeo()` call in the new page component.

### API Server (`artifacts/api-server/`)
- **Type**: api (Express)
- **Preview Path**: `/api`
- **Description**: Shared backend API server (currently only health check; CRM uses Supabase directly)

### Bravo Backlink Agent (`artifacts/backlink-agent/`)
- **Type**: react-vite
- **Preview Path**: `/backlink-agent/`
- **Description**: Autonomous AI-powered backlink outreach agent for Bravo Mechanical. Scans curated **dofollow-only** targets (Westchester chambers, regional press, HVAC trade associations, NY clean-energy programs), discovers contact emails, drafts personalized outreach with Claude, and **auto-sends via Resend**.
- **Backend**: lives in `artifacts/api-server/src/routes/backlinks.ts` + `src/lib/{prospects-seed,backlink-scanner,resend-client,storage}.ts`. JSON file storage in `artifacts/api-server/data/backlink-*.json` with per-file mutex.
- **Pipeline (`POST /api/backlinks/scan`)**: scan targets → detect dofollow vs nofollow on `<a>` to bravomechanicalny.com → discover contact email by scraping contact page + homepage → draft email → if `autoSend` & Resend configured & email known → send via Resend and mark `contacted`.
- **Dofollow only**: scanner parses `rel` attribute; `nofollow|sponsored|ugc` → status `linked-nofollow` (kept in pipeline). Generic citation directories (Yelp, BBB, Angi, YellowPages, Manta, Houzz, etc.) are intentionally excluded from the seed because their outbound links are nofollow.
- **Settings** (`backlink-settings.json`): `autoSend` (default true), `dofollowOnly` (default true). Toggleable from UI.
- **Safety**: terminal statuses (`contacted`, `responded`, `won`, `skipped`) are never overwritten by automated scans or re-sent; SSRF guard on every fetch (private/loopback/link-local/metadata IP ranges blocked).
- **Integrations**: Resend (`connection:conn_resend_01KQP0HYA8CZ1MDCS7RFNQ7KEW`), Anthropic (`@workspace/integrations-anthropic-ai`). The from-address is whatever domain is verified in the user's Resend account.
- **Schedule it**: hit `POST /api/backlinks/scan` from a Replit Scheduled Deployment for hands-off weekly outreach.
- **Social auto-posting** (Social tab): one weekly topic → AI generates 9 platform-tailored posts (FB long form, IG hook+hashtag stack, X 240-char punch, LinkedIn pro tone, Nextdoor neighborly local, etc.) via Claude. Auto-publishes to Facebook Page + Instagram Business via Meta Graph API (`src/lib/meta-client.ts`); for X/Threads/LinkedIn it deep-links the composer with text pre-filled in the URL; other platforms get one-click "copy + open composer". Routes in `src/routes/social.ts`. Storage in `social-posts.json` via `src/lib/social-storage.ts`. Required env vars: `META_PAGE_ACCESS_TOKEN`, `META_PAGE_ID`, optional `META_IG_USER_ID`. Token must be a long-lived (60-day) Page Access Token with permissions `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`, `instagram_basic`, `instagram_content_publish`. IG requires a publicly-fetchable image URL (Meta crawlers fetch the URL — auth-protected URLs won't work). Google Business Profile Posts API was deprecated in 2024 — manual only via deep link. X auto-post requires paid API tier ($100+/mo) — also deep-link only.
- **Citation Manager** (Citations tab): separate workflow for business-profile sites (Google Business, Yelp, BBB, Angi, Houzz, etc.) that REQUIRE human signup (CAPTCHA, phone, postcard verification — auto-creating accounts violates ToS and gets the listing banned). The agent (a) generates a consistent NAP + business package from `BRAVO` config (categories, services, area cities, short/long descriptions, hours), (b) deep-links every claim/signup page, (c) lets a human/VA mark status (not-started → in-progress → claimed → verified → live), and (d) on `POST /api/citations/scan` fetches each site's public search-results page and detects existing listings by brand-name + phone-tail match. Seed list in `src/lib/citations-seed.ts` (~25 sites across Tier 1, Tier 2, HVAC vertical, Local, Data aggregators). Storage in `backlink-citations.json` via `src/lib/citations-storage.ts`. Routes in `src/routes/citations.ts`.
