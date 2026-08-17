# Bravo Supabase Stabilization Design

**Date:** August 11, 2026

**Status:** Approved design

**Authoritative project:** `vqygaqrderxvumczpfnu`
**Selected hosting:** Supabase Free Plan for now

## Context

Bravo Mechanical will retain its only database on managed Supabase. The owner confirmed that `vqygaqrderxvumczpfnu` is the sole Bravo database. Other project references in the application are stale configuration and are not data sources.

The authoritative project is healthy on PostgreSQL 17.6. Its audited baseline contains 54 public rows, two Auth users, one Storage object, and three active Edge Functions. The deployed frontend still targets a stale project and submits several fields that do not exist in `vqy...`. Existing RLS policies also grant every authenticated user unrestricted access to operational tables and role assignments.

Bravo will not upgrade to Supabase Pro in this phase. Automatic inactivity pausing remains an accepted availability constraint. This design does not add synthetic keep-alive traffic.

## Goals

1. Preserve `vqy...` as the system of record without deleting or resetting existing data.
2. Make the active public forms and CRM compatible with the authoritative schema.
3. Remove stale Supabase project references and fail closed when configuration is missing.
4. Replace authentication-only RLS with role-based authorization.
5. Restore the current user-facing CRM behavior with the smallest reviewed change set.
6. Establish a verified backup and rollback path before production changes.

## Non-goals

- Moving PostgreSQL, Auth, Storage, or Edge Functions to Hostinger.
- Upgrading Supabase billing.
- Adding scheduled traffic to prevent Free Plan pausing.
- Rebuilding the notification system, implementing a transactional outbox, or adding appointment automation.
- Implementing SEO or blog automation.
- Applying the repository's entire historical migration backlog.
- Deleting, resetting, or importing historical CRM records.

## Approaches considered

### 1. Curated additive compatibility migration — selected

Add only the schema elements exercised by the active frontend, update the client configuration, and harden RLS. This preserves existing application behavior and data while avoiding unrelated historical migrations.

### 2. Reduce the frontend to the present schema

This avoids several database columns but removes booking, attribution, and CRM capabilities that the current interface exposes. It creates more application churn and was rejected.

### 3. Add a general Edge Function compatibility API

This creates a stronger server-side boundary but requires a broader backend rewrite. It is deferred until a later notification/intake phase.

## Target architecture

- `www.bravomechanicalny.com` and `app.bravomechanicalny.com` remain Vercel-hosted React/Vite applications.
- Both use only `vqy...` for Supabase Database, Auth, Storage, RPC, and Edge Functions.
- Public lead and booking forms insert tightly constrained lead records through the anonymous Data API role.
- Authenticated CRM requests are authorized by RLS using `public.user_roles`.
- Privileged email and SMS delivery remains inside authenticated Edge Functions.
- The Supabase service-role key and database credentials never enter browser code.
- Hostinger remains outside this phase.

## Baseline backup gate

No production schema or RLS mutation may occur until a baseline package exists and has passed integrity checks. The package must contain:

- PostgreSQL roles, schema, data, policies, grants, functions, triggers, extensions, and Supabase migration history;
- Auth user and identity metadata needed for recovery, without copying secrets into source control;
- Storage bucket metadata and object bytes;
- Edge Function source/configuration and deployed hashes;
- aggregate table/object counts and SHA-256 checksums.

The backup gate requires a supported `pg_dump` connection method or equivalent owner-controlled export plus Storage export access. Current connected management access is sufficient for inventory but has not produced a restorable backup. The package must be restored to an isolated PostgreSQL 17 environment and compared with the baseline counts before production changes.

## Data model changes

The implementation will calculate the exact live diff and create a new migration containing only absent requirements. Expected lead compatibility fields are:

- `service text`
- `urgency text`
- `notes text`
- `preferred_date date`
- `preferred_time text`
- `first_name text`
- `last_name text`
- `source_page text`
- `landing_url text`
- `referrer text`
- `utm_source text`
- `utm_medium text`
- `utm_campaign text`
- `utm_term text`
- `utm_content text`
- `gclid text`
- `fbclid text`

All additions are nullable except where an existing safe default is already established. The migration must be idempotent and preserve all current rows.

`service` is the active frontend compatibility field. Existing `service_type` values will backfill `service`; a narrowly scoped trigger will synchronize the two fields for future inserts and updates. The trigger must use an explicit `search_path` and avoid recursive updates.

The implementation will inspect the live enum catalog before adding any required lead-source or status value. Enum additions are limited to values currently emitted by active forms. No unused tables from generated TypeScript types will be created.

Blog-comment compatibility will be implemented only as needed by the current public and admin interfaces. Approval state will be normalized without discarding the existing `status` value. The missing admin-comment RPC will be security-invoker code so RLS remains authoritative.

## Authorization model

### Anonymous access

- Anonymous users may insert a lead only when it is new and unassigned.
- Anonymous users may not select, update, or delete leads.
- Public forms receive column-level `INSERT` grants only for the fields required for customer intake and attribution; internal assignment, conversion, and staff fields remain ungranted.
- Anonymous users may insert blog comments and select only approved comments.
- No operational table receives anonymous read access.

The ineffective browser-side duplicate lookup will be removed because anonymous users correctly lack lead read access. Every valid submission creates a lead. Reliable deduplication is deferred to a server-side intake phase.

### Authenticated CRM access

