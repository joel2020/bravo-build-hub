alter table public.leads
  add column if not exists service text,
  add column if not exists city text,
  add column if not exists urgency text,
  add column if not exists source_page text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists gclid text;
