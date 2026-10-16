# BrokeNoMore End-to-End Supabase & Frontend Implementation Plan

## Executive Overview
This implementation plan bridges the prototype state of BrokeNoMore into a production-ready, end-to-end integrated application backed directly by Supabase (`tfjqwsjisvxbcdqoacbs`) without mock or synthetic fallback traps. It directly satisfies the requirements laid out in `docs/BrokeNoMore Supabase Integration PRD and AGY Implementation Prompt.md` and `docs/brokenomore-adr-implementation-user-stories.md`.

---

## Architectural Verification Matrix (Current vs PRD)

| Component | PRD Specification | Current Status | Gap / Required Action |
| :--- | :--- | :--- | :--- |
| **Session & Proxy** | Next.js 16 `src/proxy.ts` refreshing cookies via `createServerClient` | Only runs `next-intl` | Add `src/lib/supabase/proxy.ts` session refresher to `src/proxy.ts` |
| **Auth Flow** | Google OAuth PKCE via Supabase Auth + `/auth/callback` safe next redirect | Scaffolded button & basic callback | Add strict `getSafeNextPath`, PKCE error parameters, and post-auth resolver |
| **Profile Lifecycle** | Idempotent `profiles` creation via DB trigger and `ensure_profile()` | Migration defined | Add DB trigger for `auth.users` on new signup, ensure fallback |
| **Database Schema** | Integer cents, RLS on every table, RPC functions (`complete_onboarding`, `log_expense`, `reverse_transaction`, `jail_purchase`) | Migration has tables, missing RPCs | Add atomic RPC functions in migration, test RLS & schema |
| **State & Engine** | Local-first optimistic UI with authoritative server reconciliation | `provider.tsx` has partial sync | Fully wire TanStack Query + Supabase RPCs, remove hardcoded demo state |
| **Settings & Profile** | Real user email, locale switcher (`en-KH`/`km-KH`), currency (`USD`/`KHR`), coach tone (`calm`/`straight`), real sign out | Basic static buttons with demo reset | Connect to `supabase.auth.getUser()`, `updatePreferences`, route switcher, sign out |
| **Onboarding** | Atomically writes financial profile, strategy, buckets, presets, marks onboarding complete | Scaffolded UI | Connect `complete_onboarding` RPC to the 3-step wizard |
| **Purchase Check** | Pure math client preview + server evaluation, jail to waitlist with XP | Scaffolded client drawer | Connect to waitlist table and RPCs |

---

## Phased Implementation Plan

### Phase 1: Supabase Infrastructure & Database Migration
1. **Enhance Migration with PRD Specifications**:
   - `profiles` with trigger on `auth.users` (`onboarding_completed_at`, `avatar_url`, `display_name`).
   - `user_preferences` with `coach_tone`, `currency`, `locale`, `theme`.
   - `financial_profiles`, `strategies`, `buckets`, `expense_presets`, `transactions`, `wishlist_items` (wait items), `weekly_reviews`, `audit_events`.
   - Atomic Postgres functions:
     - `ensure_profile(user_id)`
     - `complete_onboarding(template, income, fixed_home, hours, currency, locale, tone)`
     - `log_expense(amount, envelope, label, client_mutation_id)`
     - `reverse_transaction(transaction_id)`
   - Apply migration to remote Supabase project `tfjqwsjisvxbcdqoacbs` or local CLI.

### Phase 2: Next.js 16 Auth & Proxy Integration
1. **Implement `src/lib/supabase/proxy.ts`**:
   - Cookie management with `@supabase/ssr` inside Next.js 16 `proxy.ts`.
   - Ensure session refreshes seamlessly without breaking `next-intl` localization.
2. **Harden Auth Callback (`src/app/auth/callback/route.ts`)**:
   - Strict `getSafeNextPath` validator.
   - Idempotent profile bootstrap verification before redirecting to `/onboarding` or `/today`.
3. **Google Sign-In & Sign-Out**:
   - Complete Google OAuth trigger in `login-view.tsx`.
   - Add real sign-out server action / client handler clearing session and caches.

### Phase 3: Settings & Preferences End-to-End
1. **Refactor `SettingsView` (`src/features/settings/settings-view.tsx`)**:
   - Display real authenticated user account details (Google email, avatar, user ID).
   - Dynamic locale switcher navigating between `/en-KH` and `/km-KH`.
   - Currency selector (`USD` vs `KHR`) persisting to `user_preferences`.
   - Guidance voice (`calm` vs `straight`) updating Supabase backend in real-time.
   - Real "Sign out" action.

### Phase 4: Data Layer & Onboarding Integration
1. **Connect Onboarding Wizard**:
   - Wire `income`, `template`, and `review` steps to call `complete_onboarding` RPC.
   - Upon completion, transition user to `/today`.
2. **Reconcile Dashboard & Activity Ledger**:
   - Hydrate `TodayView` and `ActivityView` directly from authenticated user Supabase records.
   - Optimistic transaction capture with instant local feedback and background sync.
   - Real reversing/undoing of transactions in the database ledger.

---

## Verification & Acceptance Criteria
- [ ] Production build succeeds (`bun run build`) with zero lint or type errors.
- [ ] No hardcoded or dummy fallback mock data in production state.
- [ ] User can log in with Google, complete onboarding, and see their real financial profile.
- [ ] Settings view displays authenticated user info and updates remote preferences.
- [ ] All database writes enforce RLS (`auth.uid() = user_id`).
