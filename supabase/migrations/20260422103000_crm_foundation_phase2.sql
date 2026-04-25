-- Phase 2 CRM + lead capture foundation for single-project Supabase deployment
-- Safe to run in an existing project used by this client.

-- Extensions
create extension if not exists pgcrypto;

-- Expand roles enum used by user_roles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'office_staff';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tech';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  ELSE
    CREATE TYPE public.app_role AS ENUM ('admin', 'office_staff', 'tech');
  END IF;
END $$;

-- Shared enums
DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM (
    'new_lead',
    'contact_attempted',
    'qualified',
    'estimate_scheduled',
    'estimate_sent',
    'won',
    'lost',
    'no_response',
    'maintenance_customer'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.urgency_level AS ENUM ('low', 'normal', 'high', 'emergency');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.property_type AS ENUM ('residential', 'commercial', 'multi_family', 'condo', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.call_disposition AS ENUM (
    'reached',
    'left_voicemail',
    'no_answer',
    'wrong_number',
    'booked',
    'not_interested',
    'callback_requested'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.content_status AS ENUM ('draft', 'in_review', 'approved', 'scheduled', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.social_platform AS ENUM ('facebook', 'instagram', 'x', 'linkedin', 'google_business_profile', 'tiktok', 'youtube');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Role helpers
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY (_roles)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_role(_user_id, ARRAY['admin', 'office_staff', 'tech']::public.app_role[])
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Core profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role_label TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
CREATE POLICY "Staff can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CRM data model
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  maintenance_plan_status TEXT,
  source TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  assigned_staff_id UUID REFERENCES public.profiles(id),
  assigned_tech_id UUID REFERENCES public.profiles(id),
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  call_outcome TEXT,
  transcript_url TEXT,
  transcript_text TEXT,
  call_summary TEXT,
  disposition public.call_disposition,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  property_type public.property_type NOT NULL DEFAULT 'residential',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  property_type public.property_type,
  service_requested TEXT,
  urgency public.urgency_level NOT NULL DEFAULT 'normal',
  source TEXT NOT NULL,
  source_url TEXT,
  source_referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  notes TEXT,
  status public.lead_status NOT NULL DEFAULT 'new_lead',
  tags TEXT[] NOT NULL DEFAULT '{}',
  assigned_staff_id UUID REFERENCES public.profiles(id),
  assigned_tech_id UUID REFERENCES public.profiles(id),
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  appointment_at TIMESTAMPTZ,
  call_outcome TEXT,
  estimate_amount NUMERIC(12,2),
  job_value NUMERIC(12,2),
  maintenance_plan_status TEXT,
  transcript_url TEXT,
  transcript_text TEXT,
  call_summary TEXT,
  disposition public.call_disposition,
  spam_score INTEGER NOT NULL DEFAULT 0,
  honeypot_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  service_type TEXT,
  urgency public.urgency_level NOT NULL DEFAULT 'normal',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  value NUMERIC(12,2),
  assigned_staff_id UUID REFERENCES public.profiles(id),
  assigned_tech_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled',
  assigned_staff_id UUID REFERENCES public.profiles(id),
  assigned_tech_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note_type TEXT NOT NULL DEFAULT 'manual',
  body TEXT NOT NULL,
  follow_up_needed BOOLEAN NOT NULL DEFAULT false,
  replacement_opportunity BOOLEAN NOT NULL DEFAULT false,
  parts_needed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  amount NUMERIC(12,2),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  assigned_staff_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'open',
  due_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT,
  featured_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  schema_type TEXT,
  city TEXT,
  service TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  status public.content_status NOT NULL DEFAULT 'draft',
  author_id UUID REFERENCES public.profiles(id),
  scheduled_publish_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  platform public.social_platform NOT NULL,
  caption TEXT NOT NULL,
  media_url TEXT,
  status public.content_status NOT NULL DEFAULT 'draft',
  approval_status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.call_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  objective TEXT,
  script_body TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.call_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  call_script_id UUID REFERENCES public.call_scripts(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  scheduled_call_at TIMESTAMPTZ,
  assigned_caller_id UUID REFERENCES public.profiles(id),
  assigned_to_ai BOOLEAN NOT NULL DEFAULT false,
  disposition public.call_disposition,
  transcript TEXT,
  summary TEXT,
  sentiment TEXT,
  next_action TEXT,
  appointment_booked BOOLEAN NOT NULL DEFAULT false,
  appointment_details JSONB,
  callback_requested BOOLEAN NOT NULL DEFAULT false,
  voicemail_left BOOLEAN NOT NULL DEFAULT false,
  external_call_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  key TEXT NOT NULL,
  value_encrypted TEXT,
  value_json JSONB,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, key)
);

-- Indexes for operational query paths
CREATE INDEX IF NOT EXISTS idx_leads_status_created_at ON public.leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up_at ON public.leads (next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_staff ON public.leads (assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers (full_name);
CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON public.appointments (starts_at);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_due ON public.tasks (assigned_to, due_at);
CREATE INDEX IF NOT EXISTS idx_activities_lead_created ON public.activities (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_tasks_status_schedule ON public.call_tasks (status, scheduled_call_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_publish ON public.blog_posts (status, scheduled_publish_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_status_schedule ON public.social_posts (status, scheduled_at);

-- updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'customers','properties','leads','jobs','appointments','notes','estimates','tasks',
    'blog_posts','social_posts','call_scripts','call_tasks','integration_settings'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_%s_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER set_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t, t);
  END LOOP;
END $$;

-- Default follow-up call task creation for new leads with a phone number
CREATE OR REPLACE FUNCTION public.create_call_task_for_new_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.phone IS NOT NULL AND length(trim(NEW.phone)) > 0 THEN
    INSERT INTO public.call_tasks (lead_id, phone_number, status, scheduled_call_at)
    VALUES (NEW.id, NEW.phone, 'queued', now());
  END IF;

  INSERT INTO public.activities (lead_id, activity_type, summary, metadata)
  VALUES (
    NEW.id,
    'lead_created',
    'Lead created from public form',
    jsonb_build_object(
      'source', NEW.source,
      'service_requested', NEW.service_requested,
      'urgency', NEW.urgency
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_call_task_for_new_lead ON public.leads;
CREATE TRIGGER trg_create_call_task_for_new_lead
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.create_call_task_for_new_lead();

-- Enable RLS and apply default role-based policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Public lead insert only (website forms)
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(full_name) BETWEEN 2 AND 120
  AND (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  AND (phone IS NULL OR length(phone) BETWEEN 7 AND 30)
  AND length(source) BETWEEN 2 AND 120
);

DROP POLICY IF EXISTS "Public can insert activities for own lead events" ON public.activities;
CREATE POLICY "Public can insert activities for own lead events"
ON public.activities FOR INSERT
TO anon, authenticated
WITH CHECK (activity_type IN ('lead_created', 'form_submission'));

-- Staff access
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'customers','properties','leads','jobs','appointments','notes','activities',
    'estimates','tasks','blog_posts','social_posts','call_tasks','call_scripts','integration_settings'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Staff can read %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Staff can read %s" ON public.%I FOR SELECT TO authenticated USING (public.is_staff(auth.uid()))', t, t);

    EXECUTE format('DROP POLICY IF EXISTS "Office staff and admin can manage %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Office staff and admin can manage %s" ON public.%I FOR ALL TO authenticated USING (public.has_any_role(auth.uid(), ARRAY[''admin'', ''office_staff'']::public.app_role[])) WITH CHECK (public.has_any_role(auth.uid(), ARRAY[''admin'', ''office_staff'']::public.app_role[]))', t, t);

    EXECUTE format('DROP POLICY IF EXISTS "Tech can update %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Tech can update %s" ON public.%I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), ''tech'')) WITH CHECK (public.has_role(auth.uid(), ''tech''))', t, t);
  END LOOP;
END $$;

-- Tighten integration settings to admin only
DROP POLICY IF EXISTS "Office staff and admin can manage integration_settings" ON public.integration_settings;
CREATE POLICY "Admins can manage integration_settings"
ON public.integration_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Tech can update integration_settings" ON public.integration_settings;

-- ElevenLabs placeholder default row key suggestions (manual secrets injection)
INSERT INTO public.integration_settings (provider, key, value_json, active)
VALUES
  ('elevenlabs', 'api_base_url', jsonb_build_object('value', 'https://api.elevenlabs.io'), true),
  ('elevenlabs', 'webhook_signing_secret', NULL, false),
  ('elevenlabs', 'agent_id', NULL, false)
ON CONFLICT (provider, key) DO NOTHING;
