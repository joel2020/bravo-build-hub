# Bravo Supabase Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize the Bravo Mechanical application on the sole retained Supabase project `vqygaqrderxvumczpfnu`, preserve all current production data, align the supported frontend workflows with the live database, and replace permissive RLS with explicit anonymous and CRM-staff access rules.

**Architecture:** Use two additive, independently deployable migrations: the first supplies only the compatibility fields and small tables required by the approved workflow matrix; the second hardens authorization after application compatibility is proven. The browser uses one fail-closed Supabase client and invokes existing Edge Functions through the SDK. A verified, encrypted backup and isolated restore are hard gates before production writes, and the application remains deployable against the existing database during every step.

**Tech Stack:** PostgreSQL 17, Supabase CLI 2.113.0, Supabase Auth/Storage/Edge Functions, pgTAP, React 19, TypeScript, `@supabase/supabase-js`, Vite 7, Vitest 4, Testing Library, pnpm, Vercel.

## Global Constraints

- Treat `vqygaqrderxvumczpfnu` as the only Bravo Mechanical Supabase project.
- Retain Supabase Free for now; do not migrate to Hostinger, enable Pro, or create synthetic keepalive traffic.
- Make no production database change until the encrypted backup has been restored into an isolated PostgreSQL instance and table counts have been reconciled.
- Never print, commit, or place database passwords, service-role keys, Twilio credentials, SMTP credentials, backup passphrases, access tokens, or customer data inside the repository.
- Preserve all 54 audited public-table rows, both Auth users and identities, and the `job-photos` storage object.
- Do not replay the repository's 40 historical migrations against production. Create only the two new migrations in this plan with the pinned Supabase CLI.
- Keep the compatibility and RLS migrations separate. Prove application compatibility before applying RLS hardening.
- Anonymous users may insert tightly constrained leads and comments, read approved comments, and perform no anonymous lead lookup, update, or operational-table read.
- CRM authorization comes only from `public.user_roles` roles `admin` and `technician`. The browser may read only its own role and may not mutate roles.
- Do not broaden the public Storage surface. Preserve the current public `job-photos` bucket behavior while restricting writes to CRM staff.
- Support the approved core matrix: public lead/booking submission, approved comments, CRM dashboard/leads/jobs/dispatch/invoices/activity/settings templates, public photos, and SMS invocation. Render the unfinished Proposals and Messages workspaces as explicit deferred panels instead of querying absent tables.
- Keep role administration read-only in the browser. User invitations and role changes remain owner/service-side operations.
- Use synthetic test identities and data only. Prefix temporary production canary records with `codex-verification-20260811-` and delete those exact records after verification.
- Application rollback means redeploying the immediately previous application commit with the `vqygaqrderxvumczpfnu` Vercel environment, never restoring the stale deployment that targets another Supabase project.
- Compatibility-schema rollback is forward-fix only because the additions preserve original columns. RLS has a separately reviewed inverse-policy runbook that restores the exact pre-change grants and policies without changing application data.
- Every behavior change starts with a failing test and follows red-green-refactor.
- Do not push, deploy, or apply production migrations without the user's explicit approval at the execution checkpoint.

## File Structure

- Create `docs/superpowers/evidence/2026-08-11-vqy-baseline-manifest.md`: sanitized counts, checksums, restore results, and deployment gates; no customer data or secrets.
- Create via Supabase CLI `artifacts/bravo-mechanical/supabase/config.toml`: local test configuration for this artifact.
- Create via Supabase CLI `artifacts/bravo-mechanical/supabase/migrations/*_vqy_frontend_compatibility.sql`: additive schema compatibility migration.
- Create via Supabase CLI `artifacts/bravo-mechanical/supabase/migrations/*_vqy_rls_hardening.sql`: role helper, grants, and RLS policies.
- Create `artifacts/bravo-mechanical/supabase/tests/vqy_frontend_compatibility.test.sql`: pgTAP compatibility contract.
- Create `artifacts/bravo-mechanical/supabase/tests/vqy_rls_hardening.test.sql`: pgTAP role/authorization contract.
- Create `artifacts/bravo-mechanical/supabase/rollback/vqy_rls_hardening_inverse.sql`: reviewed restoration of the exact baseline policies and grants; never part of normal migration replay.
- Create `artifacts/bravo-mechanical/src/test/supabase-stabilization.test.tsx`: frontend configuration and workflow regressions.
- Modify `artifacts/bravo-mechanical/src/integrations/supabase/client.ts`: one fail-closed client with no stale fallback.
- Regenerate `artifacts/bravo-mechanical/src/integrations/supabase/types.ts`: types from the stabilized `vqy` public schema.
- Modify `artifacts/bravo-mechanical/src/lib/email.ts` and `src/lib/sms.ts`: SDK Edge Function invocation.
- Modify `artifacts/bravo-mechanical/src/components/LeadForm.tsx`: insert-only anonymous lead path.
- Modify `artifacts/bravo-mechanical/src/components/CommentsSection.tsx` and `src/pages/AdminComments.tsx`: compatibility comment contract.
- Modify `artifacts/bravo-mechanical/src/pages/Projects.tsx`: keep the public gallery on bundled/static project assets instead of anonymously querying an operational table.
- Modify `artifacts/bravo-mechanical/src/pages/BookOnline.tsx` and `src/pages/es/EsBook.tsx`: typed `online_booking` lead source.
- Modify `artifacts/bravo-mechanical/src/components/crm/CRMDashboard.tsx`: settings templates plus read-only self-role display and the shared deferred panel.
- Modify `artifacts/bravo-mechanical/src/pages/CRM.tsx`: approved authorization and workspace routing.
- Modify `artifacts/bravo-mechanical/src/pages/ProposalView.tsx` and `src/main.tsx`: remove stale project references and fail safely.
- Modify `artifacts/bravo-mechanical/src/pages/Auth.tsx`: fail closed before any Auth request when public Supabase configuration is absent.
- Modify `artifacts/bravo-mechanical/.env.example`: document required public Vite variables without secrets.

---

### Task 1: Create and verify the recovery gate

**Files:**
- Create: `docs/superpowers/evidence/2026-08-11-vqy-baseline-manifest.md`
- Verify only: an operator-selected backup directory outside `/Users/joel/Documents/Bravo Mechanical`

**Interfaces:**
- Consumes `BRAVO_SUPABASE_DB_URL`, `BRAVO_BACKUP_DIR`, and `BRAVO_BACKUP_PASSPHRASE` from the operator environment.
- Produces encrypted role, schema, and data dumps; a storage copy; Edge Function source/config exports; SHA-256 checksums; and a sanitized committed manifest.
- The manifest records counts and checksums, never row values or secrets.

- [ ] **Step 1: Establish secret-safe shell state and validate the target**

```bash
set -euo pipefail
umask 077
test -n "${BRAVO_SUPABASE_DB_URL:?set BRAVO_SUPABASE_DB_URL}"
test -n "${BRAVO_BACKUP_DIR:?set BRAVO_BACKUP_DIR outside the repository}"
test -n "${BRAVO_BACKUP_PASSPHRASE:?set BRAVO_BACKUP_PASSPHRASE}"
case "$BRAVO_BACKUP_DIR" in
  "/Users/joel/Documents/Bravo Mechanical"*) exit 64 ;;
esac
mkdir -p "$BRAVO_BACKUP_DIR"
chmod 700 "$BRAVO_BACKUP_DIR"
```

Expected: the command exits before creating a backup when any required value is absent or the backup target is inside the repository.

- [ ] **Step 2: Dump the live roles, schema, and data using the pinned CLI**

```bash
pnpm dlx supabase@2.113.0 db dump --db-url "$BRAVO_SUPABASE_DB_URL" --role-only --file "$BRAVO_BACKUP_DIR/roles.sql"
pnpm dlx supabase@2.113.0 db dump --db-url "$BRAVO_SUPABASE_DB_URL" --schema public,auth,storage,extensions,supabase_migrations --file "$BRAVO_BACKUP_DIR/schema.sql"
pnpm dlx supabase@2.113.0 db dump --db-url "$BRAVO_SUPABASE_DB_URL" --schema public,auth,storage,extensions,supabase_migrations --data-only --use-copy --file "$BRAVO_BACKUP_DIR/data.sql"
```

