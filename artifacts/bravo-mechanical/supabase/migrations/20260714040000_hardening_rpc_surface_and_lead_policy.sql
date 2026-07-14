-- Applied to production 2026-07-14 (via MCP). Included for version control.
-- Hardening pass from the security-advisor scan.

-- 1) Internal functions should not be callable through the public REST API.
--    (Triggers/cron run as owner and are unaffected by EXECUTE revokes.)
revoke execute on function public.mark_overdue_invoices() from public, anon, authenticated;
revoke execute on function public.notify_new_lead() from public, anon, authenticated;
revoke execute on function public.bootstrap_first_admin() from public, anon, authenticated;

-- 2) Role helpers: anon never needs to call these via RPC. They stay
--    executable by authenticated because RLS policies evaluate them as the
--    querying role.
revoke execute on function public.auth_user_role() from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_crm_admin() from anon;
revoke execute on function public.is_crm_staff() from anon;

-- 3) user_profiles policies were scoped "to public" (includes anon); with the
--    anon EXECUTE revoke on is_admin() that combination would error instead of
--    filtering. Scope them to authenticated, which is what they meant anyway.
alter policy "Admins can manage all profiles" on public.user_profiles to authenticated;
alter policy "Users can update own profile" on public.user_profiles to authenticated;

-- 4) Public lead-form inserts can only arrive as fresh, unassigned leads.
drop policy anon_insert_leads on public.leads;
create policy anon_insert_leads on public.leads
  for insert to anon
  with check (
    status = 'new'
    and assigned_to is null
    and converted_to_customer_id is null
    and created_by is null
  );
