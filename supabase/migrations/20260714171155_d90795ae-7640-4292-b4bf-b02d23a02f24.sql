
-- 1. Set fixed search_path on definer functions that lack it
alter function public.delete_email(text, bigint) set search_path = '';
alter function public.move_to_dlq(text, text, bigint, jsonb) set search_path = '';
alter function public.read_email_batch(text, integer, integer) set search_path = '';
alter function public.enqueue_email(text, jsonb) set search_path = '';

-- 2. Revoke EXECUTE on internal SECURITY DEFINER helpers from public API roles.
--    These are only meant to be called by triggers / edge functions using service_role.
revoke execute on function public.email_queue_wake() from public, anon, authenticated;
revoke execute on function public.email_queue_dispatch() from public, anon, authenticated;
revoke execute on function public.delete_email(text, bigint) from public, anon, authenticated;
revoke execute on function public.move_to_dlq(text, text, bigint, jsonb) from public, anon, authenticated;
revoke execute on function public.read_email_batch(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.enqueue_email(text, jsonb) from public, anon, authenticated;
-- has_role is used inside RLS policies; keep it callable by authenticated but not by anon
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;

-- 3. Hide author_email column from anon and authenticated on blog_comments.
--    RLS still allows row reads of approved comments, but the email column is no longer selectable.
revoke select (author_email) on public.blog_comments from anon, authenticated;

-- 4. Provide an admin-only RPC that returns full comments (including email) for moderation.
create or replace function public.admin_list_blog_comments()
returns setof public.blog_comments
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_role(auth.uid(), 'admin'::public.app_role) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  return query select * from public.blog_comments order by created_at desc;
end;
$$;

revoke execute on function public.admin_list_blog_comments() from public, anon;
grant execute on function public.admin_list_blog_comments() to authenticated;
