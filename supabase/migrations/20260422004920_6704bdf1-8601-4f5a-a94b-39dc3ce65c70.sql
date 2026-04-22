
-- Tighten INSERT/UPDATE policies to require a role
-- LEADS
DROP POLICY "Authenticated users can insert leads" ON public.leads;
DROP POLICY "Authenticated users can update leads" ON public.leads;
CREATE POLICY "Role holders can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));
CREATE POLICY "Role holders can update leads" ON public.leads FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));

-- JOBS
DROP POLICY "Authenticated users can insert jobs" ON public.jobs;
DROP POLICY "Authenticated users can update jobs" ON public.jobs;
CREATE POLICY "Role holders can insert jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));
CREATE POLICY "Role holders can update jobs" ON public.jobs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));

-- INVOICES
DROP POLICY "Authenticated users can insert invoices" ON public.invoices;
DROP POLICY "Authenticated users can update invoices" ON public.invoices;
CREATE POLICY "Role holders can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));
CREATE POLICY "Role holders can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));

-- FOLLOW-UPS
DROP POLICY "Authenticated users can insert follow_ups" ON public.follow_ups;
DROP POLICY "Authenticated users can update follow_ups" ON public.follow_ups;
CREATE POLICY "Role holders can insert follow_ups" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));
CREATE POLICY "Role holders can update follow_ups" ON public.follow_ups FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));

-- ACTIVITY LOG
DROP POLICY "Authenticated users can insert activity_log" ON public.activity_log;
CREATE POLICY "Role holders can insert activity_log" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));

-- Also tighten SELECT to role holders only (internal CRM)
DROP POLICY "Authenticated users can view leads" ON public.leads;
DROP POLICY "Authenticated users can view jobs" ON public.jobs;
DROP POLICY "Authenticated users can view invoices" ON public.invoices;
DROP POLICY "Authenticated users can view follow_ups" ON public.follow_ups;
DROP POLICY "Authenticated users can view activity_log" ON public.activity_log;

CREATE POLICY "Role holders can view leads" ON public.leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));
CREATE POLICY "Role holders can view jobs" ON public.jobs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));
CREATE POLICY "Role holders can view invoices" ON public.invoices FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));
CREATE POLICY "Role holders can view follow_ups" ON public.follow_ups FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));
CREATE POLICY "Role holders can view activity_log" ON public.activity_log FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'user'));
