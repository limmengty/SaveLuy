# BrokeNoMore Supabase Integration PRD and AGY Implementation Prompt

## Document control

| Field | Value |
|---|---|
| Product | BrokeNoMore |
| Document type | Product requirements document, technical implementation plan, and coding-agent execution prompt |
| Scope | Supabase integration from Google authentication through production readiness |
| Frontend | Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui, Motion, next-intl |
| Application libraries | Zod, React Hook Form, TanStack Query, nuqs |
| Runtime and package manager | Bun |
| Backend | Supabase Auth, Postgres, Row Level Security, database functions, optional Realtime |
| AI development integration | Supabase MCP, project-scoped and read-only by default |
| Baseline viewport | Mobile-first PWA at 390 × 844 px, max-width mobile shell on desktop |
| Status | Implementation-ready |

## Executive decision

BrokeNoMore will use Supabase as the system of record for identity, financial configuration, transactions, cooling-off requests, wishlist decisions, discipline events, and privacy-safe leaderboard data. The current approved UI should be preserved; this work replaces prototype-only state with a secure, typed, testable data layer rather than redesigning screens.

Google OAuth will use Supabase Auth with the PKCE server-side flow and cookie-backed sessions. The Next.js application will maintain separate browser and server Supabase clients, refresh sessions in `proxy.ts`, exchange the authorization code in an App Router callback Route Handler, and verify identity again in protected server layouts and mutations. Supabase’s SSR guidance requires cookie-based sessions and distinguishes browser and server clients; its current guidance also states that authorization should use verified claims or an up-to-date user lookup rather than trusting an unverified session object.[^1][^2]

All exposed tables will enable Row Level Security. Every user-owned row will carry `user_id`, normal users will access only their own rows, and administrative access will be explicit, auditable, and denied by default. Supabase recommends enabling RLS on every table in an exposed schema and testing allow and deny behavior for each operation and role.[^3]

Supabase MCP is an engineering tool, not a runtime dependency. AGY may use it to inspect the project, query metadata, generate types, and run security or performance advisors. The default MCP connection must be bound to one non-production project with `read_only=true`; mutating schema work must be represented first as reviewed migration files in the repository.[^4][^5][^6]

## Product outcomes

### Goals

- A user can authenticate using Google only and arrive at the correct next step without seeing a password form.
- A new user receives exactly one profile and completes template onboarding once.
- A returning user reaches the dashboard with server-verified identity and hydrated financial data.
- Quick expense logging is optimistic, idempotent, reversible, and reconciled against an authoritative database result.
- Purchase checks, wishlist cooling-off, vault withdrawal requests, XP, and weekly pacing use one consistent calculation contract.
- Financial rows cannot be read or changed by another authenticated user.
- Admin capabilities use explicit roles, narrow server-side operations, and immutable audit records.
- All database changes are reproducible from migrations and safe development seed data.
- English and Khmer UI copy remain externalized through next-intl; enum values and money calculations remain language-neutral.
- The approved UX, animations, responsive behavior, and accessibility are preserved while real persistence is introduced.

### Non-goals

- Email/password, magic-link, phone, or anonymous authentication.
- Bank synchronization, card processing, investment execution, or financial advice.
- Storing Google provider access or refresh tokens unless a future Google API feature has a reviewed requirement.
- Letting MCP make unreviewed production changes.
- Using a service-role key in browser code.
- Building a generic accounting ledger with double-entry bookkeeping in the first release.
- Storing derived dashboard totals in many tables when they can be calculated safely from an authoritative transaction ledger.

## Success measures

| Measure | Target |
|---|---:|
| Successful Google sign-in to first useful screen | Under 5 seconds after provider redirect under normal network conditions |
| Duplicate profile rows per user | 0 |
| Cross-user RLS test failures | 0 |
| Quick-log visual acknowledgement | Under 100 ms using optimistic UI |
| Quick-log server reconciliation | Under 1.5 seconds at p95, measured after instrumentation exists |
| Duplicate transactions from repeated taps or retries | 0 |
| Protected-route unauthorized data exposure | 0 |
| Database migration reproducibility | Clean `supabase db reset` succeeds in CI |
| Accessibility | WCAG 2.2 AA checks for authentication and all changed flows |
| Build quality | Lint, typecheck, unit, integration, database, and production build all pass |

