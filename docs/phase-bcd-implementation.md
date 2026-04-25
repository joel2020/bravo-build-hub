# Phase B/C/D Implementation (Auth + Dashboard + Files)

## What was verified first
- Public website routes and pages remain intact.
- Existing contact/rebate lead capture writes to Supabase.
- Existing auth was mixed sign-in/sign-up and comment-admin focused.
- Existing migration had CRM tables but no dashboard UI routes and no file metadata/upload workflow.

## What this batch adds
- Invite-only login flow (sign-in only) at `/auth`.
- Route protection + role-aware access for `/dashboard/*`.
- First usable CRM routes/screens:
  - `/dashboard`
  - `/dashboard/leads`, `/dashboard/leads/:id`
  - `/dashboard/customers`, `/dashboard/customers/:id`
  - `/dashboard/jobs`, `/dashboard/jobs/:id`
  - `/dashboard/calendar`
  - `/dashboard/content`
  - `/dashboard/settings`
- Tech photo workflow on job detail:
  - camera/mobile friendly upload
  - photo type + caption
  - gallery with signed URLs
- New migration for role alignment (`office`, `marketing`) and file metadata/storage policy setup.

## Manual setup notes
1. Apply migration `20260422113000_dashboard_auth_files.sql`.
2. Ensure users are created in Supabase Auth by admin only.
3. Assign roles in `public.user_roles` (`admin`, `office`, `tech`, `marketing`; `office_staff` still supported).
4. Verify storage buckets exist: `job-photos`, `customer-files`.
5. Test as tech user: open job -> upload photo -> see gallery.

## Current known limits
- User management UI is read-focused (role list + instructions), not a full invite workflow yet.
- Customer file upload UI is scaffolded at DB/storage level; direct UI uploader is still pending.
- Several tables are queried with permissive TS casts and should be replaced with regenerated Supabase types.
