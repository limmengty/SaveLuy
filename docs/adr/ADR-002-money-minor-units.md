# Architecture Decision Record (ADR): Money Minor Units, Parsing, and Invariant Feasibility

**Status:** Accepted  
**Date:** 17 October 2026  
**Deciders:** Financial Data Safety Reviewer, Principal Backend Engineer  
**Context:**  
Evidence from screenshots (`IMG_9877`, `IMG_9875`, `IMG_9880`, `IMG_9882`) showed multiple severe financial integrity bugs:
1. $200 declared monthly income coexisting with $160 protected monthly commitments and $50/week flexible allowance (which normalizes to ~$216/month, causing an impossible $376 budget against $200 income).
2. Ad-hoc string parsing (`parseFloat * 100`) causing precision drift and $20,000 / $20,040 unit scale errors.
3. Emergency maximum allowed access calculated purely client-side without server validation of eligible accrued protected funds.
4. Currency switches silently reinterpreting existing raw cents as riels.

---

## Decision

1. **Pure Integer Minor Units End-to-End:**
   - All amounts in database columns, API payloads, state objects, and calculation engines represent integer minor units (e.g. cents for USD, whole riels for KHR).
   - No floating-point multiplication in money conversions. Parsing uses strict decimal string token splitting:
     ```typescript
     // e.g. "12.50" => split '.' => 12 * 100 + 50 = 1250 cents
     ```
   - All values must be non-negative integers below $10,000,000.00 (1 billion cents).

2. **Feasibility Equation & Month-Normalization Standard:**
   - In accordance with banking standards, weekly allowances are normalized to a monthly baseline using the exact average weeks per month constant:
     $$\text{WEEKS\_PER\_MONTH} = \frac{52}{12} \approx 4.3333333333$$
   - Total plan commitment is defined as:
     $$\text{Total Monthly Commitment} = \text{homeFixedMonthly} + \text{futureFundMonthly} + \text{Math.ceil}\left((\text{essentialsWeekly} + \text{funWeekly}) \times \frac{52}{12}\right)$$
   - **Hard Invariant:**
     $$\text{Total Monthly Commitment} \le \text{monthlyFlexibleIncome}$$
   - Any plan violating this rule is deemed **overallocated**. Overallocated plans cannot be activated in the UI, cannot pass Zod validation, and are rejected by database check constraints and RPC validation.

3. **Currency Display & Metadata Policy:**
   - Monetary values store their associated currency code (`USD` or `KHR`).
   - Changing preferred currency in Settings updates user preferences for future plans; it **never** reinterprets existing stored minor units (e.g. 20000 cents does not become 20000 riels).

4. **Derivation of Emergency Maximum:**
   - The maximum emergency unlock amount is derived server-side from actual accrued protected fund balances, never accepted as an arbitrary client input parameter.

---

## Consequences

- **Positive:**
  - Complete elimination of impossible budgets and misleading "Available Today" numbers.
  - Zero floating-point rounding errors ($19.99 remains exactly 1999 cents).
  - Unbreakable client and server trust boundary.
- **Trade-offs:**
  - Users with older invalid legacy plans must be detected on startup and routed to a repair flow (`/plan/repair`) rather than computing an inaccurate Available Today figure.