The latency values above are product targets, not claims about current performance. Instrumentation must be added before reporting achievement.

## Experience flows

### New user authentication

1. The unauthenticated user opens `/login` or is redirected there from a protected route.
2. The login screen displays one primary action, **Continue with Google**, plus privacy and terms links. It never shows email or password controls.
3. The user activates the button. The button enters a loading state, prevents repeat activation, and calls `signInWithOAuth({ provider: 'google' })` with an exact application callback URL.
4. Supabase redirects to Google. Google returns to the Supabase Auth callback, and Supabase returns an authorization code to the application callback.
5. `/auth/callback` validates the query parameters, exchanges the code with `exchangeCodeForSession`, and writes the cookie-backed session. PKCE authorization codes are exchanged for a session through this method.[^7][^8]
6. The callback accepts only a relative, allowlisted `next` path. External URLs, protocol-relative URLs, and unknown destinations are rejected to prevent open redirects.
7. The application reads the authenticated profile. If `onboarding_completed_at` is null, it redirects to `/{locale}/onboarding`; otherwise it redirects to `/{locale}/dashboard` or the safe requested destination.
8. The first authenticated database transaction creates a profile if the auth trigger has not already done so. The operation must be idempotent.
9. Onboarding writes the financial profile, strategy, buckets, and default quick presets atomically, then marks onboarding complete only after all records exist.

### Returning user

1. Proxy refreshes or propagates the cookie session for matched application routes.
2. The protected locale layout verifies identity on the server.
3. If unauthenticated, the layout redirects to `/{locale}/login?next=<relative-path>`.
4. If authenticated but onboarding is incomplete, it redirects to onboarding.
5. The dashboard server component prefetches the dashboard query, dehydrates TanStack Query state, and renders useful data without a client-only authentication flash.

Proxy improves routing and session continuity but is not the only authorization boundary. Next.js Route Handlers are public endpoints, and Next.js explicitly advises verifying credentials at the operation itself rather than relying on proxy alone.[^9][^10]

### Sign-out

1. The user selects Sign out from the profile menu.
2. A server action or protected Route Handler calls `supabase.auth.signOut()`.
3. Query caches containing user data are cleared.
4. The user is redirected to the localized login screen.
5. Browser back navigation must not reveal sensitive server-rendered content; protected responses use appropriate dynamic rendering and cache controls.

### Authentication failure

- User cancels Google consent: return to login with a localized, non-destructive message and enabled retry button.
- Missing or expired code: return to login with `reason=expired_callback`; do not display raw provider details.
- Profile bootstrap failure: show a recoverable setup screen, log a correlation ID, and offer Retry and Sign out.
- Network interruption: preserve the login screen and allow retry; never present an infinite spinner.
- Authenticated but unauthorized admin route: return 403, not 404 masquerading as success and not a client-only redirect.

## OAuth configuration

### Google Cloud

Create separate OAuth clients for local/development, staging, and production where practical. Register the Supabase provider callback URL shown in the Supabase dashboard, normally:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

Most OAuth providers require HTTPS except for localhost. Supabase’s OAuth flow sends the user from the application to Supabase Auth, then to the provider, back to Supabase’s callback, and finally to an allowed application redirect.[^11]

### Supabase Auth

- Enable only Google under Authentication Providers for this release.
- Configure the Google client ID and client secret in Supabase, never in `NEXT_PUBLIC_*` variables.
- Set the production Site URL to the canonical application origin.
- Add exact production and staging callback URLs to the redirect allowlist.
- Add `http://localhost:3000/**` for local development.
- Use a constrained Vercel preview wildcard only if preview OAuth is required; production should use an exact path. Supabase supports redirect wildcards but recommends exact production redirect URLs.[^12]
- Review CAPTCHA, abuse controls, session lifetime, and refresh-token settings before launch.

### Application environment

```bash
# Public and safe for the browser
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Server-only operational values; do not expose to browser bundles
SUPABASE_PROJECT_REF=
SUPABASE_ACCESS_TOKEN= # local CLI or CI only when required
SUPABASE_SERVICE_ROLE_KEY= # avoid unless a narrowly reviewed server task needs it
```

