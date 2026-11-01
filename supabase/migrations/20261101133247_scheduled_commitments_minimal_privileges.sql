-- Remove the project's broad default table grants for this user-owned table.
-- RLS then limits authenticated reads and writes to the caller's own rows.
revoke all privileges
  on table public.scheduled_commitments
  from anon, authenticated, service_role;

-- The app lists, creates, and deactivates commitments. Deactivation is UPDATE;
-- it does not need row deletion or server-role access.
grant select, insert, update
  on table public.scheduled_commitments
  to authenticated;

notify pgrst, 'reload schema';
