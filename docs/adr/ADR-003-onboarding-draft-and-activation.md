# Architecture Decision Record (ADR): Onboarding State Durability, Reversibility, and Plan Activation

**Status:** Accepted  
**Date:** 17 October 2026  
**Deciders:** Principal UX Engineer, Senior Frontend Engineer  
**Context:**  
Evidence from screenshots and runtime inspection:
1. Onboarding steps 1–3 had no Back navigation button. A user on Step 2 or 3 who made a typo on income could not go back without refreshing or clearing storage.
2. In-flight onboarding state was held only in ephemeral client `sessionStorage`. Closing the browser or losing network connection wiped the user's progress.
3. Templates in Step 2 used static hard-coded dollar numbers ($30, $20, $120, $40) that were completely decoupled from the income declared in Step 1, producing impossible plans for lower incomes ($200) and inadequate plans for higher incomes ($5,000).
4. Step 3 (Review) did not display the allocation equation or unallocated buffer before activation.
5. In previous versions, returning users were repeatedly looped back to onboarding due to Postgres RPC schema cache errors (`PGRST202` / `PGRST204`).

---

## Decision

1. **Reversible & Navigable Onboarding Shell:**
   - Every onboarding step (1, 2, 3) provides a top bar with a dedicated 44 × 44px Back target, a step progress indicator ("Step X of 3"), and a "Save & Exit" option.
   - Step 1 Back requires confirmation ("Leave setup? Your draft is saved") before exiting to login.
   - Step 2 Back returns to Step 1 with entered income and rhythm prefilled.
   - Step 3 Back returns to Step 2 with template selection preserved.

2. **Durable Onboarding Draft Persistence:**
   - Onboarding drafts are saved to `localStorage` (with server sync to user profile draft metadata when authenticated) on every field change.
   - If the user refreshes, closes the app, or completes an OAuth redirect, they resume at the exact unfinished step.

3. **Dynamic Template Generation from Validated Income:**
   - Static dollar templates are replaced with dynamic percentage-based allocation engines derived from the user's validated monthly income:
     - **Balanced Starter (Recommended):** Fixed commitments 50%, Future fund 15%, Weekly essentials 20% (split over weeks), Weekly fun 10%, Buffer 5%.
     - **Safety First:** Fixed commitments 55%, Future fund 20%, Weekly essentials 15%, Weekly fun 5%, Buffer 5%.
     - **Flex Forward:** Fixed commitments 40%, Future fund 10%, Weekly essentials 25%, Weekly fun 20%, Buffer 5%.
   - Every generated template is mathematically guaranteed to fit within declared income.

4. **Mandatory Review & Adjust (Step 3):**
   - Step 3 presents the clear equation:
     $$\text{Monthly Income} - \text{Protected Commitments} - \text{Weekly Flexible (Monthly Eq)} = \text{Unallocated Buffer}$$
   - Displays real-time status: **Balanced**, **Unallocated Buffer**, or **Overallocated**.
   - Inline adjustments allow fine-tuning envelopes directly on this screen before activation.
   - Activation is disabled if overallocated.

5. **Atomic Activation & Idempotent Navigation:**
   - Activating a plan calls `completeOnboarding` atomically.
   - Marks `onboarding_completed_at` in Supabase Auth metadata and database profile.
   - Routes once to `/today`.
   - Returning users with an active plan and completion flag are routed directly to `/today` and never see onboarding again.

---

## Consequences

- **Positive:**
  - High user confidence during setup with zero risk of stranded data or irreversible mistakes.
  - Zero impossible plans generated.
  - Rock-solid session continuity across PWA restarts.
- **Trade-offs:**
  - Dynamic template calculations require clean roundings to whole dollar or thousand-riel boundaries to avoid awkward cents in baseline templates.
