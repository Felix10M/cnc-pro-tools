-- Run in Supabase SQL Editor AFTER server/admin-setup.sql.
-- Checks the signed-in user's UID, never an email from the browser.
create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.app_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_app_admin() from public, anon;
grant execute on function public.is_app_admin() to authenticated;
