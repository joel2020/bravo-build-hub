create table if not exists public.job_parts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  name text not null,
  quantity integer not null default 1,
  cost numeric not null default 0,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.part_suggestions (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  part_name text not null,
  priority integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.jobs add column if not exists job_type text;
alter table public.invoices add column if not exists lead_id uuid references public.leads(id) on delete set null;
alter table public.invoices add column if not exists total numeric not null default 0;
alter table public.invoices add column if not exists due_at timestamptz;

create index if not exists idx_job_parts_job_id on public.job_parts(job_id);
create index if not exists idx_part_suggestions_job_type on public.part_suggestions(job_type, priority);
