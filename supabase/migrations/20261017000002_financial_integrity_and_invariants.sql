-- ==============================================================================
-- Migration: 20261017000002_financial_integrity_and_invariants.sql
-- Description:
-- 1. Adds check constraint on public.plans to guarantee that total monthly
--    commitment (fixed + future + weekly flexible normalized by 52/12)
--    never exceeds declared monthly income.
-- 2. Upgrades complete_onboarding RPC function with strict cross-field validation.
-- 3. Adds server-enforced convert_wait_item RPC function ensuring items cannot
--    be bought before unlock_at has elapsed.
-- 4. Rollback notes provided at bottom.
-- ==============================================================================

-- 1. Table-level Check Constraint on public.plans
-- Normalization: weekly_flexible * 52 / 12 (using integer ceiling math)
alter table public.plans
  drop constraint if exists check_plan_commitment_within_income;

alter table public.plans
  add constraint check_plan_commitment_within_income
  check (
    (home_fixed_monthly_cents + future_fund_monthly_cents + 
     ceil((essentials_limit_cents + fun_limit_cents) * 52.0 / 12.0)::integer) <= monthly_flexible_income_cents
  );

-- 2. Atomic complete_onboarding RPC with validation
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
  v_total_commitment integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Validate inputs are non-negative
  if p_essentials_cents < 0 or p_fun_cents < 0 or p_home_fixed_cents < 0 or 
     p_future_fund_cents < 0 or p_monthly_flexible_income_cents < 100 then
    raise exception 'Invalid amounts: all values must be non-negative and income >= 100 cents';
  end if;

  -- Validate allocation invariant: Protected + (Weekly * 52/12) <= Monthly Income
  v_total_commitment := p_home_fixed_cents + p_future_fund_cents + 
                        ceil((p_essentials_cents + p_fun_cents) * 52.0 / 12.0)::integer;

  if v_total_commitment > p_monthly_flexible_income_cents then
    raise exception 'Plan overallocated: commitments (% cents) exceed declared monthly income (% cents)',
      v_total_commitment, p_monthly_flexible_income_cents;
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

-- 3. Atomic convert_wait_item RPC enforcing 24h cooling server-side
create or replace function public.convert_wait_item(
  p_wait_id uuid,
  p_client_mutation_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_item public.wait_items%rowtype;
  v_tx_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_item
  from public.wait_items
  where id = p_wait_id and user_id = v_user_id;

  if not found then
    raise exception 'Wait item not found or unauthorized';
  end if;

  if v_item.status != 'waiting' then
    raise exception 'Item is not in waiting status';
  end if;

  -- Verify cooling period against server time
  if now() < v_item.unlock_at then
    raise exception 'Cooling period has not elapsed: item unlocks at %', v_item.unlock_at;
  end if;

  -- Create transaction
  insert into public.transactions (
    user_id,
    amount_cents,
    envelope,
    label,
    source,
    client_mutation_id
  ) values (
    v_user_id,
    v_item.amount_cents,
    v_item.envelope,
    v_item.label,
    'waitlist',
    p_client_mutation_id
  ) returning id into v_tx_id;

  -- Update wait item status to converted
  update public.wait_items
  set status = 'converted'
  where id = p_wait_id;

  return jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'wait_id', p_wait_id
  );
end;
$$;

-- Grant execution permissions
grant execute on function public.complete_onboarding(integer, integer, integer, integer, integer, integer) to authenticated;
grant execute on function public.convert_wait_item(uuid, text) to authenticated;

notify pgrst, 'reload schema';

-- ==============================================================================
-- ROLLBACK NOTES:
-- alter table public.plans drop constraint if exists check_plan_commitment_within_income;
-- drop function if exists public.convert_wait_item(uuid, text);
-- (Revert complete_onboarding to unconstrained version in 20261016000000_initial_schema.sql)
-- ==============================================================================
