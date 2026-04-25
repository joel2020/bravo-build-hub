-- Phase B/C/D: auth role alignment, dashboard support, and file upload metadata

-- Align role naming with app access model
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'office';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Keep existing helper compatible with office alias
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_role(
    _user_id,
    ARRAY['admin', 'office', 'office_staff', 'tech', 'marketing']::public.app_role[]
  )
$$;

-- Photo/file metadata tables
CREATE TABLE IF NOT EXISTS public.job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  caption TEXT,
  photo_type TEXT NOT NULL DEFAULT 'issue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_label TEXT,
  file_type TEXT NOT NULL DEFAULT 'paperwork',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_photos_job_id_created_at ON public.job_photos(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_files_customer_id_created_at ON public.customer_files(customer_id, created_at DESC);

ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can read job_photos" ON public.job_photos;
CREATE POLICY "Staff can read job_photos"
ON public.job_photos FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Tech office admin can manage job_photos" ON public.job_photos;
CREATE POLICY "Tech office admin can manage job_photos"
ON public.job_photos FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'office', 'office_staff', 'tech']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'office', 'office_staff', 'tech']::public.app_role[]));

DROP POLICY IF EXISTS "Staff can read customer_files" ON public.customer_files;
CREATE POLICY "Staff can read customer_files"
ON public.customer_files FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Tech office admin can manage customer_files" ON public.customer_files;
CREATE POLICY "Tech office admin can manage customer_files"
ON public.customer_files FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'office', 'office_staff', 'tech']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'office', 'office_staff', 'tech']::public.app_role[]));

-- Storage buckets and policies (single project)
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-files', 'customer-files', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Staff can read job-photos bucket" ON storage.objects;
CREATE POLICY "Staff can read job-photos bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'job-photos' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Tech office admin can upload job-photos" ON storage.objects;
CREATE POLICY "Tech office admin can upload job-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'job-photos' AND public.has_any_role(auth.uid(), ARRAY['admin', 'office', 'office_staff', 'tech']::public.app_role[]));

DROP POLICY IF EXISTS "Tech office admin can delete own job-photos" ON storage.objects;
CREATE POLICY "Tech office admin can delete own job-photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'job-photos' AND public.has_any_role(auth.uid(), ARRAY['admin', 'office', 'office_staff', 'tech']::public.app_role[]));

DROP POLICY IF EXISTS "Staff can read customer-files bucket" ON storage.objects;
CREATE POLICY "Staff can read customer-files bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'customer-files' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Tech office admin can upload customer-files" ON storage.objects;
CREATE POLICY "Tech office admin can upload customer-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'customer-files' AND public.has_any_role(auth.uid(), ARRAY['admin', 'office', 'office_staff', 'tech']::public.app_role[]));

DROP POLICY IF EXISTS "Tech office admin can delete customer-files" ON storage.objects;
CREATE POLICY "Tech office admin can delete customer-files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'customer-files' AND public.has_any_role(auth.uid(), ARRAY['admin', 'office', 'office_staff', 'tech']::public.app_role[]));
