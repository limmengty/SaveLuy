-- ==============================================================================
-- BrokeNoMore Schema: Complete Clean & Re-migration Specification
-- Run this script in Supabase Dashboard > SQL Editor
-- Project Reference: tfjqwsjisvxbcdqoacbs
-- 
-- 1. Drops legacy objects cleanly with cascade
-- 2. Creates all tables with proper types, check constraints, and RLS
-- 3. Deploys all 4 atomic RPC commands (ensure_profile, complete_onboarding,
--    log_expense, reverse_transaction) with security definer and search_path
-- 4. Grants execute rights to authenticated role and reloads schema cache
-- ==============================================================================

-- Enable uuid extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- CLEAN SLATE: DROP EXISTING FUNCTIONS, TRIGGERS & TABLES IN DEPENDENCY ORDER
-- ------------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.ensure_profile() cascade;
drop function if exists public.complete_onboarding(integer, integer, integer, integer, integer, integer) cascade;
drop function if exists public.log_expense(integer, text, text, text) cascade;
drop function if exists public.reverse_transaction(uuid) cascade;

drop table if exists public.audit_events cascade;
drop table if exists public.weekly_reviews cascade;
drop table if exists public.wait_items cascade;
drop table if exists public.quick_actions cascade;
drop table if exists public.transactions cascade;
drop table if exists public.plan_periods cascade;
drop table if exists public.plans cascade;
drop table if exists public.user_preferences cascade;
drop table if exists public.profiles cascade;

-- ------------------------------------------------------------------------------
-- 1. PROFILES & USER PREFERENCES
-- ------------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  locale text default 'en-KH' not null,
  onboarding_completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.user_preferences (
  user_id uuid references auth.users on delete cascade primary key,
  voice text default 'calm' not null check (voice in ('calm', 'straight')),
  locale text default 'en-KH' not null check (locale in ('en-KH', 'km-KH')),
  currency text default 'USD' not null check (currency in ('USD', 'KHR')),
  theme text default 'dark' not null check (theme in ('dark', 'light', 'system')),
  reduced_motion boolean default false not null,
  week_starts_on integer default 1 not null check (week_starts_on between 0 and 6),
  updated_at timestamptz default now() not null
);

-- ------------------------------------------------------------------------------
-- 2. PLANS & PLAN PERIODS
-- ------------------------------------------------------------------------------
create table public.plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  essentials_limit_cents integer not null check (essentials_limit_cents >= 0),
  fun_limit_cents integer not null check (fun_limit_cents >= 0),
  home_fixed_monthly_cents integer not null check (home_fixed_monthly_cents >= 0),
  future_fund_monthly_cents integer not null check (future_fund_monthly_cents >= 0),
  monthly_flexible_income_cents integer not null check (monthly_flexible_income_cents >= 0),
  monthly_work_hours integer not null default 160 check (monthly_work_hours > 0),
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create unique index idx_plans_user_active on public.plans(user_id) where (is_active = true);

create table public.plan_periods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plan_id uuid references public.plans on delete cascade not null,
  start_date date not null,
  end_date date not null,
  weekly_flexible_limit_cents integer not null,
  spent_cents integer default 0 not null,
  is_closed boolean default false not null,
  created_at timestamptz default now() not null
);

create index idx_plan_periods_user_closed on public.plan_periods(user_id, is_closed);

-- ------------------------------------------------------------------------------
-- 3. TRANSACTIONS
-- ------------------------------------------------------------------------------
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  period_id uuid references public.plan_periods on delete set null,
  client_mutation_id text unique,
  amount_cents integer not null check (amount_cents > 0),
  envelope text not null check (envelope in ('essentials', 'fun')),
  label text not null,
  source text default 'manual' not null,
  reversed boolean default false not null,
  reverses_transaction_id uuid references public.transactions(id) on delete set null,
  created_at timestamptz default now() not null
);

create index idx_transactions_user_date on public.transactions(user_id, created_at desc);

-- ------------------------------------------------------------------------------
-- 4. QUICK ACTIONS
-- ------------------------------------------------------------------------------
create table public.quick_actions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  label text not null,
  emoji text not null,
  amount_cents integer not null check (amount_cents > 0),
  envelope text not null check (envelope in ('essentials', 'fun')),
  display_order integer default 0 not null,
  created_at timestamptz default now() not null
);

create index idx_quick_actions_user_order on public.quick_actions(user_id, display_order);

-- ------------------------------------------------------------------------------
-- 5. WAIT ITEMS
-- ------------------------------------------------------------------------------
create table public.wait_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  label text not null,
  amount_cents integer not null check (amount_cents > 0),
  envelope text not null check (envelope in ('essentials', 'fun')),
  unlock_at timestamptz not null,
  status text default 'waiting' not null check (status in ('waiting', 'converted', 'dismissed')),
  created_at timestamptz default now() not null
);

create index idx_wait_items_user_status on public.wait_items(user_id, status);

-- ------------------------------------------------------------------------------
-- 6. WEEKLY REVIEWS
-- ------------------------------------------------------------------------------
create table public.weekly_reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  period_id uuid references public.plan_periods on delete cascade not null,
  planned_cents integer not null,
  spent_cents integer not null,
  remainder_cents integer not null,
  action text not null check (action in ('future', 'carry', 'leave')),
  created_at timestamptz default now() not null
);

create index idx_weekly_reviews_user on public.weekly_reviews(user_id, created_at desc);

-- ------------------------------------------------------------------------------
-- 7. AUDIT EVENTS
-- ------------------------------------------------------------------------------
create table public.audit_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  event_type text not null,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null
);

