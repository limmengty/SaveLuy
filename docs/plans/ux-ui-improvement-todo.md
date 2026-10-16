# BrokeNoMore UX/UI Improvement Implementation Backlog

This checklist contains discrete, traceable tasks derived directly from the UX/UI Audit and 2.0 PRD. Every task specifies evidence, dependencies, acceptance criteria, and verification tests.

---

### [x] UX-001 — Resolve React Compiler Lint Errors in Client Hooks & Views
- **Priority:** P0
- **Area:** Performance
- **Finding:** `bun run lint` exits with code 1 due to 4 cascading synchronous `setState` calls inside `useEffect` (`review-step.tsx`, `check-panel.tsx`, `use-mobile.ts`) and unescaped apostrophe in `today-view.tsx`.
- **Evidence:** Terminal output from `bun run lint` (13 problems, 4 errors).
- **User impact:** Causes cascading re-renders, degrades framerate on mobile devices, and prevents CI/CD builds from passing cleanly.
- **Proposed change:** Refactor state initialization to derive initial state from props or lazy initializers; replace direct `setState` inside effect bodies with idiomatic pattern or event handlers; escape apostrophe in JSX.
- **Files likely affected:**
  - `src/features/onboarding/review-step.tsx`
  - `src/features/purchase-check/check-panel.tsx`
  - `src/features/planning/today-view.tsx`
  - `src/hooks/use-mobile.ts`
- **Dependencies:** None
- **Acceptance criteria:**
  - [x] `bun run lint` passes with 0 errors.
  - [x] No cascading re-renders triggered on view mounting.
- **Tests:**
  - [x] Run `bun run lint`
  - [x] Run `bun test`
- **Effort:** S
- **Rollout/rollback:** Direct safe refactor in codebase.

---

### [x] UX-002 — Add Missing Progress Destination & Update Shell Navigation
- **Priority:** P0
- **Area:** User
- **Finding:** PRD specifies a 4-destination core navigation (Today, Plan, Activity, Progress) with centered Purchase Check. The route `/[locale]/progress` is missing and the bottom nav has placeholder tab items.
- **Evidence:** Route inspection of `src/app/[locale]` shows no `progress` route; `src/components/app-shell/app-shell.tsx` has inconsistent mobile tab layout.
- **User impact:** Users cannot track streaks, discipline milestones, or participate in the optional anonymous league.
- **Proposed change:** Create `src/app/[locale]/(app)/progress/page.tsx` and `src/features/progress/progress-view.tsx`. Update `app-shell.tsx` navigation items to match the PRD 4-tab model + center action.
- **Files likely affected:**
  - `src/app/[locale]/(app)/progress/page.tsx`
  - `src/features/progress/progress-view.tsx`
  - `src/components/app-shell/app-shell.tsx`
- **Dependencies:** None
- **Acceptance criteria:**
  - [x] Route `/[locale]/progress` is navigable from both desktop sidebar and mobile bottom nav.
  - [x] Mobile bottom nav renders 4 tabs (Today, Plan, Activity, Progress) + center elevated Check Purchase action.
- **Tests:**
  - [x] Component mount and navigation test in Playwright/Bun test.
- **Effort:** M
- **Rollout/rollback:** Feature-flagged navigation item if needed.

---

### [x] UX-003 — Complete i18n Localization for Today & Check Panel Views
- **Priority:** P1
- **Area:** Design system
- **Finding:** Key strings in `today-view.tsx`, `check-panel.tsx`, and `income-step.tsx` are hardcoded in English, ignoring `next-intl` translation catalogs.
- **Evidence:** Lines 89, 127, 166, 174 in `src/features/planning/today-view.tsx` contain literal English strings while keys exist in `src/messages/en-KH.json` and `km-KH.json`.
- **User impact:** Khmer-speaking users see mixed English/Khmer screens, degrading trust in a financial product.
- **Proposed change:** Replace all raw text strings with `t("key")` calls using `useTranslations("today")` and `useTranslations("check")`. Add any missing keys to both `en-KH.json` and `km-KH.json`.
- **Files likely affected:**
  - `src/features/planning/today-view.tsx`
  - `src/features/purchase-check/check-panel.tsx`
  - `src/features/onboarding/income-step.tsx`
  - `src/messages/en-KH.json`
  - `src/messages/km-KH.json`
- **Dependencies:** None
- **Acceptance criteria:**
  - [x] Zero hardcoded English strings in `today-view.tsx` and `check-panel.tsx`.
  - [x] Switching locale to `km-KH` renders 100% Khmer copy.