Expected: three non-empty files owned only by the current user. If Auth dump permissions block the combined dump, record the exact error in the manifest and use the Supabase dashboard backup/export for `auth` before continuing; do not weaken database permissions.

- [ ] **Step 3: Export Storage and Edge Function assets**

```bash
pnpm dlx supabase@2.113.0 link --project-ref vqygaqrderxvumczpfnu --workdir artifacts/bravo-mechanical
pnpm dlx supabase@2.113.0 storage cp --recursive ss:///job-photos "$BRAVO_BACKUP_DIR/storage/job-photos" --linked --workdir artifacts/bravo-mechanical
mkdir -p "$BRAVO_BACKUP_DIR/function-export"
pnpm dlx supabase@2.113.0 init --workdir "$BRAVO_BACKUP_DIR/function-export"
pnpm dlx supabase@2.113.0 functions download send-sms --project-ref vqygaqrderxvumczpfnu --use-api --workdir "$BRAVO_BACKUP_DIR/function-export"
pnpm dlx supabase@2.113.0 functions download send-email --project-ref vqygaqrderxvumczpfnu --use-api --workdir "$BRAVO_BACKUP_DIR/function-export"
pnpm dlx supabase@2.113.0 functions download twilio-inbound --project-ref vqygaqrderxvumczpfnu --use-api --workdir "$BRAVO_BACKUP_DIR/function-export"
mv "$BRAVO_BACKUP_DIR/function-export/supabase/functions" "$BRAVO_BACKUP_DIR/functions"
rm -rf "$BRAVO_BACKUP_DIR/function-export"
```

Expected: one Storage object and the three live function source trees are present. Record function verification/JWT settings from the connected Supabase project in the manifest without recording secret values.

- [ ] **Step 4: Encrypt and checksum every raw export**

```bash
for backup_file in "$BRAVO_BACKUP_DIR/roles.sql" "$BRAVO_BACKUP_DIR/schema.sql" "$BRAVO_BACKUP_DIR/data.sql"; do
  openssl enc -aes-256-cbc -pbkdf2 -salt -in "$backup_file" -out "$backup_file.enc" -pass env:BRAVO_BACKUP_PASSPHRASE
  shasum -a 256 "$backup_file.enc" >> "$BRAVO_BACKUP_DIR/SHA256SUMS"
  rm "$backup_file"
done
tar -C "$BRAVO_BACKUP_DIR" -czf "$BRAVO_BACKUP_DIR/assets.tar.gz" storage functions
openssl enc -aes-256-cbc -pbkdf2 -salt -in "$BRAVO_BACKUP_DIR/assets.tar.gz" -out "$BRAVO_BACKUP_DIR/assets.tar.gz.enc" -pass env:BRAVO_BACKUP_PASSPHRASE
shasum -a 256 "$BRAVO_BACKUP_DIR/assets.tar.gz.enc" >> "$BRAVO_BACKUP_DIR/SHA256SUMS"
rm -rf "$BRAVO_BACKUP_DIR/storage" "$BRAVO_BACKUP_DIR/functions" "$BRAVO_BACKUP_DIR/assets.tar.gz"
```

Expected: no raw SQL, customer file, or function source remains unencrypted in the backup directory.

- [ ] **Step 5: Restore into an isolated PostgreSQL 17 instance**

```bash
command -v docker >/dev/null || { echo "Install and start Docker Desktop before continuing"; exit 69; }
docker info >/dev/null
BRAVO_RESTORE_CONTAINER="bravo-vqy-restore-20260811"
docker run --name "$BRAVO_RESTORE_CONTAINER" -e POSTGRES_PASSWORD=bravo_restore_only -p 127.0.0.1:55432:5432 -d supabase/postgres:17.6.1.105
for attempt in $(seq 1 60); do
  docker exec "$BRAVO_RESTORE_CONTAINER" pg_isready -U postgres -d postgres && break
  test "$attempt" -lt 60 || exit 70
  sleep 1
done
openssl enc -d -aes-256-cbc -pbkdf2 -in "$BRAVO_BACKUP_DIR/roles.sql.enc" -out "$BRAVO_BACKUP_DIR/roles.restore.sql" -pass env:BRAVO_BACKUP_PASSPHRASE
openssl enc -d -aes-256-cbc -pbkdf2 -in "$BRAVO_BACKUP_DIR/schema.sql.enc" -out "$BRAVO_BACKUP_DIR/schema.restore.sql" -pass env:BRAVO_BACKUP_PASSPHRASE
openssl enc -d -aes-256-cbc -pbkdf2 -in "$BRAVO_BACKUP_DIR/data.sql.enc" -out "$BRAVO_BACKUP_DIR/data.restore.sql" -pass env:BRAVO_BACKUP_PASSPHRASE
docker cp "$BRAVO_BACKUP_DIR/roles.restore.sql" "$BRAVO_RESTORE_CONTAINER:/tmp/roles.restore.sql"
docker cp "$BRAVO_BACKUP_DIR/schema.restore.sql" "$BRAVO_RESTORE_CONTAINER:/tmp/schema.restore.sql"
docker cp "$BRAVO_BACKUP_DIR/data.restore.sql" "$BRAVO_RESTORE_CONTAINER:/tmp/data.restore.sql"
docker exec "$BRAVO_RESTORE_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/roles.restore.sql
docker exec "$BRAVO_RESTORE_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/schema.restore.sql
docker exec "$BRAVO_RESTORE_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/data.restore.sql
docker exec "$BRAVO_RESTORE_CONTAINER" rm /tmp/roles.restore.sql /tmp/schema.restore.sql /tmp/data.restore.sql
rm "$BRAVO_BACKUP_DIR/roles.restore.sql" "$BRAVO_BACKUP_DIR/schema.restore.sql" "$BRAVO_BACKUP_DIR/data.restore.sql"
```

Expected: restore completes with `ON_ERROR_STOP=1`. If the image tag is unavailable, select the currently published `supabase/postgres` image whose PostgreSQL major version is 17, record the exact digest in the manifest, and rerun from an empty container.

- [ ] **Step 6: Reconcile restored counts against the audited baseline**

```sql
select 'leads' as relation, count(*) from public.leads
union all select 'jobs', count(*) from public.jobs
union all select 'invoices', count(*) from public.invoices
union all select 'follow_ups', count(*) from public.follow_ups
union all select 'activity_log', count(*) from public.activity_log
union all select 'rebate_estimates', count(*) from public.rebate_estimates
union all select 'user_roles', count(*) from public.user_roles
union all select 'blog_comments', count(*) from public.blog_comments
union all select 'job_photos', count(*) from public.job_photos
union all select 'technicians', count(*) from public.technicians
union all select 'crm_notifications', count(*) from public.crm_notifications
union all select 'review_requests', count(*) from public.review_requests
union all select 'inbound_messages', count(*) from public.inbound_messages;
```

Expected counts in order: `9, 10, 0, 0, 1, 1, 2, 1, 1, 2, 0, 0, 27`. Also verify `auth.users=2`, `auth.identities=2`, `auth.sessions=2`, `storage.buckets=1`, and `storage.objects=1`.

- [ ] **Step 7: Write the sanitized baseline manifest**

Record:

```markdown
# vqy Baseline and Recovery Manifest — 2026-08-11

- Project ref: `vqygaqrderxvumczpfnu`
- PostgreSQL: `17.6`
- Public-table total: `54`
- Auth users / identities / sessions: `2 / 2 / 2`
- Storage buckets / objects: `1 / 1`
- Live functions: `send-sms`, `send-email`, `twilio-inbound`
- Public/Storage policy baseline: `23` policies, normalized fingerprint `ed2ea25b75ff0bf1a83d21c76bce66fa`
- Policy/grant definitions: normalized fingerprints plus the exact SQL retained in the encrypted schema dump
- Bravo Vercel properties: property IDs, active deployment IDs, domains, and environment-variable names/current project refs; no environment-variable values
- Encrypted backup location: operator-controlled path outside the repository
- Encrypted artifact checksums: copied from `SHA256SUMS`
- Isolated restore: PASS with the exact container image digest
- Count reconciliation: PASS with per-table counts
- Production write gate: CLOSED until Tasks 2–8 pass and the user approves execution
```

