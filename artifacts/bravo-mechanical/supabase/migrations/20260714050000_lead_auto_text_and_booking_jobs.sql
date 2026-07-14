-- Applied to production 2026-07-14 (via MCP). Included for version control.
--
-- 1) Speed-to-lead: notify_new_lead() (bell + admin email) extended to also
--    instantly TEXT the customer for leads from customer channels
--    (contact_form, website, rebate_estimator, online_booking, phone).
--    Async via pg_net so messaging problems can never block a lead insert;
--    staff-entered leads (source 'other') are not texted. The outbound text
--    is recorded in sms_messages so it shows in the Messages inbox.
--    See the live definition in the database (or the MCP migration history)
--    for the full function body; it supersedes 20260714020000's version.
--
-- 2) Online booking -> dispatch board: /book inserts an anon lead with
--    preferred_date/preferred_time and source 'online_booking'; this trigger
--    creates the corresponding scheduled job so it appears on Dispatch
--    immediately with "CONFIRM WITH CUSTOMER" notes.

create or replace function public.create_job_from_booking()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.source = 'online_booking' and new.preferred_date is not null then
    insert into public.jobs (
      lead_id, title, status, scheduled_date, amount, total_amount,
      customer_name, customer_phone, customer_email,
      address, service_address, notes, dispatch_notes
    ) values (
      new.id,
      coalesce(nullif(new.service, ''), nullif(new.service_type, ''), 'HVAC service') || ' - ' || coalesce(new.name, 'Online booking'),
      'scheduled',
      new.preferred_date,
      0, 0,
      new.name, new.phone, new.email,
      new.address, coalesce(new.service_address, new.address),
      'Booked online. Requested window: ' || coalesce(new.preferred_time, 'any time') || '. CONFIRM WITH CUSTOMER before dispatch.',
      'Online booking — requested ' || coalesce(new.preferred_time, 'any time') || ' on ' || new.preferred_date::text || '. Confirm with customer.'
    );
  end if;
  return new;
exception when others then
  raise warning 'create_job_from_booking failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists trg_create_job_from_booking on public.leads;
create trigger trg_create_job_from_booking
  after insert on public.leads
  for each row execute function public.create_job_from_booking();
