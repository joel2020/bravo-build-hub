-- invoices.customer_id is NOT NULL, but the frontend creates invoices from a
-- job_id only. Derive customer_id (and lead_id) from the linked job when absent.
CREATE OR REPLACE FUNCTION public.sync_invoice_compat_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.amount IS NOT NULL THEN NEW.total := NEW.amount;
  ELSIF NEW.total IS NOT NULL THEN NEW.amount := NEW.total; END IF;

  IF NEW.notes IS NOT NULL THEN NEW.internal_notes := NEW.notes;
  ELSIF NEW.internal_notes IS NOT NULL THEN NEW.notes := NEW.internal_notes; END IF;

  IF NEW.paid_date IS NOT NULL THEN NEW.paid_at := NEW.paid_date::timestamptz;
  ELSIF NEW.paid_at IS NOT NULL THEN NEW.paid_date := NEW.paid_at::date; END IF;

  IF NEW.due_date IS NOT NULL THEN NEW.due_at := NEW.due_date::timestamptz;
  ELSIF NEW.due_at IS NOT NULL THEN NEW.due_date := NEW.due_at::date; END IF;

  -- Backfill customer_id / lead_id from the linked job (customer_id is NOT NULL).
  IF NEW.customer_id IS NULL AND NEW.job_id IS NOT NULL THEN
    SELECT j.customer_id, COALESCE(NEW.lead_id, j.lead_id)
      INTO NEW.customer_id, NEW.lead_id
      FROM public.jobs j WHERE j.id = NEW.job_id;
  END IF;

  RETURN NEW;
END $$;
