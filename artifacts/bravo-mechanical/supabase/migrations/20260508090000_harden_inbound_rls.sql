-- Harden inbound SMS storage policies without destructive data changes.
alter table public.inbound_messages enable row level security;

drop policy if exists "authenticated_read_inbound_messages" on public.inbound_messages;
drop policy if exists "service_role_insert_inbound_messages" on public.inbound_messages;
drop policy if exists "service_role_update_inbound_messages" on public.inbound_messages;
drop policy if exists "Role holders can read inbound_messages" on public.inbound_messages;

create policy "Role holders can read inbound_messages"
  on public.inbound_messages
  for select
  to authenticated
  using (has_role(auth.uid(), 'admin') or has_role(auth.uid(), 'user'));

create policy "service_role_insert_inbound_messages"
  on public.inbound_messages
  for insert
  to service_role
  with check (true);

create policy "service_role_update_inbound_messages"
  on public.inbound_messages
  for update
  to service_role
  using (true)
  with check (true);