Rules:

- Commit `.env.example` with empty values and explanations.
- Never commit `.env.local`, PATs, OAuth secrets, database passwords, or service-role keys.
- Validate environment variables at startup with a server/client-separated Zod schema.
- Fail with a clear configuration error rather than a non-null assertion.
- Use the publishable key for normal user-scoped access; security comes from verified identity and RLS, not from hiding the publishable key.

## Application architecture

```text
Browser
  ├─ shadcn/ui + Motion components
  ├─ React Hook Form + Zod
  ├─ TanStack Query cache and mutations
  ├─ nuqs for non-sensitive shareable UI state
  └─ Supabase browser client for permitted user-scoped operations

Next.js 16 App Router
  ├─ Server Components for authenticated initial reads
  ├─ Server Actions / Route Handlers for validated commands
  ├─ proxy.ts for session refresh and coarse redirects
  ├─ next-intl locale routing
  └─ Supabase server client using request cookies

Supabase
  ├─ Google Auth
  ├─ Postgres tables, constraints, indexes, views
  ├─ RLS policies
  ├─ RPC functions for atomic financial commands
  ├─ database tests and generated TypeScript types
  └─ optional Realtime only where multi-device freshness justifies it

Development control plane
  ├─ Supabase CLI for local stack, migrations, reset, tests, types
  └─ Supabase MCP for scoped inspection, docs, and advisors
```

### Client boundaries

Create exactly two normal Supabase factories:

```text
src/lib/supabase/client.ts   # createBrowserClient<Database>()
src/lib/supabase/server.ts   # createServerClient<Database>() with cookies
```

Add one proxy helper:

```text
src/lib/supabase/proxy.ts
```

Do not create ad hoc Supabase clients inside feature components. Do not import server-only environment variables into any module reachable by Client Components.

### Authentication files

```text
src/app/auth/callback/route.ts
src/app/[locale]/(public)/login/page.tsx
src/app/[locale]/(public)/login/google-sign-in-button.tsx
src/app/[locale]/(protected)/layout.tsx
src/app/[locale]/(protected)/onboarding/page.tsx
src/app/[locale]/(protected)/dashboard/page.tsx
src/actions/auth.ts
src/lib/auth/get-current-user.ts
src/lib/auth/require-user.ts
src/lib/auth/require-admin.ts
src/lib/auth/safe-next-path.ts
src/proxy.ts
```

For Next.js 16, use `proxy.ts` (which replaces deprecated `middleware.ts`) as the root entry point to refresh sessions and update cookies. Encapsulate helper logic in `src/lib/supabase/proxy.ts` so proxy plumbing does not clutter feature code.

### Auth callback contract

The callback Route Handler must:

- Read `code`, optional `next`, and optional locale.
- Normalize `next` through a strict helper.
- Exchange the code once.
- Avoid logging the code, access token, refresh token, cookies, or provider payload.
- Redirect failures to a localized login error state.
- Redirect successful users through one post-auth resolver.
- Set `Cache-Control: no-store` where appropriate.

Illustrative structure:

```ts
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = getSafeNextPath(url.searchParams.get('next'))

  if (!code) return redirectToLogin(url, 'missing_code')

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) return redirectToLogin(url, 'callback_failed')
  return NextResponse.redirect(new URL(next ?? '/auth/complete', url.origin))
}
```

The final implementation must use project naming and locale routing, and it must not copy this sketch blindly.

## Data model

### Modeling principles

- Store money as integer minor units (`bigint` cents), never floating point.
- Store all timestamps as `timestamptz` in UTC; keep the user’s IANA timezone in their financial profile.
- Treat `transactions` as the authoritative financial event ledger.
- Derive safe-to-spend, weekly spend, bucket remaining values, and streak displays from authoritative rows or one reviewed snapshot process.
- Use check constraints for positive amounts, valid ranges, and legal state transitions.
- Use enums sparingly; use lookup-safe text constraints when product values are expected to evolve frequently.
- Add `created_at` and `updated_at` consistently.
- Put `user_id` on every user-owned table even when it can be reached through another relation; this simplifies and strengthens RLS.
- Use UUID primary keys generated in Postgres.
- Add idempotency keys to retryable commands.

### Core tables