- [ ] **Step 8: Commit the recovery evidence**

```bash
git add docs/superpowers/evidence/2026-08-11-vqy-baseline-manifest.md
git commit -m "docs: record vqy recovery baseline"
```

---

### Task 2: Establish the isolated migration test harness

**Files:**
- Create via CLI: `artifacts/bravo-mechanical/supabase/config.toml`
- Create: `artifacts/bravo-mechanical/supabase/tests/vqy_frontend_compatibility.test.sql`

**Interfaces:**
- The test target is the restored database at `postgresql://postgres:bravo_restore_only@127.0.0.1:55432/postgres`.
- `COMPAT_MIGRATION` always resolves to exactly one CLI-created file named `*_vqy_frontend_compatibility.sql`.
- Tests describe the desired schema contract without requiring access to production.

- [ ] **Step 1: Initialize the artifact's Supabase directory**

```bash
test ! -e artifacts/bravo-mechanical/supabase/config.toml
pnpm dlx supabase@2.113.0 init --workdir artifacts/bravo-mechanical
```

Expected: `config.toml` is created without changing or replaying the existing historical migrations.

- [ ] **Step 2: Create the migration with the CLI and resolve its path**

```bash
pnpm dlx supabase@2.113.0 migration new vqy_frontend_compatibility --workdir artifacts/bravo-mechanical
COMPAT_MIGRATION="$(find artifacts/bravo-mechanical/supabase/migrations -maxdepth 1 -name '*_vqy_frontend_compatibility.sql' -print)"
test "$(printf '%s\n' "$COMPAT_MIGRATION" | sed '/^$/d' | wc -l | tr -d ' ')" = "1"
```

- [ ] **Step 3: Write the failing pgTAP compatibility contract**

Enable pgTAP only in the isolated restore:

```bash
docker exec bravo-vqy-restore-20260811 psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c 'create extension if not exists pgtap with schema extensions;'
```

```sql
begin;
set local search_path = public, extensions;
select plan(27);

select has_enum('public', 'lead_source');
select enum_has_labels('public', 'lead_source', array['contact_form','rebate_estimator','phone','referral','google','other','sms','online_booking']);
select enum_has_labels('public', 'app_role', array['admin','user','technician']);

select has_column('public', 'leads', 'service');
select has_column('public', 'leads', 'urgency');
select has_column('public', 'leads', 'preferred_date');
select has_column('public', 'leads', 'preferred_time');
select has_column('public', 'leads', 'first_name');
select has_column('public', 'leads', 'last_name');
select has_column('public', 'leads', 'source_page');
select has_column('public', 'leads', 'landing_url');
select has_column('public', 'leads', 'utm_term');
select has_column('public', 'leads', 'service_address');
select has_column('public', 'leads', 'assigned_to');
select has_column('public', 'jobs', 'service_address');
select has_column('public', 'job_photos', 'is_public');
select has_column('public', 'job_photos', 'public_caption');
select has_column('public', 'crm_notifications', 'read');
select has_column('public', 'crm_notifications', 'technician_id');
select has_column('public', 'blog_comments', 'post_slug');
select has_column('public', 'blog_comments', 'body');
select has_column('public', 'blog_comments', 'approved');
select has_table('public', 'activity_logs');
select has_table('public', 'settings');
select has_function('public', 'admin_list_blog_comments', array[]::text[]);
select has_trigger('public', 'leads', 'sync_lead_compat_fields');
select has_trigger('public', 'blog_comments', 'sync_blog_comment_compat_fields');

select * from finish();
rollback;
```

- [ ] **Step 4: Verify RED against the restored baseline**

```bash
pnpm dlx supabase@2.113.0 test db --db-url postgresql://postgres:bravo_restore_only@127.0.0.1:55432/postgres artifacts/bravo-mechanical/supabase/tests/vqy_frontend_compatibility.test.sql
```

Expected: failures identify the absent enum labels, columns, tables, function, and triggers.

- [ ] **Step 5: Commit the red contract and local configuration**

```bash
git add artifacts/bravo-mechanical/supabase/config.toml artifacts/bravo-mechanical/supabase/tests/vqy_frontend_compatibility.test.sql "$COMPAT_MIGRATION"
git commit -m "test: define vqy compatibility contract"
```

---

### Task 3: Implement the additive compatibility migration

**Files:**
- Modify: the one `artifacts/bravo-mechanical/supabase/migrations/*_vqy_frontend_compatibility.sql` created in Task 2
- Modify: `artifacts/bravo-mechanical/supabase/tests/vqy_frontend_compatibility.test.sql`

**Interfaces:**
- Old names remain usable: `leads.service_type`, `blog_comments.content`, and `blog_comments.status` are not removed.
- New and old compatibility fields synchronize in both directions through deterministic `BEFORE INSERT OR UPDATE` triggers.
- `activity_logs` supports `record_type`, `record_id`, `activity_type`, `title`, `description`, `lead_id`, `job_id`, and `created_by`.
- `settings` stores `key text PRIMARY KEY` and `value jsonb NOT NULL`.

- [ ] **Step 1: Add enums and nullable compatibility columns**

```sql
alter type public.lead_source add value if not exists 'online_booking';
alter type public.app_role add value if not exists 'technician';

alter table public.leads
  add column if not exists service text,
  add column if not exists urgency text,
  add column if not exists preferred_date date,
  add column if not exists preferred_time text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists source_page text,
  add column if not exists landing_url text,
  add column if not exists referrer text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists gclid text,
  add column if not exists fbclid text,
  add column if not exists notes text,
  add column if not exists service_address text,
  add column if not exists assigned_to uuid references auth.users(id) on delete set null;

alter table public.jobs add column if not exists service_address text;
alter table public.job_photos
  add column if not exists is_public boolean not null default false,
  add column if not exists public_caption text;
alter table public.crm_notifications
  add column if not exists read boolean not null default false,
  add column if not exists technician_id uuid references public.technicians(id) on delete set null;
alter table public.blog_comments
  add column if not exists post_slug text,
  add column if not exists body text,
  add column if not exists approved boolean not null default false;
```

- [ ] **Step 2: Backfill and synchronize compatibility fields**

```sql
update public.leads set service = service_type where service is null and service_type is not null;
update public.blog_comments
set body = coalesce(body, content),
    approved = (status = 'approved'),
    post_slug = coalesce(post_slug, metadata ->> 'post_slug');

create or replace function public.sync_lead_compat_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.service := coalesce(new.service, new.service_type);
    new.service_type := coalesce(new.service_type, new.service);
  elsif new.service is distinct from old.service then
    new.service_type := new.service;
  elsif new.service_type is distinct from old.service_type then
    new.service := new.service_type;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_lead_compat_fields on public.leads;
create trigger sync_lead_compat_fields
before insert or update on public.leads
for each row execute function public.sync_lead_compat_fields();

create or replace function public.sync_blog_comment_compat_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.body is not null and new.content is null then
      new.content := new.body;
      new.status := case when new.approved then 'approved' else 'pending' end;
    elsif new.content is not null and new.body is null then
      new.body := new.content;
      new.approved := new.status = 'approved';
    else
      new.body := coalesce(new.body, new.content);
      new.content := coalesce(new.content, new.body);
      new.approved := new.approved or new.status = 'approved';
      new.status := case when new.approved then 'approved' else 'pending' end;
    end if;
  elsif new.body is distinct from old.body then
    new.content := new.body;
  elsif new.content is distinct from old.content then
    new.body := new.content;
  end if;
  if tg_op = 'UPDATE' and new.approved is distinct from old.approved then
    new.status := case when new.approved then 'approved' else 'pending' end;
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    new.approved := new.status = 'approved';
  end if;
  return new;
end;
$$;

drop trigger if exists sync_blog_comment_compat_fields on public.blog_comments;
create trigger sync_blog_comment_compat_fields
before insert or update on public.blog_comments
for each row execute function public.sync_blog_comment_compat_fields();
```

