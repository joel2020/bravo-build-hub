# Supabase schema for Bravo Mechanical

Source of truth for the Supabase database schema this site depends on.

## Layout

```
supabase/
└── migrations/                # Ordered SQL migrations (timestamped filenames)
    ├── 20260418024353_*.sql   # initial: leads, rebate_estimates, user_roles, has_role()
    ├── 20260419233342_*.sql   # blog_comments table + RLS
    ├── 20260419234020_*.sql   # one-off data fix
    ├── 20260422004855_*.sql   # CRM core: jobs, follow_ups, invoices, activity_log
    ├── 20260422004920_*.sql   # tightened RLS to require role on CRM tables
    ├── 20260422005305_*.sql   # public anon insert policy for the lead form
    ├── 20260422010238_*.sql   # email infrastructure (queue + DLQ)
    ├── 20260425090000_*.sql   # SEO/UTM columns on leads
    ├── 20260429210000_*.sql   # inbound_messages (Twilio inbound webhook)
    ├── 20260430090000_*.sql   # automation: job_parts + invoice loop fields
    └── 20260503070000_*.sql   # CRM dispatch + alerts (technicians, crm_notifications,
                               #   plus extra columns on jobs the CRM screens use)
```

Migrations are idempotent (use `IF NOT EXISTS` / `DROP POLICY IF EXISTS`) so they
are safe to re-run.

## Applying migrations

### Option A — Supabase SQL Editor (one-off / quickest)

1. Open Supabase → SQL Editor → New query.
2. Paste the contents of each migration file in chronological order.
3. Run.

### Option B — Supabase CLI (recommended for ongoing work)

From the repo root:

```bash
# one-time setup
brew install supabase/tap/supabase            # or: npm i -g supabase
cd artifacts/bravo-mechanical
supabase login
supabase link --project-ref <your-project-ref>

# apply all pending migrations
supabase db push
```

The CLI tracks which migrations are applied in a Supabase metadata table, so
re-running `db push` only applies new files.

## Regenerating TypeScript types

After applying schema changes, regenerate `src/integrations/supabase/types.ts`
so the CRM's `as any` casts can come out:

```bash
supabase gen types typescript --project-id <your-project-ref> \
  > src/integrations/supabase/types.ts
```

## Required RLS policies (already in migrations)

| Table | Public anon | Authenticated (role holder) | Admin only |
|---|---|---|---|
| `leads` | INSERT (status='new', source in contact_form/rebate_estimator) | SELECT, INSERT, UPDATE | DELETE |
| `rebate_estimates` | INSERT (validated) | — | — |
| `blog_comments` | INSERT (forced approved=false) | — | UPDATE, DELETE |
| `jobs`, `invoices`, `follow_ups`, `activity_log` | — | SELECT, INSERT, UPDATE | DELETE |
| `technicians` | — | SELECT | INSERT, UPDATE, DELETE |
| `crm_notifications` | — | SELECT, INSERT, UPDATE | DELETE |
| `inbound_messages` | — | SELECT | INSERT (service_role only — for the Twilio webhook) |

## Seed data

After the first apply, seed at least one technician so the Dispatch board has
someone to assign to:

```sql
insert into public.technicians (name, email, phone, active)
values ('Bravo Tech 1', 'tech1@bravomechanicalny.com', '914-555-0100', true);
```
