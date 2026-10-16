# BrokeNoMore UX/UI Technical & Accessibility Audit

**Audit Date:** October 16, 2026  
**Auditor:** Principal UX Engineer, Accessibility Specialist & Senior Next.js/Supabase Developer  
**Status:** Complete — Pending Product-Owner Review & Approval  
**Codebase:** BrokeNoMore (Next.js 16.4.2 App Router, Tailwind CSS v4, Bun 1.3.14, Supabase)

---

## 1. Executive Summary

BrokeNoMore is built around a rigorous and deterministic mathematical core (`src/lib/wealth-engine/engine.ts`), strictly adhering to integer minor-unit (cents) arithmetic with comprehensive test coverage. Its stated product vision—a calm, supportive financial decision partner following the **Obsidian Ledger** design direction—is well-conceived.

However, an in-depth audit of the repository, build pipeline, database policies, component trees, and accessibility structures reveals critical gaps between the current state and the 2.0 Product Requirements Document:

1. **Build & Quality Pipeline Failures:** While `bun test` passes (7/7 tests in 43ms) and `next build` succeeds, `bun run lint` exits with code 1 due to 4 React Compiler / hook errors (cascading synchronous `setState` inside `useEffect`) and 9 unused variable warnings.
2. **Missing Admin Surface & Authorization Infrastructure:** The PRD specifies an extensive 10-section Admin Console (Attention Queue, User Support, Strategy Engine, Coach Content, Moderation, Campaigns, Feature Flags, Audit Log, System Health, Staff RBAC). Currently, **zero admin routes, zero admin UI components, and zero admin RLS policies** exist in the codebase.
3. **PWA Mobile-First Navigation Gaps:** The bottom navigation bar has 5 slots with placeholder behavior. The PRD mandates a clear 4-destination user model (**Today**, **Plan**, **Activity**, **Progress**) with a central **Purchase Check** modal/drawer. Currently, **Progress** (streaks/leagues) is completely missing from routes and navigation.
4. **Hardcoded Strings & Incomplete i18n:** Although `next-intl` is configured with `en-KH.json` and `km-KH.json`, multiple user-facing views (`today-view.tsx`, `check-panel.tsx`, `plan-view.tsx`, `income-step.tsx`) render raw hardcoded English strings, completely breaking localization for Khmer (`km-KH`) users.
5. **Accessibility & Contrast Deficits:** Several interactive elements fail WCAG 2.2 AA target size (minimum 44x44px), lacking visible focus rings or relying on pure color cues. Theme tokens lack a proper light theme definition (`:root` is hardcoded to dark colors, and `.light` is undefined).
6. **Raw Styling vs. Design Tokens:** Over 65 instances of ad-hoc Tailwind color utilities and raw pixel values bypass the Obsidian Ledger design system tokens.

---

## 2. Test Environment & Verification Commands

| Command | Status | Output / Findings |
|---|---|---|
| `bun --version` | Passed | `1.3.14` |
| `bun test` | Passed | 7 pass, 0 fail across `src/lib/wealth-engine/engine.test.ts` (43ms) |
| `bun run lint` | **Failed (Code 1)** | 13 problems (4 errors, 9 warnings).<br>- `src/features/onboarding/review-step.tsx:24:32`: synchronous `setState` in `useEffect`<br>- `src/features/planning/today-view.tsx:119:35`: unescaped entity `'`<br>- `src/features/purchase-check/check-panel.tsx:53:7`: synchronous `setState` in `useEffect`<br>- `src/hooks/use-mobile.ts:15:5`: synchronous `setState` in `useEffect` |
| `bun run build` | Passed | Next.js 16.4.2 (Turbopack) successfully compiled 26 static/dynamic pages |
| `bun typecheck` | Needs config | No direct script in `package.json`; executed via build typecheck |

---

## 3. Financial Integrity & Engine Verification

- **Integer Cents Representation:** All money amounts are stored and calculated as integer cents (`amount_cents`, `availableToday`, `weeklyFlexibleLimit`).
- **Zero Float Leaks in Core Logic:** `engine.ts` uses `Math.floor` and `Math.max(0, ...)` to guarantee no sub-cent fractions leak into state balances.
- **Formulas Verified:**
  - $BaselineDaily = \lfloor WeeklyFlexibleLimit / 7 \rfloor$
  - $StartOfDayRemaining = WeeklyFlexibleLimit - SpendBeforeToday$
  - $PaceCapacityToday = \lfloor \max(0, StartOfDayRemaining) / DaysRemaining \rfloor$
  - $TodayStartLimit = \min(BaselineDaily, PaceCapacityToday)$
  - $AvailableToday = \max(0, TodayStartLimit - SpendToday)$
