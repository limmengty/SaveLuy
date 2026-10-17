# UX/UI and Architecture Audit

**Target Viewport:** 390 × 844 CSS px (iPhone 14 / modern iOS & Android standard)  
**Date:** 17 October 2026  
**Auditor:** Principal UX Engineer & PWA Specialist  
**Status:** Complete (Phase 0)

---

## 1. Executive Summary & Routing Architecture

### Route Tree & Layout Hierarchy
```text
src/app/
├── layout.tsx (Root Layout: ThemeProvider, font preconnects, viewport metadata)
├── manifest.ts (PWA manifest: standalone mode, background #0b0f17, theme #10b981)
├── icon.tsx, apple-icon.tsx, favicon.ico
├── auth/
│   └── callback/route.ts (OAuth code exchange, profile bootstrap, onboarding gate)
└── [locale]/
    ├── layout.tsx (next-intl IntlServerProvider, locale html sync)
    ├── page.tsx (Redirects to /[locale]/today)
    ├── (marketing)/
    │   └── login/page.tsx (Public login page, server redirect to /today if authenticated)
    ├── (onboarding)/
    │   └── onboarding/
    │       ├── layout.tsx (Onboarding container shell)
    │       ├── income/page.tsx (Step 1: Rhythm + Estimated income)
    │       ├── template/page.tsx (Step 2: Template selection)
    │       └── review/page.tsx (Step 3: Review & plan activation)
    └── (app)/
        ├── layout.tsx (AppGroupLayout: server-side onboarding gate, redirect to /onboarding/income)
        ├── today/page.tsx (TodayView wrapped in AppShell)
        ├── plan/
        │   ├── page.tsx (PlanView)
        │   └── wait-list/page.tsx (WaitListView)
        ├── activity/page.tsx (ActivityView with nuqs filter)
        ├── progress/page.tsx (ProgressView)
        ├── review/page.tsx (WeeklyReviewView)
        └── settings/page.tsx (SettingsView)
```

### Client vs. Server Component Boundaries
- **Server Components:**
  - `src/app/layout.tsx` (Root layout)
  - `src/app/[locale]/layout.tsx` (Locale provider layout)
  - `src/app/[locale]/(app)/layout.tsx` (Auth & onboarding server gate)
  - All page entries: `today/page.tsx`, `plan/page.tsx`, `login/page.tsx`, etc.
  - Route handlers: `src/app/auth/callback/route.ts`
- **Client Islands (`"use client"`):**
  - `src/components/app-shell/app-shell.tsx` (Desktop sidebar, mobile header, bottom dock, check drawer trigger)
  - Feature views: `TodayView`, `PlanView`, `ActivityView`, `ProgressView`, `SettingsView`, `WaitListView`
  - Onboarding step components: `IncomeStep`, `TemplateStep`, `ReviewStep`
  - Overlays & Drawers: `CheckPanel`, `EmergencyUnlockModal`, `TransactionDetailModal`
  - Engine & Query Providers: `WealthEngineProvider`, `QueryProvider`

---

## 2. Screenshot Evidence & Root-Cause Verifications

