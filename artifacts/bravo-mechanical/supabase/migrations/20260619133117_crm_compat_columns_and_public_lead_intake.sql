-- =====================================================================
-- Fixes QA bugs #1, #2, #3, #4 for Bravo Mechanical CRM.
-- The frontend queries leads.address / leads.name / customers.address,
-- which never existed (real columns are service_address / first_name+last_name).
-- Add compatibility columns kept in sync with the canonical columns via
-- BEFORE INSERT/UPDATE triggers, so writes land correctly AND joins read
-- real values. Also add a public (anon) INSERT policy for the website form.
-- =====================================================================

-- ---- LEADS: add compat columns -------------------------------------
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS address text;

CREATE OR REPLACE FUNCTION public.sync_lead_compat_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- name  <->  first_name / last_name
  IF (NEW.first_name IS NOT NULL AND NEW.first_name <> '')
     OR (NEW.last_name IS NOT NULL AND NEW.last_name <> '') THEN
    NEW.name := btrim(coalesce(NEW.first_name,'') || ' ' || coalesce(NEW.last_name,''));
  ELSIF NEW.name IS NOT NULL AND NEW.name <> '' THEN
    NEW.first_name := split_part(NEW.name, ' ', 1);
    NEW.last_name  := coalesce(nullif(btrim(substr(NEW.name, length(split_part(NEW.name,' ',1)) + 1)), ''), '');
  END IF;
  -- guarantee NOT NULL columns are satisfied
  NEW.first_name := coalesce(nullif(NEW.first_name,''), coalesce(nullif(NEW.name,''), 'Unknown'));
  NEW.last_name  := coalesce(NEW.last_name, '');

  -- address  <->  service_address
  IF NEW.service_address IS NULL AND NEW.address IS NOT NULL THEN
    NEW.service_address := NEW.address;
  ELSIF NEW.address IS NULL AND NEW.service_address IS NOT NULL THEN
    NEW.address := NEW.service_address;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_lead_compat_fields ON public.leads;
CREATE TRIGGER trg_sync_lead_compat_fields
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.sync_lead_compat_fields();

-- backfill existing rows
UPDATE public.leads
   SET name = btrim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')),
       address = coalesce(address, service_address);

-- ---- CUSTOMERS: add compat columns (defensive: Add Customer path) ---
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS address text;

CREATE OR REPLACE FUNCTION public.sync_customer_compat_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (NEW.first_name IS NOT NULL AND NEW.first_name <> '')
     OR (NEW.last_name IS NOT NULL AND NEW.last_name <> '') THEN
    NEW.name := btrim(coalesce(NEW.first_name,'') || ' ' || coalesce(NEW.last_name,''));
  ELSIF NEW.company_name IS NOT NULL AND NEW.company_name <> '' AND (NEW.name IS NULL OR NEW.name = '') THEN
    NEW.name := NEW.company_name;
  ELSIF NEW.name IS NOT NULL AND NEW.name <> '' THEN
    NEW.first_name := split_part(NEW.name, ' ', 1);
    NEW.last_name  := nullif(btrim(substr(NEW.name, length(split_part(NEW.name,' ',1)) + 1)), '');
  END IF;

  IF NEW.service_address IS NULL AND NEW.address IS NOT NULL THEN
    NEW.service_address := NEW.address;
  ELSIF NEW.address IS NULL AND NEW.service_address IS NOT NULL THEN
    NEW.address := NEW.service_address;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_customer_compat_fields ON public.customers;
CREATE TRIGGER trg_sync_customer_compat_fields
  BEFORE INSERT OR UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.sync_customer_compat_fields();

UPDATE public.customers
   SET name = btrim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')),
       address = coalesce(address, service_address);

-- ---- PUBLIC LEAD INTAKE (website contact form) ---------------------
-- Allow the anonymous (anon) role used by the public site to create leads.
GRANT INSERT ON public.leads TO anon;

DROP POLICY IF EXISTS "Public can submit leads" ON public.leads;
CREATE POLICY "Public can submit leads" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (
    source = 'website'::lead_source
    AND status = 'new'::lead_status
  );
