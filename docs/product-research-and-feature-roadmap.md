# SaveLuy (សន្សំលុយ) — Product Research & Feature Roadmap

> **Document Version:** 1.0.0  
> **Target Platform:** Mobile-First Web PWA (Next.js 16.4.2 App Router, React 19, Supabase SSR, Tailwind CSS)  
> **Market Focus:** Cambodia & Southeast Asia Dual-Currency Cash-Flow Guardrails  
> **Design Philosophy:** Calm Financial Ledger, Zero Friction, Zero Shaming, Mathematical Determinism

---

## 1. Executive Summary & Product Thesis

### 1.1 The Problem Space
Most personal finance applications fail in emerging Southeast Asian economies—and in Cambodia specifically—because they are designed as **retrospective accounting software** or **rigid zero-based envelope spreadsheets** (e.g., YNAB, Mint, Mobills). 

In Cambodia's rapidly modernizing financial landscape:
1. **Dual Currency In Everyday Life:** The economy operates natively on both United States Dollars (USD) and Khmer Riel (KHR). Retail purchases routinely involve paying in USD and receiving change in KHR, or scanning Bakong KHQR codes in KHR while tracking cash reserves in USD.
2. **Cognitive Fatigue at the Counter:** If logging an expense requires more than 4 seconds, multi-step categorization, or manual exchange rate conversions at a busy coffee stall or market, **users abandon the tool within 5 to 7 days**.
3. **The Trap of Guilt & Shaming:** Typical apps show flashing red bars and negative alerts when users exceed limits. Behavioral psychology proves that financial shame triggers cognitive avoidance—users stop opening the app right when they need spending guardrails the most.

### 1.2 The SaveLuy Solution
SaveLuy is **not** an accounting tool, debt tracker, or retro expense report.  
SaveLuy is an **active spending guardrail and cash-flow pacing engine** answering one question at the moment of purchase:

$$\text{\textbf{“Can I safely spend this right now without endangering my rent, bills, or protected cushion?”}}$$

SaveLuy achieves this through:
- **Calm, High-Status Ledger UX:** Monospaced tabular digits, clean physical card cards, quiet progress indicators, and complete absence of infantile gamification (no confetti, no stars, no flashing red alarms).
- **Pure Integer Cents Architecture:** All calculations are performed in minor currency units (USD cents) with explicit, deterministic conversions to KHR (Cambodian Riel).
- **Forward-Looking Daily Pacing:** Adjusts tomorrow's spending capacity dynamically when today's limit is exceeded, preserving peace of mind and long-term financial health.

---

## 2. Target Persona & Field Research Insights

### 2.1 Primary User Archetypes

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SAVELUY PERSONAS                                       │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ 1. Sophea — The Young Pro    │ 2. Dara — The Freelancer      │ 3. Vicheka — Modern    │
│    (Phnom Penh, Age 24)       │    (Siem Reap / Remote, 29)   │    Family Budgeter     │
├───────────────────────────────┼───────────────────────────────┼────────────────────────┤
│ • Income: $500–$800/mo (USD)  │ • Income: $900–$1,800/mo      │ • Income: Dual earner  │
│ • Spends via: KHQR & Cash     │ • Spends via: Bakong / Cards  │ • Spends via: Cash/KHQR│
│ • Pain: Daily cafe drinks,    │ • Pain: Volatile project cash │ • Pain: Fixed bills vs │
│   weekend hangouts eat 40% of │   flows; difficulty knowing   │   daily living balance;│
│   salary before rent day.     │   daily safe-to-spend limit.  │   fear of emergencies. │
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

