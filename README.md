# Bravo Build Hub (HVAC Website + CRM Foundation)

This project is a Lovable-generated Vite + React + TypeScript app, now being extended into a production HVAC website + CRM + automation base.

## Current Scope
- Public marketing website and SEO content pages.
- Blog + comments moderation.
- Supabase-backed lead capture foundation (Phase 2).
- Authenticated CRM MVP dashboard with role-aware route guards and job photo uploads.

## Local Development
```bash
npm install
npm run dev
```

## Environment
Copy `.env.example` to `.env.local` and fill values from your **existing client-specific Supabase project**.

## Supabase
- Migrations live in `supabase/migrations`.
- Apply migrations to one dedicated project for this client.
- Do **not** create additional Supabase projects.

## Notes
Detailed audit and implementation notes for Phase 1 + Phase 2 are in:
- `docs/phase1-phase2-audit.md`
- `docs/phase-bcd-implementation.md` covers dashboard/auth/files MVP.
