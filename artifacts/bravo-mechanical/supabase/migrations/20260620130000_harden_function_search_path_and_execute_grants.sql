-- =====================================================================
-- Follow-up production hardening: resolve the remaining Supabase security
-- advisor WARNINGs left after 20260620120000_harden_crm_rls_production_security.
--
-- Two classes of finding are addressed here:
--
-- 1. function_search_path_mutable
--    Several pre-existing helper/trigger functions were created without a
--    pinned search_path. A mutable search_path lets a caller who can set
--    `search_path` shadow built-in objects and influence what the function
--    resolves. Pinning `search_path = public` (the schema these functions
--    actually use) closes that and is behaviour-preserving.
--
-- 2. anon/authenticated SECURITY DEFINER function executable
--    Supabase grants EXECUTE on every public function to `anon` and
--    `authenticated` by default. For our SECURITY DEFINER functions that is
--    broader than intended:
--      * handle_new_user() is a trigger function only. It never needs to be
--        callable as an RPC by anyone -- the trigger fires as the table
--        owner regardless of EXECUTE grants -- so EXECUTE is revoked from
--        PUBLIC/anon/authenticated entirely.
--      * The role-check helpers (auth_user_role, is_admin, is_crm_admin,
--        is_crm_staff) and the first-admin bootstrap are only ever called
--        from authenticated contexts (RLS policies / signed-in setup). The
--        anonymous role has no legitimate reason to call them, so EXECUTE is
--        revoked from anon while authenticated/service_role keep it.
--
-- Note: EXECUTE on the number-generator functions (generate_* ) is left
-- untouched, because the public (anon) website lead-form insert path can
-- reach them via table triggers.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Pin search_path on the flagged functions (all are zero-argument).
-- ---------------------------------------------------------------------
ALTER FUNCTION public.generate_agreement_number()  SET search_path = public;
ALTER FUNCTION public.generate_estimate_number()   SET search_path = public;
ALTER FUNCTION public.generate_invoice_number()    SET search_path = public;
ALTER FUNCTION public.generate_job_number()        SET search_path = public;
ALTER FUNCTION public.update_invoice_paid_amount() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column()   SET search_path = public;
ALTER FUNCTION public.handle_new_user()            SET search_path = public;

-- ---------------------------------------------------------------------
-- 2a. handle_new_user is a trigger function only -- never an RPC.
-- ---------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- ---------------------------------------------------------------------
-- 2b. SECURITY DEFINER helpers: the anonymous role has no business
--     calling these. Keep authenticated (RLS / signed-in setup) and
--     service_role.
-- ---------------------------------------------------------------------
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'auth_user_role','is_admin','is_crm_admin','is_crm_staff','bootstrap_first_admin'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = fn
    ) THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I() FROM anon', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I() TO authenticated', fn);
    END IF;
  END LOOP;
END $$;
