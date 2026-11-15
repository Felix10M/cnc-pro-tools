-- Run in Supabase SQL editor. Never expose service_role credentials in browser.
create table if not exists public.billing_customers (
 user_id uuid primary key references auth.users(id) on delete cascade,
 stripe_customer_id text unique not null
);
create table if not exists public.billing_subscriptions (
 user_id uuid primary key references auth.users(id) on delete cascade,
 stripe_subscription_id text unique not null,
 status text not null,
 current_period_end timestamptz,
 updated_at timestamptz not null default now()
);
alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
create policy "read own subscription" on public.billing_subscriptions for select to authenticated using (auth.uid() = user_id);
-- No client write policies. Only server service role can update billing records.
