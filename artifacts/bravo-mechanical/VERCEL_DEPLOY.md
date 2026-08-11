# Deploy Bravo Mechanical to Vercel

The site is already built to deploy on Vercel from this monorepo as-is.
The `vercel.json` at the repo root tells Vercel everything it needs.

## One-time setup

1. **Push this repo to GitHub** (Vercel needs a Git source).
2. In Vercel, click **Add New → Project** and import the repo.
3. **Do not change the Root Directory.** Leave it as the repo root (`./`).
   The `vercel.json` already points at `artifacts/bravo-mechanical`.
4. Framework Preset: **Other** (auto-detected from `vercel.json`).
5. Add the environment variables below (Settings → Environment Variables).
6. Click **Deploy**.

## Environment variables (required)

Set these for **Production**, **Preview**, and **Development**:

| Name | Value | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | your Supabase project URL | same value already in Replit secrets |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | your Supabase anon/publishable key | same value already in Replit secrets |

Both are safe to expose to the browser (publishable keys are designed for that;
RLS policies enforce access).

## Custom domain

After the first deploy works on `*.vercel.app`:

1. Vercel → Project → Settings → Domains → Add `bravomechanicalny.com`.
2. Vercel shows you the DNS records to set at your registrar (usually one
   `A` record for the apex and one `CNAME` for `www`).
3. Once DNS propagates, Vercel auto-issues an SSL cert.
4. Add `www.bravomechanicalny.com` too and set it as the production domain. The
   root `vercel.json` permanently redirects the apex host to the canonical
   `www` host.

## What happens at build time

`pnpm --filter @workspace/bravo-mechanical run build` runs:

1. `vite build` — bundles the React SPA into `dist/public/`.
2. `node scripts/generate-sitemap.mjs` — writes `dist/public/sitemap.xml`.
3. `node scripts/inject-head-metadata.mjs` — for every route (services,
   service areas, blog posts, etc.) writes a copy of `index.html` with
   per-page `<title>`, meta description, canonical, OG tags, and JSON-LD
   pre-injected. Vercel serves `/foo/index.html` when `/foo` is requested,
   so Google sees real per-page metadata in the initial HTML response.

## What still talks to Supabase

The site reads/writes Supabase **directly** from the browser using the
publishable key. There is no backend server in the Vercel deployment.
All security is enforced by Supabase Row-Level Security policies, which
are already in place.

The Replit api-server (used only for the disabled backlink agent) is **not**
deployed to Vercel. If you ever want to re-enable the backlink agent on
Vercel, it would need to move to Vercel Serverless Functions (a separate
follow-up).

## Re-deploying

Every push to `main` (or your default branch) triggers a production deploy.
Pushes to other branches get preview deploys at unique URLs.
