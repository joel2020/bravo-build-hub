# Phase 1 Audit + Phase 2 Implementation Notes

## Stack Summary
- Frontend: Vite + React + TypeScript + React Router + Tailwind + shadcn/ui.
- Data/auth: Supabase JS client (`@supabase/supabase-js`).
- Content: Markdown blog posts loaded at build-time via `import.meta.glob`.
- Analytics: GA-style custom dataLayer events in `src/lib/analytics.ts`.

## Route Map (existing)
- `/` homepage
- `/about`
- `/services`
- `/services/:serviceSlug/:citySlug`
- `/services/:slug`
- `/service-areas`
- `/service-areas/:slug`
- `/reviews`
- `/blog`
- `/blog/:slug`
- `/contact`
- `/auth`
- `/admin/comments`
- `/emergency-hvac-westchester`

## Existing Supabase Integration (before this phase)
- `blog_comments`: public comment inserts + admin moderation.
- `rebate_estimates`: public rebate lead inserts.
- `user_roles`: role records for admin moderation access.

## Existing Forms (before this phase)
- Contact lead form (`LeadForm`): **frontend-only success state** (no persistence).
- Rebate estimator lead form: persisted to `rebate_estimates`.
- Blog comment form: persisted to `blog_comments` with moderation.
- No separate emergency service, financing, or newsletter form route/component found.

## Production Risks Identified
- Contact conversion data loss risk (no database persistence).
- No unified CRM schema for leads/customers/jobs/tasks/content/call follow-up.
- Role model only had `admin` and `user`; no office/tech role separation.
- No standardized activity trail for operational/audit timeline.

## Phase 2 Changes in this commit
- Added a full CRM + content + voice-prep schema migration with RLS in one Supabase migration file.
- Wired contact form to persist real leads to Supabase.
- Added source tracking + UTM + honeypot + minimum-fill-time anti-spam checks.
- Kept existing rebate estimator insert behavior and mirrored submissions into `leads`.

## Manual Setup Steps (single existing Supabase project)
1. Apply all `supabase/migrations` to your existing client-specific project (do **not** create a new Supabase project).
2. Ensure frontend env vars are set (see `.env.example`).
3. In Supabase, assign roles in `public.user_roles` for staff users: `admin`, `office_staff`, `tech`.
4. Verify public insert policies by submitting forms from `/contact` and rebate estimator.

## Scope Notes
- This phase sets the data model and public lead ingestion foundation.
- Internal CRM routes/UI (`/dashboard/*`) are planned for the next phase.
- ElevenLabs live API/webhooks are not implemented yet; placeholder integration settings + call task scaffolding are included.
