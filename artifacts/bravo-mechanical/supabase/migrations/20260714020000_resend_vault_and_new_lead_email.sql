-- Applied to production 2026-07-14 (via MCP). Included for version control.
--
-- Email delivery wiring:
--   * The Resend API key lives in Supabase Vault under the name 'resend_api_key'.
--     IT IS NOT COMMITTED HERE. On a fresh environment, store it with:
--       select vault.create_secret('<RESEND_API_KEY>', 'resend_api_key');
--   * The domain bravomechanicalny.com is verified in Resend, so mail sends
--     from "Bravo Mechanical <info@bravomechanicalny.com>".
--   * The send-email edge function reads the key via get_service_secret()
--     (service_role only); the new-lead trigger reads it directly.

create extension if not exists pg_net;

-- Service-role-only accessor so the send-email edge function can read the key.
create or replace function public.get_service_secret(secret_name text)
returns text
language sql
security definer
set search_path to ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = secret_name limit 1;
$$;
revoke execute on function public.get_service_secret(text) from public, anon, authenticated;
grant execute on function public.get_service_secret(text) to service_role;

-- Email every CRM admin when a new lead arrives (website form, intake, anywhere).
-- Runs via pg_net (async) so it can never slow down or block the lead insert;
-- any failure is swallowed — the in-app bell notification still fires regardless.
create or replace function public.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  api_key text;
  admin_emails jsonb;
  lead_label text;
begin
  insert into public.crm_notifications (type, title, message, lead_id, read, read_at)
  values (
    'new_lead',
    'New lead received',
    coalesce(new.name, 'New lead') || case when new.service_type is not null then ' — ' || new.service_type else '' end,
    new.id, false, null
  );

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

  return new;
end;
$$;
