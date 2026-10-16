# BrokeNoMore Database & Frontend Architecture Audit

**Audit Date**: 2026-10-16  
**Auditor**: Senior Full-Stack Architecture & Migration Engineer  
**Objective**: Deep audit of all database migration tables, frontend state bindings, RPC functions, and elimination of mock data / local storage fallbacks in production mode.

---

## 1. Table-by-Table Database Migration Audit

| Table | Migration Status | Schema Quality & Constraints | Gap / Finding | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **`profiles`** | Exists | UUID FK to `auth.users`, `onboarding_completed_at` | Missing `avatar_url`, `locale` per PRD § Data model. | Medium |
| **`user_preferences`** | Exists | `voice`, `locale`, `currency`, `theme` | Missing `reduced_motion_override`, `week_starts_on` per PRD. | Low |
| **`plans`** | Exists | Cents integer storage, default values | Missing active versioning constraint (only 1 active plan per user). | Medium |
| **`plan_periods`** | Exists | Cents integer storage, dates | Good. Needs index on `(user_id, is_closed)`. | Low |
| **`transactions`** | Exists | `amount_cents > 0`, `envelope` check, `client_mutation_id` | Missing `source`, `reverses_transaction_id` self-referencing FK for audit trail. | High |
| **`quick_actions`** | Exists | `label`, `emoji`, `amount_cents`, `display_order` | Good. Needs auto-seed trigger for new user profiles. | Medium |
| **`wait_items`** | Exists | `unlock_at`, `status` check | Good. Matches PRD wishlist cooling-off design. | Pass |
| **`weekly_reviews`** | Exists | `action` check (`future`, `carry`, `leave`) | Good. Records remainder disposition. | Pass |
| **`audit_events`** | Exists | `event_type`, `payload jsonb` | Good. RLS prevents update/delete. | Pass |
| **Atomic RPC Functions** | **Missing** | None defined in current migration | **CRITICAL GAP**: PRD requires `complete_onboarding`, `log_expense`, `reverse_transaction`, `evaluate_purchase`, and `ensure_profile`. Frontend is doing raw client table updates instead of transactional RPCs. | **CRITICAL** |

---

## 2. Frontend State & Mock Data Audit

| Area | Current State | Target End-to-End State | Action Required |
| :--- | :--- | :--- | :--- |
| **`provider.tsx` initial state** | Has hardcoded `seedState()` with fake groceries, lunch, coffee transactions | When user is logged in, state must hydrate ONLY from Supabase; when no transactions exist in DB, show empty ledger lines, NOT fake seed data. | Remove synthetic seed transactions; only load genuine database rows. |
| **`provider.tsx` local storage** | Fallback to `localStorage` for demo/offline | Allowed only as an offline cache; must not mask unauthenticated or un-synced cloud states. | Add distinct `syncStatus: "synced" \| "syncing" \| "offline"`. |
| **Route Protection (`(app)/layout.tsx`)** | Currently a pass-through component; unauthenticated users can view `/today` with mock data | Server layout must verify `supabase.auth.getUser()`. If no session, redirect to `/{locale}/login`. | Add Server Component authentication guard in `(app)/layout.tsx`. |
| **Onboarding Guard** | Only checked in auth callback | If authenticated user accesses `/today` before completing onboarding, redirect to `/onboarding/income`. | Enforce in `(app)/layout.tsx`. |
| **Atomic Transactions** | `supabaseApi.addTransaction` inserts directly via client table write | Must execute `rpc('log_expense')` or atomic transaction ensuring idempotency. | Add RPC migration and call `supabase.rpc("log_expense")`. |

---

## 3. Actionable Todo List for Full Resolution

### Phase 1: Database Migration & Schema Hardening
- [ ] **TODO-1.1**: Update `supabase/migrations/20261016000000_initial_schema.sql`:
  - Add `avatar_url`, `locale` to `profiles`.
  - Add `reverses_transaction_id uuid references public.transactions(id)` to `transactions`.
  - Add unique partial index `create unique index on public.plans(user_id) where (is_active = true)`.
  - Add indexes on `transactions(user_id, created_at)` and `plan_periods(user_id, is_closed)`.
- [ ] **TODO-1.2**: Implement Postgres Atomic RPC Functions:
  - `ensure_profile()`: Idempotently creates profile and default preferences.
  - `complete_onboarding()`: Atomically saves plan, default quick actions, and marks `onboarding_completed_at`.
  - `log_expense()`: Inserts transaction, checks period limits, and returns fresh calculated balances.
  - `reverse_transaction()`: Sets `reversed = true` and records reversal link.

### Phase 2: Server-Side Authentication & Onboarding Route Guards
- [ ] **TODO-2.1**: Update `src/app/[locale]/(app)/layout.tsx` to be an async Server Component:
  - Call `await createClient()` from `src/lib/supabase/server.ts`.
  - If no user, redirect to `/${locale}/login?next=...`.
  - If user exists but `onboarding_completed_at` is null, redirect to `/${locale}/onboarding/income`.
- [ ] **TODO-2.2**: Update `src/app/[locale]/(onboarding)/...` routes:
  - If user is not authenticated, redirect to `/${locale}/login`.
  - If onboarding already completed, redirect to `/${locale}/today`.

### Phase 3: Eliminate Mock Data from Frontend Engine
- [ ] **TODO-3.1**: Clean up `seedState()` in `src/lib/wealth-engine/provider.tsx`:
  - Set default `transactions: []` (empty array, zero fake transactions).
  - Set default `waitList: []`.
  - When Supabase returns user data, hydrate directly.
  - If genuine empty database state, render `LedgerEmptyActivity` in UI rather than fake transactions.
- [ ] **TODO-3.2**: Connect `addTransaction` and `completeOnboarding` directly to the new Supabase RPC functions.

### Phase 4: Full End-to-End Verification
- [ ] **TODO-4.1**: Run `bun test` for unit tests.
- [ ] **TODO-4.2**: Run `bun run test:e2e` for Playwright end-to-end suite.
- [ ] **TODO-4.3**: Run `bun run build` to verify zero type or bundle errors.
