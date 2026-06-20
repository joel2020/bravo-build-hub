-- The public marketing LeadForm/RebateEstimator insert leads with a free-text
-- `source` (e.g. "contact_form") and marketing/tracking columns that don't
-- exist on the canonical leads table. Relax source to text and add the columns.

-- Drop the restrictive anon policy whose `source = 'website'::lead_source` cast
-- would break once source becomes text. The build session's permissive
-- "anon_insert_leads" (WITH CHECK true) already allows public inserts.
DROP POLICY IF EXISTS "Public can submit leads" ON public.leads;

ALTER TABLE public.leads ALTER COLUMN source DROP DEFAULT;
ALTER TABLE public.leads ALTER COLUMN source TYPE text USING source::text;
ALTER TABLE public.leads ALTER COLUMN source SET DEFAULT 'other';

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS service text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source_page text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS landing_url text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_term text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_content text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS gclid text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS fbclid text;

-- Extend the existing lead compat trigger to also sync service <-> service_type.
CREATE OR REPLACE FUNCTION public.sync_lead_compat_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.first_name IS NOT NULL AND NEW.first_name <> '')
     OR (NEW.last_name IS NOT NULL AND NEW.last_name <> '') THEN
    NEW.name := btrim(coalesce(NEW.first_name,'') || ' ' || coalesce(NEW.last_name,''));
  ELSIF NEW.name IS NOT NULL AND NEW.name <> '' THEN
    NEW.first_name := split_part(NEW.name, ' ', 1);
    NEW.last_name  := coalesce(nullif(btrim(substr(NEW.name, length(split_part(NEW.name,' ',1)) + 1)), ''), '');
  END IF;
  NEW.first_name := coalesce(nullif(NEW.first_name,''), coalesce(nullif(NEW.name,''), 'Unknown'));
  NEW.last_name  := coalesce(NEW.last_name, '');

  IF NEW.service_address IS NULL AND NEW.address IS NOT NULL THEN
    NEW.service_address := NEW.address;
  ELSIF NEW.address IS NULL AND NEW.service_address IS NOT NULL THEN
    NEW.address := NEW.service_address;
  END IF;

  -- service <-> service_type
  IF NEW.service IS NOT NULL AND NEW.service <> '' THEN
    NEW.service_type := coalesce(NEW.service_type, NEW.service);
  ELSIF NEW.service_type IS NOT NULL THEN
    NEW.service := coalesce(NEW.service, NEW.service_type);
  END IF;

  RETURN NEW;
END;
$$;
