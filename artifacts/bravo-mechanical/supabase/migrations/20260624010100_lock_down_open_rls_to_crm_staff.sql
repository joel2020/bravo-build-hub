-- Tighten tables that were readable/writable by ANY authenticated user
-- (auth.role() = 'authenticated') down to CRM staff only (is_crm_staff()),
-- matching the pattern already used by leads/jobs/invoices. The service role
-- (used by edge functions like proposal-public) bypasses RLS, so public
-- proposal viewing is unaffected.

drop policy if exists "Authenticated users can manage contacts" on public.contacts;
create policy "Staff manage contacts" on public.contacts for all to authenticated using (is_crm_staff()) with check (is_crm_staff());

drop policy if exists "Authenticated users can manage equipment" on public.equipment;
create policy "Staff manage equipment" on public.equipment for all to authenticated using (is_crm_staff()) with check (is_crm_staff());

drop policy if exists "Authenticated users can manage estimate items" on public.estimate_line_items;
create policy "Staff manage estimate items" on public.estimate_line_items for all to authenticated using (is_crm_staff()) with check (is_crm_staff());

drop policy if exists "Authenticated users can manage invoice items" on public.invoice_line_items;
create policy "Staff manage invoice items" on public.invoice_line_items for all to authenticated using (is_crm_staff()) with check (is_crm_staff());

drop policy if exists "Authenticated users can manage files" on public.files;
create policy "Staff manage files" on public.files for all to authenticated using (is_crm_staff()) with check (is_crm_staff());

drop policy if exists "Authenticated users can manage job notes" on public.job_notes;
create policy "Staff manage job notes" on public.job_notes for all to authenticated using (is_crm_staff()) with check (is_crm_staff());

drop policy if exists "Authenticated users can manage agreements" on public.service_agreements;
create policy "Staff manage agreements" on public.service_agreements for all to authenticated using (is_crm_staff()) with check (is_crm_staff());

drop policy if exists "Authenticated users can manage tasks" on public.tasks;
create policy "Staff manage tasks" on public.tasks for all to authenticated using (is_crm_staff()) with check (is_crm_staff());

-- Open SELECT-only exposures (manage policies were already restricted)
drop policy if exists "Authenticated users can view customers" on public.customers;
create policy "Staff view customers" on public.customers for select to authenticated using (is_crm_staff());

drop policy if exists "Authenticated users can view estimates" on public.estimates;
create policy "Staff view estimates" on public.estimates for select to authenticated using (is_crm_staff());

-- Profiles: staff can read all; everyone can still read their own row
drop policy if exists "Users can view all profiles" on public.user_profiles;
create policy "Staff or self view profiles" on public.user_profiles for select to authenticated using (is_crm_staff() or id = auth.uid());