| Table | Purpose | Important fields |
|---|---|---|
| `profiles` | Safe public subset of the auth identity | `id` FK to `auth.users`, `display_name`, `avatar_url`, `locale`, `onboarding_completed_at` |
| `user_preferences` | UX choices | `user_id`, `coach_tone`, `theme`, `reduced_motion_override`, `week_starts_on` |
| `financial_profiles` | Inputs for financial calculations | `user_id`, `currency_code`, `monthly_income_cents`, `fixed_home_cents`, `monthly_work_hours`, `timezone` |
| `strategies` | User strategy configuration | `id`, `user_id`, `mode`, `name`, `weekly_cap_cents`, `is_active`, `version` |
| `buckets` | Home, wealth, essentials, and guilt-free allocations | `id`, `user_id`, `strategy_id`, `kind`, `allocated_cents`, `locked`, `sort_order` |
| `expense_presets` | Quick-tap chips | `id`, `user_id`, `bucket_id`, `emoji`, `label`, `amount_cents`, `sort_order`, `active` |
| `transactions` | Authoritative income, expense, transfer, reversal ledger | `id`, `user_id`, `bucket_id`, `kind`, `amount_cents`, `occurred_at`, `source`, `idempotency_key`, `reverses_transaction_id` |
| `wishlist_items` | Cooling-off purchase decisions | `id`, `user_id`, `bucket_id`, `name`, `price_cents`, `status`, `unlocks_at`, `resolved_at` |
| `vault_unlock_requests` | Delayed locked-vault withdrawal requests | `id`, `user_id`, `bucket_id`, `amount_cents`, `status`, `requested_at`, `unlocks_at`, `resolved_at` |
| `xp_events` | Append-only discipline events | `id`, `user_id`, `event_type`, `points`, `dedupe_key`, `metadata`, `created_at` |
| `weekly_snapshots` | Finalized weekly privacy-safe metrics | `id`, `user_id`, `week_start`, `discipline_score`, `no_vault_touch`, `swept_cents`, `finalized_at` |
| `app_user_roles` | Explicit application roles | `user_id`, `role`, `granted_by`, `granted_at` |
| `admin_audit_log` | Append-only record of admin commands | `id`, `actor_user_id`, `action`, `target_type`, `target_id`, `reason`, `metadata`, `created_at` |

### What not to persist

Do not persist a mutable `remaining_cents` column on every bucket during the first implementation unless a measured performance problem justifies it. It is easy for duplicated totals to drift from transactions. Return calculated balances from a view or RPC, and introduce snapshots only with reconciliation tests.

Do not store translated strategy names as database truth. Store stable codes such as `SETHI_65_15_20`; render localized names through next-intl.

Do not store the buy-check amount in a query string. nuqs may represent harmless UI state such as selected tab, admin filters, or whether a drawer is open, but financial amounts and notes remain component/form state.

### Profile bootstrap

A minimal `profiles` row may be created by an `after insert on auth.users` trigger. Supabase documents this pattern but warns that trigger failures occur in the same transaction and can block signup.[^13]

Therefore:

- Keep the trigger minimal and deterministic.
- Copy only `id`, a safe display name, avatar URL, and default locale.
- Never call external services from the trigger.
- Add a tested `ensure_profile()` fallback used by the post-auth resolver.
- Validate provider metadata defensively because names and avatars may be absent.
- Do not mark onboarding complete in the trigger.

## Row Level Security

### Policy matrix

| Resource | User read | User write | Admin access |
|---|---|---|---|
| `profiles` | Own row | Own safe fields only | Read through reviewed admin operation |
| `user_preferences` | Own row | Own row | No routine access required |
| `financial_profiles` | Own row | Own row | Denied by default; exceptional support access is audited |
| `strategies` | Own rows | Own rows | Denied by default |
| `buckets` | Own rows | Through onboarding/strategy RPC | Denied by default |
| `expense_presets` | Own rows | Own rows | Denied by default |
| `transactions` | Own rows | Insert through command RPC; reversals instead of destructive delete | Aggregates only by default |
| `wishlist_items` | Own rows | Own rows within transition rules | Aggregate status only |
| `vault_unlock_requests` | Own rows | Insert/cancel own requests | Reviewed resolve command with audit |
| `xp_events` | Own rows | No arbitrary direct write | System RPC inserts; admin cannot silently edit |
| `weekly_snapshots` | Own detail | No direct write | Privacy-safe aggregate view |
| `app_user_roles` | Optional own role | None | Narrow role-management command |
| `admin_audit_log` | None | None | Admin read; append only through server command |

