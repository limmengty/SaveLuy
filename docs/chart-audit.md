# SaveLuy Financial Visualization System Audit

## 1. Executive Summary & Purpose
This audit analyzes SaveLuy's current architecture, data sources, calculation models, and design system before implementing a mobile-first, decision-centric visualization system.

The core product promise of SaveLuy is:
> **"How much can I safely spend today without touching protected money?"**

Charts in SaveLuy are **not accounting dashboards** and **not decorative eye candy**. Every chart exists to answer one decision-focused question within 5 seconds on low-to-mid range mobile devices.

---

## 2. Canonical Data Sources & Invariant Verification

| Domain Concept | Canonical Source | DB Representation | Minor Units / Scale | Invariant Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Transactions** | `public.transactions` | `amount_cents` integer | Cents (USD) / Riels (KHR) | `amount_cents > 0`, `reversed = false` for active spend |
| **Reversals** | `public.transactions` | `reversed` boolean, `reverses_transaction_id` | N/A | Excluded completely from active spending tallies |
| **Active Plan** | `public.plans` (`is_active = true`) | `essentials_limit_cents`, `fun_limit_cents`, etc. | Integer cents | Sum of weekly limits + emergency relief = weekly flexible limit |
| **Emergency Relief** | `plan.emergencyReliefCents` / `audit_events` | `emergency_unlock` / `emergency_revert` | Integer cents | Deducts from protected vault, credits active weekly flexible cycle |
| **Pacing Cycle Start** | `plan.cycleAnchorDay` | integer (0=Sun, 1=Mon, 5=Fri, 6=Sat) | N/A | Week boundaries calculated via `weekStart(now, cycleAnchorDay)` |
| **Protected Funds** | `homeFixedMonthly` + `futureFundMonthly` | Integer cents | Monthly integer cents | Vault never touched by regular transactions |
| **Weekly Reviews** | `public.weekly_reviews` | `planned_cents`, `spent_cents`, `remainder_cents`, `action` | Integer cents | Remainder disposition: `future`, `carry`, or `leave` |

---

## 3. Technology Stack & Dependency Inspection

- **React / Next.js**: React 19.3.0, Next.js 16.4.2 (Turbopack, App Router).
- **Chart Primitive**: Recharts 3.10.1 installed and verified cleanly with React 19 and TypeScript.
- **State & Caching**: TanStack Query (`@tanstack/react-query` ^5.104.3), WealthEngine React context with optimistic local storage fallback.
- **URL Filter State**: `nuqs` (^2.10.2) for shareable filter states without re-rendering page trees.
- **Localization**: `next-intl` (^4.14.9) with full dual parity for `en-KH` and `km-KH`.
- **CSS / Theme Tokens**: Tailwind v4 with OKLCH tokens (`--chart-1` through `--chart-5`, `--primary`, `--warning`, `--destructive`).

---

## 4. Current UX / UI Structure & Chart Placement

1. **Today View (`/today`)**:
   - Primary Hero: "Available Today" + status badge + daily progress bar.
   - **Visualization Addition**: Compact **Weekly Pace Mini-Chart** (`<WeeklyPaceMini />`) placed directly under the hero explanation and above Quick Add, keeping touch targets tight (120-140px tall).
   - Quick Add 6-grid.
   - Latest Activity transactions.
   - Link to Progress for historical analysis.

2. **Plan View (`/plan`)**:
   - Monthly Income & Protected Vault breakdown.
   - **Visualization Addition**: Horizontal **Envelope Usage Bars** (`<EnvelopeUsageBars />`) showing Essentials vs Fun Money budget vs spend vs remaining.
   - Editable money fields & Template Switcher.

3. **Progress View (`/progress`)**:
   - Pacing Streak & Protected Funds summary.
   - **Visualization Addition 1**: **Weekly Pace Detailed Chart** (`<WeeklyPaceChart />`) with cumulative plan line vs actual spend.
   - **Visualization Addition 2**: **Flexible Spending Breakdown** (`<SpendingBreakdownChart />`) with period toggle (`week` | `last-week` | `month`).
   - **Visualization Addition 3**: **Protected Money Trend** (`<ProtectedMoneyChart />`) showing protected vault consistency across weeks.

4. **Activity View (`/activity`)**:
   - Deep-linked from chart elements (e.g. clicking an envelope bar opens Activity filtered by that envelope via nuqs).

---

## 5. Security & Row Level Security (RLS) Inspection

- All tables (`plans`, `plan_periods`, `transactions`, `weekly_reviews`, `audit_events`) have strict RLS enabled: `auth.uid() = user_id`.
- Aggregations are strictly client-side or scoped via `auth.uid()`.
- Client requests never pass an arbitrary `user_id`.

---

## 6. Audit Verdict
All financial rules and invariants are verified. No production data alteration or destructive migrations are needed. Proceeding to define data contracts and implementation plan.
