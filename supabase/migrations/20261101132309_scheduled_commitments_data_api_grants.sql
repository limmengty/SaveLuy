-- The app uses the authenticated Data API to list, create, and deactivate
-- scheduled commitments. Row ownership remains enforced by the table's RLS
-- policy from 20261018000000_dual_currency_and_horizon.sql.
grant select, insert, update
  on table public.scheduled_commitments
  to authenticated;

notify pgrst, 'reload schema';