### Policy conventions

Use policies shaped around the authenticated role and indexed ownership fields:

```sql
create policy "users_select_own_transactions"
on public.transactions
for select
to authenticated
using ((select auth.uid()) = user_id);
```

Supabase notes that `auth.uid()` returns null without a valid authenticated request, and recommends indexes on RLS filter columns, explicit roles, and wrapping stable helper calls with `select` for performance.[^14][^3]

Required rules:

- Enable RLS immediately in the migration that creates each exposed table.
- Revoke broad default grants where they are unnecessary.
- Create a policy per operation; do not assume a SELECT policy protects INSERT.
- Add indexes on `user_id`, ownership foreign keys, active-strategy lookups, transaction date ranges, and uniqueness constraints used by idempotency.
- Test anonymous denial, owner success, different-user denial, and admin behavior.
- Avoid user-editable profile metadata as proof of admin authorization.

### Admin authorization

Implement `private.is_admin()` as a carefully reviewed `security definer` function that checks `app_user_roles`, fixes its `search_path`, and has execute permission restricted to the required roles. Never expose an unrestricted definer function. Supabase warns that definer functions execute with creator privileges and may bypass RLS; ownership checks and execute grants must be narrowed deliberately.[^15]

Administrative mutations must also:

- Verify the actor on the server.
- Require a Zod-validated reason for sensitive actions.
- Write an `admin_audit_log` record in the same transaction.
- Avoid returning private financial values unless the admin use case explicitly requires them.
- Prefer aggregate operational metrics over browsing users’ transaction details.

## Atomic database commands

### `complete_onboarding`

Inputs:

- Template code
- Monthly income cents
- Fixed home contribution cents
- Monthly work hours
- Locale, timezone, and currency
- Coach tone
- Idempotency key

Behavior:

1. Verify `auth.uid()`.
2. Lock or create the user’s financial profile.
3. Reject invalid ranges.
4. Create exactly one active strategy.
5. Create the four buckets and default presets.
6. Mark onboarding completed.
7. Return the complete dashboard bootstrap object.
8. If retried with the same key, return the original result rather than duplicating rows.

### `log_expense`

Inputs:

- Preset ID or validated custom amount and bucket ID
- Occurrence timestamp
- Client-generated idempotency key

Behavior:

1. Verify ownership of the preset and bucket.
2. Lock the active strategy row or another narrow per-user coordination row.
3. Insert one expense transaction.
4. Insert the XP event using a unique dedupe key.
5. Calculate authoritative dashboard metrics.
6. Return transaction, XP delta, safe-to-spend, weekly spend, weekly cap, and pacing state.

The UI applies an optimistic update immediately. On success it replaces optimistic data with the RPC result; on failure it rolls back and shows inline recovery. “Undo” creates a reversal transaction through `reverse_transaction`; it does not hard-delete financial history.

### `evaluate_purchase`

This command is read-only and returns:

- Verdict: `SAFE`, `STRETCH`, or `COOLING_OFF`
- Work-hours equivalent
- Future-value illustration
- Current daily pace
- Re-paced daily allowance
- Weekly-cap impact
- Localized-copy parameters, not final English text

The TypeScript wealth engine may calculate an immediate preview, but contract tests must compare it with the database implementation. Server results are authoritative for commits.

### `jail_purchase`

Atomically creates the wishlist item, sets `unlocks_at`, and grants XP once. A unique dedupe key prevents reward farming through retries.

### `request_vault_unlock`

Creates a pending unlock request. It never moves money immediately. Resolution verifies time eligibility and current balance, then inserts ledger transactions and an audit/event row atomically.

### `sweep_week`

Moves the eligible unspent amount to wealth through transfer ledger rows, grants XP once, and finalizes the weekly snapshot. The operation must be idempotent by `(user_id, week_start)`.

## Query and form integration

### TanStack Query

Use stable factories:

