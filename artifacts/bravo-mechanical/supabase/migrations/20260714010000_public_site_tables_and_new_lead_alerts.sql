-- Applied to production 2026-07-14 (via MCP). Included for version control.
--
-- E2E testing found the public site writing to two tables that did not exist
-- in this project (blog comments + rebate estimator both 404'd), and that no
-- notification fired when a new lead arrived.

-- 1) blog_comments: used by the public blog (CommentsSection) and /admin/comments.
create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  author_name text not null,
  author_email text not null,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.blog_comments enable row level security;

-- Public may submit comments, but never pre-approved.
create policy anon_insert_blog_comments on public.blog_comments
  for insert to anon, authenticated with check (approved = false);
-- Public reads only approved comments.
create policy anon_select_approved_comments on public.blog_comments
  for select to anon using (approved = true);
-- CRM staff moderate everything.
create policy staff_select_blog_comments on public.blog_comments
  for select to authenticated using (public.is_crm_staff());
create policy staff_update_blog_comments on public.blog_comments
  for update to authenticated using (public.is_crm_staff()) with check (public.is_crm_staff());
create policy staff_delete_blog_comments on public.blog_comments
  for delete to authenticated using (public.is_crm_staff());

-- 2) rebate_estimates: written by the public RebateEstimator tool.
create table if not exists public.rebate_estimates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  zip text,
  system_type text,
  home_type text,
  current_heating text,
  estimated_total numeric,
  programs jsonb,
  created_at timestamptz not null default now()
);
alter table public.rebate_estimates enable row level security;
create policy anon_insert_rebate_estimates on public.rebate_estimates
  for insert to anon, authenticated with check (true);
create policy staff_select_rebate_estimates on public.rebate_estimates
  for select to authenticated using (public.is_crm_staff());

-- 3) New-lead alert: ring the CRM bell whenever a lead arrives (website form,
--    intake, anywhere). SECURITY DEFINER so anon form submissions can write the
--    notification despite crm_notifications being staff-only.
--    NOTE: superseded by 20260714020000, which extends this trigger to also
--    email the admins. Kept for migration-history completeness.
create or replace function public.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.crm_notifications (type, title, message, lead_id, read, read_at)
  values (
    'new_lead',
    'New lead received',
    coalesce(new.name, 'New lead') || case when new.service_type is not null then ' — ' || new.service_type else '' end,
    new.id, false, null
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_lead on public.leads;
create trigger trg_notify_new_lead
  after insert on public.leads
  for each row execute function public.notify_new_lead();
