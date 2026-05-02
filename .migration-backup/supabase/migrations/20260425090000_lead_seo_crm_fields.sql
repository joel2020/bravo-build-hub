alter table public.leads
  add column if not exists service text,
  add column if not exists city text,
  add column if not exists urgency text,
  add column if not exists source_page text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists gclid text,
  add column if not exists fbclid text,
  add column if not exists landing_url text,
  add column if not exists referrer text;
