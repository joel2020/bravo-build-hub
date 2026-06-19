
-- Add city column to leads (code inserts city, table only has service_city)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS message text;

-- Create follow_ups table (code references this for follow-up scheduling)
CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  due_date date,
  note text,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_follow_ups" ON follow_ups;
CREATE POLICY "authenticated_all_follow_ups"
  ON follow_ups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create crm_notifications table (code uses this name instead of notifications)
CREATE TABLE IF NOT EXISTS crm_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE crm_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_crm_notifications" ON crm_notifications;
CREATE POLICY "authenticated_all_crm_notifications"
  ON crm_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create activity_log view (code uses singular; table is activity_logs)
CREATE OR REPLACE VIEW activity_log AS SELECT * FROM activity_logs;
