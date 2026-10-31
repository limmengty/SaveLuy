-- ==============================================================================
-- Migration: 20261018000000_dual_currency_and_horizon.sql
-- Description:
-- 1. Adds dual-currency tracking columns to public.transactions:
--    - input_currency (USD or KHR)
--    - exchange_rate_snapshot (historical rate applied)
--    - raw_khr_amount (original riel amount when logged via KHR or Bakong QR)
-- 2. Upgrades log_expense RPC to record dual-currency metadata.
-- 3. Creates public.scheduled_commitments table with RLS and index for
--    event-driven bill horizon baseline protection.
-- ==============================================================================

-- 1. Dual-Currency metadata on transactions table
alter table public.transactions
  add column if not exists input_currency varchar(3) default 'USD',
  add column if not exists exchange_rate_snapshot numeric(10, 2) default 4000.00,
  add column if not exists raw_khr_amount bigint;

-- Update log_expense RPC to support dual-currency parameters
create or replace function public.log_expense(
  p_amount_cents integer,
  p_envelope text,
  p_label text,
  p_client_mutation_id text default null,
  p_input_currency text default 'USD',
  p_exchange_rate_snapshot numeric default 4000.00,
  p_raw_khr_amount bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_period_id uuid;
  v_tx_id uuid;
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

  -- Idempotency check: if client_mutation_id already exists, return existing
  if p_client_mutation_id is not null then
    select id into v_tx_id
    from public.transactions
    where user_id = v_user_id and client_mutation_id = p_client_mutation_id
    limit 1;

    if v_tx_id is not null then
      return jsonb_build_object('id', v_tx_id, 'status', 'idempotent_duplicate');
    end if;
  end if;

  -- Locate current open plan period
  select id into v_period_id
  from public.plan_periods
  where user_id = v_user_id and is_closed = false
  order by start_date desc
  limit 1;

  insert into public.transactions (
    user_id,
    plan_period_id,
    amount_cents,
    envelope,
    label,
    client_mutation_id,
    input_currency,
    exchange_rate_snapshot,
    raw_khr_amount
  ) values (
    v_user_id,
    v_period_id,
    p_amount_cents,
    p_envelope,
    coalesce(nullif(trim(p_label), ''), case when p_envelope = 'fun' then 'Fun purchase' else 'Essentials purchase' end),
    p_client_mutation_id,
    coalesce(p_input_currency, 'USD'),
    coalesce(p_exchange_rate_snapshot, 4000.00),
    p_raw_khr_amount
  )
  returning id into v_tx_id;

  return jsonb_build_object('id', v_tx_id, 'status', 'created');
end;
$$;

-- 2. Scheduled Commitments table for dynamic horizon protection
create table if not exists public.scheduled_commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null check (char_length(trim(label)) > 0),
  amount_cents integer not null check (amount_cents > 0),
  due_day_of_month integer not null check (due_day_of_month >= 1 and due_day_of_month <= 31),
  category text default 'other' check (category in ('housing', 'utilities', 'family', 'subscription', 'other')),
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.scheduled_commitments enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users manage own scheduled commitments" on public.scheduled_commitments;

-- RLS policy: users have full CRUD on their own scheduled commitments
create policy "Users manage own scheduled commitments"
  on public.scheduled_commitments
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Performance index
create index if not exists idx_scheduled_commitments_user_due
  on public.scheduled_commitments(user_id, due_day_of_month)
  where is_active = true;
