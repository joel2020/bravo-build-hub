-- inbound_messages: stores inbound SMS from Twilio webhooks
create table if not exists public.inbound_messages (
  id uuid primary key default gen_random_uuid(),
  from_phone text not null,
  body text not null,
  source text not null default 'twilio',
  lead_id uuid references public.leads(id) on delete set null,
  message_sid text,
  created_at timestamptz not null default now()
);

-- Index for fast lookups by phone number
create index if not exists idx_inbound_messages_from_phone on public.inbound_messages(from_phone);

-- Index for linking to leads
create index if not exists idx_inbound_messages_lead_id on public.inbound_messages(lead_id);

-- RLS: allow authenticated users to read, service_role to insert (webhook)
alter table public.inbound_messages enable row level security;

create policy "authenticated_read_inbound_messages"
  on public.inbound_messages
  for select
  to authenticated
  using (true);

create policy "service_role_insert_inbound_messages"
  on public.inbound_messages
  for insert
  to service_role
  with check (true);
