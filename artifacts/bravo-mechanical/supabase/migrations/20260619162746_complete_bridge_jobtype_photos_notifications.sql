-- ---- jobs.job_type / leads.service_type: relax enums to text (frontend
-- writes free-text / auto-detected values that aren't enum members) --------
ALTER TABLE public.jobs ALTER COLUMN job_type DROP DEFAULT;
ALTER TABLE public.jobs ALTER COLUMN job_type TYPE text USING job_type::text;
ALTER TABLE public.jobs ALTER COLUMN job_type SET DEFAULT 'other';

ALTER TABLE public.leads ALTER COLUMN service_type TYPE text USING service_type::text;

-- ---- job_photos: columns the frontend reads/writes --------------------
ALTER TABLE public.job_photos ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE public.job_photos ADD COLUMN IF NOT EXISTS public_url text;
ALTER TABLE public.job_photos ADD COLUMN IF NOT EXISTS lead_id uuid;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='job_photos_lead_id_fkey') THEN
    ALTER TABLE public.job_photos ADD CONSTRAINT job_photos_lead_id_fkey
      FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.sync_job_photo_compat()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- public_url <-> photo_url (photo_url is NOT NULL on the canonical table)
  IF NEW.public_url IS NOT NULL THEN NEW.photo_url := COALESCE(NEW.photo_url, NEW.public_url);
  ELSIF NEW.photo_url IS NOT NULL THEN NEW.public_url := NEW.photo_url; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_sync_job_photo_compat ON public.job_photos;
CREATE TRIGGER trg_sync_job_photo_compat BEFORE INSERT OR UPDATE ON public.job_photos
  FOR EACH ROW EXECUTE FUNCTION public.sync_job_photo_compat();

UPDATE public.job_photos SET public_url = COALESCE(public_url, photo_url);

-- ---- crm_notifications: invoice_id / follow_up_id / read_at -----------
ALTER TABLE public.crm_notifications ADD COLUMN IF NOT EXISTS invoice_id uuid;
ALTER TABLE public.crm_notifications ADD COLUMN IF NOT EXISTS follow_up_id uuid;
ALTER TABLE public.crm_notifications ADD COLUMN IF NOT EXISTS read_at timestamptz;

CREATE OR REPLACE FUNCTION public.sync_crm_notification_read()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- keep boolean `read` and timestamp `read_at` consistent (two UIs use each)
  IF NEW.read_at IS NOT NULL THEN NEW.read := true;
  ELSIF NEW.read IS true AND NEW.read_at IS NULL THEN NEW.read_at := now();
  ELSIF NEW.read IS false THEN NEW.read_at := NULL; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_sync_crm_notification_read ON public.crm_notifications;
CREATE TRIGGER trg_sync_crm_notification_read BEFORE INSERT OR UPDATE ON public.crm_notifications
  FOR EACH ROW EXECUTE FUNCTION public.sync_crm_notification_read();

UPDATE public.crm_notifications SET read_at = CASE WHEN read THEN created_at ELSE NULL END WHERE read_at IS NULL;
