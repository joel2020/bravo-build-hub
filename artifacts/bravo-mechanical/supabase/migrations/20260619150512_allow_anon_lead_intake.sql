
-- Allow anonymous users to submit leads (public intake form)
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads"
  ON leads FOR INSERT TO anon
  WITH CHECK (true);

-- Ensure RLS is enabled on leads  
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to leads
DROP POLICY IF EXISTS "authenticated_all_leads" ON leads;
CREATE POLICY "authenticated_all_leads"
  ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