create index idx_audit_events_user_time on public.audit_events(user_id, created_at desc);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.plans enable row level security;
alter table public.plan_periods enable row level security;
alter table public.transactions enable row level security;
alter table public.quick_actions enable row level security;
alter table public.wait_items enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.audit_events enable row level security;

create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can manage own preferences" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own plans" on public.plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own plan periods" on public.plan_periods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own transactions" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own quick actions" on public.quick_actions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own wait items" on public.wait_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own weekly reviews" on public.weekly_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can view own audit events" on public.audit_events
  for select using (auth.uid() = user_id);

create policy "Users can insert own audit events" on public.audit_events
  for insert with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- AUTH TRIGGER & NEW USER BOOTSTRAP
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'BrokeNoMore User'),
    new.raw_user_meta_data->>'avatar_url',
    'en-KH'
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id, voice, locale, currency)
  values (new.id, 'calm', 'en-KH', 'USD')
  on conflict (user_id) do nothing;

  -- Default Quick Actions
  insert into public.quick_actions (user_id, label, emoji, amount_cents, envelope, display_order)
  values
    (new.id, 'Coffee', '☕', 150, 'fun', 1),
    (new.id, 'Meal', '🍜', 250, 'essentials', 2),
    (new.id, 'Transport', '🛺', 300, 'essentials', 3),
    (new.id, 'Drink', '🧃', 200, 'fun', 4),
    (new.id, 'Groceries', '🥬', 500, 'essentials', 5)
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- ATOMIC RPC COMMANDS (CALLED BY SUPABASE-SERVICE)
-- ------------------------------------------------------------------------------

-- 1. Ensure Profile Helper (RPC)
create or replace function public.ensure_profile()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  profile_record public.profiles%rowtype;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into profile_record from public.profiles where id = current_user_id;

  if not found then
    insert into public.profiles (id, email, display_name)
    values (current_user_id, auth.jwt()->>'email', 'BrokeNoMore User')
    returning * into profile_record;

    insert into public.user_preferences (user_id, voice, locale, currency)
    values (current_user_id, 'calm', 'en-KH', 'USD')
    on conflict do nothing;
  end if;

  return to_jsonb(profile_record);
end;
$$;

-- 2. Complete Onboarding (RPC)
create or replace function public.complete_onboarding(
  p_essentials_cents integer,
  p_fun_cents integer,
  p_home_fixed_cents integer,
  p_future_fund_cents integer,
  p_monthly_flexible_income_cents integer,
  p_monthly_work_hours integer default 160
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Deactivate previous active plans if any
  update public.plans
  set is_active = false
  where user_id = v_user_id and is_active = true;

  -- Create new active plan
  insert into public.plans (
    user_id,
    essentials_limit_cents,
    fun_limit_cents,
    home_fixed_monthly_cents,
    future_fund_monthly_cents,
    monthly_flexible_income_cents,
    monthly_work_hours,
    is_active
  ) values (
    v_user_id,
    p_essentials_cents,
    p_fun_cents,
    p_home_fixed_cents,
    p_future_fund_cents,
    p_monthly_flexible_income_cents,
    p_monthly_work_hours,
    true
  ) returning id into v_plan_id;

  -- Mark profile onboarding completed
  update public.profiles
  set onboarding_completed_at = now(), updated_at = now()
  where id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'plan_id', v_plan_id,
    'completed_at', now()
  );
end;
$$;

-- 3. Log Expense (RPC)
create or replace function public.log_expense(
  p_amount_cents integer,
  p_envelope text,
  p_label text,
  p_client_mutation_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_tx_id uuid;
  v_created_at timestamptz;
  v_existing public.transactions%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_envelope not in ('essentials', 'fun') then
    raise exception 'Invalid envelope: %', p_envelope;
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Amount must be positive';
  end if;

  -- Idempotency check via client_mutation_id
  if p_client_mutation_id is not null then
    select * into v_existing
    from public.transactions
    where client_mutation_id = p_client_mutation_id and user_id = v_user_id;

    if found then
      return jsonb_build_object(
        'transaction_id', v_existing.id,
        'created_at', v_existing.created_at,
        'idempotent', true
      );
    end if;
  end if;

  insert into public.transactions (
    user_id,
    client_mutation_id,
    amount_cents,
    envelope,
    label
  ) values (
    v_user_id,
    p_client_mutation_id,
    p_amount_cents,
    p_envelope,
    p_label
  ) returning id, created_at into v_tx_id, v_created_at;

  return jsonb_build_object(
    'transaction_id', v_tx_id,
    'created_at', v_created_at,
    'idempotent', false
  );
end;
$$;

-- 4. Reverse Transaction (RPC)
create or replace function public.reverse_transaction(
  p_transaction_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_original public.transactions%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_original
  from public.transactions
  where id = p_transaction_id and user_id = v_user_id;

  if not found then
    raise exception 'Transaction not found or not owned by user';
  end if;

  if v_original.reversed then
    return jsonb_build_object('success', true, 'already_reversed', true);
  end if;

  update public.transactions
  set reversed = true
  where id = p_transaction_id and user_id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'reversed_id', p_transaction_id
  );
end;
$$;

-- ------------------------------------------------------------------------------
-- GRANT PERMISSIONS & RELOAD SCHEMA CACHE
-- ------------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

grant execute on function public.ensure_profile to authenticated;
grant execute on function public.complete_onboarding to authenticated;
grant execute on function public.log_expense to authenticated;
grant execute on function public.reverse_transaction to authenticated;

notify pgrst, 'reload schema';