- Operational access requires an existing `admin` or `technician` row for `auth.uid()` in `public.user_roles`.
- CRM staff retain the table operations required by the current interface.
- Users may select their own role assignment.
- Authenticated browser users may not insert, update, or delete `user_roles` rows.
- Role administration remains an owner/service-side operation until a separately reviewed admin workflow exists.

Policies will use explicit `TO` clauses, `USING`, and `WITH CHECK`. The role lookup must not depend on user-editable JWT metadata. It must also avoid a recursive policy on `user_roles`.

### Storage and functions

- Job-photo uploads remain limited to authenticated CRM staff.
- This phase will not broaden public job-photo access.
- The frontend SMS helper will invoke the existing authenticated `send-sms` Edge Function instead of the nonexistent `send_sms_via_twilio` database RPC.
- The admin-comment RPC will be security invoker, not a public security-definer bypass.

## Frontend configuration and behavior

- Remove every `tzcz...` and `bcj...` URL or fallback from active source and generated bundles.
- `VITE_SUPABASE_URL` and the publishable key remain build-time Vercel variables.
- No service-role or database password receives a `VITE_` prefix.
- Marketing pages remain renderable if configuration is missing, but database-backed forms display a clear unavailable state instead of contacting a fallback project.
- CRM routes fail closed with a configuration message when Supabase is unavailable.
- Regenerate `Database` TypeScript definitions from `vqy...` after the migration and remove casts that only masked schema drift when practical within touched code.

## Delivery sequence

1. Create the verified baseline backup.
2. Create a dedicated implementation branch from current `origin/main`.
3. Build a synthetic PostgreSQL 17/Supabase test fixture matching the audited schema.
4. Generate the curated migration using the repository's migration tooling.
5. Apply the migration twice to the test fixture to prove safe re-entry.
6. Update generated types, client configuration, public forms, SMS integration, and comment compatibility.
7. Run local unit, integration, type, build, and smoke tests.
8. Apply additive schema compatibility changes to `vqy...`.
9. Configure the Vercel deployment with `vqy...` and deploy the tested application.
10. Verify public and staff workflows against production.
11. Confirm both Auth users have valid CRM roles, then apply the separate RLS-hardening migration.
12. Re-run workflow tests and Supabase security/performance advisors.
13. Monitor API, Auth, Storage, and Edge Function logs for at least 30 minutes.

Schema compatibility and RLS hardening are separate migrations. This keeps the data-contract change independently reviewable and prevents an authorization mistake from being hidden inside a larger migration.

## Error handling

- Migration preconditions abort when unexpected columns, constraints, policy shapes, or role coverage are found.
- Additive schema changes run transactionally where PostgreSQL permits.
- Application calls surface actionable user messages without logging contact details or tokens.
- Configuration errors fail closed and identify the missing variable without printing its value.
- Form submissions remain single-attempt from the client; ambiguous failures do not automatically retry and risk duplicate leads.
- Edge Function errors retain provider IDs/status codes in restricted logs without exposing message content in browser telemetry.

## Verification matrix

### Data preservation

- Public row counts do not decrease from the pre-change snapshot.
- Auth user/identity counts and Storage object counts do not decrease.
- Existing lead `service_type` data appears in the compatibility `service` field after backfill.
- Applying the migration twice produces no error or duplicate object.

### RLS and authorization

- Anonymous compliant lead insert succeeds.
- Anonymous lead select, update, delete, assignment, and non-new status insert fail.
- User without a CRM role cannot read operational tables.
- Staff role can perform the operations required by the CRM.
- A user cannot create, update, or delete their own role assignment.
- Anonymous users can read only approved comments.
- Non-staff Storage upload fails; authorized upload succeeds.

### Application workflows

- English and Spanish booking forms create populated lead records.
- General lead forms preserve service, notes, urgency, and attribution.
- CRM authentication and role routing work.
- Dashboard, leads, jobs, dispatch, invoices, comments, and photo workflows load and write successfully.
- SMS uses the authenticated `send-sms` Edge Function.
- Missing configuration shows a controlled unavailable state.

### Repository and deployment

- Typecheck, unit tests, production build, and smoke tests pass.
- Browser source and built assets contain `vqy...` and contain no stale project reference.
- No service-role key, database password, or secret fallback exists in tracked or built browser assets.
- Supabase security advisor has no new errors; known warnings are documented.

## Rollback

Schema additions are non-destructive and may remain during an application rollback. Do not drop new columns or restore an old database over records accepted after rollout.

The application rollback artifact is the previous production application code rebuilt with the correct `vqy...` environment. It is not the currently deployed bundle, because that bundle points to a stale project. Database migrations use expand/contract sequencing so the new and rollback application versions can coexist during the rollback window.

RLS hardening has a separately reviewed inverse migration. If it blocks authorized staff, restore the immediately previous policy definitions without changing application data, then investigate with the affected role and a synthetic fixture.

## Success criteria

The phase is complete when:

1. A restore-tested baseline backup exists.
2. Both Vercel properties use only `vqy...`.
3. Public lead and booking forms create complete records.
4. Authorized staff can use the active CRM workflows.
5. Unauthorized and role-escalation tests fail as designed.
6. Existing data, Auth users, and Storage objects are preserved.
7. All required repository and production smoke checks pass.
8. No Hostinger database, Pro upgrade, keep-alive automation, or unrelated feature work was introduced.
