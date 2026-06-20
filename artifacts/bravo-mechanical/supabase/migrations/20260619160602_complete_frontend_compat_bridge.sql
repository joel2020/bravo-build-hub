-- =====================================================================
-- Completes the compatibility bridge the frontend relies on. All changes
-- are ADDITIVE (new nullable columns / triggers / one table / view redef).
-- =====================================================================

-- ---------- INVOICES: add the columns the frontend reads/writes --------
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount numeric;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_date date;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS due_at timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS lead_id uuid;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_lead_id_fkey') THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.sync_invoice_compat_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- amount <-> total (amount is the value the frontend edits)
  IF NEW.amount IS NOT NULL THEN NEW.total := NEW.amount;
  ELSIF NEW.total IS NOT NULL THEN NEW.amount := NEW.total; END IF;
  -- notes <-> internal_notes
  IF NEW.notes IS NOT NULL THEN NEW.internal_notes := NEW.notes;
  ELSIF NEW.internal_notes IS NOT NULL THEN NEW.notes := NEW.internal_notes; END IF;
  -- paid_date(date) <-> paid_at(timestamptz)
  IF NEW.paid_date IS NOT NULL THEN NEW.paid_at := NEW.paid_date::timestamptz;
  ELSIF NEW.paid_at IS NOT NULL THEN NEW.paid_date := NEW.paid_at::date; END IF;
  -- due_at(timestamptz) <-> due_date(date)
  IF NEW.due_date IS NOT NULL THEN NEW.due_at := NEW.due_date::timestamptz;
  ELSIF NEW.due_at IS NOT NULL THEN NEW.due_date := NEW.due_at::date; END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_invoice_compat ON public.invoices;
CREATE TRIGGER trg_sync_invoice_compat BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_compat_fields();

UPDATE public.invoices SET
  amount = COALESCE(amount, total),
  notes = COALESCE(notes, internal_notes),
  paid_date = COALESCE(paid_date, paid_at::date),
  due_at = COALESCE(due_at, due_date::timestamptz),
  lead_id = COALESCE(lead_id, (SELECT j.lead_id FROM public.jobs j WHERE j.id = invoices.job_id));

-- ---------- JOBS: sync compat columns with canonical + backfill --------
CREATE OR REPLACE FUNCTION public.sync_job_compat_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.address IS NOT NULL THEN NEW.service_address := NEW.address;
  ELSIF NEW.service_address IS NOT NULL THEN NEW.address := NEW.service_address; END IF;

  IF NEW.started_at IS NOT NULL THEN NEW.actual_start_at := NEW.started_at;
  ELSIF NEW.actual_start_at IS NOT NULL THEN NEW.started_at := NEW.actual_start_at; END IF;

  IF NEW.completed_at IS NOT NULL THEN NEW.actual_end_at := NEW.completed_at;
  ELSIF NEW.actual_end_at IS NOT NULL THEN NEW.completed_at := NEW.actual_end_at; END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_job_compat ON public.jobs;
CREATE TRIGGER trg_sync_job_compat BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.sync_job_compat_fields();

UPDATE public.jobs SET
  address = COALESCE(address, service_address),
  started_at = COALESCE(started_at, actual_start_at),
  completed_at = COALESCE(completed_at, actual_end_at),
  amount = COALESCE(amount, (SELECT SUM(i.total) FROM public.invoices i WHERE i.job_id = jobs.id));

-- jobs.technician_id stores a technicians.id (the dispatch <Select> uses it);
-- add the FK so PostgREST can embed technicians(name).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_technician_id_fkey') THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technicians(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ---------- REVIEW_REQUESTS: table the revenue-loop helper needs --------
CREATE TABLE IF NOT EXISTS public.review_requests (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_name text,
  customer_phone text,
  customer_email text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage review_requests" ON public.review_requests;
CREATE POLICY "Authenticated can manage review_requests" ON public.review_requests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------- ACTIVITY_LOG view: expose action/details for readers --------
DROP VIEW IF EXISTS public.activity_log;
CREATE VIEW public.activity_log
WITH (security_invoker = true) AS
  SELECT id, record_type, record_id, customer_id, lead_id, job_id,
         activity_type, title, title AS action,
         description, description AS details,
         direction, channel, created_by, created_at
  FROM public.activity_logs;
GRANT SELECT ON public.activity_log TO anon, authenticated;