- [ ] **Step 3: Add only the active support tables and comment RPC**

```sql
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  record_type text not null,
  record_id uuid not null,
  activity_type text not null,
  title text not null,
  description text,
  lead_id uuid references public.leads(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_record_idx on public.activity_logs(record_type, record_id, created_at desc);
create index if not exists activity_logs_lead_id_idx on public.activity_logs(lead_id);
create index if not exists activity_logs_job_id_idx on public.activity_logs(job_id);
create index if not exists activity_logs_created_by_idx on public.activity_logs(created_by);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create index if not exists settings_updated_by_idx on public.settings(updated_by);
create index if not exists leads_assigned_to_idx on public.leads(assigned_to);
create index if not exists crm_notifications_technician_id_idx on public.crm_notifications(technician_id);

create or replace function public.admin_list_blog_comments()
returns setof public.blog_comments
language sql stable security invoker set search_path = '' as $$
  select c.* from public.blog_comments c order by c.created_at desc;
$$;
```

- [ ] **Step 4: Extend the contract with data-preservation assertions**

Add pgTAP assertions that the preexisting rows retain their values and that both compatibility directions work inside the test transaction:

```sql
insert into public.leads (name, service_type, source, status)
values ('compat-old-name', 'boiler', 'other', 'new');
select is((select service from public.leads where name = 'compat-old-name'), 'boiler');

insert into public.leads (name, service, source, status)
values ('compat-new-name', 'heat-pump', 'online_booking', 'new');
select is((select service_type from public.leads where name = 'compat-new-name'), 'heat-pump');

insert into public.blog_comments (author_name, author_email, body, post_slug, approved)
values ('Synthetic Tester', 'synthetic@example.invalid', 'Compatibility body', 'synthetic-post', true);
select is((select content from public.blog_comments where post_slug = 'synthetic-post'), 'Compatibility body');
select is((select status from public.blog_comments where post_slug = 'synthetic-post'), 'approved');
```

Increase `plan(...)` by four, from 27 to 31.

- [ ] **Step 5: Apply to the isolated restore and verify GREEN**

```bash
COMPAT_MIGRATION="$(find artifacts/bravo-mechanical/supabase/migrations -maxdepth 1 -name '*_vqy_frontend_compatibility.sql' -print)"
docker cp "$COMPAT_MIGRATION" bravo-vqy-restore-20260811:/tmp/compatibility.sql
docker exec bravo-vqy-restore-20260811 psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/compatibility.sql
docker exec bravo-vqy-restore-20260811 rm /tmp/compatibility.sql
pnpm dlx supabase@2.113.0 test db --db-url postgresql://postgres:bravo_restore_only@127.0.0.1:55432/postgres artifacts/bravo-mechanical/supabase/tests/vqy_frontend_compatibility.test.sql
```

Expected: all 31 pgTAP assertions pass; audited baseline counts remain unchanged.

- [ ] **Step 6: Prove safe re-entry**

Apply the same compatibility file a second time to the isolated restore, rerun all 31 assertions, and reconcile the baseline counts again:

```bash
docker cp "$COMPAT_MIGRATION" bravo-vqy-restore-20260811:/tmp/compatibility-second-pass.sql
docker exec bravo-vqy-restore-20260811 psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/compatibility-second-pass.sql
docker exec bravo-vqy-restore-20260811 rm /tmp/compatibility-second-pass.sql
pnpm dlx supabase@2.113.0 test db --db-url postgresql://postgres:bravo_restore_only@127.0.0.1:55432/postgres artifacts/bravo-mechanical/supabase/tests/vqy_frontend_compatibility.test.sql
```

Expected: the second application creates no duplicate trigger, index, table, column, function, or enum label.

- [ ] **Step 7: Commit compatibility implementation**

```bash
git add "$COMPAT_MIGRATION" artifacts/bravo-mechanical/supabase/tests/vqy_frontend_compatibility.test.sql
git commit -m "feat: add vqy frontend compatibility schema"
```

---

### Task 4: Make Supabase configuration fail closed

**Files:**
- Create: `artifacts/bravo-mechanical/src/test/supabase-stabilization.test.tsx`
- Modify: `artifacts/bravo-mechanical/src/integrations/supabase/client.ts`
- Modify: `artifacts/bravo-mechanical/src/pages/ProposalView.tsx`
- Modify: `artifacts/bravo-mechanical/src/pages/Auth.tsx`
- Modify: `artifacts/bravo-mechanical/src/main.tsx`
- Modify: `artifacts/bravo-mechanical/.env.example`

**Interfaces:**
- `isSupabaseConfigured: boolean` is exported with the client.
- Valid configuration requires both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- The only production URL documented or accepted for Bravo is `https://vqygaqrderxvumczpfnu.supabase.co`.
- Marketing pages render when configuration is absent; data actions show a controlled unavailable state and make no network call.

- [ ] **Step 1: Write failing configuration tests**

```tsx
// @vitest-environment jsdom
describe("Supabase configuration", () => {
  it("contains no stale project reference in runtime source", async () => {
    const sourceFiles = import.meta.glob(["../**/*.ts", "../**/*.tsx"], { query: "?raw", import: "default", eager: true });
    expect(Object.values(sourceFiles).join("\n")).not.toContain("tzczkcvavudoyuuetwcr");
  });

  it("reports missing configuration without crashing the marketing shell", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    vi.resetModules();
    const { isSupabaseConfigured } = await import("@/integrations/supabase/client");
    expect(isSupabaseConfigured).toBe(false);
  });

  it("shows a controlled Auth configuration error without a network call", async () => {
    render(<MemoryRouter><Auth /></MemoryRouter>);
    expect(screen.getByText(/supabase configuration is unavailable/i)).toBeInTheDocument();
    expect(authGetSession).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Verify RED**

```bash
pnpm --filter @workspace/bravo-mechanical exec vitest run src/test/supabase-stabilization.test.tsx
```

Expected: the stale project reference and fallback behavior fail.

- [ ] **Step 3: Implement one fail-closed client**

```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = createClient(
  supabaseUrl || "http://127.0.0.1:54321",
  supabasePublishableKey || "missing-public-key",
  { auth: { persistSession: isSupabaseConfigured, autoRefreshToken: isSupabaseConfigured } },
);
```

All public entry points that perform a data action must check `isSupabaseConfigured` before using the client. `Auth.tsx` and `CRM.tsx` stop before Auth calls; LeadForm, booking, and comments use the same controlled unavailable message in Task 5. Remove the direct URL from `ProposalView.tsx`; use `supabase.functions.invoke("proposal-public", ...)` only when configured and show the existing unavailable/not-found state otherwise. Replace the old project-specific setup guidance in `main.tsx` with environment-variable names only.

- [ ] **Step 4: Document the public Vite contract**

```dotenv
VITE_SUPABASE_URL=https://vqygaqrderxvumczpfnu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=replace-with-the-project-anon-key
```

The `.env.example` key value is an explicit non-secret replacement marker; no live key is committed.

- [ ] **Step 5: Verify GREEN and scan source**

```bash
pnpm --filter @workspace/bravo-mechanical exec vitest run src/test/supabase-stabilization.test.tsx
rg -n 'tzczkcvavudoyuuetwcr|bcjfyopozweriiezqbfg' artifacts/bravo-mechanical/src artifacts/bravo-mechanical/.env.example
```

Expected: tests pass and `rg` returns no matches.

- [ ] **Step 6: Commit the configuration boundary**

```bash
git add artifacts/bravo-mechanical/src/test/supabase-stabilization.test.tsx artifacts/bravo-mechanical/src/integrations/supabase/client.ts artifacts/bravo-mechanical/src/pages/ProposalView.tsx artifacts/bravo-mechanical/src/pages/Auth.tsx artifacts/bravo-mechanical/src/main.tsx artifacts/bravo-mechanical/.env.example
git commit -m "fix: fail closed on missing Supabase config"
```

---

### Task 5: Align anonymous lead, booking, and comment workflows

**Files:**
- Modify: `artifacts/bravo-mechanical/src/test/supabase-stabilization.test.tsx`
- Modify: `artifacts/bravo-mechanical/src/components/LeadForm.tsx`
- Modify: `artifacts/bravo-mechanical/src/pages/BookOnline.tsx`
- Modify: `artifacts/bravo-mechanical/src/pages/es/EsBook.tsx`
- Modify: `artifacts/bravo-mechanical/src/components/CommentsSection.tsx`
- Modify: `artifacts/bravo-mechanical/src/pages/AdminComments.tsx`
- Modify: `artifacts/bravo-mechanical/src/pages/Projects.tsx`

**Interfaces:**
- Public lead forms perform one `leads.insert(...)`; they never perform anonymous `select` or `update`.
- Booking source is the typed enum value `online_booking`.
- Public comments insert `post_slug`, `body`, `author_name`, `author_email`, and default to unapproved.
- Public comment reads filter `.eq("approved", true)` and the current `post_slug`.
- Admin comment listing uses `admin_list_blog_comments`; moderation updates `approved`.
- The public Projects page uses its bundled/static project collection and does not query `job_photos`; CRM staff retain database-backed photo management.

- [ ] **Step 1: Write failing public workflow tests**

Create a chainable Supabase mock and assert:

```tsx
it("submits a public lead with one insert and no anonymous read/update", async () => {
  render(<LeadForm source="contact_form" />);
  await fillRequiredLeadFields();
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));
  expect(from).toHaveBeenCalledWith("leads");
  expect(insert).toHaveBeenCalledTimes(1);
  expect(select).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
});