| Symptom / Screenshot | Code-Level Root Cause | Verification & Risk |
|---|---|---|
| **$200 income vs. $160 protected + $50/wk flexible** (`IMG_9880`, `IMG_9878`, `IMG_9879`) | Step 2 templates hardcode static dollar amounts ($30 essentials, $20 fun, $120 fixed, $40 future = $160 protected + $50 weekly). For a $200 income, $50/wk equates to ~$216/mo flexible. Total = $376/mo against $200 declared. No cross-field validation checked `income >= protected + (weekly * 4.3333)` on client or server. | **P0 Critical:** Leads user into immediate overdraft and false sense of spending headroom. |
| **$20,000 Home & Fixed and $20,040 Emergency Max** (`IMG_9877`, `IMG_9875`, `IMG_9882`) | In `IncomeStep`, default `monthlyIncome` was set to `20000` ($200.00 in cents). In input fields without explicit currency masks, typing `200` was interpreted or converted inconsistently between display dollars and minor cents, or a test entered 20000 directly. Furthermore, emergency maximum in `PlanView` was directly computed as `plan.homeFixedMonthly + plan.futureFundMonthly` without server verification of true protected accrual or balance. | **P0 Critical:** Massive scale errors in financial figures destroy credibility and risk erroneous financial decisions. |
| **Installed PWA White Screen on Cold Launch** (User report) | 1. Fonts loaded via blocking external Google CDN links in `<head>` rather than self-hosted `next/font`.<br>2. Missing iOS splash images (`apple-touch-startup-image`) in `<head>` for iPhone viewports.<br>3. Theme initialization via next-themes without inline anti-flash script.<br>4. No route-level `loading.tsx` skeletons for instant shell painting while data queries initialize. | **P0 Critical:** iOS WebKit displays pure white canvas until full JavaScript bundle hydration and network requests complete. |
| **Header / Safe-Area Clipping & Covered Dock** (`IMG_9874`–`IMG_9884`) | `AppShell` rendered `header` sticky with `top-0` without `env(safe-area-inset-top)`. In standalone PWA mode, status bar overlay collided with brand mark and title. Mobile dock applied `pb-[env(safe-area-inset-bottom)]`, but scroll container had standard `pb-32` without dynamic viewport safe area calculation. Page scroll was held on `window` rather than locked inner scroll container. | **P1 High:** Interactive elements under notch and bottom home indicator are unreachable or mis-tapped. |
| **No Onboarding Back Button** (`IMG_9880`, `IMG_9878`, `IMG_9879`) | `IncomeStep`, `TemplateStep`, and `ReviewStep` only contained a forward "Continue" button. Browser back navigation or refreshing cleared `sessionStorage`, stranding the user. | **P1 High:** Users cannot fix typos or change income cadence without abandoning setup. |
| **Buy Button Active on Locked Waiting List** (`IMG_9874`) | `WaitListView` computed `isReadyToReview = new Date(item.unlockAt) <= new Date()`, but the "Buy" button was rendered enabled with no disabled state or countdown lock, allowing users to buy immediately while the label still stated "Unlocks Sunday". | **P1 High:** Violates the core 24-hour behavioral cool-off mechanic. |
| **Duplicate Activity Rows & Tiny $0.01 Transactions** (`IMG_9872`) | Quick-add buttons had no client-side tap debounce or pending mutation lock. Consecutive rapid taps generated multiple transactions. No minimum amount check or duplicate command deduplication ID was enforced on the client. | **P1 High:** Unintended double entries corrupt Available Today and clutter ledger history. |
| **Internal Truncated UUID in Settings** (`IMG_9883`, `IMG_9884`) | `SettingsView` line 214 rendered `ID: {userId?.slice(0, 8)}...` prominently in the identity section. | **P2 Medium:** Confusing internal implementation detail for non-technical users. |
| **"Other amo…" Label Truncation** (`IMG_9870`) | Quick-add card grid forced button label truncation on 375–390px screens. | **P2 Medium:** Looks broken and unpolished. |

---

## 3. Auth Cookie, Proxy, and Callback Flow

1. **Proxy (`src/proxy.ts`)**:
   - Executes `next-intl` localization middleware first.
   - Updates Supabase SSR session via `updateSession(request)`.
   - Protects private routes: redirects unauthenticated users to `/[locale]/login?next=...`.
   - Protects login: redirects already authenticated users directly to `/[locale]/today`.
   - *Issue Identified:* If an authenticated user has not completed onboarding, `proxy.ts` redirects `/login` to `/today`, where `(app)/layout.tsx` must then redirect to `/onboarding/income`. This creates a two-hop redirect.
2. **Callback (`src/app/auth/callback/route.ts`)**:
   - Exchanges PKCE code for Supabase session.
   - Bootstraps `profiles` row with Google avatar and display name.
   - Checks user metadata (`onboarding_completed_at`), active plan in `plans` table, and `profiles.onboarding_completed_at`.
   - If user has no plan and no completion marker, directs to `/en-KH/onboarding/income`.
   - Otherwise redirects to `safeNext` (validated against open redirects).
3. **App Group Layout (`src/app/[locale]/(app)/layout.tsx`)**:
   - Validates user session server-side.
   - Evaluates onboarding completion with triple-fallback:
     1. `user.user_metadata.onboarding_completed_at` (fastest, immune to schema cache).
     2. `plans` table query for `is_active = true`.
     3. `profiles.onboarding_completed_at`.
   - Redirects to `/onboarding/income` only if no active plan and no completion flag exists.

---

## 4. Accessibility & Component Inventory

- **Touch Targets:**
  - App shell bottom navigation: 56px height (Passes WCAG 2.2 AA).
  - Floating Check button: 56 × 56px (Passes).
  - Quick-add cards: 68px height (Passes).
  - Settings avatar change trigger: 28 × 28px (Fails 44 × 44px recommendation; needs expansion).
- **Contrast & Colors:**
  - Dark mode canvas (`oklch(0.14 0.01 250)`) with text (`oklch(0.96 0.005 250)`): > 10:1 (Passes AAA).
  - Muted text (`oklch(0.72 0.015 250)`): ~5.2:1 (Passes AA).
  - Primary emerald accent (`oklch(0.78 0.14 162)` on dark): ~8.5:1 (Passes AAA).
- **Motion & Reduced Motion:**
  - `@media (prefers-reduced-motion: reduce)` resets duration to `0.01ms` in `globals.css`.
  - Motion transitions in dialogs and sheets must avoid animating backdrop blur under reduced motion.
- **Khmer (km-KH) Typography:**
  - Uses `Kantumruy Pro` with line-height 1.72 and letter-spacing 0.012em.
  - Number strings formatted with `km-KH` locale and `JetBrains Mono` tabular figures.

---

## 5. Next Steps for Implementation
Proceed immediately to Phase 1 (Financial Integrity) upon approval of Phase 0 deliverables.
