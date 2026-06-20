-- =====================================================================
-- Communication audit log for the send-email / send-sms edge functions.
--
-- Both edge functions write a row here (via the service-role client, which
-- bypasses RLS) after every send attempt so operators have a durable record
-- of outbound email/SMS and delivery failures. The table is intentionally
-- unified: SMS rows use template_name = 'sms' and store the phone number in
-- recipient_email. Without this table those inserts silently no-op, so the
-- audit trail is empty in production.
--
-- Access model:
--   * INSERT/UPDATE happen only through the service role (RLS bypassed), so
--     no write policy is granted to anon/authenticated.
--   * CRM staff may read the log to review send history from the UI.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.email_send_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      text,
  template_name   text,
  recipient_email text NOT NULL,
  status          text NOT NULL DEFAULT 'sent',
  error_message   text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_send_log_created_at_idx
  ON public.email_send_log (created_at DESC);
CREATE INDEX IF NOT EXISTS email_send_log_recipient_idx
  ON public.email_send_log (recipient_email);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

-- Staff (admin/user) may read the send history. Writes are service-role only.
DROP POLICY IF EXISTS "staff_select_email_send_log" ON public.email_send_log;
CREATE POLICY "staff_select_email_send_log"
  ON public.email_send_log FOR SELECT TO authenticated
  USING (public.is_crm_staff());
