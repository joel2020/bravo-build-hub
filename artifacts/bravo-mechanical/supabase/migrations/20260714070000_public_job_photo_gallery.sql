-- Website project gallery fed from CRM job photos.
-- Staff mark individual photos public from the Jobs view; only those rows
-- are visible to anon (the /projects page reads them directly).
--
-- Applied to production 2026-07-14 as migration public_job_photo_gallery.

alter table public.job_photos
  add column if not exists is_public boolean not null default false,
  add column if not exists public_caption text;

drop policy if exists public_view_public_job_photos on public.job_photos;
create policy public_view_public_job_photos
  on public.job_photos for select
  to anon, authenticated
  using (is_public = true);

-- The CRM has always stored getPublicUrl() links, which only work on a public
-- bucket. Objects remain unlisted (uuid paths); the table stays RLS-guarded.
update storage.buckets set public = true where id = 'job-photos';

-- Legacy column: the app writes public_url/storage_path, never photo_url,
-- so the NOT NULL constraint made every CRM photo upload insert fail.
alter table public.job_photos alter column photo_url drop not null;
update public.job_photos set photo_url = public_url where photo_url is null and public_url is not null;
