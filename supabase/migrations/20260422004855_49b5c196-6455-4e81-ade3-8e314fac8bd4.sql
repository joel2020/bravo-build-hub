
-- Lead status enum
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'quoted', 'won', 'lost');

-- Lead source enum
CREATE TYPE public.lead_source AS ENUM ('contact_form', 'rebate_estimator', 'phone', 'referral', 'google', 'other');

-- Job status enum
CREATE TYPE public.job_status AS ENUM ('quoted', 'scheduled', 'in_progress', 'completed', 'cancelled');

-- Invoice status enum
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue');

-- =====================
-- LEADS
-- =====================
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  source lead_source NOT NULL DEFAULT 'other',
  status lead_status NOT NULL DEFAULT 'new',
  notes TEXT DEFAULT '',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =====================
-- JOBS
-- =====================
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status job_status NOT NULL DEFAULT 'quoted',
  address TEXT,
  scheduled_date DATE,
  completed_date DATE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view jobs" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update jobs" ON public.jobs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete jobs" ON public.jobs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =====================
-- INVOICES
-- =====================
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'draft',
  due_date DATE,
  paid_date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete invoices" ON public.invoices FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =====================
-- FOLLOW-UPS
-- =====================
CREATE TABLE public.follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT follow_up_has_parent CHECK (lead_id IS NOT NULL OR job_id IS NOT NULL)
);

ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view follow_ups" ON public.follow_ups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert follow_ups" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update follow_ups" ON public.follow_ups FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete follow_ups" ON public.follow_ups FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =====================
-- ACTIVITY LOG
-- =====================
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activity_log" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert activity_log" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