- **Identified Risk:** In `src/lib/money/index.ts`, `parseMoneyInputToCents` uses `parseFloat` and `Math.round(num * 100)`. While standard, inputs with currency symbols or Khmer numerals are not properly parsed.

---

## 4. Route-by-Route Findings

### 4.1. `/[locale]/today`
- **User Job:** View safe-to-spend balance today, quick log expense, inspect week pace.
- **Primary Action:** Log spend (Quick Add or Check Purchase).
- **Audit Findings:**
  - Hero amount displays clearly with tabular figures.
  - "Why this amount?" disclosure functions well.
  - Quick add triggers optimistic update with undo toast.
  - **Issues:**
    - Hardcoded English strings on status messages and buttons (`"Why this amount?"`, `"Quick add"`, `"Latest activity"`), ignoring `useTranslations("today")`.
    - No skeleton/loading state when loading remote profile or initial data.
    - Missing offline banner when client loses network connection.

### 4.2. `/[locale]/purchase-check` (Drawer / Modal)
- **User Job:** Pre-evaluate discretionary purchase before making it.
- **Audit Findings:**
  - Keypad entry is responsive and quick.
  - Calculates impact on future days and shows opportunity cost (work hours, 10-year compound interest).
  - **Issues:**
    - Lint error on line 53 (`setDigits("")` in `useEffect`).
    - Fixed 24-hour wait action stores item in memory/Supabase, but lacks push notification or clear reminder mechanism.
    - Hardcoded text strings instead of `next-intl` keys.

### 4.3. `/[locale]/plan` & `/[locale]/plan/wait-list`
- **User Job:** Review envelope allocation (Essentials vs Fun) and protected monthly funds.
- **Audit Findings:**
  - Clear visual distinction between flexible weekly and protected monthly funds.
  - **Issues:**
    - Sliders or edit controls for envelopes are missing (read-only mockup).
    - Wait list lacks filtering, sorting, or batch actions.

### 4.4. `/[locale]/activity`
- **User Job:** Audit financial log, reverse erroneous transactions, inspect weekly summaries.
- **Audit Findings:**
  - Transaction list supports filtering by envelope and reversing transactions.
  - **Issues:**
    - Missing date-range selector or pagination for high transaction counts.
    - Empty state lacks an immediate action button linking to Quick Add or Today.

### 4.5. `/[locale]/review`
- **User Job:** Sunday Sweep / Weekly review to allocate remaining surplus.
- **Audit Findings:**
  - Provides clear choices: Future Fund, Carry Next, or Leave Unchanged.
  - **Issues:**
    - No guards preventing premature review submission before week end.

### 4.6. `/[locale]/(onboarding)/*`
- **User Job:** Initial setup of rhythm, income, and envelope template.
- **Audit Findings:**
  - Multi-step wizard (Income -> Template -> Review).
  - Uses `sessionStorage` for cross-step state.
  - **Issues:**
    - In `review-step.tsx`, lint error on `useEffect` hydration.
    - When user navigates directly to `/review` without prior steps, empty fallback lacks friendly redirect.

### 4.7. Missing Route: `/[locale]/progress`
- **Status:** **Missing entirely**.
- **Impact:** Violates PRD user information architecture (Today, Plan, Activity, Progress). Users have no screen to view streaks, discipline milestones, or opt into the anonymous leaderboard.

### 4.8. Missing Route Group: `/[locale]/admin/*`
- **Status:** **Missing entirely**.
- **Impact:** All 10 admin operational workflows (Overview, Users, Strategies, Coach Content, Moderation, Campaigns, Feature Flags, Audit Log, System, Staff) have zero route presence.

---

## 5. Accessibility Audit (WCAG 2.2 AA)