it("uses the online_booking enum for the booking form", async () => {
  render(<MemoryRouter><BookOnline /></MemoryRouter>);
  await submitValidBooking();
  expect(insert).toHaveBeenCalledWith(expect.objectContaining({ source: "online_booking" }));
  expect(insert).toHaveBeenCalledWith(expect.not.objectContaining({ id: expect.anything() }));
});

it("loads only approved comments for the active post", async () => {
  render(<CommentsSection postSlug="synthetic-post" />);
  expect(eq).toHaveBeenCalledWith("approved", true);
  expect(eq).toHaveBeenCalledWith("post_slug", "synthetic-post");
});

it("does not anonymously query operational photo metadata", async () => {
  render(<MemoryRouter><Projects /></MemoryRouter>);
  expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
  expect(from).not.toHaveBeenCalledWith("job_photos");
});
```

- [ ] **Step 2: Verify RED**

```bash
pnpm --filter @workspace/bravo-mechanical exec vitest run src/test/supabase-stabilization.test.tsx
```

Expected: duplicate lookup/update logic and comment contract mismatches fail.

- [ ] **Step 3: Replace lead deduplication with one insert**

Build one payload from the validated form:

```ts
const payload = {
  name: form.name.trim(),
  email: form.email.trim() || null,
  phone: form.phone.trim(),
  address: form.address.trim() || null,
  city: form.city.trim() || null,
  service: form.service || null,
  urgency: form.urgency || null,
  notes: form.notes.trim() || null,
  source,
  status: "new" as const,
  source_page: window.location.pathname,
  landing_url: window.location.href,
  referrer: document.referrer || null,
  ...trackingFields,
};
const { error } = await supabase.from("leads").insert(payload);
```

Remove all public duplicate `select`, merge, and `update` branches. Preserve existing validation, consent copy, analytics event names, and success/error presentation.

- [ ] **Step 4: Align booking and comments with the compatibility contract**

Use `source: "online_booking"` in both English and Spanish booking pages and remove their client-supplied lead `id`; the database UUID default creates the identifier without requiring anonymous read access. Map comments to:

```ts
await supabase.from("blog_comments").insert({
  post_slug: postSlug,
  body: content.trim(),
  author_name: name.trim(),
  author_email: email.trim(),
  approved: false,
});
```

Keep the admin RPC but update moderation to `.update({ approved: nextApproved })`.

Keep the current verified project cards and bundled images in `Projects.tsx`, but remove the anonymous `job_photos` read and its loading/error branch. Do not delete CRM photo upload/moderation code.

- [ ] **Step 5: Verify GREEN**

```bash
pnpm --filter @workspace/bravo-mechanical exec vitest run src/test/supabase-stabilization.test.tsx
```

- [ ] **Step 6: Commit public workflow compatibility**

```bash
git add artifacts/bravo-mechanical/src/test/supabase-stabilization.test.tsx artifacts/bravo-mechanical/src/components/LeadForm.tsx artifacts/bravo-mechanical/src/pages/BookOnline.tsx artifacts/bravo-mechanical/src/pages/es/EsBook.tsx artifacts/bravo-mechanical/src/components/CommentsSection.tsx artifacts/bravo-mechanical/src/pages/AdminComments.tsx artifacts/bravo-mechanical/src/pages/Projects.tsx
git commit -m "fix: align public forms with vqy schema"
```

---

### Task 6: Align CRM scope, settings, activity, and function calls

**Files:**
- Modify: `artifacts/bravo-mechanical/src/test/supabase-stabilization.test.tsx`
- Modify: `artifacts/bravo-mechanical/src/lib/email.ts`
- Modify: `artifacts/bravo-mechanical/src/lib/sms.ts`
- Modify: `artifacts/bravo-mechanical/src/components/crm/CRMDashboard.tsx`
- Modify: `artifacts/bravo-mechanical/src/pages/CRM.tsx`

**Interfaces:**
- Email invokes `supabase.functions.invoke("send-email", { body })`.
- The existing `sendEmail` array-recipient API invokes the live function once per recipient because version 11 validates `to` as a string.
- SMS invokes `supabase.functions.invoke("send-sms", { body })`; no browser RPC named `send_sms_via_twilio` remains.
- CRM settings read/write `settings.key` and `settings.value`; authenticated users see only their own role.
- Proposals and Messages routes render a `DeferredWorkspace` component and execute no Supabase query.
- Activity remains backed by the new `activity_logs` table through existing `createActivity` and activity-log screens.

- [ ] **Step 1: Write failing function and role-boundary tests**

```tsx
it("invokes SMS through the deployed Edge Function", async () => {
  await sendSms("+19145550123", "Synthetic test");
  expect(functionInvoke).toHaveBeenCalledWith("send-sms", { body: { to: "+19145550123", body: "Synthetic test" } });
  expect(rpc).not.toHaveBeenCalled();
});

it("invokes send-email once per recipient", async () => {
  await sendEmail({ to: ["one@example.invalid", "two@example.invalid"], subject: "Synthetic", html: "<p>Synthetic</p>" });
  expect(functionInvoke).toHaveBeenNthCalledWith(1, "send-email", { body: expect.objectContaining({ to: "one@example.invalid" }) });
  expect(functionInvoke).toHaveBeenNthCalledWith(2, "send-email", { body: expect.objectContaining({ to: "two@example.invalid" }) });
});

it("does not offer browser role mutation", async () => {
  render(<CRMSettingsPanel />);
  expect(screen.queryByRole("button", { name: /change role|make admin|make technician/i })).not.toBeInTheDocument();
  expect(from).not.toHaveBeenCalledWith("user_profiles");
});