### 2.2 Deep Field Insights (Cambodia Context)
1. **The KHQR Explosion (Bakong):** Bakong has made cashless payments nearly universal, from high-end supermarkets in BKK1 to rural roadside coconut vendors. Micro-payments ($0.75, $1.25, 6,000 KHR) occur 4–8 times per day. Every friction point in transaction entry multiplies by 8x daily.
2. **Dual-Tender Change Friction:** A customer buys lunch for $3.50, hands over a $10 bill, and receives $6.00 in USD plus 2,000 KHR. In traditional apps, calculating the net expense requires mental arithmetic. SaveLuy must solve this in 2 taps.
3. **PWA Mobile Habitats:** Most users run iOS Safari or Android Chrome with "Add to Home Screen". The interface must operate with the fluid responsiveness of native iOS/Android apps: full support for safe-area insets (`env(safe-area-inset-bottom)`), pull-to-refresh gestures, and zero layout shift.

---

## 3. High-Impact Feature Research & Specifications

Based on financial engineering principles and behavioral design audits, we specify **5 high-impact, genuinely transformative features** for SaveLuy:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                          CORE STRATEGIC ROADMAP                                   │
├───────────────┬─────────────────────────────────────────────────┬─────────────────┤
│ Feature       │ Core Problem Solved                             │ Impact Category │
├───────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ 1. Split-Cash │ Dual-currency register friction & KHQR payment   │ Core Usability  │
│    Tender     │ change mental math. Zero-headache entry.        │ & Daily Habit   │
├───────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ 2. Bill Horizon│ Fixed bills due mid-cycle shock daily pace.     │ Mathematical    │
│    Protection │ Dynamic horizon keeps rent money untouchable.   │ Guardrail       │
├───────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ 3. Impulse 24h│ Emotional buying. 24-hour cooling list with     │ Behavioral      │
│    Cooldown   │ scheduled push reminders to cancel impulse.     │ Psychology      │
├───────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ 4. Offline PWA│ Unstable cellular/Wi-Fi connection during street│ Technical       │
│    Sync       │ payments. Never lose a logged transaction.      │ Resilience      │
├───────────────┼─────────────────────────────────────────────────┼─────────────────┤
│ 5. Weekly     │ End-of-cycle ambiguity. Deliberately sweep or   │ Long-Term       │
│    Sweep      │ roll surplus without guilt or arbitrary resets. │ Wealth Creation │
└───────────────┴─────────────────────────────────────────────────┴─────────────────┘
```

---

### Feature 1: Dual-Currency Split-Tender Capture & Rapid KHQR Calculator

#### The User Need
In Cambodia, paying cash or Bakong KHQR frequently requires mixed calculations:
- Price is quoted in USD ($4.50), but paid with a 20,000 KHR banknote ($5.00 equivalent at 4,000 KHR/$1), returning 2,000 KHR change.
- Or user scans a KHQR merchant code in KHR (e.g., 18,500 KHR) and wants to immediately know how much USD was deducted from their daily allowance.

#### UX Specification
- **Instant Dual-Currency Keypad:** A dedicated toggle directly on the numerical keypad `[$ USD | ៛ KHR]` that converts in real time using the user's configured exchange rate (e.g., 4,000 or 4,100 KHR/USD).
- **"Paid & Change" Calculator Sheet:** A collapsible drawer in Quick Add:
  - Input: *Bill Amount* ($4.50)
  - Tendered: *I gave* ($10.00 bill)
  - Change received: *I got back* (2,000 KHR bill + $3.00 USD)
  - Net calculated deduction: Exactly $4.50 (450 cents) logged to the envelope.
- **Visual Feedback:** Shows both currency equivalents at all times:
  ```
  [ 450 ¢ USD ]  ≈  [ 18,000 ៛ KHR ]
  ```

#### Mathematical Model & Invariants
All internal data structures remain strictly integer cents (USD).
$$\text{Amount}_{\text{cents}} = \text{round}\left(\frac{\text{Amount}_{\text{KHR}}}{\text{ExchangeRate}_{\text{KHR}}} \times 100\right)$$
$$\text{Display}_{\text{KHR}} = \text{round}\left(\frac{\text{Amount}_{\text{cents}}}{100} \times \text{ExchangeRate}_{\text{KHR}}\right)$$

#### Database Impact
No breaking schema change. Add optional metadata to transactions table:
```sql
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS input_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS exchange_rate_snapshot NUMERIC(10, 2) DEFAULT 4000.00,
ADD COLUMN IF NOT EXISTS raw_khr_amount BIGINT;
```

---

### Feature 2: Event-Driven Bill Horizon & Payday Cushion (Dynamic Baseline Protection)

#### The User Need
Currently, `daily(i: DayInputs)` divides the weekly flexible spending evenly:
$$\text{baselineDaily} = \lfloor \text{weeklyFlexibleLimit} / 7 \rfloor$$

However, if a user has a $120 utility/rent bill due in 3 days, flat division gives a false sense of security. If they spend their maximum daily allowance for the first 3 days, they will trigger an emergency on day 4 when the bill hits.

#### UX Specification
- **Scheduled Commitment Mini-Timeline:** A quiet, non-cluttered horizontal bar on the Home tab showing the next 7 days with subtle dots representing upcoming scheduled commitments (e.g., "Electricity $35 on Thursday").
- **Dynamic Horizon Protection:** The wealth engine calculates the *Horizon Protected Reserve*:
  If a bill falls within the current 7-day rolling window, that amount is ring-fenced from the flexible spending pool *before* calculating `availableToday`.
- **Clarity Message:** 
  > *"Safe today: $18.50 ($35 reserved for Electric bill on Thursday)"*

#### Mathematical Formulation
Let:
- $W_{\text{flex}} = \text{Total Weekly Flexible Limit}$
- $B_{\text{horizon}} = \sum \text{Bills due within remaining days of current cycle}$
- $D_{\text{remaining}} = \text{Days remaining in cycle (including today)}$
- $S_{\text{past}} = \text{Spend before today in current cycle}$
- $S_{\text{today}} = \text{Spend today}$

$$\text{NetFlexiblePool} = \max\left(0, W_{\text{flex}} - B_{\text{horizon}} - S_{\text{past}}\right)$$
$$\text{PaceCapacityToday} = \left\lfloor \frac{\text{NetFlexiblePool}}{D_{\text{remaining}}} \right\rfloor$$
$$\text{TodayStartLimit} = \min(\text{BaselineDaily}, \text{PaceCapacityToday})$$
$$\text{AvailableToday} = \max\left(0, \text{TodayStartLimit} - S_{\text{today}}\right)$$

This completely prevents bill-shock without requiring complex calendar software.

---

### Feature 3: Impulse Cooldown 2.0 (24h Waiting-List Awakening & Push Notification)

#### The User Need
SaveLuy currently includes a `WaitItem` model (`unlockAt: ISO string`). When users face an impulse purchase, they enter it into the Wait List. However, currently the user must remember to open the app 24 hours later to check it.  
Behavioral science shows that **72% of impulse cravings dissipate within 24 hours**, but if the app does not prompt the user, the item stays in limbo and the user feels no sense of closure or reward.

#### UX Specification
1. **Web Push Notification Integration (Service Worker):**
   - At exactly $T + 24\text{h}$:
     > **Title:** SaveLuy Cooling Check  
     > **Body:** 24 hours have passed for “Sony Headphones ($120)”. Do you still want to buy this, or celebrate the save?
2. **The 2-Tap Closure Sheet:**
   When tapping the notification or opening the Waitlist tab:
   - **Button A (Calm Green):** *“I don't need it — Return to Reserve”*  
     → Logs item as a "Resisted Impulse". Adds $120 to user's "Protected Cents Saved" lifetime stat.
   - **Button B (Neutral Ledger):** *“I still need it — Buy Now”*  
     → Deducts directly from Essentials or Fun envelope, logging transaction seamlessly.
3. **Behavioral Psychology Dashboard:**
   Displays: *“You have paused $480 in impulse spending this month, avoiding $340 in non-essential buys.”*  
   This provides pure positive psychological reinforcement without gamified gimmickry.

#### Technical Architecture
- Service Worker registration via `public/sw.js`.
- Supabase Edge Function running on `pg_cron` or scheduled webhook every 15 minutes checking:
  ```sql
  SELECT * FROM public.wait_items 
  WHERE status = 'active' AND unlock_at <= NOW() AND notified_at IS NULL;
  ```
- Standard Web Push API (VAPID keys) sending encrypted push payload to subscribed endpoints.

---

### Feature 4: Zero-Latency Offline-First Queue & Background Replay Engine

#### The User Need
In Cambodia, internet connections frequently drop inside basement parking, local wet markets (Toul Tompoung / Orussey), or during high-density evening gatherings. If a user tries to log a coffee or meal and sees an error spinner or lost transaction, trust is broken.

#### Architecture Specification
```
┌────────────────────────────────────────────────────────────────────────┐
│                      OFFLINE REPLAY PIPELINE                           │
│                                                                        │
│   [ User Quick Add ] ──► [ Generate Client UUID ]                      │
│                               │                                        │
│                               ▼                                        │
│                    [ Write to IndexedDB ]                              │
│                               │                                        │
│          ┌────────────────────┴────────────────────┐                   │
│          ▼                                         ▼                   │
│   [ Optimistic State ]                    [ Network Status ]           │
│   (Instant UI update,                       │                          │
│    Safe-to-spend adjusts)           Online? ├──► YES: Flush to Supabase│
│                                             │                          │
│                                             └──► NO: Listen for 'online│
│                                                      event & replay    │
└────────────────────────────────────────────────────────────────────────┘
```

#### Key Implementation Details
1. **Client-Generated UUIDs:** All transaction IDs are generated on the client via `crypto.randomUUID()`. The database table uses `PRIMARY KEY (id)` with `ON CONFLICT (id) DO NOTHING`. This guarantees idempotency and zero duplicate entries on retries.
2. **IndexedDB Local Store (`saveluy_offline_queue`):**
   - Stores pending mutations: `{ id, action: 'CREATE_TX', payload, createdAt, attempts }`.
3. **Offline Visual Indicator:**
   A subtle, calm badge in the header:
   ```tsx
   <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
     <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
     <span>Offline • 2 queued</span>
   </div>
   ```
4. **Auto-Reconciliation:** When `navigator.onLine` fires, the queue synchronizes with Supabase with exponential backoff.

---

### Feature 5: End-of-Cycle Quiet Sweep Ritual (Surplus Capital Protection)

#### The User Need
At the end of the 7-day cycle (e.g., Sunday night or cycle anchor day), what happens to leftover daily allowance?
- If it vanishes silently, the user feels cheated of their discipline.
- If it automatically rolls into next week, it inflates next week's baseline, encouraging binge spending on Monday.

SaveLuy needs an intentional, dignified **Sunday Night Capital Sweep**.

#### UX Specification
- **The Ritual Card:** Appears on the Dashboard on the morning of the cycle reset day:
  > **Week Complete: $42.50 Remaining**  
  > *“You spent less than your daily allowance this week. Where should this capital go?”*
- **Three Deliberate Allocations:**
  1. **Lock to Emergency Cushion (Recommended):** Transfers the entire $42.50 into the protected Future Fund. Strengthens financial immunity.
  2. **Rollover as Special Flex Cushion:** Keeps it as a secondary, separate buffer for the upcoming weekend.
  3. **Reset Clean:** Discards rollover; resets next week strictly to original baseline.
- **Review Summary Table:**
  Displays a 7-day quiet bar graph comparing daily limit vs actual expenditure, highlighting steady pacing.

---

## 4. Prioritization & Feasibility Matrix

We evaluate each feature across **User Impact**, **Technical Complexity**, **Implementation Risk**, and **Strategic Fit**:

| Feature | User Impact | Tech Complexity | Risk | Priority Score | Recommendation |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. Split-Cash & KHQR Calculator** | **High (9.5/10)** | Low (3/10) | Very Low | **9.2 / 10** | **Sprint 1 (Immediate)** |
| **2. Dynamic Bill Horizon Cushion** | **High (9.0/10)** | Medium (5/10) | Low | **8.8 / 10** | **Sprint 1 (Immediate)** |
| **3. Offline IndexedDB Queue** | **High (8.5/10)** | Medium (5/10) | Low | **8.2 / 10** | **Sprint 2** |
| **4. Impulse 24h Web Push Cooldown**| **High (8.0/10)** | Medium (6/10) | Medium | **7.6 / 10** | **Sprint 2** |
| **5. End-of-Cycle Capital Sweep** | **Medium (7.5/10)**| Low (3/10) | Low | **7.5 / 10** | **Sprint 3** |

---

## 5. Architectural Implementation Blueprint

### 5.1 Sprint 1: Split-Cash Calculator & Dual-Tender Quick Add
1. **Extend `src/lib/wealth-engine/engine.ts`**:
   - Add utility function `calculateSplitTender(billCents, paidCents, paidKhr, exchangeRate)` returning net cents.
2. **UI Component: `<SplitTenderSheet>`**:
   - Seamlessly integrated inside the existing Quick Add bottom sheet.
   - Dedicated numerical keypad with instant currency toggle (`USD` / `KHR`).
   - Clean tabular preview before confirming transaction.
3. **Localization**:
   - Add translations to `messages/en.json` and `messages/km.json`:
     - `quickAdd.splitTender`: *"Split Cash / Change Calculator"* / *"ម៉ាស៊ីនគិតលុយអាប់ (ដុល្លារ/រៀល)"*
     - `quickAdd.tendered`: *"Amount Paid"* / *"ចំនួនបានបង់"*
     - `quickAdd.changeReceived`: *"Change Received"* / *"លុយអាប់បានទទួល"*

### 5.2 Sprint 2: Bill Horizon & Scheduled Commitment Protection
1. **Database Schema (`supabase/migrations/`)**:
   - Create table `public.scheduled_commitments` with `user_id`, `amount_cents`, `label`, `due_day_of_month`, `category`.
2. **Update Wealth Engine**:
   - Augment `DayInputs` with `horizonCommitmentsCents: number`.
   - Update `daily()` to deduct horizon commitments prior to pace calculation.
3. **UI Dashboard Component**:
   - Add `<HorizonReserveBanner>` beneath the Safe-to-Spend display, clearly explaining any ring-fenced funds.

### 5.3 Sprint 3: Offline Sync Engine & Web Push
1. **Local Storage Layer**:
   - Implement `src/lib/offline/queue.ts` using `idb` (IndexedDB lightweight wrapper).
2. **Mutation Sync Hook**:
   - Wrap Supabase transaction inserts with an optimistic cache updater and background worker.
3. **Web Push Registration**:
   - Implement service worker handler `sw.js` for `push` and `notificationclick` events.

---

## 6. Design System & UX Principles Checklist

Before any code is merged, verify compliance with SaveLuy's Core UX Standards:
- [ ] **Tabular Digits:** All monetary figures use `font-mono tracking-tight tabular-nums`.
- [ ] **Dual-Currency Parity:** Every primary USD amount has an accessible, clean KHR equivalent.
- [ ] **Safe-Area Inset Compliance:** Bottom bars and modals respect `env(safe-area-inset-bottom)`.
- [ ] **No Star/Sparkle Icons:** Keep visual tone serious, calm, and trustworthy.
- [ ] **Touch Targets:** All interactive buttons and inputs are minimum $44 \times 44\text{px}$.
- [ ] **Zero-Jank Animations:** Use Tailwind transitions $\le 200\text{ms}$ with `ease-out`.
- [ ] **Bilingual Equivalence:** Every string is localized in both English (`en-KH`) and Khmer (`km-KH`).

---

*Authored by Antigravity Engineering & Financial UX Team*  
*SaveLuy Architecture & Design Document*