| Criteria | Status | Evidence / Recommendation |
|---|---|---|
| **1.4.3 Contrast (Minimum)** | Needs remediation | `--muted-foreground` (`oklch(0.74 0.02 255)`) on `--background` (`oklch(0.155 0.012 255)`) passes AA for regular text, but `--subtle` (`oklch(0.6 0.02 255)`) falls below 4.5:1 on small text. |
| **2.4.7 Focus Visible** | Partial | `:focus-visible` is globally defined with 2px outline, but some custom buttons in quick-add lack explicit outline-offset breathing room. |
| **2.5.8 Target Size (Minimum)** | Partial | Tab buttons in bottom navigation and quick add cards meet 44px height. However, secondary text links (`See all`, `Why this amount?`) have a clickable target height < 44px without padding hit-slop. |
| **3.1.2 Language of Parts** | Failed | Khmer translations render in the same font size and line height as English, causing glyph clipping on subscripts (e.g. ្) and cramped vertical rhythm. |
| **1.3.1 Info and Relationships** | Partial | Headings (`h1`, `h2`) are present, but document titles (`<title>`) are not updated dynamically per route change. |
| **2.3.3 Animation from Interactions** | Needs improvement | CSS `@keyframes fadeNum` is disabled by `@media (prefers-reduced-motion)`, but Motion for React animations (if added) require explicit `useReducedMotion()` fallback. |

---

## 6. Supabase & Security Authorization Findings

1. **User RLS:** All current tables (`profiles`, `user_preferences`, `plans`, `plan_periods`, `transactions`, `quick_actions`, `wait_items`, `weekly_reviews`, `audit_events`) have strict `auth.uid() = user_id` policies enabled.
2. **Missing Admin Authorization:**
   - No role or claim (`app_metadata.role` or `staff_roles` table) exists in Supabase migrations.
   - No policies exist for support staff, moderators, or admins.
   - If an admin route is created, client-side route guards alone will fail the security mandate: **"A hidden button is not authorization."**
3. **Audit Logging Gap:**
   - `audit_events` table only allows users to insert their own events (`auth.uid() = user_id`). No system or admin audit capability exists.

---

## 7. Performance & Bundle Review

- **Next.js 16.4.2 with Turbopack:** Build completes in ~800ms.
- **Client Components Overuse:** Almost all feature views are marked `"use client"`. Server components should be used for initial page data fetching (profile, active plan, transaction history) to eliminate client-side loading waterfalls and improve First Contentful Paint (FCP).
- **Icons & SVGs:** Lucide icons are imported individually. No heavy custom SVGs or unoptimized lottie animations currently burden the bundle.

---

## 8. Defect Severity Matrix

### P0 (Blockers — Critical Path / Compliance / Build Failures)
1. **P0-1:** `bun run lint` failure breaks CI/CD pipeline (4 React Compiler errors, 1 JSX unescaped entity).
2. **P0-2:** Zero Admin routes, UI, or Supabase RBAC / RLS authorization despite PRD core requirement.
3. **P0-3:** Missing `/[locale]/progress` user route violates the 4-tab core navigation architecture.

### P1 (High Priority — Broken User Journeys / Accessibility Violations)
4. **P1-1:** Raw hardcoded English strings across `today-view.tsx`, `check-panel.tsx`, and `review-step.tsx` breaking Khmer locale.
5. **P1-2:** Absence of dynamic page document titles per route (violates Next.js route announcement and WCAG 2.4.2).
6. **P1-3:** Lack of light theme variables in CSS (`globals.css` only defines dark tokens in `:root`).
7. **P1-4:** Target size failure on text triggers (`See all`, calculation drawer toggle) under 44px touch area.
8. **P1-5:** No loading skeleton or error boundary states for asynchronous data fetching in today/activity views.

### P2 (Medium Priority — Usability & Design Polish)
9. **P2-1:** Raw hex/Tailwind color classes and inconsistent padding values in feature components.
10. **P2-2:** Quick actions lack edit/reorder UI in settings or today view.
11. **P2-3:** Khmer typography vertical rhythm and subscript clipping on Android / Windows browsers.
12. **P2-4:** Missing empty states with affirmative next action on Activity and Wait List screens.

### P3 (Low Priority — Enhancements & Minor Cleanups)
13. **P3-1:** Unused TypeScript imports in `engine.test.ts` and `provider.tsx`.
14. **P3-2:** Nuqs query param integration for tab/filter states in Activity view.
