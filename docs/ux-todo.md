# UX / UI & Engineering Implementation TODO

**Project:** BrokeNoMore  
**Target Viewport:** 390 × 844 CSS px  
**Date:** 17 October 2026  
**Status:** Audit Complete (Phase 0 Done); Ready for Phase 1 Execution

---

## Phase 0 — Audit & Architecture (Completed)
- [x] **UX-P0-000: Comprehensive Codebase & Flow Audit**
  - Completed `docs/ux-audit.md`
  - Completed `docs/pwa-startup-audit.md`
  - Completed `docs/financial-integrity-audit.md`
  - Completed `docs/adr/ADR-001-pwa-app-shell.md`
  - Completed `docs/adr/ADR-002-money-minor-units.md`
  - Completed `docs/adr/ADR-003-onboarding-draft-and-activation.md`

---

## Phase 1 — Financial Integrity & Invariant Safety (Next)
- [ ] **UX-P0-001: Pure Integer Minor Units & Strict String-Split Decimal Parsing**
  - **Area:** Money engine (`src/lib/money/index.ts`)
  - **Evidence:** `IMG_9877`, `IMG_9875` ($20,000 / $20,040 unit scale errors)
  - **Task:** Ban `parseFloat * 100`. Implement string decimal token parsing, currency metadata, and formatting policy.
  - **Dependencies:** None
  - **Tests:** Add unit tests verifying parsing of `$200.00`, `$0.01`, `$19.99`, KHR integer amounts, and malformed inputs.
- [ ] **UX-P0-002: Plan Feasibility Equation & Cross-Field Zod Validation**
  - **Area:** Validation schemas (`src/lib/validation/schemas.ts`)
  - **Evidence:** `IMG_9880`, `IMG_9878` ($200 income with $160 protected + $50/wk flexible = $376 total commitment)
  - **Task:** Enforce $\text{Protected} + (\text{Weekly} \times 4.3333) \le \text{Income}$. Reject overallocated plans with exact shortfall messaging.
  - **Dependencies:** `UX-P0-001`
  - **Tests:** Unit tests proving $200 cannot activate $160 + $50/wk.
- [ ] **UX-P0-003: Forward Database Migration for Plan Check Constraints & RPC Validation**
  - **Area:** Supabase SQL migrations (`supabase/migrations/`)
  - **Task:** Propose migration adding table-level check constraint on `plans` and validation in `complete_onboarding` and `log_expense`.
  - **Dependencies:** `UX-P0-002`
- [ ] **UX-P0-004: Waiting-List 24-Hour Enforcement & Server-Side Verification**
  - **Area:** Planning (`src/features/planning/wait-list-view.tsx`, `src/lib/api/supabase-service.ts`)
  - **Evidence:** `IMG_9874` (Buy button enabled while item locked until Sunday)
  - **Task:** Disable Buy button until `unlockAt <= now()`; display real-time countdown; add server-side check.
  - **Dependencies:** None
  - **Tests:** Test wait item unlocking behavior before and after expiry.
- [ ] **UX-P0-005: Idempotency Keys & Tap Debounce on Quick-Add Mutations**
  - **Area:** Transactions (`src/features/planning/today-view.tsx`, `src/lib/wealth-engine/provider.tsx`)
  - **Evidence:** `IMG_9872` (Duplicate transactions & tiny entries from rapid taps)
  - **Task:** Attach deterministic `client_mutation_id` per intent; add 600ms tap locking on quick-add chips.
  - **Dependencies:** None

---

## Phase 2 — PWA Startup, App Shell & Zero-Blank Architecture
- [ ] **UX-P0-006: Self-Hosted Fonts & Removal of External Head Blockers**
  - **Area:** Root layout (`src/app/layout.tsx`)
  - **Task:** Migrate from external Google Fonts `<link>` tags to Next.js `next/font/google`.
- [ ] **UX-P0-007: Route Skeletons (`loading.tsx`) for Instant Shell Painting**
  - **Area:** App routes (`src/app/[locale]/(app)/loading.tsx`, `(onboarding)/loading.tsx`)
  - **Task:** Stream theme-accurate skeletons immediately upon navigation.
- [ ] **UX-P0-008: Unified App Shell, Safe-Area Ownership & Locked Scroller**
  - **Area:** Components (`src/components/app-shell/app-shell.tsx`)
  - **Evidence:** `IMG_9874`–`IMG_9884` (Collision with notch, bottom navigation obscuring content)
  - **Task:** Implement locked viewport with inner scroll root, `env(safe-area-inset-top)` contextual top bar, and reserved dock clearance.
- [ ] **UX-P0-009: iOS Touch Startup Images & Maskable Manifest Icons**
  - **Area:** PWA configuration (`src/app/manifest.ts`, static startup link tags in `<head>`)

---

## Phase 3 — Login & Onboarding Redesign
- [ ] **UX-P1-010: Reversible Onboarding with 44 × 44px Back Button & Durable Draft State**
  - **Area:** Onboarding (`src/features/onboarding/`)
  - **Evidence:** `IMG_9880`, `IMG_9878` (No back button; lost state on refresh)
  - **Task:** Add top bar with Back target and step indicator; persist draft in `localStorage` / user metadata.
- [ ] **UX-P1-011: Dynamic Percentage-Based Plan Templates**
  - **Area:** Onboarding (`src/features/onboarding/template-step.tsx`)
  - **Task:** Replace static dollar templates with dynamic calculations derived from declared income.
- [ ] **UX-P1-012: Review & Adjust Screen with Full Allocation Equation**
  - **Area:** Onboarding (`src/features/onboarding/review-step.tsx`)
  - **Task:** Display balanced equation, inline envelope adjusters, and unallocated buffer.
- [ ] **UX-P1-013: Installed-PWA Login Variant with Tap Locking & Error States**
  - **Area:** Auth (`src/features/auth/login-view.tsx`, `src/proxy.ts`)
  - **Task:** Single-screen installed PWA login, duplicate-tap locking, and direct server redirect for complete returning users.

---

## Phase 4 — Design System & Authenticated App Screens
- [ ] **UX-P2-014: "Quiet Glass Ledger" Design Tokens & Restrained Navigation Glass**
  - **Area:** Styles (`src/app/globals.css`, `tokens.css`)
  - **Task:** Restrain glass to top app bar and bottom dock; keep money cards and forms opaque for contrast.
- [ ] **UX-P2-015: Refine Today, Plan, Activity & Settings Screens**
  - **Area:** Feature views
  - **Evidence:** `IMG_9870` ("Other amo..." truncation), `IMG_9883` (Internal UUID displayed)
  - **Task:** Rename "Other amo..." to "Custom", remove UUID from account UI, group settings logically.
- [ ] **UX-P2-016: Geometric Custom SVG Illustrations**
  - **Area:** Components (`src/components/illustrations/`)
  - **Task:** Original `currentColor` SVG illustrations for empty waitlist, empty activity, and offline states.

---

## Phase 5 — Motion, Accessibility & Localization (Khmer / USD / KHR)
- [ ] **UX-P2-017: WCAG 2.2 AA Contrast & 44 × 44px Touch Targets**
- [ ] **UX-P2-018: Reduced Motion & Reduced Transparency Fallbacks**
- [ ] **UX-P2-019: Khmer Localization QA & Currency Display Policy**

---

## Phase 6 — QA Verification & Release Gate
- [ ] **UX-P0-020: Full Automated Verification Suite**
  - Run `bun run lint`
  - Run `bun run typecheck`
  - Run `bun test`
  - Run `bun run build`
  - Execute Playwright journey suites across 320px, 390px, and 768px viewports in light & dark modes.