```text
queryKeys.auth.me()
queryKeys.dashboard.summary(userId, weekStart)
queryKeys.transactions.list(filters)
queryKeys.strategies.active(userId)
queryKeys.leaderboard.week(weekStart)
queryKeys.admin.users(filters)
```

Rules:

- Prefetch protected page data in Server Components and hydrate the client cache.
- Never use the authenticated user ID from an editable client input; derive it from the verified session.
- Use optimistic updates only when rollback is deterministic.
- Cancel in-flight dashboard queries before optimistic expense updates.
- Use mutation scope or button disabling to serialize repeated taps where appropriate.
- Invalidate only affected keys.
- Clear private caches on sign-out.
- Do not put Supabase access tokens into query keys, logs, or persisted cache.
- Keep authentication state server-led; TanStack Query is not the security boundary.

### Zod and React Hook Form

Define domain schemas once and reuse them at UI and command boundaries:

```text
src/features/auth/schemas.ts
src/features/onboarding/schemas.ts
src/features/transactions/schemas.ts
src/features/purchase-check/schemas.ts
src/features/vault/schemas.ts
src/features/admin/schemas.ts
```

Requirements:

- Currency inputs parse into integer cents.
- Reject NaN, negative values, unsafe integers, and excessive bounds.
- Validate timezone and supported currency codes.
- Use localized messages through next-intl.
- Render field errors next to the field and a focusable error summary for multi-field submissions.
- Disable only the submitted action, not the entire page.
- Preserve valid entered values after recoverable server failures.

### nuqs

Approved URL state:

- Transaction date and bucket filters
- Strategy tab
- Leaderboard period
- Admin list search, status, role, sort, and page
- Non-sensitive drawer or dialog intent when deep-linking is useful

Forbidden URL state:

- OAuth codes or tokens beyond the provider callback lifecycle
- Salary, purchase amount, notes, or vault withdrawal amount
- Raw database IDs that grant or imply authorization
- Personally identifying or confidential financial data

## Realtime and offline behavior

Realtime is optional for MVP. Use normal mutation responses and targeted invalidation for the same-device flow. Add a user-scoped Realtime subscription only if multi-device updates are an observed requirement; every subscribed table still requires correct RLS.

The PWA may show cached shell content offline, but it must not claim an expense is permanently saved until the server confirms it. If offline logging is introduced later, use a durable outbox with idempotency keys, visible pending status, retry limits, and conflict handling. Do not silently queue financial commands in an opaque service worker.

## Supabase MCP operating policy

### Purpose

AGY may use Supabase MCP to:

- Inspect schemas, tables, constraints, policies, indexes, and migration history.
- Execute read-only diagnostic SQL.
- Retrieve official Supabase documentation.
- Generate TypeScript types.
- Run security and performance advisors.
- Compare deployed development schema with repository migrations.

Supabase advisors can surface issues such as misconfigured RLS policies and missing indexes, and are available through the MCP `get_advisors` tool.[^5][^16]

### Safe default