it.each(["Proposals", "Messages"])("renders the %s workspace as deferred without a query", async (view) => {
  render(<MemoryRouter><CRM /></MemoryRouter>);
  await screen.findByText(/bravo command center/i);
  await userEvent.click(screen.getByRole("button", { name: view }));
  expect(screen.getByText(/deferred during supabase stabilization/i)).toBeInTheDocument();
  expect(from).not.toHaveBeenCalledWith(view === "Proposals" ? "estimates" : "sms_messages");
});
```

The CRM mock returns an authenticated session with an `admin` role. Add a separate assertion that `admin` and `technician` authorize the CRM while the legacy `user` role does not.

- [ ] **Step 2: Verify RED**

```bash
pnpm --filter @workspace/bravo-mechanical exec vitest run src/test/supabase-stabilization.test.tsx
```

- [ ] **Step 3: Replace direct URLs/RPCs with SDK function invocation**

```ts
const { data, error } = await supabase.functions.invoke("send-sms", {
  body: { to, body },
});
if (error) throw error;
return data;
```

Use the same pattern for `send-email`. Preserve current payload field names expected by the live functions, established from the Task 1 function export.

- [ ] **Step 4: Make roles read-only and self-scoped**

Replace `user_profiles` and all `user_roles.delete/insert/update` browser code with:

```ts
const { data: authData } = await supabase.auth.getUser();
const { data: roles } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", authData.user!.id);
```

Display the current account ID and its role labels. Keep settings-template reads and writes against `settings`; set `updated_by` to the authenticated user ID.

- [ ] **Step 5: Bound unfinished CRM workspaces**

```tsx
const DeferredWorkspace = ({ name }: { name: string }) => (
  <section aria-labelledby="deferred-workspace-title">
    <h2 id="deferred-workspace-title">{name}</h2>
    <p>Deferred during Supabase stabilization. No customer data has been changed.</p>
  </section>
);
```

Route only `proposals` and `messages` to this component. Preserve Dashboard, Leads, Jobs, Dispatch, Invoices, Activity, and Settings.

- [ ] **Step 6: Verify GREEN and absence of unsupported calls**

```bash
pnpm --filter @workspace/bravo-mechanical exec vitest run src/test/supabase-stabilization.test.tsx
rg -n 'send_sms_via_twilio|\.from\(["'"']user_profiles["'"']\)' artifacts/bravo-mechanical/src/lib/sms.ts artifacts/bravo-mechanical/src/components/crm/CRMDashboard.tsx
rg -n 'CRMProposals|SMSInbox' artifacts/bravo-mechanical/src/pages/CRM.tsx
```

Expected: tests pass and both scans return no active runtime matches. The unimported legacy component files may remain for a future separately scoped implementation.

- [ ] **Step 7: Commit CRM/function alignment**

```bash
git add artifacts/bravo-mechanical/src/test/supabase-stabilization.test.tsx artifacts/bravo-mechanical/src/lib/email.ts artifacts/bravo-mechanical/src/lib/sms.ts artifacts/bravo-mechanical/src/components/crm/CRMDashboard.tsx artifacts/bravo-mechanical/src/pages/CRM.tsx
git commit -m "fix: align CRM scope and Edge Function calls"
```

---

### Task 7: Define the RLS authorization contract

**Files:**
- Create via CLI: `artifacts/bravo-mechanical/supabase/migrations/*_vqy_rls_hardening.sql`
- Create: `artifacts/bravo-mechanical/supabase/tests/vqy_rls_hardening.test.sql`

**Interfaces:**
- `RLS_MIGRATION` resolves to exactly one CLI-created file named `*_vqy_rls_hardening.sql`.
- Tests run against a fresh isolated restore with the compatibility migration applied.
- Synthetic UUIDs: admin `10000000-0000-0000-0000-000000000001`, technician `...0002`, ordinary user `...0003`, and another user `...0004`.

- [ ] **Step 1: Create the RLS migration with the pinned CLI**

```bash
pnpm dlx supabase@2.113.0 migration new vqy_rls_hardening --workdir artifacts/bravo-mechanical
RLS_MIGRATION="$(find artifacts/bravo-mechanical/supabase/migrations -maxdepth 1 -name '*_vqy_rls_hardening.sql' -print)"
test "$(printf '%s\n' "$RLS_MIGRATION" | sed '/^$/d' | wc -l | tr -d ' ')" = "1"
```

- [ ] **Step 2: Seed synthetic identities inside a rollback-only pgTAP transaction**

The test inserts synthetic rows into `auth.users` and `public.user_roles`, then switches request context with:

```sql
set local search_path = public, extensions;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
set local role authenticated;
```

Use the restored Auth table's required columns/defaults discovered with `\d auth.users`; never copy real user rows.

- [ ] **Step 3: Write failing authorization assertions**

Cover these cases with `lives_ok`, `throws_ok`, `results_eq`, and `is`:

1. Anonymous can insert a `status='new'`, unassigned lead through allowed public columns.
2. Anonymous cannot select or update that lead.
3. Anonymous cannot set `assigned_to`, internal metadata, or a non-new status.
4. Anonymous can insert an unapproved comment and read approved comments only.
5. Anonymous cannot read `job_photos`; the existing public Storage read behavior is tested separately.
6. Admin and technician can select/insert/update/delete each operational table.
7. Ordinary authenticated `user` cannot access operational tables.
8. An authenticated user can select only its own `user_roles` row.
9. No authenticated browser role can insert, update, or delete `user_roles`.
10. CRM staff can insert Storage metadata; anonymous and ordinary users cannot.

Operational table list: `leads`, `jobs`, `invoices`, `follow_ups`, `activity_log`, `activity_logs`, `rebate_estimates`, `blog_comments`, `job_photos`, `technicians`, `crm_notifications`, `review_requests`, `inbound_messages`, and `settings`.

- [ ] **Step 4: Verify RED on the isolated compatible schema**

```bash
pnpm dlx supabase@2.113.0 test db --db-url postgresql://postgres:bravo_restore_only@127.0.0.1:55432/postgres artifacts/bravo-mechanical/supabase/tests/vqy_rls_hardening.test.sql
```

Expected: current broad `USING (true)` policies allow operations that the contract rejects.

- [ ] **Step 5: Commit the red authorization contract**

```bash
git add "$RLS_MIGRATION" artifacts/bravo-mechanical/supabase/tests/vqy_rls_hardening.test.sql
git commit -m "test: define vqy authorization contract"
```

---

### Task 8: Implement RLS hardening and grants

**Files:**
- Modify: the one `artifacts/bravo-mechanical/supabase/migrations/*_vqy_rls_hardening.sql` created in Task 7
- Modify: `artifacts/bravo-mechanical/supabase/tests/vqy_rls_hardening.test.sql`
- Create: `artifacts/bravo-mechanical/supabase/rollback/vqy_rls_hardening_inverse.sql`

**Interfaces:**
- `public.is_crm_staff()` returns true only for the current authenticated user's `admin` or `technician` role.
- The function is `STABLE`, `SECURITY INVOKER`, and not used in `user_roles` policies, avoiding recursive RLS.
- Public grants and RLS checks are both required; neither acts as the sole boundary.

- [ ] **Step 1: Add the staff helper and remove broad policies**

```sql
create or replace function public.is_crm_staff()
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role in ('admin'::public.app_role, 'technician'::public.app_role)
  );
$$;
revoke all on function public.is_crm_staff() from public, anon;
grant execute on function public.is_crm_staff() to authenticated;
```

For every operational table, query `pg_policies` in the isolated database and explicitly `drop policy if exists` by the live policy name before creating the new policies. Do not use dynamic SQL against production without first recording the exact policy list in the baseline manifest.

Begin the migration with a static precondition that recomputes the normalized `public`/`storage` policy fingerprint. Accept the audited baseline (`23` policies, `ed2ea25b75ff0bf1a83d21c76bce66fa`) or the exact hardened policy set proven in the isolated fixture; raise an exception for every other policy shape. Preserve `service_role_insert_inbound_messages` and `Allow job photo viewing` unchanged. This makes unexpected policy drift abort before any drop occurs.

- [ ] **Step 2: Lock down roles**

```sql
alter table public.user_roles enable row level security;
revoke insert, update, delete on public.user_roles from authenticated, anon;
revoke select on public.user_roles from anon;
grant select on public.user_roles to authenticated;

create policy user_roles_select_own
on public.user_roles for select to authenticated
using (user_id = (select auth.uid()));
```

No browser mutation policy is created. The service role and database owner retain operational control outside RLS.

- [ ] **Step 3: Apply the staff policy pattern to operational tables**

For each approved operational table:

```sql
alter table public.leads enable row level security;
grant select, insert, update, delete on public.leads to authenticated;
create policy leads_crm_staff_all
on public.leads for all to authenticated
using ((select public.is_crm_staff()))
with check ((select public.is_crm_staff()));
```

Repeat with table-specific policy names. Grant sequence usage where tables use serial sequences; UUID-default tables need no sequence grants.

Every new policy is also preceded by its matching static drop, such as `drop policy if exists leads_crm_staff_all on public.leads`, so the reviewed file can be safely reapplied. The exact baseline-policy and new-policy drops are static SQL, not a production-time dynamic loop.

- [ ] **Step 4: Add narrow anonymous lead and comment access**

```sql
revoke all on public.leads from anon;
grant insert (
  name,email,phone,address,city,state,zip_code,service,urgency,preferred_date,
  preferred_time,source,message,notes,preferred_contact_method,source_page,
  landing_url,referrer,utm_source,utm_medium,utm_campaign,utm_term,utm_content,gclid,fbclid,status
) on public.leads to anon;
create policy leads_anon_insert_new
on public.leads for insert to anon
with check (status = 'new' and assigned_to is null);

revoke all on public.blog_comments from anon;
grant select on public.blog_comments to anon;
grant insert (post_slug,body,author_name,author_email,approved) on public.blog_comments to anon;
create policy blog_comments_anon_read_approved
on public.blog_comments for select to anon using (approved is true);
create policy blog_comments_anon_insert_pending
on public.blog_comments for insert to anon with check (
  approved is false
  and length(author_name) between 1 and 80
  and length(author_email) between 3 and 255
  and length(body) between 1 and 5000
  and length(post_slug) between 1 and 200
);

revoke all on function public.admin_list_blog_comments() from public, anon;
grant execute on function public.admin_list_blog_comments() to authenticated;
```

Revoke all table privileges on `job_photos` from `anon`. Do not grant anonymous select, update, or delete on any operational table.

- [ ] **Step 5: Harden Storage object writes without changing bucket visibility**

Drop current authenticated write policies on `storage.objects` for bucket `job-photos`, then create staff-only insert/update/delete checks that require `bucket_id='job-photos'` and `(select public.is_crm_staff())`. Preserve the public read policy and the bucket's current `public=true` setting.

- [ ] **Step 6: Write and test the inverse-policy runbook**

Create `artifacts/bravo-mechanical/supabase/rollback/vqy_rls_hardening_inverse.sql` from the policy/grant definitions captured in the encrypted schema backup. The script must:

- Drop only the new named policies and `public.is_crm_staff()` grants/function.
- Restore the exact pre-change policies and grants recorded in the baseline manifest.
- Leave compatibility columns, tables, rows, Auth records, Storage objects, and migration history unchanged.
- Be idempotent through explicit `drop policy if exists` statements.

On a fresh isolated restore, apply compatibility, then RLS, then the inverse runbook. Compare normalized `pg_policies` and privilege output with the baseline fingerprints. Reapply RLS and rerun the authorization suite so the final isolated state is hardened.

- [ ] **Step 7: Verify GREEN on a fresh restore**

Destroy and recreate the isolated container, restore the encrypted baseline again, then run:

```bash
COMPAT_MIGRATION="$(find artifacts/bravo-mechanical/supabase/migrations -maxdepth 1 -name '*_vqy_frontend_compatibility.sql' -print)"
RLS_MIGRATION="$(find artifacts/bravo-mechanical/supabase/migrations -maxdepth 1 -name '*_vqy_rls_hardening.sql' -print)"
docker cp "$COMPAT_MIGRATION" bravo-vqy-restore-20260811:/tmp/compatibility.sql
docker cp "$RLS_MIGRATION" bravo-vqy-restore-20260811:/tmp/rls.sql
docker exec bravo-vqy-restore-20260811 psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/compatibility.sql
docker exec bravo-vqy-restore-20260811 psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/rls.sql
pnpm dlx supabase@2.113.0 test db --db-url postgresql://postgres:bravo_restore_only@127.0.0.1:55432/postgres artifacts/bravo-mechanical/supabase/tests/vqy_frontend_compatibility.test.sql artifacts/bravo-mechanical/supabase/tests/vqy_rls_hardening.test.sql
```

Expected: every pgTAP assertion passes and audited baseline counts remain `54` total public rows.

- [ ] **Step 8: Run Supabase advisors against the local/linked project**

```bash
pnpm dlx supabase@2.113.0 db lint --db-url postgresql://postgres:bravo_restore_only@127.0.0.1:55432/postgres --level warning
```

Resolve migration-introduced warnings. Record the existing leaked-password-protection warning as a Free-plan/account decision and retain the unindexed-FK/unused-index findings for a separate performance phase unless this migration introduced them.

- [ ] **Step 9: Commit RLS implementation**

```bash
git add "$RLS_MIGRATION" artifacts/bravo-mechanical/supabase/tests/vqy_rls_hardening.test.sql artifacts/bravo-mechanical/supabase/rollback/vqy_rls_hardening_inverse.sql docs/superpowers/evidence/2026-08-11-vqy-baseline-manifest.md
git commit -m "security: harden vqy row-level access"
```

---

### Task 9: Regenerate types and prove the application locally

**Files:**
- Modify: `artifacts/bravo-mechanical/src/integrations/supabase/types.ts`
- Modify as required by generated types: only already-touched files from Tasks 4–6

**Interfaces:**
- Generated types come from `vqygaqrderxvumczpfnu` after the compatibility migration is available in the isolated test schema or production preview.
- No hand-edited table definitions remain in `types.ts`.
- Touched runtime paths contain no `as any` casts used to bypass the stabilized contract.

- [ ] **Step 1: Generate types from the isolated compatible schema**

```bash
pnpm dlx supabase@2.113.0 gen types typescript --db-url postgresql://postgres:bravo_restore_only@127.0.0.1:55432/postgres --schema public > /tmp/bravo-vqy-types.ts
test -s /tmp/bravo-vqy-types.ts
```

Use `apply_patch` to replace the generated type file content with `/tmp/bravo-vqy-types.ts`; do not use shell redirection to modify repository files.

- [ ] **Step 2: Run typecheck and fix only stabilized paths**

```bash
pnpm --filter @workspace/bravo-mechanical run typecheck
```

Fix contract errors in the files modified by Tasks 4–6. Do not create absent Proposals/Messages tables to satisfy dormant generated-type expectations.

- [ ] **Step 3: Run focused and complete test suites**

```bash
pnpm --filter @workspace/bravo-mechanical exec vitest run src/test/supabase-stabilization.test.tsx
pnpm --filter @workspace/bravo-mechanical run test
```

- [ ] **Step 4: Build and scan the production artifact**

```bash
pnpm --filter @workspace/bravo-mechanical run build
rg -n 'vqygaqrderxvumczpfnu' artifacts/bravo-mechanical/dist
rg -n 'tzczkcvavudoyuuetwcr|bcjfyopozweriiezqbfg|send_sms_via_twilio' artifacts/bravo-mechanical/src artifacts/bravo-mechanical/dist
rg -n 'sms_messages|estimate_line_items|user_profiles' artifacts/bravo-mechanical/dist
rg -n 'sb_secret_|service_role|postgres(ql)?://[^ ]+:[^ ]+@|TWILIO_AUTH_TOKEN' artifacts/bravo-mechanical/src artifacts/bravo-mechanical/dist
```

Expected: build succeeds; the positive `vqy` scan finds the configured project; the stale-reference, deferred-table, and secret scans return no matches.

- [ ] **Step 5: Verify a local production preview**

```bash
VITE_SUPABASE_URL=https://vqygaqrderxvumczpfnu.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=synthetic-local-key pnpm --filter @workspace/bravo-mechanical run build
pnpm --filter @workspace/bravo-mechanical exec vite preview --host 127.0.0.1 --port 4173
```

In a second terminal, run the existing route smoke suite against `http://127.0.0.1:4173`. Verify the marketing site renders, data actions fail in a controlled way with the synthetic key, and no request targets another project ref.

- [ ] **Step 6: Commit generated types and compatibility fixes**

```bash
git add artifacts/bravo-mechanical/src/integrations/supabase/types.ts artifacts/bravo-mechanical/src/integrations/supabase/client.ts artifacts/bravo-mechanical/src/pages/ProposalView.tsx artifacts/bravo-mechanical/src/pages/Auth.tsx artifacts/bravo-mechanical/src/main.tsx artifacts/bravo-mechanical/src/components/LeadForm.tsx artifacts/bravo-mechanical/src/pages/BookOnline.tsx artifacts/bravo-mechanical/src/pages/es/EsBook.tsx artifacts/bravo-mechanical/src/components/CommentsSection.tsx artifacts/bravo-mechanical/src/pages/AdminComments.tsx artifacts/bravo-mechanical/src/pages/Projects.tsx artifacts/bravo-mechanical/src/lib/email.ts artifacts/bravo-mechanical/src/lib/sms.ts artifacts/bravo-mechanical/src/components/crm/CRMDashboard.tsx artifacts/bravo-mechanical/src/pages/CRM.tsx
git commit -m "chore: generate stabilized vqy database types"
```

Before committing, inspect `git diff --cached --name-only` and unstage any file outside the approved Task 4–6 paths plus `types.ts`.

---

### Task 10: Production compatibility rollout checkpoint

**Files:**
- Modify: `docs/superpowers/evidence/2026-08-11-vqy-baseline-manifest.md`
- No other repository files

**Interfaces:**
- This task requires explicit user approval after Tasks 1–9 pass.
- Compatibility migration is applied before RLS.
- Vercel Production and Preview variables both target `vqygaqrderxvumczpfnu`.
- The immediately previous Vercel deployment is recorded as the application rollback target, but is reusable only with corrected `vqy` environment variables.

- [ ] **Step 1: Present the execution gate to the user**

Report the backup restore result, baseline counts, pgTAP totals, frontend test totals, typecheck, build, stale-ref scan, and exact compatibility/RLS migration filenames. Ask for approval to apply the compatibility migration and deploy the corrected application.

- [ ] **Step 2: Snapshot production counts immediately before the write**

Run the Task 1 count query through the connected project and append only counts and timestamp to the manifest. Abort if any count is unexpectedly lower than the baseline.

- [ ] **Step 3: Apply only the compatibility migration**

Use the connected Supabase migration mechanism with the exact CLI-created compatibility file. Before execution, verify:

```bash
pnpm dlx supabase@2.113.0 migration list --linked --workdir artifacts/bravo-mechanical
git diff --exit-code -- artifacts/bravo-mechanical/supabase/migrations artifacts/bravo-mechanical/src
```

Do not run a command that replays all 40 repository migrations. If the linked migration mechanism proposes any historical file, stop and apply the reviewed compatibility SQL through the Supabase SQL editor or Management API as one transaction, then repair migration history for only that new version.

- [ ] **Step 4: Verify compatibility in production before app deployment**

Run read-only contract probes for all added columns/tables/triggers and reconcile the original table counts. Confirm that no existing row was deleted or overwritten.

- [ ] **Step 5: Correct Vercel environment variables and deploy a preview**

Set `VITE_SUPABASE_URL=https://vqygaqrderxvumczpfnu.supabase.co` and the matching `vqy` publishable/anon key in Preview and Production. Do not expose the service-role key. Build and deploy the current commit to Preview first.

Apply and verify the variables on both Bravo Vercel properties identified during the baseline inventory, including every property serving the `www` and application domains. Record each property ID and environment scope in the manifest.

- [ ] **Step 6: Run preview smoke tests against production Supabase**

Verify:

- Marketing pages and Auth load.
- Anonymous lead and English/Spanish booking submissions insert one canary row each.
- Approved comments load; a new comment remains pending.
- CRM admin can open Dashboard, Leads, Jobs, Dispatch, Invoices, Activity, and Settings.
- The public Projects gallery renders its bundled/static project cards without querying `job_photos`; authenticated CRM photo management still loads.
- SMS invocation reaches `send-sms` with a designated test number and no Twilio secret in browser traffic.
- Proposals and Messages show the deferred message and issue no absent-table query.

Delete only canary records whose marker starts `codex-verification-20260811-` after recording their IDs and results in the manifest.

- [ ] **Step 7: Promote the verified preview to Production**

Record the Vercel deployment ID, commit SHA, timestamp, and rollback deployment ID in the manifest. Confirm browser network traffic targets only the `vqy` hostname.

- [ ] **Step 8: Commit rollout evidence**

```bash
git add docs/superpowers/evidence/2026-08-11-vqy-baseline-manifest.md
git commit -m "docs: record vqy compatibility rollout"
```

---

### Task 11: Production RLS rollout and 30-minute observation

**Files:**
- Modify: `docs/superpowers/evidence/2026-08-11-vqy-baseline-manifest.md`

**Interfaces:**
- RLS applies only after the production application passes Task 10.
- Failure rollback is an application redeploy, a forward policy fix, or the reviewed inverse-policy runbook; never drop additive columns or restore an old database over newer customer data.

- [ ] **Step 1: Confirm staff-role coverage before RLS**

Run an aggregate/UUID-only query joining `auth.users`, `public.user_roles`, and active `public.technicians.user_id`. Confirm both Auth users have at least one `admin` or `technician` role. If a legacy `user` role belongs to a matching active technician, add the `technician` role through the owner/service-side connection and record only the affected UUID and role in the restricted operator log. If there is no unambiguous active-technician match, stop and ask the user before changing the role.

Expected: `auth.users=2` and staff-covered users `=2`; no browser role mutation is used.

- [ ] **Step 2: Apply only the reviewed RLS migration**

Use the same guarded mechanism as Task 10. Confirm the compatibility migration version is recorded and that the proposed SQL contains only the RLS migration.

- [ ] **Step 3: Execute the production authorization matrix**

With controlled test identities, verify:

- Anonymous: lead insert allowed; lead select/update denied.
- Anonymous: pending comment insert allowed; only approved comment select allowed.
- Anonymous: operational `job_photos` metadata denied; existing public Storage object read unchanged.
- Admin: operational CRUD allowed; role mutation denied in browser.
- Technician: operational CRUD allowed; role mutation denied.
- Ordinary `user`: operational access denied; own role select allowed.
- Storage: public read unchanged; writes admin/technician only.

Use rollback transactions or the exact canary prefix, and remove only the created canary data.

- [ ] **Step 4: Re-run production workflow smoke tests**

Repeat Task 10's public and CRM workflow matrix. Confirm no `42501`, `PGRST`, missing-column, missing-table, or Edge Function invocation errors appear.

- [ ] **Step 5: Run production Supabase advisors**

Run both security and performance advisors after RLS. Fail the rollout for any new security error or migration-introduced performance warning. Record the accepted Free-plan leaked-password-protection warning and preexisting performance findings with their remediation links.

- [ ] **Step 6: Observe for 30 minutes**

At 0, 10, 20, and 30 minutes, inspect Supabase database/API/Auth/Function logs and Vercel function/browser error telemetry for:

- RLS denial spikes.
- `relation does not exist` or `column does not exist`.
- Auth refresh/session failures.
- Edge Function 4xx/5xx responses.
- Lead/comment insertion failures.

Record timestamps and aggregate counts only; do not paste request bodies, phone numbers, emails, or tokens into the manifest.

- [ ] **Step 7: Run final count and data-preservation reconciliation**

Compare every original table count to the immediate pre-rollout snapshot. Explain expected differences caused by real or canary traffic and confirm canary deletion. Verify both Auth users and the Storage object still exist.

- [ ] **Step 8: Close the recovery and stabilization record**

Update the manifest:

```markdown
- Compatibility migration: PASS, version and timestamp recorded
- Application deployment: PASS, Vercel deployment and commit recorded
- RLS migration: PASS, version and timestamp recorded
- Authorization matrix: PASS
- 30-minute observation: PASS
- Final data reconciliation: PASS
- Production write gate: COMPLETE
- Known accepted condition: Supabase Free projects may pause during inactivity
- Deferred work: Proposals, Messages, role administration UI, database performance tuning, leaked-password-protection plan decision
```

- [ ] **Step 9: Run final repository verification and commit evidence**

```bash
pnpm --filter @workspace/bravo-mechanical run typecheck
pnpm --filter @workspace/bravo-mechanical run test
pnpm --filter @workspace/bravo-mechanical run build
git status --short
git add docs/superpowers/evidence/2026-08-11-vqy-baseline-manifest.md
git commit -m "docs: complete vqy stabilization record"
```

Expected: verification passes and `migration-notes/` remains untracked and untouched.
