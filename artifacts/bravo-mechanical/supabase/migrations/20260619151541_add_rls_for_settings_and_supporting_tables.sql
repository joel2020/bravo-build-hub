
-- Settings table RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_settings" ON settings;
DROP POLICY IF EXISTS "authenticated_manage_settings" ON settings;
CREATE POLICY "authenticated_read_settings" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_manage_settings" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- user_roles RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_user_roles" ON user_roles;
DROP POLICY IF EXISTS "authenticated_manage_user_roles" ON user_roles;
CREATE POLICY "authenticated_read_user_roles" ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_manage_user_roles" ON user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- activity_logs RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_activity_logs" ON activity_logs;
CREATE POLICY "authenticated_all_activity_logs" ON activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- invoices RLS (ensure auth users can fully manage)
DROP POLICY IF EXISTS "authenticated_all_invoices" ON invoices;
CREATE POLICY "authenticated_all_invoices" ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- job_photos RLS
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_job_photos" ON job_photos;
CREATE POLICY "authenticated_all_job_photos" ON job_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);