- **Tests:**
  - [x] Visual inspection and snapshot test under `km-KH` locale.
- **Effort:** S
- **Rollout/rollback:** Safe in-place catalog binding.

---

### [x] UX-004 — Define Obsidian Ledger Light Theme Tokens & Refactor Raw Tokens
- **Priority:** P1
- **Area:** Design system
- **Finding:** `:root` defines dark theme values; there are no light theme token overrides. Raw pixel values and hardcoded colors exist across components.
- **Evidence:** `src/app/globals.css` lines 4–42 define only dark `:root`; `today-view.tsx` and `app-shell.tsx` use non-semantic classes.
- **User impact:** Users with system preferences set to light theme get unreadable or unstyled interfaces when switching modes.
- **Proposed change:** Define complete OKLCH semantic variables for `.light` mode adhering to Obsidian Ledger (clean parchment/stone surfaces, deep charcoal text, controlled emerald accent). Enforce semantic token usage across all UI primitives.
- **Files likely affected:**
  - `src/app/globals.css`
  - `src/components/ui/button.tsx`
  - `src/components/app-shell/app-shell.tsx`
- **Dependencies:** None
- **Acceptance criteria:**
  - [x] Light mode and dark mode both achieve WCAG 2.2 AA contrast ratios (>4.5:1 for body, >3:1 for large text).
  - [x] Theme toggling works seamlessly via `next-themes` or user preference setting.
- **Tests:**
  - [x] Contrast ratio audit with axe-core in both themes.
- **Effort:** M
- **Rollout/rollback:** Token variable update.

---

### [x] UX-005 — Touch Target Sizing (44px) & Visible Focus Audit
- **Priority:** P1
- **Area:** Accessibility
- **Finding:** Secondary links ("See all", calculation accordion toggle) and some icon buttons have touch targets under 44x44px.
- **Evidence:** `today-view.tsx` line 175 (`<Link className="text-sm font-semibold text-primary">See all</Link>`) measures ~20px tall on mobile without hit padding.
- **User impact:** Users on mobile devices experience mis-taps when trying to expand calculations or inspect activity.
- **Proposed change:** Apply `min-h-11 min-w-11` or accessible padding wrappers to all interactive links and buttons. Ensure all focusable controls have 2px offset visible focus rings.
- **Files likely affected:**
  - `src/features/planning/today-view.tsx`
  - `src/components/app-shell/app-shell.tsx`
  - `src/features/transactions/activity-view.tsx`
- **Dependencies:** None
- **Acceptance criteria:**
  - [x] All interactive controls have at least 44x44px physical or touch-slop boundary.
  - [x] Keyboard navigation displays high-contrast focus rings on every focusable item.
- **Tests:**
  - [x] Run axe automated check; manual keyboard tab walkthrough.
- **Effort:** S
- **Rollout/rollback:** CSS utility update.

---

### [x] UX-006 — Route Titles and Dynamic Metadata Announcements
- **Priority:** P1
- **Area:** Accessibility
- **Finding:** App routes rely on layout titles and lack unique `<title>` document metadata, causing screen readers and Next.js client router announcements to be ambiguous.
- **Evidence:** `src/app/[locale]/(app)/today/page.tsx` exports a bare component without `generateMetadata` or `metadata: Metadata`.
- **User impact:** Blind and screen-reader users cannot tell what page they just navigated to.
- **Proposed change:** Add localized `generateMetadata` to every route page (`today`, `plan`, `activity`, `review`, `settings`, `progress`, `login`) producing formats like `BrokeNoMore — Today`.
- **Files likely affected:**
  - `src/app/[locale]/(app)/**/page.tsx`
  - `src/app/[locale]/(marketing)/**/page.tsx`
- **Dependencies:** UX-003
- **Acceptance criteria:**
  - [x] Document title updates on every route transition in both English and Khmer.
  - [x] Screen readers announce the page title on route navigation.
- **Tests:**
  - [x] Playwright E2E title check across all routes.
- **Effort:** S
- **Rollout/rollback:** Metadata addition.

---

### [x] UX-007 — Implement Admin RBAC Database Migration & RLS Policies
- **Priority:** P0
- **Area:** Security
- **Finding:** Database schema has zero admin tables, roles, or policies. Any user attempting admin operations has neither database permissions nor an authorization boundary.
- **Evidence:** `supabase/migrations/20261016000000_initial_schema.sql` only has user-scoped policies (`auth.uid() = user_id`).
- **User impact:** Inability to perform support, moderation, content management, or security audits without risking data breaches or unauthorized access.
- **Proposed change:** Create migration `20261017000000_admin_rbac.sql` introducing `staff_roles` (`support_agent`, `content_manager`, `moderator`, `analyst`, `super_admin`), audit logging for staff actions, and database functions checking staff permissions.
- **Files likely affected:**
  - `supabase/migrations/20261017000000_admin_rbac.sql`
