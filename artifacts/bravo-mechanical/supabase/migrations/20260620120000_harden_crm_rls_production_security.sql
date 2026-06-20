-- =====================================================================
-- Production security hardening for the CRM.
--
-- Problem this fixes
-- ------------------
-- Earlier "compat bridge" migrations opened almost every CRM table with
-- blanket policies of the form `FOR ALL TO authenticated USING (true)`.
-- Combined with open self-signup on /auth, that meant ANY authenticated
-- user could:
--   * grant themselves the `admin` role (write to public.user_roles), and
--   * read/write every customer, job, invoice and message in the system.
-- Two tables (job_parts, part_suggestions) shipped with no RLS at all.
--
-- Fix
-- ---
-- Re-scope every CRM table to role-based policies backed by the existing
-- `user_roles` table:
--   * staff (role 'admin' OR 'user') get read/write on operational data,
--   * only 'admin' can delete core financial/customer records, manage
--     technicians, edit settings, and manage user_roles,
--   * the public marketing lead form keeps its anonymous INSERT on leads.
--
-- This is SAFE to apply against the live data: the CRM UI (src/pages/CRM.tsx)
-- already refuses to render for anyone without an 'admin'/'user' row in
-- user_roles, so every current operator already satisfies these policies.
-- The only access being removed is the access that should never have
-- existed (no-role authenticated users and the public anon key).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper predicates. SECURITY DEFINER so they read user_roles regardless
-- of the caller's own RLS, STABLE so the planner can cache them per query.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_crm_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'user')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_crm_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_crm_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_crm_admin() TO authenticated;

-- ---------------------------------------------------------------------
-- Generic re-scoping. For each operational table: drop EVERY existing
-- policy (so no leftover `USING (true)` policy can OR its way back in),
-- enable RLS, then apply a clean staff/admin policy set.
--
-- `admin_delete` controls whether DELETE is admin-only (core records) or
-- allowed for any staff member (disposable operational rows).
-- ---------------------------------------------------------------------
DO $$
DECLARE
  tbl   text;
  pol   record;
  -- tables where DELETE must be admin-only
  admin_delete_tables text[] := ARRAY['leads','jobs','invoices','follow_ups'];
  -- every operational table that staff may read/write
  staff_tables text[] := ARRAY[
    'leads','jobs','invoices','follow_ups','activity_logs','job_photos',
    'crm_notifications','review_requests','job_parts','part_suggestions'
  ];
  is_admin_delete boolean;
BEGIN
  FOREACH tbl IN ARRAY staff_tables LOOP
    -- Skip tables that don't exist in this database.
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      CONTINUE;
    END IF;

    -- Drop every existing AUTHENTICATED-facing policy so no leftover
    -- `USING (true)` policy can OR its way back in. Policies that grant the
    -- `anon` role are preserved untouched (the public website lead form posts
    -- with the anonymous key and must keep working).
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl
        AND NOT ('anon' = ANY(roles))
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    is_admin_delete := tbl = ANY(admin_delete_tables);

    EXECUTE format(
      'CREATE POLICY "staff_select_%1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.is_crm_staff())', tbl);
    EXECUTE format(
      'CREATE POLICY "staff_insert_%1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.is_crm_staff())', tbl);
    EXECUTE format(
      'CREATE POLICY "staff_update_%1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.is_crm_staff()) WITH CHECK (public.is_crm_staff())', tbl);

    IF is_admin_delete THEN
      EXECUTE format(
        'CREATE POLICY "admin_delete_%1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.is_crm_admin())', tbl);
    ELSE
      EXECUTE format(
        'CREATE POLICY "staff_delete_%1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.is_crm_staff())', tbl);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- leads: restore the public marketing-form INSERT for the anon role.
-- (The generic block above scoped leads to staff; the website lead form
-- posts with the anonymous publishable key and must keep working.)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_insert_leads" ON public.leads;
CREATE POLICY "anon_insert_leads"
  ON public.leads FOR INSERT TO anon
  WITH CHECK (true);

-- ---------------------------------------------------------------------
-- settings + technicians: staff may read, only admins may write.
-- ---------------------------------------------------------------------
DO $$
DECLARE tbl text; pol record;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['settings','technicians'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN CONTINUE; END IF;

    FOR pol IN SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl
        AND NOT ('anon' = ANY(roles))
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "staff_select_%1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.is_crm_staff())', tbl);
    EXECUTE format('CREATE POLICY "admin_insert_%1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.is_crm_admin())', tbl);
    EXECUTE format('CREATE POLICY "admin_update_%1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.is_crm_admin()) WITH CHECK (public.is_crm_admin())', tbl);
    EXECUTE format('CREATE POLICY "admin_delete_%1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.is_crm_admin())', tbl);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- user_roles: the privilege table. Self-read + admin-read; admin-only
-- writes. This is the policy that closes the privilege-escalation hole.
-- ---------------------------------------------------------------------
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles'
      AND NOT ('anon' = ANY(roles))
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_self_or_admin_select"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_crm_admin());

CREATE POLICY "user_roles_admin_insert"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_crm_admin());

CREATE POLICY "user_roles_admin_update"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.is_crm_admin()) WITH CHECK (public.is_crm_admin());

CREATE POLICY "user_roles_admin_delete"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_crm_admin());

-- ---------------------------------------------------------------------
-- First-admin bootstrap. With writes locked to admins, a brand-new
-- project would have no way to mint its first admin. This SECURITY
-- DEFINER function lets a signed-in user claim the admin role ONLY while
-- zero admins exist; once one exists it refuses, so it cannot be abused
-- for escalation.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'An admin already exists; ask an existing admin to grant you access.';
  END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;
