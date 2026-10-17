# Financial Integrity & Money Engine Audit

**Target:** Pure integer cents (minor units), deterministic calculations, atomic commands  
**Date:** 17 October 2026  
**Auditor:** Financial Data Safety Reviewer  
**Status:** Complete (Phase 0)

---

## 1. Core Financial Invariants & Problem Statement

BrokeNoMore's promise is **"One trustworthy Available Today number."** If that number is derived from invalid arithmetic, inconsistent conversions, or overallocated plans, the user's financial confidence is destroyed.

### Critical Invariants
1. **Integer Minor Units Everywhere:**
   - Every monetary quantity in storage, state, and RPC must be an integer count of minor units (cents for USD, whole riels for KHR).
   - Floats, ad-hoc string parsing, or `parseFloat(val) * 100` must be banned from business logic.
2. **Allocation Invariant (Plan Feasibility):**
   - A financial plan cannot allocate more than declared income.
   - Using the standard normalization constant ($1\text{ month} \approx 4.3333\text{ weeks}$ or $\frac{52}{12}\text{ weeks}$):
     $$\text{Protected Monthly} + \left(\text{Weekly Flexible} \times \frac{52}{12}\right) \le \text{Monthly Income}$$
   - Any plan violating this inequality is **overallocated** and must be rejected during onboarding review, editing, and database insertion.
3. **Idempotent & Atomic Execution:**
   - Every financial mutation (transaction creation, reversal, waiting-list conversion, plan activation) must accept a unique `client_mutation_id`.
   - Rapid double-tapping must never create duplicate transactions.
4. **Emergency Ceiling Derived Server-Side:**
   - The emergency unlock maximum must never be taken from client form parameters. It must be derived from the user's active plan's accrued protected funds.

---

## 2. Audit of Existing Equations & Code Paths

### A. The $200 Income vs. $160 Protected + $50 Weekly Inconsistency (`IMG_9880`, `IMG_9878`, `IMG_9879`)
- **Code Location:** `src/features/onboarding/template-step.tsx` lines 13–41 & `review-step.tsx` lines 32–56.
- **Flaw:**
  ```typescript
  // Static templates in template-step.tsx:
  essentialsWeekly: 3000, // $30/wk
  funWeekly: 2000,        // $20/wk  => Total weekly = $50/wk
  fixedMonthly: 12000,    // $120/mo
  futureMonthly: 4000,    // $40/mo  => Total protected = $160/mo
  ```
  - For a user who declares $200.00/mo income, the template assigns:
    - Protected: $160.00/mo
    - Weekly flexible: $50.00/wk $\times 4.3333 = \$216.67/\text{mo}$
    - **Total Plan Commitment:** $\$160.00 + \$216.67 = \$376.67/\text{mo}$.
    - **Overallocated by:** $\$176.67/\text{mo}$ ($88\%$ over income!).
- **Impact:** The user is immediately put on an impossible budget where spending the weekly allowance bankrupts their fixed obligations.
- **Fix:** Templates must be dynamically derived percentages of validated monthly income (e.g. 50% fixed/future, 35% flexible weekly, 15% buffer), with cross-field Zod validation.

---

### B. Unit Conversion Anomalies ($20,000 Display / $20,040 Emergency Max) (`IMG_9877`, `IMG_9875`, `IMG_9882`)
- **Code Location:** `src/features/planning/plan-view.tsx` line 212:
  ```typescript
  <EmergencyUnlockModal
    isOpen={showUnlockModal}
    onClose={() => setShowUnlockModal(false)}
    maxAmountCents={plan.homeFixedMonthly + plan.futureFundMonthly}
  />
  ```
- **Flaws:**
  1. `maxAmountCents` is calculated client-side simply as the sum of a single month's planned fixed + future envelopes, rather than accrued balance.
  2. In `IncomeStep`, `defaultValues` set `monthlyIncome: 20000` (which is $200.00 in cents). When displayed or edited in input fields without fixed input mask formats, users typing `200` into inputs expecting raw numbers resulted in 200 cents ($2.00) or 20,000 cents ($200.00) being misinterpreted as $20,000.
  3. `parseMoneyInputToCents`:
     ```typescript
     export function parseMoneyInputToCents(val: string): number {
       const sanitized = val.replace(/[^0-9.]/g, "");
       const num = parseFloat(sanitized);
       if (isNaN(num)) return 0;
       return Math.max(0, Math.round(num * 100));
     }
     ```
     `parseFloat` introduces IEEE 754 precision issues (e.g. `19.99 * 100 = 1998.9999999999998`).
