-- Applied to production 2026-07-14 (via MCP). Included for version control.
--
-- Two-way SMS via Twilio, entirely database-side (no edge function needed):
--   * Credentials live in Supabase Vault: twilio_account_sid, twilio_auth_token,
--     twilio_phone_number. NOT committed here. On a fresh environment:
--       select vault.create_secret('<value>', 'twilio_account_sid');  -- etc.
--   * OUTBOUND: send_sms_via_twilio(to, body) — staff-only RPC, synchronous
--     (pg extension "http"), logs to email_send_log and records the message
--     in sms_messages so the Messages inbox shows the thread.
--   * INBOUND: poll_twilio_inbound() runs every minute via pg_cron, ingests
--     new inbound texts from the Twilio message log, matches/creates a lead
--     (new leads also fire the new-lead email alert), and texts the owner a
--     heads-up. Polling avoids needing a public webhook endpoint.
--   * The Twilio number's old SmsUrl webhook (pointed at a dead project) was
--     cleared via the Twilio API.

create extension if not exists http with schema extensions;

create table if not exists public.sms_messages (
  id uuid primary key default gen_random_uuid(),
  message_sid text unique,
  phone text not null,           -- the customer's number (counterparty)
  body text not null,
  direction text not null default 'inbound',
  source text not null default 'twilio',
  lead_id uuid references public.leads(id) on delete set null,
  received_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.sms_messages enable row level security;
create policy staff_select_inbound_messages on public.sms_messages
  for select to authenticated using (public.is_crm_staff());
create policy staff_update_inbound_messages on public.sms_messages
  for update to authenticated using (public.is_crm_staff()) with check (public.is_crm_staff());
create index if not exists sms_messages_phone_idx on public.sms_messages (phone, created_at);

create or replace function public.send_sms_via_twilio(p_to text, p_body text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  sid_v text; tok_v text; from_v text;
  to_norm text;
  resp extensions.http_response;
  resp_json jsonb;
  v_lead uuid;
begin
  if not public.is_crm_staff() then
    return jsonb_build_object('success', false, 'error', 'Forbidden: CRM access required');
  end if;
  if p_to is null or btrim(p_to) = '' or p_body is null or btrim(p_body) = '' then
    return jsonb_build_object('success', false, 'error', 'Missing to/body');
  end if;

  sid_v := public.get_service_secret('twilio_account_sid');
  tok_v := public.get_service_secret('twilio_auth_token');
  from_v := public.get_service_secret('twilio_phone_number');
  if sid_v is null or tok_v is null or from_v is null then
    return jsonb_build_object('success', false, 'error', 'Twilio configuration missing');
  end if;

  to_norm := case when p_to like '+%' then p_to else '+1' || regexp_replace(p_to, '\D', '', 'g') end;

  resp := extensions.http((
    'POST',
    'https://api.twilio.com/2010-04-01/Accounts/' || sid_v || '/Messages.json',
    array[extensions.http_header('Authorization', 'Basic ' || replace(encode(convert_to(sid_v || ':' || tok_v, 'utf8'), 'base64'), e'\n', ''))],
    'application/x-www-form-urlencoded',
    'From=' || extensions.urlencode(from_v) || '&To=' || extensions.urlencode(to_norm) || '&Body=' || extensions.urlencode(left(p_body, 1500))
  )::extensions.http_request);

  resp_json := resp.content::jsonb;

  insert into public.email_send_log (message_id, template_name, recipient_email, status, error_message)
  values (
    resp_json->>'sid', 'sms', to_norm,
    case when resp.status between 200 and 299 then 'sent' else 'failed' end,
    case when resp.status between 200 and 299 then null else left(resp.content, 500) end
  );

  if resp.status between 200 and 299 then
    select id into v_lead from leads
      where regexp_replace(coalesce(phone,''), '\D', '', 'g') = right(regexp_replace(to_norm, '\D', '', 'g'), 10)
      order by created_at desc limit 1;
    insert into public.sms_messages (message_sid, phone, body, direction, lead_id, received_at)
    values (resp_json->>'sid', to_norm, left(p_body, 1500), 'outbound', v_lead, now());
    return jsonb_build_object('success', true, 'sid', resp_json->>'sid', 'to', to_norm);
  end if;
  return jsonb_build_object('success', false, 'error', coalesce(resp_json->>'message', 'Twilio HTTP ' || resp.status));
exception when others then
  return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;
revoke execute on function public.send_sms_via_twilio(text, text) from public, anon;
grant execute on function public.send_sms_via_twilio(text, text) to authenticated, service_role;

create or replace function public.poll_twilio_inbound()
returns integer
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  sid_v text; tok_v text; from_v text;
  resp extensions.http_response;
  msg jsonb;
  new_count int := 0;
  v_from text; v_body text; v_sid text; v_sent timestamptz;
  v_lead uuid; v_notes text; v_inserted uuid;
  owner_phone text := '+19143619142';
begin
  sid_v := public.get_service_secret('twilio_account_sid');
  tok_v := public.get_service_secret('twilio_auth_token');
  from_v := public.get_service_secret('twilio_phone_number');
  if sid_v is null or tok_v is null or from_v is null then return 0; end if;

  resp := extensions.http((
    'GET',
    'https://api.twilio.com/2010-04-01/Accounts/' || sid_v || '/Messages.json?To=' || extensions.urlencode(from_v) || '&PageSize=50',
    array[extensions.http_header('Authorization', 'Basic ' || replace(encode(convert_to(sid_v || ':' || tok_v, 'utf8'), 'base64'), e'\n', ''))],
    null, null
  )::extensions.http_request);
  if resp.status < 200 or resp.status > 299 then
    raise warning 'poll_twilio_inbound: Twilio HTTP %', resp.status;
    return 0;
  end if;

  for msg in select * from jsonb_array_elements((resp.content::jsonb)->'messages')
  loop
    if (msg->>'direction') not like 'inbound%' then continue; end if;
    v_sid := msg->>'sid';
    if exists (select 1 from sms_messages where message_sid = v_sid) then continue; end if;

    v_from := msg->>'from';
    v_body := coalesce(msg->>'body', '');
    v_sent := nullif(msg->>'date_sent','')::timestamptz;

    insert into sms_messages (message_sid, phone, body, direction, received_at)
    values (v_sid, v_from, v_body, 'inbound', v_sent)
    returning id into v_inserted;
    new_count := new_count + 1;

    -- Twilio's canned auto-responder is noise, not a customer.
    if v_from = '+18777804236' then continue; end if;

    select id, notes into v_lead, v_notes from leads
      where regexp_replace(coalesce(phone,''), '\D', '', 'g') = right(regexp_replace(v_from, '\D', '', 'g'), 10)
         or regexp_replace(coalesce(phone,''), '\D', '', 'g') = regexp_replace(v_from, '\D', '', 'g')
      order by created_at desc limit 1;

    if v_lead is not null then
      update leads set notes = btrim(coalesce(v_notes,'') || e'\nInbound SMS: ' || v_body), status = 'contacted' where id = v_lead;
    else
      insert into leads (name, phone, source, status, notes, message)
      values ('SMS lead ' || v_from, v_from, 'phone', 'new', 'Inbound SMS: ' || v_body, v_body)
      returning id into v_lead;
    end if;
    update sms_messages set lead_id = v_lead where id = v_inserted;

    if v_from <> owner_phone and (v_sent is null or v_sent > now() - interval '24 hours') then
      begin
        perform extensions.http((
          'POST',
          'https://api.twilio.com/2010-04-01/Accounts/' || sid_v || '/Messages.json',
          array[extensions.http_header('Authorization', 'Basic ' || replace(encode(convert_to(sid_v || ':' || tok_v, 'utf8'), 'base64'), e'\n', ''))],
          'application/x-www-form-urlencoded',
          'From=' || extensions.urlencode(from_v) || '&To=' || extensions.urlencode(owner_phone) || '&Body=' || extensions.urlencode(left('New Bravo SMS from ' || v_from || ': ' || v_body, 1500))
        )::extensions.http_request);
      exception when others then
        raise warning 'poll_twilio_inbound owner alert failed: %', sqlerrm;
      end;
    end if;
  end loop;

  return new_count;
end;
$$;
revoke execute on function public.poll_twilio_inbound() from public, anon, authenticated;

select cron.schedule('poll-twilio-inbound', '* * * * *', 'select public.poll_twilio_inbound();');
