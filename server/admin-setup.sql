-- CNC Pro Tools: administrator privileges. Run once in Supabase SQL Editor as project owner.
-- SECURITY: authorization is based on auth.users.id, never on an email supplied by a browser.
create table if not exists public.app_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 granted_at timestamptz not null default now()
);
alter table public.app_admins enable row level security;
revoke all on public.app_admins from anon, authenticated;
-- No client policies: only service_role/server-side code may read or change administrators.
-- Grant only to an existing, confirmed account with the exact email below.
insert into public.app_admins(user_id)
select id from auth.users
where lower(email) = lower('Felixmihaes@yahoo.com') and email_confirmed_at is not null
on conflict (user_id) do nothing;
-- Verify that exactly one row is returned before assuming the grant succeeded.
select u.id, u.email, a.granted_at
from public.app_admins a join auth.users u on u.id = a.user_id
where lower(u.email) = lower('Felixmihaes@yahoo.com');
