-- Applied to production 2026-07-14 (via MCP). Included for version control.
--
-- 1) Speed-to-lead: notify_new_lead() (bell + admin email) extended to also
--    instantly TEXT the customer for leads from customer channels
--    (contact_form, website, rebate_estimator, online_booking, phone).
--    Async via pg_net so messaging problems can never block a lead insert;
--    staff-entered leads (source 'other') are not texted. The outbound text
--    is recorded in sms_messages so it shows in the Messages inbox.
--    Supersedes the version in 20260714020000.
--
-- 2) Online booking -> dispatch board: /book inserts an anon lead with
--    preferred_date/preferred_time and source 'online_booking'; the second
--    trigger creates the corresponding scheduled job so it appears on
--    Dispatch immediately with "CONFIRM WITH CUSTOMER" notes.

create or replace function public.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $fn$
declare
  api_key text;
  admin_emails jsonb;
  lead_label text;
  tw_sid text; tw_tok text; tw_from text;
  customer_msg text;
  to_norm text;
begin
  insert into public.crm_notifications (type, title, message, lead_id, read, read_at)
  values (
    'new_lead',
    'New lead received',
    coalesce(new.name, 'New lead') || case when new.service_type is not null then ' — ' || new.service_type else '' end,
    new.id, false, null
  );

  -- Admin email alert
  begin
    api_key := public.get_service_secret('resend_api_key');
    select coalesce(jsonb_agg(distinct p.email), '[]'::jsonb) into admin_emails
      from public.user_profiles p
      join public.user_roles r on r.user_id = p.id and r.role = 'admin'
      where p.email is not null;

    if api_key is not null and jsonb_array_length(admin_emails) > 0 then
      lead_label := coalesce(new.name, 'New lead');
      perform net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object('Authorization', 'Bearer ' || api_key, 'Content-Type', 'application/json'),
        body := jsonb_build_object(
          'from', 'Bravo Mechanical CRM <info@bravomechanicalny.com>',
          'to', admin_emails,
          'subject', 'New lead: ' || lead_label || coalesce(' — ' || nullif(new.service, ''), coalesce(' — ' || nullif(new.service_type, ''), '')),
          'html',
            '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:16px;">'
            || '<h2 style="margin:0 0 12px;">New lead from ' || coalesce(nullif(new.source, ''), 'CRM') || '</h2>'
            || '<table style="font-size:14px;line-height:1.7;">'
            || '<tr><td style="color:#64748b;padding-right:12px;">Name</td><td><b>' || lead_label || '</b></td></tr>'
            || '<tr><td style="color:#64748b;padding-right:12px;">Phone</td><td>' || coalesce(new.phone, '—') || '</td></tr>'
            || '<tr><td style="color:#64748b;padding-right:12px;">Email</td><td>' || coalesce(new.email, '—') || '</td></tr>'
            || '<tr><td style="color:#64748b;padding-right:12px;">Service</td><td>' || coalesce(new.service, new.service_type, '—') || '</td></tr>'
            || '<tr><td style="color:#64748b;padding-right:12px;">Requested</td><td>' || coalesce(new.preferred_date::text || ' ' || coalesce(new.preferred_time, ''), '—') || '</td></tr>'
            || '<tr><td style="color:#64748b;padding-right:12px;">Address</td><td>' || coalesce(new.address, new.service_address, '—') || '</td></tr>'
            || '<tr><td style="color:#64748b;padding-right:12px;">Message</td><td>' || coalesce(left(new.message, 500), '—') || '</td></tr>'
            || '</table>'
            || '<p style="margin-top:16px;"><a href="https://app.bravomechanicalny.com/admin/crm" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Open CRM</a></p>'
            || '</div>'
        )
      );
    end if;
  exception when others then
    raise warning 'new-lead email alert failed: %', sqlerrm;
  end;

  -- Speed-to-lead auto-text to the customer
  begin
    if new.phone is not null and btrim(new.phone) <> ''
       and coalesce(new.source, '') in ('contact_form', 'website', 'rebate_estimator', 'online_booking', 'phone') then
      tw_sid := public.get_service_secret('twilio_account_sid');
      tw_tok := public.get_service_secret('twilio_auth_token');
      tw_from := public.get_service_secret('twilio_phone_number');
      if tw_sid is not null and tw_tok is not null and tw_from is not null then
        to_norm := case when new.phone like '+%' then new.phone else '+1' || regexp_replace(new.phone, '\D', '', 'g') end;
        if to_norm <> tw_from and length(regexp_replace(to_norm, '\D', '', 'g')) >= 11 then
          customer_msg := case
            when new.source = 'online_booking' then
              'Hi ' || coalesce(split_part(new.name, ' ', 1), 'there') || ', Bravo Mechanical here — we received your booking request'
              || coalesce(' for ' || to_char(new.preferred_date, 'Dy Mon FMDD') || ' (' || coalesce(new.preferred_time, 'any time') || ')', '')
              || '. We''ll text you shortly to confirm the exact window. Urgent? Call (914) 361-9142. Reply STOP to opt out.'
            when new.source = 'phone' then
              'Hi, Bravo Mechanical here — we got your text and will reply shortly. If it''s urgent, call us at (914) 361-9142.'
            else
              'Hi ' || coalesce(split_part(new.name, ' ', 1), 'there') || ', Bravo Mechanical here — we received your request and will call you shortly. Urgent? Call (914) 361-9142 now. Reply STOP to opt out.'
          end;
          perform net.http_post(
            url := 'https://api.twilio.com/2010-04-01/Accounts/' || tw_sid || '/Messages.json',
            headers := jsonb_build_object('Authorization', 'Basic ' || replace(encode(convert_to(tw_sid || ':' || tw_tok, 'utf8'), 'base64'), e'\n', ''), 'Content-Type', 'application/x-www-form-urlencoded'),
            body := 'From=' || extensions.urlencode(tw_from) || '&To=' || extensions.urlencode(to_norm) || '&Body=' || extensions.urlencode(customer_msg)
          );
          insert into public.sms_messages (phone, body, direction, lead_id, received_at)
          values (to_norm, customer_msg, 'outbound', new.id, now());
        end if;
      end if;
    end if;
  exception when others then
    raise warning 'new-lead auto-text failed: %', sqlerrm;
  end;

  return new;
end;
$fn$;

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
