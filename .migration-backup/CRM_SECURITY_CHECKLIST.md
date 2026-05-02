# CRM Security Checklist

Use this checklist before each production deployment of the CRM at `app.bravomechanicalny.com`.

## Supabase RLS and auth checks

- [ ] **Anonymous can insert leads only**
  - Confirm `anon` role has `INSERT` policy on `leads`.
  - Confirm no `UPDATE`, `DELETE`, or broad `SELECT` policies exist for `anon` on `leads`.

- [ ] **Anonymous cannot read sensitive CRM tables**
  - Confirm `anon` role has no read access to:
    - `leads`
    - `jobs`
    - `invoices`
    - `follow_ups`
    - `activity_log`
    - `user_roles`

- [ ] **Authenticated CRM access requires user_roles membership**
  - Confirm RLS policies for CRM data enforce a `user_roles` row check for `auth.uid()`.
  - Confirm unauthorized authenticated users receive access denied behavior in UI.

- [ ] **Service role key is not exposed client-side**
  - Verify Vercel frontend env vars do **not** include `SUPABASE_SERVICE_ROLE_KEY`.
  - Verify browser bundle only uses publishable anon credentials.

## Supabase Auth URL configuration

- [ ] **Site URL** is set to:
  - `https://app.bravomechanicalny.com`

- [ ] **Redirect URLs** include:
  - `https://app.bravomechanicalny.com/auth`
  - `https://app.bravomechanicalny.com/admin/crm`
  - `https://bravomechanicalny.com/auth`
  - `https://bravomechanicalny.com/admin/crm`

## Deployment sanity checks

- [ ] CRM/auth pages are marked `noindex`.
- [ ] Public marketing homepage remains available on `https://bravomechanicalny.com`.
- [ ] App subdomain route `/` sends users to `/admin/crm`.