Use a project-scoped read-only connection:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=<DEV_PROJECT_REF>&read_only=true&features=database,docs"
    }
  }
}
```

The official MCP project supports `project_ref`, `read_only=true`, and feature restriction; project scoping removes account-level reach and read-only mode excludes mutating tools.[^6]

Security rules:

- Connect to development first, not production.
- Do not commit an expanded URL containing real project information if the repository is public.
- Prefer browser OAuth for interactive setup or a narrowly scoped PAT for CI.
- Never place a PAT in source code or prompt text.
- Redact personal data, access tokens, cookies, and secrets from AGY output.
- Require human approval before enabling write tools.
- Do not use MCP as the only record of a schema change.

### Migration workflow

1. AGY inspects the project with read-only MCP.
2. AGY writes a timestamped SQL migration under `supabase/migrations/`.
3. AGY adds RLS tests under `supabase/tests/` and safe inserts under `supabase/seed.sql`.
4. AGY runs the local Supabase stack and executes `supabase db reset`.
5. AGY runs database tests, generates types, and runs application tests.
6. A human reviews the SQL diff.
7. CI applies the migration to a development or preview environment.
8. Advisors run again.
9. Staging is tested.
10. Production deployment uses the approved migration pipeline, not an improvised agent SQL call.

Supabase’s CLI workflow is designed around versioned migrations, seed data, resettable local environments, and linked deployment; `supabase db reset` reapplies migrations and seed data from a clean state.[^17][^18][^19]

### Write-enabled exception

If a write-enabled MCP session is explicitly approved:

- Scope it to a disposable development branch or isolated development project.
- Enable only the feature group needed.
- Apply only the migration already present in the repository.
- Never run free-form destructive SQL.
- Capture the tool result and compare the remote migration history.
- Return to read-only mode immediately afterward.

## Local and CI setup

### Bun scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "supabase:start": "supabase start",
   

---

## References

1. [Server-Side Rendering | Supabase Docs](https://supabase.com/docs/guides/auth/server-side) - SSR frameworks move rendering and data fetches to the server, to reduce client bundle size and execu...

2. [Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) - Since Next.js Server Components can't write cookies, you need a Proxy to refresh expired Auth tokens...

3. [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - Postgres Row Level Security (RLS) gives you granular authorization rules that run inside the databas...

4. [supabase.com › platform › personal-access-tokenssupabase.com](https://supabase.com/docs/guides/platform/personal-access-tokens.md) - 2. While creating it, scope the token to one project and grant only the **Project Settings** permiss...

5. [Advisors | Supabase Docs](https://supabase.com/docs/guides/observability/advisors?lint=0023_sensitive_columns_exposed) - - MCP: `get_advisors` with `type` set to `security` or `performance`

6. [supabase/mcp: Connect Supabase to your AI assistants](https://github.com/supabase/mcp) - To configure the Supabase MCP server on your client, visit our setup documentation. You can also gen...

7. [supabase.com · docs · guidessupabase.com](https://supabase.com/docs/guides/auth/social-login/auth-azure.md) - When calling `signInWithOAuth`, provide a `redirectTo` URL which points to a callback route.

8. [PKCE flow | Supabase Docs](https://supabase.com/docs/guides/auth/sessions/pkce-flow) - The code parameter is commonly known as the Auth Code and can be exchanged for an access token by ca...

9. [${rssData.title} - Next.js](https://nextjs.org/docs/16/app/guides/backend-for-frontend.md) - Create a Route Handler using the `route.ts` or `route.js` file convention:
...
To restrict access, i...

10. [Next.js Documentation](https://nextjs.org/docs/15/app/api-reference/file-conventions/route.md) - Route Handlers allow you to create custom request handlers for a given route using the Web [Request]...

11. [Configure Social Login (OAuth) Providers - Self-Hosting](https://supabase.com/docs/guides/self-hosting/self-hosted-oauth) - 4. The provider redirects back to `https://<your-domain>/auth/v1/callback`

12. [Redirect URLs | Supabase Docs](https://supabase.com/docs/guides/auth/redirect-urls) - Supabase allows you to specify wildcards when adding redirect URLs to the allow list. You can use wi...

13. [advisors.md](https://supabase.com/docs/guides/observability/advisors.md) - - MCP: `get_advisors` with `type` set to `security` or `performance`

14. [Row Level Security performance | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security-performance) - Measure the cost of Row Level Security (RLS) and tune policies that are already correct. To learn ho...

15. [Database functions | Supabase Docs](https://supabase.com/docs/guides/database/functions) - A function created in the Dashboard or by a migration is owned by postgres , which bypasses Row Leve...

16. [Advisors | Supabase Docs](https://supabase.com/docs/guides/database/database-advisors?lint=0026_pg_graphql_anon_table_exposed) - You or an agent can pull the same checks from: Studio: Security Advisor and Performance Advisor; MCP...

17. [supabase.com · docs · referenceCLI Reference | Supabase Docs](https://supabase.com/docs/reference/cli/supabase-seed) - If test data is defined in `supabase/seed.sql`, it will be seeded after the migrations are run.

18. [supabase.com › docs › guidessupabase.com](https://supabase.com/docs/guides/deployment/database-migrations.md) - Create a seed script in supabase/seed.sql.
...
Reset your database to reapply migrations and populat...

19. [Local development workflow - Docs](https://supabase.com/docs/guides/local-development/cli-workflows) - This guide walks through two common starting points for local development with the Supabase CLI, and...