- **Dependencies:** None
- **Acceptance criteria:**
  - [x] Only users with verified staff roles can read admin views or execute staff operations.
  - [x] Regular users attempting to query admin tables receive RLS access denied.
- **Tests:**
  - [x] Supabase RLS test suite verifying allow/deny policies.
- **Effort:** L
- **Rollout/rollback:** Forward-only SQL migration.

---

### [x] UX-008 — Scaffold Admin Console Shell & Attention Queue (Section 1)
- **Priority:** P0
- **Area:** Admin
- **Finding:** Admin console is completely absent from the codebase.
- **Evidence:** No `src/app/[locale]/admin` directory exists.
- **User impact:** Support and product staff cannot monitor product health, moderation queues, or system incidents.
- **Proposed change:** Create `src/app/[locale]/admin/layout.tsx` with responsive desktop sidebar / tablet sheet shell. Build Section 1: Overview Attention Queue showing active incidents, moderation items, and system health status.
- **Files likely affected:**
  - `src/app/[locale]/admin/layout.tsx`
  - `src/app/[locale]/admin/page.tsx`
  - `src/features/admin/overview-queue.tsx`
  - `src/features/admin/admin-shell.tsx`
- **Dependencies:** UX-007
- **Acceptance criteria:**
  - [x] Admin shell enforces server-side staff role check before rendering.
  - [x] Attention queue orders items by severity and age.
- **Tests:**
  - [x] Role-based access E2E test (unauthorized redirect to login; authorized renders queue).
- **Effort:** L
- **Rollout/rollback:** Route group behind staff auth middleware.

---

### [x] UX-009 — Loading Skeletons, Error Boundaries & Offline Fallbacks
- **Priority:** P1
- **Area:** User
- **Finding:** App lacks skeleton loading states and network error boundaries. In offline or poor connection states, UI shows blank screens or fails silently.
- **Evidence:** Feature components do not render skeletons when TanStack Query / Supabase service is fetching initial payload.
- **User impact:** Users on unstable mobile connections experience layout shifts, flash of unstyled content, or unresponsive buttons.
- **Proposed change:** Add `loading.tsx` skeletons for `today`, `plan`, `activity`, and `progress`. Implement an offline status bar and optimistic rollback indicators.
- **Files likely affected:**
  - `src/app/[locale]/(app)/today/loading.tsx`
  - `src/app/[locale]/(app)/activity/loading.tsx`
  - `src/components/ui/skeleton.tsx`
  - `src/components/product/offline-indicator.tsx`
- **Dependencies:** UX-002
- **Acceptance criteria:**
  - [x] Visual skeleton displayed during data loading without layout shifts.
  - [x] Offline notification banner appears when `navigator.onLine === false`.
- **Tests:**
  - [x] Offline simulation test in Playwright.
- **Effort:** M
- **Rollout/rollback:** Component addition.

---

### [x] UX-010 — Ledger Lines SVG System & Purposeful Motion Integration
- **Priority:** P2
- **Area:** SVG & Motion
- **Finding:** Icons are generic Lucide instances; animated numbers use a basic CSS keyframe. No bespoke Ledger Lines illustrations or Motion for React micro-interactions exist.
- **Evidence:** `package.json` does not include `motion` or `framer-motion`; illustrations on empty states are missing.
- **User impact:** The app feels like a generic template rather than the bespoke, calm "Obsidian Ledger" experience promised in the PRD.
- **Proposed change:** Introduce lightweight, bespoke SVG line illustrations for empty states (No activity, No wait items, All caught up). Implement smooth tab transitions and verdict reveals using Motion for React with strict `prefers-reduced-motion` compliance.
- **Files likely affected:**
  - `package.json`
  - `src/components/illustrations/ledger-lines.tsx`
  - `src/features/purchase-check/check-panel.tsx`
  - `src/features/planning/today-view.tsx`
- **Dependencies:** UX-001, UX-004
- **Acceptance criteria:**
  - [x] Custom SVGs are optimized (<3KB each) with `aria-hidden="true"` or descriptive titles.
  - [x] All animations gracefully revert to instant opacity transitions when `prefers-reduced-motion: reduce` is enabled.
- **Tests:**
  - [x] Motion reduced-motion test; bundle size analysis.
- **Effort:** M
- **Rollout/rollback:** Package addition and component enhancement.
