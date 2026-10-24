-- Subscriptions table for Subscription Sniper
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  service_name text not null,
  cost numeric(10,2) not null check (cost >= 0),
  billing_cycle text not null check (billing_cycle in ('Monthly', 'Annual')),
  next_billing_date date not null,
  is_trial boolean not null default false,
  category text not null check (category in ('Entertainment', 'Productivity', 'Utilities', 'Health')),
  created_at timestamptz not null default now()
);

-- Row Level Security: each user only sees their own rows
alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Table privileges for the logged-in role and the backend
grant select, insert, update, delete on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;

notify pgrst, 'reload schema';
