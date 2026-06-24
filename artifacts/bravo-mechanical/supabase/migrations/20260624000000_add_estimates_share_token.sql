-- Adds a public share token to estimates so a proposal can be viewed and
-- approved by a customer via an unguessable link. The token is consumed by the
-- `proposal-public` edge function (service role), so no anon RLS is required.
alter table public.estimates add column if not exists share_token uuid not null default gen_random_uuid();
create unique index if not exists estimates_share_token_key on public.estimates (share_token);
