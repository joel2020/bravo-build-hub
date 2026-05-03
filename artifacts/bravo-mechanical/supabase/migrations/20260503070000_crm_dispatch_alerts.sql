-- =====================================================================
-- CRM Dispatch + Alerts schema
-- Adds: technicians table, crm_notifications table, and the columns on
-- jobs that the CRM Dispatch / My Jobs / Leads / Follow-Ups screens read
-- and write but were never in the schema.
-- Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS).
-- =====================================================================

-- ---------- 1. TECHNICIANS ----------
create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_technicians_active on public.technicians(active);
create index if not exists idx_technicians_user_id on public.technicians(user_id);

alter table public.technicians enable row level security;

drop policy if exists "Role holders can view technicians" on public.technicians;
drop policy if exists "Admins can insert technicians" on public.technicians;
drop policy if exists "Admins can update technicians" on public.technicians;
drop policy if exists "Admins can delete technicians" on public.technicians;

create policy "Role holders can view technicians"
  on public.technicians for select to authenticated
  using (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'user'));

create policy "Admins can insert technicians"
  on public.technicians for insert to authenticated
  with check (has_role(auth.uid(), 'admin'));

create policy "Admins can update technicians"
  on public.technicians for update to authenticated
  using (has_role(auth.uid(), 'admin'));

create policy "Admins can delete technicians"
  on public.technicians for delete to authenticated
  using (has_role(auth.uid(), 'admin'));

-- ---------- 2. CRM_NOTIFICATIONS ----------
create table if not exists public.crm_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  message text,
  lead_id uuid references public.leads(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete cascade,
  follow_up_id uuid references public.follow_ups(id) on delete cascade,
  technician_id uuid references public.technicians(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_notifications_created_at
  on public.crm_notifications(created_at desc);
create index if not exists idx_crm_notifications_unread
  on public.crm_notifications(read_at) where read_at is null;
create index if not exists idx_crm_notifications_type
  on public.crm_notifications(type);

alter table public.crm_notifications enable row level security;

drop policy if exists "Role holders can view crm_notifications" on public.crm_notifications;
drop policy if exists "Role holders can insert crm_notifications" on public.crm_notifications;
drop policy if exists "Role holders can update crm_notifications" on public.crm_notifications;
drop policy if exists "Role holders can delete crm_notifications" on public.crm_notifications;

create policy "Role holders can view crm_notifications"
  on public.crm_notifications for select to authenticated
  using (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'user'));

create policy "Role holders can insert crm_notifications"
  on public.crm_notifications for insert to authenticated
  with check (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'user'));

create policy "Role holders can update crm_notifications"
  on public.crm_notifications for update to authenticated
  using (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'user'));

create policy "Role holders can delete crm_notifications"
  on public.crm_notifications for delete to authenticated
  using (has_role(auth.uid(), 'admin'));

-- ---------- 3. JOBS — add columns the CRM uses ----------
alter table public.jobs
  add column if not exists technician_id uuid references public.technicians(id) on delete set null,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists scheduled_at timestamptz,
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists dispatch_notes text,
  add column if not exists completion_summary text,
  add column if not exists total_amount numeric;

create index if not exists idx_jobs_technician_id on public.jobs(technician_id);
create index if not exists idx_jobs_started_at on public.jobs(started_at);
create index if not exists idx_jobs_completed_at on public.jobs(completed_at);

-- ---------- 4. updated_at trigger for technicians ----------
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_technicians_set_updated_at on public.technicians;
create trigger trg_technicians_set_updated_at
  before update on public.technicians
  for each row execute function public.set_updated_at_timestamp();
