-- The frontend creates jobs/invoices from a lead_id (lead-centric), without a
-- customer_id. Make customer_id optional and derive it from the lead when the
-- lead has been converted to a customer.
ALTER TABLE public.jobs ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE public.invoices ALTER COLUMN customer_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_job_compat_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.address IS NOT NULL THEN NEW.service_address := NEW.address;
  ELSIF NEW.service_address IS NOT NULL THEN NEW.address := NEW.service_address; END IF;

  IF NEW.started_at IS NOT NULL THEN NEW.actual_start_at := NEW.started_at;
  ELSIF NEW.actual_start_at IS NOT NULL THEN NEW.started_at := NEW.actual_start_at; END IF;

  IF NEW.completed_at IS NOT NULL THEN NEW.actual_end_at := NEW.completed_at;
  ELSIF NEW.actual_end_at IS NOT NULL THEN NEW.completed_at := NEW.actual_end_at; END IF;

  -- best-effort: link the converted customer if the lead has one
  IF NEW.customer_id IS NULL AND NEW.lead_id IS NOT NULL THEN
    SELECT converted_to_customer_id INTO NEW.customer_id FROM public.leads WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END $$;
