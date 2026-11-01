# Production Deployment Plan

**Scope:** Apple HIG-aligned web design migration and the existing dual-currency / scheduled-commitments database migration.
**Status:** App deployments completed and database migrations applied on 2026-11-01. Authenticated end-to-end and cross-user RLS smoke tests remain outstanding.
**Date:** 2026-11-01

## Release contents

- App changes in this branch: grouped light/dark surfaces, semantic Apple-inspired
  color roles, typography and list primitives, responsive app shell, accessible
  loading states, bilingual copy, and chart/UI updates.
- Existing database migration in the repository:
  `supabase/migrations/20261018000000_dual_currency_and_horizon.sql`. It adds
  currency metadata to transactions, updates `log_expense`, and creates
  `public.scheduled_commitments` with RLS.
- The app is deployed through Vercel. The production Supabase project is
  `saveluy-prod` (`jqonymcffmhhzcqpiehs`).

## Production credential handling

`.env.prod` is ignored by Git and must remain local. It contains only the
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` settings;
these configure the browser client and cannot authorize database migrations.
Do not copy their values into this plan, a commit, or CI logs. `NEXT_PUBLIC_`
values are public in the built app.

Use the production host's protected environment settings for those two app
values. Database migration access must use a scoped Supabase access token or a
database credential stored in the CI secret manager, never a frontend
publishable key. Limit the credential to this project and the deployment job.
Production migrations were applied through the authenticated Supabase CLI.
No database password or service-role key was added to the repository.

## Production execution record — 2026-11-01

- Vercel reported successful deployments for both app projects on `main`.
- Before migration, the target had no recorded migrations or public tables,
  one Auth user, no custom Auth trigger, and no `avatars` bucket or objects.
  Supabase reported no physical backups and PITR disabled. The existing Auth
  account was outside the objects touched by the initial schema migration.
- Applied all seven migrations in timestamp order through
  `20261101133247_scheduled_commitments_minimal_privileges.sql`. No seed data
  was applied. The first attempt stopped before applying a migration because
  the initial SQL could not resolve `uuid_generate_v4()`; migration history
  remained empty, and the unapplied files were corrected to use
  `gen_random_uuid()` before retrying.
- Verified all seven migration versions are recorded. The
  `scheduled_commitments` table has RLS and an owner policy; anonymous table
  access is denied, authenticated select/insert/update are allowed, and
  authenticated delete and `service_role` access are denied. An anonymous
  Data API request returned permission denied as expected.
- Verified both the four-argument and seven-argument `log_expense` functions
  exist. The migration sends a PostgREST schema reload notification.
- Not yet verified with authenticated app sessions: transaction flows,
  scheduled-commitment CRUD, or isolation between two users. There is no
  staging Supabase project available in the current CLI account. The existing
  Auth user has no profile row yet; the OAuth callback creates it on login.

## Required preflight

1. Review the final `main` commit and CI results. Run lint, typecheck, unit and
   end-to-end tests, and a production build before release.
2. Install/use the current Supabase CLI in the release environment and link it
   to the confirmed production project. Do not infer the target from a local
   environment file.
3. Compare local and remote migration history with `supabase migration list`.
   Do not push until the pending set and its order are understood. Never repair
   migration history automatically; investigate any mismatch first.
   The repository's `20261016000000_initial_schema.sql` contains `DROP ...
   CASCADE` statements for application tables and functions. If this migration
   appears pending while production has data or existing schema, stop. Do not
   run it against production; first baseline the remote schema/history with a
   reviewed Supabase pull and resolve drift without dropping user data.
4. Validate the migration on a clean local database with `supabase db reset`,
   then on a staging project with production-like schema and scrubbed data.
5. Review backup/PITR availability, take a pre-release backup or confirm a
   recoverable restore point, and record the operator and deployment window.
6. Run `supabase db push --dry-run` against the confirmed target and verify that
   it lists only the intended pending migrations.

## Database migration gate

The 2026-10-30 Supabase Data API change requires explicit grants for newly
created `public` tables. The existing 2026-10-18 migration enables RLS and adds
an authenticated-user policy for `scheduled_commitments`, but it has no
explicit table grant. RLS does not replace table privileges. Before applying
this migration to production, inspect the effective grants and API exposure:

- If the migration is still pending, add a **new, versioned follow-up
  migration** that grants only the operations needed by `authenticated` (and
  `service_role` only if server-side code uses the Data API), preserving RLS.
- If it was applied before the platform change, verify the table's current
  grants and authenticated CRUD access. If grants are absent, use the same
  forward-only grant migration; do not edit an already-applied migration.
- Do not grant `anon` access to scheduled commitments. Verify one user's rows
  remain invisible to a different authenticated user.

Also verify that the seven-argument `log_expense` RPC is visible to PostgREST
and accepts the current app payload. The older four-argument overload is kept
for compatibility; test both the current call and any still-supported legacy
client before changing or removing it. Confirm the schema cache has refreshed
after the migration.

This grant preflight is a release blocker until verified, because the current
platform behavior can reject Data API requests before RLS is evaluated.

## Deployment order

1. Deploy pending database migrations first, in timestamp order, to keep the
   old application compatible while the schema is added. Use one operator or
   one serialized CI job; do not run concurrent production pushes.
2. Confirm migration history, table grants, RLS policies, RPC signature, and
   Data API access before switching application traffic.
3. Deploy the app commit to the confirmed production host with the production
   URL and publishable key configured there. The visual design changes do not
   need a schema migration by themselves.
4. Smoke-test sign-in, a USD transaction, a KHR transaction with its captured
   exchange-rate snapshot, transaction reversal, scheduled-commitment CRUD,
   weekly review, and offline queue recovery. Verify data isolation with two
   separate accounts and confirm unauthenticated access is denied.
5. Monitor application errors, Supabase/Postgres API errors, auth, and
   migration history through the release window. Watch specifically for
   permission-denied table errors and unresolved RPC/schema-cache errors.

## Rollback and recovery

- Prefer rolling the app back to the last known production-compatible artifact
  if UI or client behavior regresses. Keep additive columns and the new table
  in place, and verify the rollback artifact's required columns and RPC
  signature before switching traffic.
- Do not drop new columns or `scheduled_commitments` as an automatic rollback;
  that can destroy user data. Correct a missing grant with a forward migration.
- Restore the database from the recorded recovery point only if data integrity
  has been damaged and after coordinating application traffic. Reconcile
  migration history only after comparing the actual schema and the migration
  history table.

## Release decision checklist

- [ ] Production project and app host confirmed.
- [ ] Local/remote migration histories match and pending migrations are known.
- [ ] The scheduled-commitments Data API grants are explicit and RLS isolation
      is verified.
- [ ] Backup/restore point is available.
- [ ] Lint, typecheck, unit tests, end-to-end tests, and production build pass.
- [ ] Staging smoke tests pass for USD, KHR, RPC compatibility, RLS, and
      scheduled commitments.
- [ ] Protected production app values and scoped migration credential are set
      in the appropriate secret/environment stores.
- [ ] One release operator is assigned and post-deploy monitoring is ready.

## References

- [Supabase: Deploy database migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase: Deployment and branching](https://supabase.com/docs/guides/deployment)
- [Supabase: `db push` CLI reference](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Supabase changelog: explicit grants for new Data API tables](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
