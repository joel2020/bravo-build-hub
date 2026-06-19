
-- Add all missing columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS total_amount numeric(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dispatch_notes text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completion_summary text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS technician_id uuid;

-- Create technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  specialty text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

-- RLS policies (drop first to avoid duplicates)
DROP POLICY IF EXISTS "authenticated_read_technicians" ON technicians;
DROP POLICY IF EXISTS "authenticated_manage_technicians" ON technicians;

CREATE POLICY "authenticated_read_technicians"
  ON technicians FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_manage_technicians"
  ON technicians FOR ALL TO authenticated USING (true);