- **Fix:** Use pure string decimal splitting for integer cents (`[dollars, cents]`), and add explicit min/max bounds checking.

---

### C. Waiting-List 24-Hour Behavioral Violation (`IMG_9874`)
- **Code Location:** `src/features/planning/wait-list-view.tsx` lines 74–87:
  ```typescript
  const isReadyToReview = new Date(item.unlockAt) <= new Date();
  ...
  <button
    onClick={() => {
      addTransaction({...});
      removeWaitItem(item.id);
    }}
    className="min-h-11 rounded-xl bg-primary px-4 py-2 text-xs font-semibold..."
  >
    {t("buy")}
  </button>
  ```
- **Flaw:** The "Buy" button is completely active and clickable regardless of `isReadyToReview`!
- **Fix:**
  - `disabled={!isReadyToReview}` with an explicit countdown lock icon.
  - Server-side RPC `convert_wait_item` must verify `now() >= unlock_at` before allowing transaction creation.

---

### D. Duplicate Transactions & Lack of Idempotency Keys in UI
- **Code Location:** `src/features/planning/today-view.tsx` lines 220–235:
  ```typescript
  onClick={() => {
    const tx = addTransaction({
      amount: q.amount,
      envelope: q.envelope,
      label: q.label,
    });
    ...
  }}
  ```
- **Flaw:**
  - No pending state on the quick action button.
  - If a user double-taps on mobile, two separate calls execute with two newly generated client mutation IDs.
- **Fix:**
  - Add active tap lock: disable button for 600ms on tap.
  - Generate deterministic `client_mutation_id` per intention.
  - Database unique constraint on `(user_id, client_mutation_id)` protects against replays.

---

## 3. Database Schema, Constraints & RPC Audit

### Current Migration (`supabase/migrations/20261016000000_initial_schema.sql`)
- **`plans` Table:**
  - Has checks `essentials_limit_cents >= 0`, `fun_limit_cents >= 0`, etc.
  - **Missing:** Cross-field table constraint enforcing:
    $$\text{home\_fixed\_monthly\_cents} + \text{future\_fund\_monthly\_cents} + \left((\text{essentials\_limit\_cents} + \text{fun\_limit\_cents}) \times \frac{52}{12}\right) \le \text{monthly\_flexible\_income\_cents}$$
- **`complete_onboarding` RPC:**
  - Takes 6 parameters.
  - **Missing:** Validation check inside PL/pgSQL function before inserting into `plans`.
- **`log_expense` RPC:**
  - Has `client_mutation_id text default null`.
  - Already checks for existing `client_mutation_id` and returns existing row. Good foundation! Needs front-end to pass it reliably.
- **`wait_items` Conversion:**
  - Currently handled via client calling `addTransaction` followed by `removeWaitItem`.
  - Needs a dedicated atomic RPC `convert_wait_item(p_wait_id uuid, p_client_mutation_id text)` enforcing server time.

---

## 4. Phase 1 Implementation Plan

1. **Central Money Engine (`src/lib/money/index.ts`):**
   - Replace float math with string-split integer parsing.
   - Introduce currency metadata table (USD: 2 decimals, minor unit 1 cent; KHR: 0 decimals, minor unit 1 riel).
   - Add month-normalization constant: `MONTH_WEEKS_RATIO = 52 / 12` ($4.333333$).
2. **Cross-Field Validation Schemas (`src/lib/validation/schemas.ts`):**
   - Add Zod `.refine()` enforcing total commitment $\le$ monthly income.
3. **Database Migration:**
   - Propose forward migration adding plan feasibility check constraint and updating `complete_onboarding` RPC with strict allocation validation.
4. **Automated Test Suite:**
   - Add unit tests proving $200 cannot produce $20,000.
   - Add tests proving overallocated plans are rejected.
   - Add tests proving duplicate quick-add taps are prevented.
