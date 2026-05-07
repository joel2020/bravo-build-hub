-- =====================================================================
-- job_photos: add lead_id (for direct lead lookup) and caption fields
-- The CRM (CRMJobs, CRMMyJobs) reads/writes these columns; without them
-- the queries error at runtime and TypeScript can't infer types.
-- Safe to re-run.
-- =====================================================================

alter table public.job_photos
  add column if not exists lead_id uuid references public.leads(id) on delete set null,
  add column if not exists caption text;

create index if not exists idx_job_photos_lead_id on public.job_photos(lead_id);
