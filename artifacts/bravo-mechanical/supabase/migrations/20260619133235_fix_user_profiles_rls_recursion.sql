-- Fix infinite recursion in user_profiles RLS.
-- Root cause: the "Admins can manage all profiles" policy runs a subquery
-- against user_profiles, which re-triggers the same policy -> recursion.
-- Solution: SECURITY DEFINER helper functions that read the role while
-- bypassing RLS, then reference them from the policies.

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'::public.user_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.auth_user_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Rewrite the recursive policy to use the helper (no self-select).
ALTER POLICY "Admins can manage all profiles" ON public.user_profiles
  USING (public.is_admin());

-- Rewrite the leads management policy to avoid evaluating user_profiles RLS
-- inline (also future-proofs it against recursion).
ALTER POLICY "Non-technician users can manage leads" ON public.leads
  USING (
    auth.uid() IS NOT NULL
    AND public.auth_user_role() IS NOT NULL
    AND public.auth_user_role() <> 'technician'::public.user_role
  );
