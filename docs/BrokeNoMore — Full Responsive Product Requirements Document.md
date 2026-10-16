# BrokeNoMore — Full Responsive Product Requirements Document

## Document control

| Field | Specification |
|---|---|
| Product | BrokeNoMore |
| Working URL | `brokenomore.vercel.app` |
| Document type | Product requirements document, UX specification, responsive frontend specification |
| Version | 2.0 |
| Status | Implementation-ready proposal |
| Primary platforms | Responsive web application and installable PWA |
| Mobile baseline | 390 × 844 CSS pixels |
| Smallest supported width | 320 CSS pixels |
| Desktop baseline | 1440 × 900 CSS pixels |
| Target stack | Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Supabase Auth and Postgres |
| Authentication | Google OAuth; demo mode for prototype evaluation |
| Initial locale | English with Cambodia-ready USD/KHR and Khmer architecture |
| Accessibility target | WCAG 2.2 Level AA; selected AAA usability targets |
| Product owner | To be assigned |
| Design owner | To be assigned |
| Engineering owner | To be assigned |

Next.js 15 App Router supports file-system routing, nested layouts, loading states, error handling, Server Components, and client navigation, which fit the proposed route and shell architecture. Supabase’s official Next.js guidance supports cookie-based authentication, TypeScript, Tailwind CSS, browser/server clients, and server-side session handling.[^1][^2][^3][^4][^5][^6]

## Product summary

BrokeNoMore is a responsive personal spending-planning application that tells users what is reasonable to spend **today** without using money reserved for home, fixed commitments, or future goals. It combines a clear daily allowance, one-tap expense capture, pre-purchase impact checks, flexible re-pacing, optional cooling-off periods, and a short weekly review.

The product is not a bank, wallet, accounting system, investment adviser, or transaction blocker. In its initial form, it records a user’s plan and spending decisions. It must never imply that money is technically transferred, invested, guaranteed, or locked unless a future regulated integration actually performs that action.

### Product promise

> **Know what is okay to spend today—without touching money set aside for home, bills, or your future.**

### Core interaction loop

1. See **Available today**.
2. Record a purchase in one tap or check it before buying.
3. Understand the immediate effect on the week.
4. Keep protected commitments visible.
5. Review the week and decide what to do with the remainder.

Real-time spending feedback is central to the proposition. CFPB research found strong consumer interest in real-time remaining-to-spend information, while a trial discussed in the same report observed lower spending among people who received feedback. The interface therefore prioritizes present-tense decisions over retrospective charts.[^7]

## Problem statement

Most budgeting products tell users what happened after the money is gone. Category charts, month-end reports, and complex allocation screens require interpretation at the moment when the user instead needs a simple answer: **Can this purchase fit without damaging the rest of the week?**

The baseline user has limited disposable income, repeated small daily expenses, family or home contributions that must remain protected, and little tolerance for data entry. A monthly budget can appear healthy while today’s decision still creates a shortfall before payday. BrokeNoMore turns the weekly plan into an explainable daily number and updates that number after every recorded action.

### User problems

- Users cannot quickly translate a monthly or weekly plan into an amount that is reasonable to spend today.
- Small repeated purchases are tedious to record, so tracking becomes incomplete.
- Conventional dashboards reveal overspending after the fact.
- Savings and household commitments are mentally mixed with spendable money.
- Unexpected spending makes a static budget feel “failed,” encouraging abandonment.
- Financial products often use judgmental warnings or unexplained scores.
- Mobile-only layouts can feel sparse and inefficient on desktop, while desktop-first dashboards become cramped on phones.
- Cambodia-based users may manage both USD and KHR, use cash and KHQR, and have monthly, weekly, biweekly, or irregular income.

## Vision and principles

### Vision

BrokeNoMore should become the fastest, clearest place to make a small daily money decision. The interface should feel calm, authored, local, and trustworthy—never like a collection of generic fintech cards or AI-generated motivational content.

### Experience principles

1. **Facts before personality.** Show amount, impact, assumptions, and recovery path before coaching copy.
2. **One dominant decision per view.** Every screen has a clear primary task.
3. **Protection without entrapment.** Add friction to discretionary decisions while preserving emergency access.
4. **Explain every changing number.** Any calculated value has a “Why?” disclosure.
5. **Recovery over perfection.** A changed week produces a revised plan, not a failed user.
6. **Fast common actions, deliberate risky actions.** Coffee can take one tap; protected-fund changes require review.
7. **Platform-appropriate, feature-equivalent.** Mobile and desktop offer the same essential capability but use layouts suited to their contexts.
8. **Local by construction.** Currency, language, week start, pay cycle, timezone, and payment method are data, not hard-coded copy.
9. **No false intelligence.** Deterministic rules are called rules, calculations, or guidance—not AI.
10. **Privacy by default.** Financial amounts are not exposed to community features or analytics.

Responsive design should preserve the answer and core capability across devices while changing placement and density. Mobile should prioritize content over interface chrome, while desktop should avoid stretching a phone layout into sparse, excessively long pages.[^8][^9][^10]

## Goals and non-goals

### Product goals

- Allow a first-time user to create a comprehensible starter plan in under two minutes.
- Allow a returning user to understand today’s available amount in under five seconds.
- Record a saved frequent expense with one tap and no typing.
- Complete a custom expense in under ten seconds.
- Evaluate a prospective purchase with amount, envelope, and immediate weekly impact.
- Preserve protected commitments when discretionary spending changes.
- Recalculate future daily guidance after overspending without declaring the budget failed.
- Provide equivalent core workflows on mobile, tablet, laptop, and desktop.
- Meet WCAG 2.2 AA and remain functional at 320 CSS pixels and 200% text scaling.
- Support local-first prototype use, then synchronize safely to Supabase after authentication.
- Prepare for English/Khmer and USD/KHR without redesigning the data model.

### Non-goals

- Direct custody of funds.
- Bank transfers or actual investment transactions.
- Automatic KHQR payment initiation in the first release.
- Credit scoring, lending, cash advances, or debt collection.
- Tax preparation or business accounting.
- Full bank-feed reconciliation in the first release.
- Guaranteed investment-return projections.
- Personalized investment advice.
- A chatbot as the primary navigation model.
- Public display of salary, balances, transactions, or amount saved.
- Mandatory social competition.

## Success metrics

### North-star metric

**Weekly Protected Plan Completion Rate:** percentage of active users who finish a weekly period without reducing a protected commitment below its planned amount.

This metric reflects the product promise better than raw session time, number of taps, or XP earned.

### Activation metrics

- Percentage of new users who complete a plan.
- Percentage who can correctly explain “Available today” in a short comprehension check.
- Percentage who record a first transaction.
- Time from authentication or demo entry to first usable Today screen.

### Habit metrics

- Weekly active planners.
- Weeks with at least three recorded spending days.
- Percentage of expenses captured using quick actions.
- Weekly review completion rate.
- Percentage of users returning after an adjusted or needs-decision state.

### Outcome metrics

- Protected-plan completion rate.
- Percentage of weeks ending with a non-negative flexible balance.
- Cooling-off items dismissed after review.
- Self-reported confidence in daily spending decisions.
- Reduction in calculation misunderstandings during usability tests.

### Guardrail metrics

- Rate of accidental expense corrections.
- Rate of “Why this amount?” openings followed by support or error actions.
- Percentage of users reporting shame, pressure, or confusion.
- Authentication failures.
- Sync conflicts or duplicate transactions.
- Accessibility task-failure rate.
- Community opt-out and complaint rate.

## Users and scenarios

### Primary persona: Home supporter

- Earns approximately $500 per month.
- Contributes approximately $200 to home or family.
- Wants fixed commitments and future money protected.
- Uses a combination of cash and QR payments.
- Repeats small expenses such as coffee, meals, transport, and drinks.
- Needs a daily answer rather than a finance lesson.
- May use the product primarily from an Android phone but occasionally review plans on a laptop.

### Secondary persona: Irregular earner

- Receives freelance, commission, or informal income at uneven times.
- Cannot rely on one monthly payday.
- Needs percentages, income batches, and adjustable period dates.
- Wants extra income divided automatically by a transparent rule.

### Secondary persona: Student or starter

- Has a smaller income and a specific education or skill goal.
- Needs simple category language and very low input effort.
- Is more open to playful copy but still requires respectful treatment.

### Secondary persona: Desktop planner

- Performs daily logging on mobile.
- Uses desktop for weekly review, transaction correction, plan adjustment, and comparison.
- Benefits from denser tables, persistent navigation, visible calculation explanations, and side-by-side summaries.

### Jobs to be done

- “When I am about to buy something, tell me how it changes the rest of my week.”
- “When I buy something routine, let me record it without opening a form.”
- “When the week changes unexpectedly, give me a workable new pace instead of telling me I failed.”
- “When I look at a number, let me understand where it came from.”
- “When I set aside family or future money, help me keep it mentally separate.”
- “When I use a laptop, show more useful context rather than a stretched mobile screen.”

## Scope and release model

### MVP scope

- Google OAuth and demo mode.
- Responsive application shell.
- Onboarding and starter templates.
- Today dashboard.
- Quick expenses.
- Custom expense entry.
- Purchase Check.
- Activity and transaction correction.
- Plan and envelope management.
- Weekly review.
- Calm guidance style.
- USD, Cambodia timezone support, and architecture for KHR/Khmer.
- Local persistence and authenticated cloud persistence.
- Offline-tolerant capture.
- WCAG 2.2 AA baseline.

### Phase 1.1

- Straight-talk guidance style.
- Wait 24 Hours list.
- Extra-income rules.
- KHR entry and dual-currency display.
- Khmer localization.
- Installable PWA enhancements and background sync.

### Phase 2

- Opt-in private challenges.
- Pseudonymous community cohort.
- Import tools or regulated integrations after security and legal review.
- More advanced income cycles and shared-household planning.

## Product language

### Approved terms

| Concept | Product term | Avoid |
|---|---|---|
| Daily allowance | Available today | Safe to spend, free money |
| Household commitments | Home and fixed | Burden, obligation score |
| Savings or long-term goal | Future fund | Guaranteed wealth |
| Discretionary category | Fun money | Guilt-free, bad spending |
| Budget categories | Plan groups or envelopes | Smart AI buckets |
| Automatic behavior | Rule | AI decision |
| Changed daily amount | Adjusted plan | Failed budget |
| Delay decision | Wait 24 hours | Jail, punishment |
| Serious voice | Calm | Buffett mode |
| Playful direct voice | Straight talk | Roast by default |
| Reward indicator | Momentum | Discipline score |
| Remaining weekly money | Weekly remainder | Winning money |

### Tone

- Direct, brief, and non-judgmental.
- Use verbs that describe actions: add, adjust, wait, move, review.
- Avoid moral labels such as good, bad, disciplined, irresponsible, or failure.
- Humor may target the situation or item, never the user’s intelligence, income, family, culture, or worth.
- Financial consequence copy always appears before optional personality copy.
- Do not name living financial personalities as in-product authority without permission and legal review.

### Example copy

**Calm:** “This purchase is $7.86 above today’s amount. If you add it, tomorrow’s amount becomes about $5.18 through Sunday.”

**Straight talk:** “This shirt fits the week, but the rest of the week gets tighter: about $5.18 a day.”

**Never use:** “Bro, you are broke again.”

## Information architecture

### Primary destinations

| Destination | Purpose | Mobile | Desktop |
|---|---|---|---|
| Today | Daily amount, quick add, current state | Bottom navigation | Left sidebar |
| Activity | Transactions, corrections, filters | Bottom navigation | Left sidebar |
| Check | Prospective purchase action | Raised center action | Primary sidebar/top-bar action |
| Plan | Envelopes, rules, income, strategy | Bottom navigation | Left sidebar |
| Profile | Settings, language, currency, privacy | Bottom navigation | Avatar menu and sidebar |
| Weekly review | Period-end review | Contextual card/deep link | Sidebar sub-item and contextual card |
| Wait list | Cooling-off items | Within Plan or contextual link | Sidebar sub-item under Plan |
| Community | Optional challenge area | Profile/More; not primary | Secondary sidebar section |

The Check control is an action rather than a navigation destination. It opens a bottom drawer on compact screens and a right-side panel or centered dialog on larger screens. If loaded from a shared or restored URL, `/check` renders as a full route with identical state.

### Route map

```text
/
├── /login
├── /demo
├── /auth/callback
├── /onboarding
│   ├── /income
│   ├── /template
│   └── /review
└── /(app)
    ├── /today
    ├── /activity
    ├── /activity/[transactionId]
    ├── /check
    ├── /plan
    ├── /plan/[bucketId]
    ├── /plan/rules
    ├── /plan/wait-list
    ├── /review
    ├── /community
    └── /settings
        ├── /profile
        ├── /appearance
        ├── /language-currency
        ├── /privacy
        └── /accessibility
```

`/dashboard` remains as a compatibility redirect to `/today`.

## Responsive strategy

### Responsive philosophy

BrokeNoMore uses one product and one semantic component system, not separate mobile and desktop applications. Content and capability remain equivalent, while navigation, density, control placement, and disclosure adapt to available space. W3C reflow guidance requires content to work at the equivalent of 320 CSS pixels without loss of information or two-dimensional scrolling for normal vertical content.[^11]

### Breakpoints

| Mode | Width | Primary navigation | Content behavior |
|---|---:|---|---|
| Compact | 320–639 px | Fixed bottom navigation | One column; bottom drawers; stacked cards |
| Medium | 640–1023 px | Compact left rail or bottom navigation depending on orientation | One or two columns; modal sheets; wider dialogs |
| Expanded | 1024–1439 px | Persistent 232 px sidebar | Two-column application layout |
| Wide | 1440 px and above | Persistent 248 px sidebar | Main content plus optional 320–360 px context rail |

Breakpoints are content-driven. Components must not assume a specific phone model or desktop resolution.

### Application shells

#### Compact shell

- Full-width application canvas.
- Header height: 56 px plus safe-area handling.
- Screen horizontal padding: 16 px.
- Bottom navigation height: 68 px plus `env(safe-area-inset-bottom)`.
- Scroll content receives bottom padding large enough to remain above navigation.
- Check action floats within the navigation system but has a text label.
- Drawers use nearly full width and a maximum height of 92dvh.
- No desktop-style sidebar or breadcrumb.

#### Medium shell

- Portrait tablets may retain bottom navigation with a content max width of 720 px.
- Landscape tablets use a 72 px left navigation rail.
- Dialogs and drawers cap at 560–640 px.
- Today may use a 3/2 two-column layout when both columns remain at least 280 px.
- Tables switch to cards below the point where labels would wrap excessively.

#### Expanded shell

- Persistent 232 px sidebar.
- Top utility bar within content region, 64 px high.
- Main content width: fluid, max 1200 px.
- Page gutters: 24–32 px.
- Today uses a primary column and context column.
- Check opens as a 440–480 px right panel; the underlying page remains visible but inert.
- Activity uses a table with sticky header and optional detail side panel.
- Plan uses a master-detail pattern.

#### Wide shell

- Persistent 248 px sidebar.
- Content canvas max width: 1320 px centered inside remaining space.
- Main working column: 720–820 px.
- Context rail: 320–360 px.
- Avoid stretching text, progress bars, or forms across the full viewport.
- No simulated phone frame. Desktop is a first-class workspace.

### Responsive component rules

| Component | Compact | Expanded |
|---|---|---|
| Navigation | Bottom bar | Left sidebar |
| Page title | In compact header | In content header with actions |
| Available card | Full width | Main column, wider but height constrained |
| Quick actions | 2 × 2 grid or horizontal row | Single row of 4–6 actions |
| Plan groups | Vertical rows | Summary rail plus master-detail page |
| Check | Bottom drawer | Right side panel |
| Activity | Stacked transaction rows | Sortable/filterable table |
| Transaction detail | Full page or drawer | Detail panel without leaving table |
| Weekly review | Full page | Two-column review and comparison |
| Toast | Top-center below header | Bottom-right stack |
| Dialog | Near-full width with 16 px margins | 440–560 px centered |
| Form actions | Sticky bottom when needed | Inline footer aligned right |

### Orientation and resizing

- No state is lost when orientation or viewport changes.
- An open compact drawer becomes a desktop side panel while preserving entered amount and selected envelope.
- Navigation state remains route-driven.
- Desktop sidebar can collapse to a 72 px rail at user request; the preference persists.
- Components respond to their container where practical, not only global viewport width.

## Visual design system

### Visual direction

The product should resemble a focused financial utility with restrained warmth. It should not use generic AI-dashboard conventions such as excessive gradients, glowing glass cards, a pill around every label, equal-weight bento boxes, decorative charts, or motivational copy in every section.

Use typography, alignment, spacing, and content density to establish hierarchy. Cards represent real objects or decisions—not arbitrary layout groups. Most desktop sections can use flat surfaces and dividers rather than nested cards.

### Color tokens

| Token | Dark value | Light value | Purpose |
|---|---:|---:|---|
| `canvas` | `#0B0E13` | `#F6F8FA` | App background |
| `surface` | `#121720` | `#FFFFFF` | Raised content |
| `surface-strong` | `#19212C` | `#EEF2F5` | Selected and pressed states |
| `border` | `#263140` | `#D8DEE6` | Dividers and outlines |
| `text-primary` | `#F4F7FA` | `#15202B` | Main text |
| `text-secondary` | `#A7B0BE` | `#4D5B6A` | Supporting text |
| `text-muted` | `#778292` | `#6F7C8A` | Metadata |
| `brand` | `#5DD6A7` | `#087F5B` | Primary action and positive progress |
| `brand-hover` | `#79E2B9` | `#066A4B` | Hover state |
| `warning` | `#F2B84B` | `#9A5B00` | Adjusted state |
| `critical` | `#F07178` | `#B42333` | Destructive and protected-fund risk |
| `momentum` | `#A78BFA` | `#6D43C0` | Optional progress and challenge accent |
| `focus` | `#7DD3FC` | `#0369A1` | Keyboard focus ring |

### Color rules

- Color never communicates status alone.
- Every status includes icon and text.
- Brand green does not imply investment returns.
- Red is reserved for destructive action, protected-fund impact, sync failure, or unrecoverable validation—not low scores.
- Warning amber indicates a workable but tighter plan.
- Community and Momentum purple cannot compete with the primary action.
- Charts, if introduced later, use accessible categorical palettes and direct labels.

### Typography

Use a high-legibility sans-serif UI family with Khmer coverage or a tested companion Khmer family. Use tabular numerals for financial values. Do not use a monospace font for all currency displays.

| Role | Compact | Expanded |
|---|---|---|
| Available amount | 48/52, 700 | 56/60, 700 |
| Check amount | 40/44, 700 | 48/52, 700 |
| Page title | 22/28, 700 | 28/34, 700 |
| Section title | 16/22, 650 | 18/24, 650 |
| Body | 15/22, 400 | 15/22, 400 |
| Button | 15/20, 600 | 14–15/20, 600 |
| Label | 13/18, 600 | 13/18, 600 |
| Metadata | 12/16, 450 | 12/16, 450 |

### Spacing and sizing

- Base spacing unit: 4 px.
- Compact page gutter: 16 px.
- Medium page gutter: 20–24 px.
- Expanded page gutter: 24–32 px.
- Section spacing: 24 px compact, 28–32 px expanded.
- Frequent touch control: minimum 48 px height.
- Other interactive target: minimum 44 × 44 px.
- Primary CTA: 52–56 px compact, 44–48 px expanded.
- Input: 52 px compact, 44–48 px expanded.
- Card radius: 16 px.
- Control radius: 10–12 px.
- Drawer radius: 24 px top corners on compact.
- Dialog radius: 18 px.
- Shadows only for modal layers, floating Check action, and temporary overlays.

WCAG’s enhanced target-size criterion recommends 44 × 44 CSS pixels, while WCAG 2.2 AA establishes a smaller minimum with exceptions. BrokeNoMore adopts 44 × 44 as the internal minimum and 48 px for frequent actions.[^12][^13]

### Iconography

- Use Lucide icons at 18, 20, or 24 px.
- Icon-only controls require visible tooltips on hover/focus and accessible names.
- Emoji may decorate quick expenses but cannot be the only category identifier.
- Do not mix filled emoji, multicolor illustration, and outline icons within the same control hierarchy.
- Status icons: check circle, gauge/adjust, alert triangle, lock, clock, and sync.

### Motion

- Standard transition: 150–200 ms.
- Drawer/panel: 220–280 ms.
- Number change: 180–250 ms crossfade or subtle vertical slide.
- No slot-machine counting.
- Confetti is off by default and never used for routine financial actions.
- `prefers-reduced-motion` removes number travel, panel spring effects, celebratory motion, and nonessential transitions.
- Motion cannot delay data display or confirmation.

## Navigation specification

### Mobile bottom navigation

Items:

1. Today.
2. Activity.
3. Check, raised action.
4. Plan.
5. Profile.

Requirements:

- Icons and labels always visible.
- Active state uses icon weight, text weight, and tonal background.
- Check has a calculator icon and “Check” label.
- Navigation respects safe-area inset.
- Keyboard focus must not be hidden by the fixed bar.
- Screen content uses `scroll-padding-bottom` and adequate bottom padding.

### Desktop sidebar

Sections:

- Brand and collapse control.
- Today.
- Activity.
- Check purchase button.
- Plan.
- Weekly review.
- Wait list.
- Optional Community divider and entry.
- Flexible spacer.
- Help.
- Profile and settings.

Expanded sidebar shows icon, label, and active indicator. Collapsed rail retains icons, accessible tooltips, and a clearly discoverable expand action. Check purchase is visually prominent but does not overpower Today.

### Top utility bar

Compact:

- Page context or date.
- Sync/offline indicator when needed.
- Avatar.

Desktop:

- Page title and optional breadcrumb.
- Period selector.
- Sync status.
- Primary contextual action.
- Avatar menu.

Breadcrumbs are used only on nested desktop views such as Plan → Future fund. Mobile uses a back button and concise title.

## Financial engine

### Money representation

- Store money in integer minor units.
- USD uses cents.
- KHR defaults to whole riel unless a future provider requires another representation.
- Each stored amount includes currency code.
- Never use binary floating-point for persisted money calculations.
- Conversion rates are explicit records with source and timestamp; no invisible conversion.

### Plan periods

Supported period types:

- Weekly.
- Biweekly.
- Monthly.
- Custom income period.

The starter experience uses a weekly flexible-spending plan derived from the broader monthly plan. Default week: Monday 00:00 through Sunday 23:59 in the user’s timezone. Users can change week start.

### Protected and flexible groups

**Protected**

- Home and fixed.
- Future fund.

**Flexible**

- Essentials.
- Fun money.

A purchase must be assigned to one flexible envelope. Moving money from a protected envelope requires a separate review flow.

### Canonical daily calculation

Definitions:

```text
baselineDaily = floor(weeklyFlexibleLimit / numberOfDaysInPeriod)
periodRemaining = weeklyFlexibleLimit - confirmedFlexibleSpend
startOfDayRemaining = weeklyFlexibleLimit - spendBeforeToday
paceCapacityToday = floor(startOfDayRemaining / daysRemainingIncludingToday)
todayStartLimit = min(baselineDaily, paceCapacityToday)
availableToday = max(0, todayStartLimit - confirmedSpendToday)
```

This policy does not increase ordinary daily guidance above the baseline after an under-spend. The difference remains in the weekly remainder and may be allocated during weekly review. Overspending can lower later daily guidance.

For a prospective purchase:

```text
projectedRemaining = periodRemaining - purchaseAmount
futureDays = daysRemainingAfterToday
projectedNextDaily =
  futureDays > 0
    ? max(0, min(baselineDaily, floor(projectedRemaining / futureDays)))
    : max(0, projectedRemaining)
```

All divisions floor to the smallest currency unit so guidance never allocates more than remains. Rounding residue stays in weekly remainder.

### Baseline fixture

| Variable | Value |
|---|---:|
| Weekly flexible limit | $50.00 |
| Confirmed spend before today | $14.28 |
| Days remaining including today | 5 |
| Baseline daily amount | $7.14 |
| Today start limit | $7.14 |
| Coffee purchase | $1.50 |
| Available today after coffee | $5.64 |

### Prospective $15 fixture

| Variable | Value |
|---|---:|
| Weekly flexible limit | $50.00 |
| Spend before today | $14.28 |
| Proposed purchase | $15.00 |
| Projected weekly remaining | $20.72 |
| Future days after today | 4 |
| Projected next-daily amount | $5.18 |

The product must use this reproducible $5.18 result for this fixture rather than the inconsistent $4.64 or $5.95 examples in the earlier concept.

### Purchase status

| Status | Rule | User-facing label |
|---|---|---|
| `ON_PLAN` | Amount is within Available today, selected envelope, and weekly flexible remainder | Fits today |
| `ADJUSTED` | Amount exceeds Available today but remains within the selected envelope and weekly flexible remainder | Adjusts the week |
| `NEEDS_DECISION` | Amount exceeds selected envelope or weekly flexible remainder, or requires protected money | Needs a decision |

Do not label a purchase “blocked” unless the application technically prevents it. The prototype cannot prevent an external cash or QR transaction.

### Work-time equivalent

```text
trueDiscretionaryHourly = monthlyFlexibleIncome / monthlyWorkHours
workTimeEquivalent = purchaseAmount / trueDiscretionaryHourly
```

For $200 flexible monthly income and 160 work hours, the rate is $1.25 per hour; a $15 purchase equals 12 hours of discretionary-income work. Label this as an optional perspective, not actual wage.

### Future-value equivalent

```text
futureValue = purchaseAmount × (1 + assumedAnnualReturn) ^ years
```

For $15, 9% annually, and 10 years, the result is approximately $35.51. Copy must say “could become about” and show the assumed rate, period, and non-guarantee. This metric is collapsed by default.

## End-to-end flows

### Flow A: Entry and authentication

1. User opens the application.
2. Returning authenticated user goes to Today.
3. Returning demo user restores local state and goes to Today.
4. New user sees Login.
5. User chooses Continue with Google or Try demo.
6. OAuth returns through `/auth/callback`.
7. New authenticated user enters onboarding.
8. Existing authenticated user receives cloud state; unresolved local demo data prompts an explicit merge decision.

Google OAuth avoids password recall, aligning with WCAG accessible-authentication goals that discourage cognitive-function tests without alternatives. Supabase social authentication requires provider configuration, redirect URLs, and an OAuth route, all of which must be represented in deployment configuration.[^14][^13][^15]

### Flow B: Onboarding

1. Choose language and display currency if not inferred.
2. Choose income rhythm: monthly, twice monthly, weekly, irregular.
3. Choose a starting template.
4. Review Protected, Flexible, and Future amounts.
5. Adjust amounts or percentages if desired.
6. Select week start and payday.
7. Confirm plan with **Start my plan**.
8. Land on Today with a subtle confirmation animation.

Guidance style is not required during setup. It is introduced after the first successful action or in Profile.

### Flow C: Quick expense

1. User taps a saved quick action.
2. UI applies an optimistic transaction event.
3. Available today and relevant envelope update immediately.
4. Confirmation appears: “Coffee added · $1.50” with Undo.
5. Transaction appears at top of Activity.
6. If sync fails, item shows Pending sync and retries; local calculation remains consistent.
7. Undo creates a reversal event and updates every derived total.

### Flow D: Custom expense

1. User taps Other amount or Check.
2. Amount entry opens.
3. User enters amount using custom keypad or hardware keyboard.
4. User selects Essentials or Fun money.
5. Result updates.
6. User chooses Add purchase, Wait 24 hours, or close.
7. If Add purchase, optional category/name choices use recent presets.
8. Confirmation and Undo appear.

### Flow E: Purchase Check

1. Open Check.
2. Enter amount.
3. Select envelope.
4. View one of three statuses.
5. Read immediate weekly impact.
6. Optionally expand work-time or future-value perspective.
7. Choose Add purchase or Wait 24 hours.
8. If protected money is required, enter protected-fund review rather than ordinary confirmation.

### Flow F: Wait 24 hours

1. Choose Wait 24 hours.
2. Optional item name; no typing required.
3. Confirm exact review time.
4. Item appears in Wait list.
5. At unlock, user chooses Add purchase, Wait again, or Dismiss.
6. Momentum is awarded only for completing the reflection or dismissing, not for creating unlimited items.

### Flow G: Protected-fund access

1. Open a protected envelope.
2. Choose Adjust protected amount.
3. Product shows affected home/fixed or future commitments.
4. User selects reason: emergency, plan correction, income change, other.
5. Emergency access is always available.
6. Non-emergency action may offer a 24-hour wait.
7. User confirms exact amount and new plan.
8. Product records an audit event and offers a recovery plan.

No shame copy, XP loss, streak loss, or intentionally hidden exit is allowed.

### Flow H: Weekly review

1. Contextual card appears near the user’s review time.
2. User opens review.
3. Product shows planned, spent, and remainder.
4. User sees one or two useful observations, not a dense report.
5. User chooses Move remainder to Future fund, Carry into next period, or Leave plan unchanged.
6. Since the MVP does not move real money, copy says **Allocate in plan**.
7. User previews next period and confirms.

### Flow I: Desktop planning

1. User opens Plan on desktop.
2. Sidebar remains visible.
3. Plan groups appear in a master list; selected group detail appears alongside.
4. User edits allocation in a focused side panel or form.
5. Impact preview updates before save.
6. Save updates Today and review projections.

## Screen specifications

## Login

### Objective

Establish trust and provide the shortest credible entry path.

### Mobile layout

- Top: language control.
- Middle: wordmark, product promise, one concrete plan preview.
- Preview: `$50 weekly plan → $7.14 available today`.
- Lower thumb zone: Continue with Google, then Try demo.
- Footer: Privacy and Terms.

### Desktop layout

- Two-column composition, max width 1120 px.
- Left: product promise and three-step explanation.
- Right: 420–460 px authentication card.
- No decorative dashboard mockup larger than the actual message.
- Authentication card remains vertically centered within reasonable viewport height.

### Requirements

- Google button uses official provider treatment.
- Try demo is visually secondary but fully usable.
- No email/password fields.
- No unverified social proof.
- Show honest storage copy: local-only in demo; synchronized after sign-in.
- Loading, OAuth-cancelled, network-error, and blocked-cookie states are defined.

## Onboarding

### Objective

Create a correct and understandable plan with minimal input.

### Mobile

- One decision per step.
- Progress text such as “Step 2 of 3,” not a gamified progress race.
- Sticky bottom CTA that does not cover focused controls.
- Template cards are full-width radio options.
- Review screen uses three stacked groups.

### Desktop

- Centered 720–840 px setup panel.
- Step navigation on the left or top.
- Review step may use plan groups on left and Available-today preview on right.
- Do not show all setup questions in a long form.

### Starter templates

| Template | Example allocation | Notes |
|---|---|---|
| Home supporter | $200 home, $100 future, $125 essentials, $75 fun | Demo default only |
| Freelancer | Percentage-based protected/flexible split | Income batches supported |
| Student/starter | Lower fixed amount and skill goal | Plain-language setup |
| High-savings month | 35% future allocation | Temporary challenge, reversible |

### Requirements

- No real user receives a hard-coded $500 salary without confirmation.
- Every template shows exact amounts and percentages before confirmation.
- “You can change this later” appears near the CTA.
- Back navigation preserves prior answers.
- Exit and resume are supported.

## Today

### Objective

Answer “What can I spend today?” and make capture immediate.

### Compact layout

1. Header with date, sync state if needed, and avatar.
2. Available-today card.
3. Quick actions.
4. Protected summary.
5. Latest activity.
6. Conditional weekly-review card.
7. Bottom navigation.

### Expanded layout

- Header with date/period selector and Check purchase action.
- Main column:
  - Available-today card.
  - Quick actions row.
  - Latest activity.
- Context rail:
  - Protected summary.
  - Week status.
  - Weekly review or Wait-list card.
- At wide widths, the hero and context rail align at the top; the hero does not span the entire canvas.

### Available card

Content order:

- Label: Available today.
- Amount.
- State: On plan, Adjusted, or Needs attention.
- One-line explanation.
- Weekly progress line: `$14.28 used of $50.00`.
- Days remaining.
- Why this amount? action.

The card uses no pie chart. Progress is secondary to the amount.

### Quick actions

Default demo actions:

- Coffee · $1.50.
- Meal · $2.50.
- Transport · $3.00.
- Drink · $2.00.
- Groceries · $5.00.
- Other amount.

Compact shows four plus Other, with Edit accessible. Desktop can show all six in one row. Users can reorder, edit, hide, and create actions.

### States

- First day/no activity.
- On plan.
- Adjusted week.
- Today amount exhausted.
- Weekly amount exhausted.
- Offline with locally confirmed transactions.
- Pending sync.
- Calculation unavailable due to invalid plan; provide Fix plan CTA.

## Purchase Check

### Objective

Show the consequence of a purchase before it is recorded.

### Compact presentation

- Bottom drawer, max height 92dvh.
- Header: Check a purchase; close button.
- Amount display.
- Essentials/Fun money radio choices with remaining amounts.
- Numeric keypad.
- Result replaces or moves above keypad when sufficient data exists.
- Sticky action area within drawer.

### Expanded presentation

- Right panel 440–480 px wide.
- Underlying page remains visually available but inert.
- Hardware keyboard input supported.
- Amount and result can be visible simultaneously.
- Optional impact details use disclosure rows.

### Keypad

- Digits 0–9.
- Decimal key only when currency allows decimals.
- Backspace.
- Clear available by long press and explicit button/menu; long press is never the only method.
- KHR entry does not force cents.
- Each key is a semantic button with spoken label.
- Pasted input is sanitized.

### Result card

Order:

1. Status and concise verdict.
2. Tomorrow/remaining-days impact.
3. Selected-envelope remainder.
4. Optional assumptions and additional perspectives.
5. Actions.

Actions by status:

| Status | Primary | Secondary |
|---|---|---|
| Fits today | Add purchase | Wait 24 hours |
| Adjusts week | Wait 24 hours | Add and adjust week |
| Needs decision | Review options | Wait 24 hours |

No button says “Buy anyway.” The application records a spending choice; it does not authorize a purchase.

## Activity

### Objective

Make fast capture trustworthy through visibility and correction.

### Compact

- Period segmented control: Today, Week, All.
- Filter button.
- Grouped transaction rows.
- Each row: category icon, title, time, envelope, amount, sync state.
- Tap opens full-screen or bottom-drawer detail.
- Visible overflow menu provides Edit and Delete.

### Expanded

- Filter toolbar with date range, envelope, payment method, and status.
- Table columns: date/time, title, envelope, method, amount, state, menu.
- Sticky table header.
- Selecting a row opens a detail panel.
- Bulk selection is out of MVP unless import is added.
- Export is future scope.

### Requirements

- Delete requires confirmation and creates a reversible record where feasible.
- Edit recalculates all derived values.
- Swipe is optional only; pointer-accessible actions must exist because WCAG 2.2 requires alternatives to dragging gestures.[^13][^16]
- Search is deferred until transaction volume justifies it.
- Empty state teaches Quick add.

## Plan

### Objective

Show what is protected, what is flexible, and how the plan is configured.

### Compact

- Period summary.
- Protected section.
- Flexible section.
- Vertical envelope rows.
- Rules section.
- Income schedule.
- Each row opens detail.

### Expanded

- Main plan summary at top.
- Left master list of groups.
- Right selected-group detail or two-column card/list arrangement.
- Rules and income schedule appear below or in tabs.
- Edit actions open side panel with live impact preview.

### Envelope row

- Icon and name.
- Allocated amount.
- Remaining amount.
- Plain state text.
- Progress line only when useful.
- Protected label and lock icon for protected groups.

### Rules

Examples:

- Extra-income split: “When extra income is added, allocate 50% to Future fund.”
- Elastic re-pacing: “When flexible spending changes, recalculate remaining days.”
- Cooling-off suggestion: “Suggest a 24-hour wait when a purchase adjusts the week.”

Each rule states trigger and result before its Switch. Mutually exclusive strategies use RadioGroup, not Switch.

## Envelope detail

### Content

- Current allocation and remaining amount.
- Period history.
- Recent transactions.
- Associated rules.
- Edit allocation.
- For protected groups: exact protection state and adjustment consequences.

### Responsive behavior

- Compact: dedicated page.
- Expanded: detail region or panel with stable master list.
- Deep linking works in both modes.

## Wait list

### Objective

Support reflection without pressure.

### Content

- Active items with amount and exact review time.
- Ready-to-review items.
- Dismissed history, optional.
- No second-by-second animated countdown; use “Ready tomorrow at 7:30 PM.”
- Actions: Review now when unlocked, Keep waiting, Dismiss.

### Empty state

“Nothing is waiting. Use Check when you want more time before deciding.”

## Weekly review

### Objective

Close the period, learn one useful thing, and set the next period.

### Compact

- Planned, spent, remainder.
- One category insight.
- Protected-plan state.
- Remainder choice.
- Next-week preview.
- Confirm CTA.

### Expanded

- Two-column view.
- Left: plan versus actual, transaction highlights.
- Right: remainder decision and next-period preview.
- Optional trend across recent weeks appears only when at least four complete periods exist.

### Remainder actions

- Allocate to Future fund.
- Carry into next week.
- Leave unallocated.

Copy must not say money was transferred unless an external transfer occurred.

## Community

### Objective

Provide optional encouragement without exposing private finances or making social comparison central.

### Requirements

- Explicit opt-in.
- Generated alias by default.
- No salary, balance, transaction, or raw savings amount.
- Rank or group users by completed reviews, protected-plan consistency, or challenge completion.
- Equal ranks for ties.
- Ability to leave and delete participation data.
- No contact discovery in MVP.
- No streak-loss notification.
- Community is never shown during financial stress or protected-fund access.

### Layout

Mobile uses challenge cards and a compact cohort list. Desktop uses a challenge summary and pseudonymous participant table. Community remains a secondary destination.

## Profile and settings

Sections:

- Profile.
- Guidance style.
- Language and currency.
- Week start and timezone.
- Appearance.
- Accessibility.
- Notifications.
- Privacy and data.
- Sign out.
- Delete account.

Guidance style uses a RadioGroup:

- Calm.
- Straight talk.

A preview appears before saving. Straight talk is never applied to emergencies, negative balances, protected-fund access, account deletion, security, or sync errors.

## Notifications

### Allowed

- Weekly review ready.
- Wait item ready for review.
- Sync problem requiring action.
- Optional gentle reminder after user-selected inactivity.

### Disallowed

- Shame notifications.
- “Your streak will die” language.
- Notifications revealing financial amounts on the lock screen by default.
- Repeated pressure to join Community.
- Marketing notifications without separate consent.

Users choose notification categories and quiet hours. Amounts remain hidden in notification previews unless explicitly enabled.

## Component system

| Product component | shadcn/ui base | Requirements |
|---|---|---|
| App navigation | Custom + Button/Tooltip | Responsive bottom bar/sidebar |
| Available card | Card + Progress | Single dominant value, explain action |
| Quick action | Button | 48 px target, amount and label |
| Check panel | Drawer/Dialog/Sheet | Responsive primitive by viewport |
| Envelope choice | RadioGroup | Remaining value in option label |
| Keypad | Button grid | Semantic keys, hardware input |
| Transaction list | Table/Card | Shared semantic data model |
| Envelope row | Button/Card | Whole row target, no nested links |
| Rule row | Switch | Trigger/result visible |
| Strategy choice | RadioGroup + Card | Mutually exclusive |
| Wait item | Card | Exact time and clear actions |
| Confirmation | Sonner + Activity | Toast is not the only recovery path |
| Destructive action | AlertDialog | Specific consequence |
| Filters | Popover/Sheet | Sheet on mobile, popover on desktop |
| Period selector | Select/Popover | Keyboard accessible |
| Status badge | Badge | Text + icon + color |
| Calculation detail | Accordion/Collapsible | Assumptions exposed |

### Component states

Every interactive component defines:

- Default.
- Hover, where pointer exists.
- Focus-visible.
- Active/pressed.
- Selected.
- Disabled with explanation when relevant.
- Loading.
- Error.
- Offline/pending when data mutation is involved.

Skeletons match final geometry. Avoid full-page spinners after shell load.

## Accessibility requirements

### Standard

Target WCAG 2.2 Level AA across authentication and the authenticated application. WCAG organizes accessibility around perceivable, operable, understandable, and robust principles.[^17]

### Reflow and zoom

- No loss of function at 320 CSS pixels.
- No horizontal page scroll for ordinary content.
- At 200% browser zoom, desktop can adapt to medium or compact navigation.
- At 400% zoom, content reflows to a usable single-column layout where required.[^11]
- Financial tables may transform into labeled rows rather than require two-dimensional scrolling.

### Keyboard

- Logical DOM and focus order.
- Skip link to main content on desktop.
- All actions work without pointer.
- Escape closes user-opened modal layers unless a destructive confirmation is in progress.
- Closing a layer returns focus to trigger.
- Sticky headers, bottom bars, and panels cannot obscure focused controls. WCAG 2.2 specifically requires focus not be entirely hidden by author-created content.[^18][^13]
- Focus ring targets a two-pixel apparent perimeter and at least 3:1 contrast as the internal visual standard.[^19]

### Screen readers

- One H1 per page.
- Regions named: navigation, main, complementary context.
- Currency announced with full units.
- Changing Available-today value uses a polite live region only after user action; it does not continuously interrupt.
- Toasts are announced once.
- Decorative emoji are `aria-hidden`.
- Charts include text equivalents.
- Status is included in accessible names.

### Touch and motor

- Minimum internal target 44 × 44 px.
- Frequent actions 48 px or larger.
- No action requires drag, swipe, long press, hover, or multi-touch.
- Swipe and drag may exist only as shortcuts.
- Sufficient spacing prevents accidental taps.

### Cognitive

- One primary choice per step.
- Plain language.
- Consistent help placement.
- No countdown pressure.
- No automatically changing carousels.
- Authentication avoids memory puzzles.
- Entered data survives validation errors.
- Calculation assumptions are visible.

### Motion and sensory

- Reduced-motion mode.
- No flashing content.
- Haptics are supplementary.
- Sound is off by default.
- Color is not the sole signal.

## Localization and Cambodia readiness

### Locale model

- Locale and display currency are separate preferences.
- Supported architecture: `en-KH`, `km-KH`, and future locales.
- Date, number, and currency formatting use `Intl` APIs plus tested application rules.
- Week start is configurable.
- Timezone defaults to `Asia/Phnom_Penh` for Cambodia users but remains editable.

### Currency

- USD and KHR are first-class currencies.
- Users choose one plan base currency.
- A transaction may record another currency with an explicit conversion rate.
- Conversion source and timestamp are stored.
- No live rate is silently applied.
- Quick actions are currency-specific.

KHQR is designed as an interoperable retail-payment QR standard and supports Cambodia’s digital payment context, while USD and KHR are both relevant to payment flows. The MVP records QR as a payment method but does not claim to initiate or settle KHQR transactions.[^20][^21][^22]

### Language layout

- Khmer strings are tested in components, not merely translated in files.
- Minimum body size and line height may increase for Khmer.
- Buttons allow two lines where necessary.
- Navigation labels use validated concise translations.
- Avoid fixed widths based on English text.
- Use a production-grade Khmer Unicode font and test weight availability.

### Financial-literacy considerations

Cambodia research identifies gaps between mobile access and use of formal or digital financial services, as well as digital and financial-literacy barriers. Therefore calculations need plain-language explanations, demo mode must not require account connection, and testing must include users with varied financial and digital confidence.[^23][^24][^25]

## Data model

### Core types

```ts
type CurrencyCode = 'USD' | 'KHR';
type GuidanceStyle = 'CALM' | 'STRAIGHT_TALK';
type PayCycle = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'IRREGULAR';
type PlanStatus = 'ON_PLAN' | 'ADJUSTED' | 'NEEDS_DECISION';
type PaymentMethod = 'CASH' | 'QR' | 'CARD' | 'BANK' | 'OTHER';
type BucketKind = 'PROTECTED' | 'FLEXIBLE';

interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

interface UserPreferences {
  locale: string;
  timezone: string;
  baseCurrency: CurrencyCode;
  weekStartsOn: 0 | 1 | 6;
  guidanceStyle: GuidanceStyle;
  theme: 'DARK' | 'LIGHT' | 'SYSTEM';
  reducedMotionOverride: boolean | null;
}

interface PlanPeriod {
  id: string;
  startsAt: string;
  endsAt: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  flexibleLimitMinor: number;
  baselineDailyMinor: number;
  rolloverPolicy: 'NONE' | 'NEXT_PERIOD';
}

interface Bucket {
  id: string;
  name: string;
  iconKey: string;
  kind: BucketKind;
  allocatedMinor: number;
  currency: CurrencyCode;
  sortOrder: number;
  coolingOffEnabled: boolean;
}

interface Transaction {
  id: string;
  clientMutationId: string;
  title: string;
  amountMinor: number;
  currency: CurrencyCode;
  baseAmountMinor: number;
  baseCurrency: CurrencyCode;
  conversionRate: string | null;
  bucketId: string;
  paymentMethod: PaymentMethod;
  occurredAt: string;
  source: 'QUICK_ADD' | 'MANUAL' | 'IMPORT';
  syncState: 'LOCAL' | 'PENDING' | 'SYNCED' | 'CONFLICT';
  reversedTransactionId: string | null;
}

interface WaitItem {
  id: string;
  title: string | null;
  amountMinor: number;
  currency: CurrencyCode;
  bucketId: string;
  createdAt: string;
  reviewAt: string;
  status: 'WAITING' | 'READY' | 'PURCHASED' | 'DISMISSED' | 'EXTENDED';
}
```

### Supabase tables

- `profiles`.
- `user_preferences`.
- `income_sources`.
- `plan_templates`.
- `plans`.
- `plan_periods`.
- `buckets`.
- `transactions`.
- `quick_actions`.
- `wait_items`.
- `rules`.
- `weekly_reviews`.
- `community_profiles`, opt-in only.
- `challenge_participation`, opt-in only.
- `audit_events` for protected-plan changes and security-sensitive events.

### Data rules

- Every user-owned table includes `user_id`.
- Row Level Security restricts access to the owning user.
- Community views expose only explicitly derived non-financial fields.
- Service-role keys never reach the browser.
- Client mutations use idempotent `clientMutationId` values.
- Deletes use reversal or soft-delete where auditability is needed.
- Derived totals are calculated from transaction events or verified snapshots, not multiple independently mutated counters.
- Database constraints prevent negative allocations where not explicitly allowed.

## Local-first and synchronization

### Demo mode

- Uses IndexedDB for structured data; localStorage may store small preferences only.
- Works without an account.
- Clearly labeled Demo.
- Provides Reset demo.
- No claim of secure multi-device backup.

### Authenticated mode

- Supabase is source of durable truth.
- Recent state is cached locally.
- New expenses can be queued offline.
- Optimistic UI applies immediately.
- Sync state appears only when pending, failed, or offline.
- Retry is automatic with bounded backoff.

### Merge rules

When a demo user signs in:

- If cloud account is empty, offer Import demo plan.
- If cloud data exists, offer Keep cloud, Replace with demo, or Review merge.
- Never silently merge transactions.
- Duplicate detection uses `clientMutationId`, amount, timestamp window, and explicit user review for uncertain matches.

### Conflict handling

- Transaction creation is idempotent.
- Simple transaction edits use last-write with version checking and an informative conflict view.
- Plan allocation conflicts require user review because they affect calculations.
- An offline protected-fund adjustment must be confirmed again if the cloud plan changed before sync.

## Technical architecture

### Rendering model

- Server Components for shell, authenticated session bootstrap, static educational content, and initial data payload where appropriate.
- Client Components for calculators, optimistic transaction capture, drawers, filters, and local-first state.
- Route Handlers for OAuth callback, server mutations where required, and controlled integration endpoints. Next.js Route Handlers live inside the `app` directory and support standard HTTP methods.[^26]
- Suspense boundaries by page region, not around every card.
- Error boundaries at route and high-risk interaction levels.

### State model

Separate three forms of state:

1. **Server state:** user, plans, transactions, rules, reviews.
2. **Local durable state:** offline queue, demo data, dismissed education.
3. **Ephemeral UI state:** open panel, draft amount, filters, current step.

Use a query/cache layer or a purpose-built repository interface for server synchronization. Use a small client store for ephemeral and optimistic state. Financial calculations remain pure functions in `wealth-engine` with exhaustive tests.

### Recommended folder structure

```text
src/
├── app/
│   ├── (marketing)/
│   │   └── login/page.tsx
│   ├── (onboarding)/
│   │   └── onboarding/
│   │       ├── layout.tsx
│   │       ├── income/page.tsx
│   │       ├── template/page.tsx
│   │       └── review/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── today/page.tsx
│   │   ├── activity/page.tsx
│   │   ├── activity/[transactionId]/page.tsx
│   │   ├── check/page.tsx
│   │   ├── plan/page.tsx
│   │   ├── plan/[bucketId]/page.tsx
│   │   ├── plan/rules/page.tsx
│   │   ├── plan/wait-list/page.tsx
│   │   ├── review/page.tsx
│   │   ├── community/page.tsx
│   │   └── settings/
│   ├── auth/callback/route.ts
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── page.tsx
├── components/
│   ├── app-shell/
│   ├── today/
│   ├── activity/
│   ├── check/
│   ├── plan/
│   ├── review/
│   ├── community/
│   ├── settings/
│   └── ui/
├── features/
│   ├── auth/
│   ├── onboarding/
│   ├── transactions/
│   ├── planning/
│   ├── calculations/
│   ├── sync/
│   └── localization/
├── lib/
│   ├── supabase/
│   ├── wealth-engine/
│   ├── repositories/
│   ├── analytics/
│   ├── money/
│   └── validation/
├── stores/
├── types/
├── messages/
│   ├── en-KH.json
│   └── km-KH.json
└── tests/
```

## Authentication and security

### Authentication

- Google OAuth through Supabase Auth.
- PKCE flow.
- Server-side cookie session.
- OAuth redirect allowlist for local, preview, and production environments.
- Authenticated routes verify claims server-side.
- Sign out clears local sensitive cache while preserving only consented non-sensitive preferences.

Supabase documents server-side auth with cookie sessions and recommends claim verification for protected pages and user data.[^6]

### Security requirements

- Row Level Security on all user tables.
- Content Security Policy.
- Secure, HttpOnly, SameSite cookies where applicable.
- No secret keys in client bundles.
- Input validation on client and server.
- Rate limiting on mutation and callback endpoints.
- CSRF protections appropriate to the chosen server mutation pattern.
- Dependency and secret scanning in CI.
- Audit log for protected-plan changes, data exports, and account deletion.
- PII and financial data excluded from application logs.
- Error monitoring scrubs amounts, titles, email addresses, and tokens.

### Privacy

- Collect only data required for the feature.
- Financial values are excluded from product analytics.
- Transaction names are excluded from analytics and error reporting.
- Community participation is a separate consent.
- Data export and deletion are accessible from Privacy settings.
- Account deletion explains immediate and delayed deletion behavior.
- Demo data stays on device unless the user explicitly imports it.

## Analytics specification

### Principles

- Track interaction shape, not financial content.
- Do not send amount, salary, bucket balance, transaction title, or free text.
- Use coarse status such as `ON_PLAN`, `ADJUSTED`, or `NEEDS_DECISION`.
- Respect consent and regional requirements.
- Disable analytics in local development and automated tests.

### Events

| Event | Allowed properties |
|---|---|
| `onboarding_started` | locale, device mode |
| `template_selected` | template ID |
| `plan_started` | pay-cycle type, number of buckets |
| `quick_action_used` | quick-action position, bucket type |
| `check_opened` | entry point, device mode |
| `check_result_viewed` | status, optional metrics expanded |
| `purchase_recorded` | status, source, payment-method type |
| `wait_item_created` | status before wait |
| `wait_item_resolved` | purchased, dismissed, extended |
| `calculation_explained` | explanation type |
| `transaction_corrected` | edit or reverse |
| `weekly_review_completed` | remainder action, plan status |
| `sync_error_seen` | error category |
| `guidance_style_changed` | calm or straight-talk |
| `community_opted_in` | challenge ID |

## Error, empty, and offline states

### Global errors

- Use plain language and a recovery action.
- Preserve user input.
- Include a reference code only for support, not as the main message.
- Do not expose stack traces or provider details.

### Calculation error

If the plan is invalid or incomplete:

- Available today displays `—`, not $0.00.
- Message: “This amount cannot be calculated until the weekly plan is fixed.”
- CTA: Fix plan.
- Existing transactions remain accessible.

### Offline

- Persistent but quiet Offline indicator.
- Quick expenses remain available.
- Check calculations work locally.
- OAuth, data export, Community, and destructive account actions explain that a connection is required.
- Pending items have a visible state in Activity.

### Empty states

- Today: guide the user to create or repair a plan.
- Activity: explain Quick add with one CTA.
- Wait list: explain when to use Check.
- Community: explain privacy before opt-in.
- Weekly review: explain when the first review becomes available.

## Performance requirements

### Targets

- Core Web Vitals in the “good” range for production sample traffic.
- Initial authenticated shell usable on a mid-range mobile device and ordinary Cambodian mobile connection.
- Local quick-action visual response within 100 ms.
- Check calculation response within one animation frame for ordinary inputs.
- Route transitions show useful skeletons within 150 ms if data is not ready.
- No layout shift from late-loading currency fonts or navigation.
- Application shell and essential current-period data cached for offline return.

### Optimization

- Keep calculation engine client bundle small and dependency-light.
- Dynamically load Community and nonessential education.
- Optimize avatars and illustrations through Next.js image handling.
- Subset fonts with Khmer handled carefully; do not omit required glyphs.
- Avoid shipping desktop-only table libraries to compact routes when not needed.
- Use route-level code splitting and Server Components where they reduce client JavaScript.

## PWA requirements

- Web app manifest with name, short name, icons, theme color, and standalone display.
- Install prompt is contextual and non-blocking.
- Service worker caches shell and safe static resources.
- Offline queue does not cache OAuth responses or sensitive server pages indiscriminately.
- App update flow avoids losing draft input.
- Standalone mode respects safe areas.
- Push notifications are opt-in and amount-free by default.

## Testing strategy

### Unit tests

- Money arithmetic.
- Rounding in USD and KHR.
- Daily calculation.
- Status classification.
- Week boundaries and timezone.
- Future-value assumptions.
- Work-time equivalent.
- Reversal and edit derivation.
- Currency-conversion records.

### Component tests

- Available card in all states.
- Quick actions and Undo.
- Keypad with pointer and keyboard.
- RadioGroup envelope selection.
- Drawer/Sheet responsive transformation.
- Transaction rows and menus.
- Protected-fund confirmation.
- Focus restoration.

### Integration tests

- Google OAuth callback.
- New-user onboarding.
- Demo-to-account import.
- Offline expense then sync.
- Duplicate mutation prevention.
- Plan edit recalculation.
- Weekly review close and new period.
- RLS isolation between users.

### End-to-end viewport matrix

| Viewport | Required flows |
|---|---|
| 320 × 568 | Reflow, login, quick add, Check, Activity correction |
| 390 × 844 | Full primary mobile flow |
| 430 × 932 | Large-phone layout and safe areas |
| 768 × 1024 | Tablet portrait |
| 1024 × 768 | Tablet landscape/compact desktop |
| 1280 × 800 | Laptop |
| 1440 × 900 | Desktop baseline |
| 1920 × 1080 | Wide-layout max-width behavior |

### Accessibility testing

- Automated checks with axe or equivalent.
- Full keyboard pass.
- VoiceOver on iOS and macOS.
- TalkBack on Android.
- 200% text scaling and browser zoom.
- Reduced motion.
- Dark and light contrast testing.
- English and Khmer screen-reader/content review where support exists.
- Focus-not-obscured checks with sticky headers, bottom navigation, drawers, and toasts.

### Usability testing

Initial formative round: 8–10 Cambodia-based participants across salaried workers, students, and irregular earners. Include English-first and Khmer-first users, cash-primary users, and regular QR users.

Tasks:

1. Create a plan and explain it.
2. Identify Available today.
3. Add a routine purchase.
4. Undo an accidental purchase.
5. Check a $15 item.
6. Explain why tomorrow changes.
7. Access protected money for an emergency.
8. Review the week.
9. Complete the same review on desktop.

Measures:

- Task success.
- Time to correct first action.
- Comprehension of plan versus bank balance.
- Calculation trust.
- Error recovery.
- Perceived judgment.
- Preference for Calm versus Straight talk.
- Mobile/desktop continuity.

## Functional acceptance criteria

### Authentication

- User can enter with Google or demo mode.
- OAuth cancellation returns to Login with a recoverable message.
- Existing user reaches Today after session validation.
- New user reaches onboarding.
- No authenticated content flashes before authorization is established.

### Onboarding

- User can create a plan without typing when using a template.
- Every template shows exact allocation before confirmation.
- Default demo fixture uses $500 income and $200 home contribution.
- Real users explicitly confirm imported or entered income.
- Exiting and returning preserves progress.

### Today

- Available-today value is visible without scrolling at all supported primary viewports.
- “Why this amount?” reproduces the displayed value.
- Quick action updates amount and envelope immediately.
- Undo restores transaction-derived values exactly.
- Protected summary remains clear without showing four equal-weight cards.

### Check

- Amount can be entered with touch, pointer, and hardware keyboard.
- Result cannot appear until amount and envelope are valid.
- Status follows deterministic rules.
- Baseline $15 fixture returns projected next-daily amount of $5.18.
- Work-time and future-value details are optional and disclose assumptions.
- Draft survives responsive layout change and accidental panel close until discarded.

### Activity

- New transaction appears immediately.
- User can edit or reverse it without gestures.
- Derived values update after correction.
- Desktop table and mobile rows expose equivalent information.
- Pending sync and conflict states are distinguishable.

### Plan

- Protected and flexible groups are visually and semantically distinct.
- Allocation edits show impact before save.
- Rules describe trigger and result.
- Emergency protected-fund access is available without shame or reward loss.

### Weekly review

- Review shows plan, spending, and remainder.
- Remainder action updates the plan, not a falsely represented bank transfer.
- Next-period preview appears before confirmation.
- Review works at compact and expanded layouts.

### Responsiveness

- No mobile frame appears on desktop.
- Navigation changes from bottom bar to rail/sidebar at content-appropriate breakpoints.
- No essential feature disappears on desktop or mobile.
- Normal pages have no horizontal scrolling at 320 px.
- Open Check state survives breakpoint changes.
- Wide screens use constrained content widths and context rails rather than stretched cards.

### Accessibility

- All product-controlled targets are at least 44 × 44 px except inline text links with an equivalent accessible target.
- Every flow is keyboard operable.
- Focus is visible and not hidden by sticky content.
- Status never relies only on color.
- Reduced motion removes nonessential animation.
- Screen readers receive meaningful currency and state announcements.
- Authentication does not require a cognitive puzzle.

### Localization

- Core screens support English and Khmer strings without clipping.
- USD and KHR formatting is correct.
- Decimal keypad behavior follows currency.
- Week boundary uses configured timezone.
- QR and cash are available payment methods.

## Non-functional acceptance criteria

- No service-role secret in browser assets.
- RLS tests confirm users cannot access one another’s data.
- Product analytics contain no financial amount or transaction title.
- Local quick-action response is under 100 ms in target test conditions.
- Calculation unit-test coverage includes all boundary states and rounding cases.
- Offline-created transactions synchronize without duplication.
- Error monitoring scrubs financial and personal content.
- Light and dark themes meet contrast requirements.

## Design QA checklist

### Hierarchy

- One dominant action per screen.
- Available-today amount remains the dominant Today element.
- No row contains more than two competing badges.
- Cards represent meaningful objects or decisions.
- Desktop uses density without overcrowding.

### Content

- No AI claim for deterministic features.
- No unverified user counts.
- No guaranteed-return wording.
- No “Buy anyway,” “failed,” or user-directed shame.
- Plan balance and bank balance are explicitly distinguished.

### Responsive

- 320, 390, 768, 1024, 1280, 1440, and 1920 widths reviewed.
- Text scaling reviewed.
- Khmer expansion reviewed.
- Safe areas reviewed in installed PWA mode.
- Tables transform rather than compress illegibly.

### Interaction

- Hover is supplementary.
- Gestures have visible alternatives.
- Loading does not shift layout.
- Destructive actions have specific confirmations.
- Modal focus is trapped and restored.
- Toast is never the only record of an important event.

## Delivery roadmap

### Milestone 1: Foundation

- Design tokens and responsive shell.
- Authentication and demo mode.
- Supabase schema and RLS.
- Money and calculation engine.
- Local repository and sync contracts.
- Accessibility baseline.

### Milestone 2: Core daily loop

- Onboarding.
- Today.
- Quick actions.
- Activity.
- Undo/edit/reversal.
- Responsive navigation.

### Milestone 3: Decision support

- Purchase Check.
- Explainable calculations.
- Wait list.
- Protected-fund review.
- Desktop side panels and master-detail layouts.

### Milestone 4: Period management

- Plan editing.
- Rules.
- Weekly review.
- Next-period creation.
- Offline synchronization hardening.

### Milestone 5: Localization and polish

- Khmer content design.
- KHR and dual-currency transactions.
- PWA installation and notification preferences.
- Cross-device and accessibility QA.
- Performance optimization.

### Milestone 6: Optional engagement

- Straight-talk style.
- Private Momentum.
- Opt-in community challenges.
- Community privacy and safety evaluation.

## Definition of done

BrokeNoMore v2 is done when a new user can create a transparent plan, see an explainable daily amount, record and correct routine expenses, evaluate a purchase, adjust the week, preserve protected commitments, and review the period on both mobile and desktop. The same underlying information and actions must remain available across devices, while each viewport uses an appropriate navigation, density, and interaction pattern.

The product must feel like a calm financial utility rather than a gamified dashboard: clear values, restrained color, limited card nesting, optional personality, deterministic calculations, honest labels, and strong recovery paths. A user should never need to trust an unexplained number, fear an emergency-access flow, or wonder whether an in-app allocation moved real money.

---

## References

1. [App Router: Guides](https://nextjs.org/docs/15/app/guides) - url: "https://nextjs.org/docs/15/app/guides"

2. [Next.js](https://nextjs.org/docs/15/app/getting-started.md) - description: Learn how to create full-stack web applications with the Next.js App Router.

3. [App Router: Glossary](https://nextjs.org/docs/app/glossary) - It uses file-system based routing and supports layouts, nested routing, loading states, error handli...

4. [supabase.com · docs · guidessupabase.com](https://supabase.com/docs/guides/auth/quickstarts/nextjs.md) - Learn how to configure Supabase Auth for the Next.js App Router.

5. [Use Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) - Use the `create-next-app` command and the `with-supabase` template, to create a Next.js app pre-conf...

6. [Build a User Management App with Next.js | Supabase Docs](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) - Next.js is a versatile framework offering pre-rendering at build time (SSG), server-side rendering a...

7. [Consumer insights on managing spending](https://files.consumerfinance.gov/f/documents/201702_cfpb_Consumer-Insights-on-Managing-Spending.pdf) - over the course of the trial than those who didn’t receive such feedback.

8. [responsive design Articles, Videos, Reports, and Training Courses](https://www.nngroup.com/topic/responsive-design/?asset=publications) - It's key to prioritize content based on different contexts of use across devices and create a cohesi...

9. [Progress in Mobile User Experience - Nielsen Norman Group](https://www.nngroup.com/articles/mobile-usability-update/) - The second big implication of responsive design has been that sites have finally understood that **c...

10. [Mobile-Dedicated, Responsive, Adaptive, or Desktop Site? - NN/G](https://www.nngroup.com/articles/mobile-vs-responsive/) - Responsive design tackles that objection by striving for content and feature parity across different...

11. [Understanding Success Criterion 1.4.10: Reflow | WAI | W3C](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) - - Vertical scrolling content at a width equivalent to 320 CSS pixels;

12. [Understanding SC 2.5.5 Target Size (Enhanced) (Level AAA)](https://w3c.github.io/wcag/understanding/target-size-enhanced.html) - In reflowed content, the targets can appear anywhere on a line and can change position based on the ...

13. [New in 2.2 Draft](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) - > The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except where:

14. [Social Authentication](https://supabase.com/library/docs/nextjs/social-auth) - To switch providers, just update the `provider` field in the `supabase.auth.signInWithOAuth` call.

15. [Understanding Success Criterion 3.3.9: Accessible Authentication ...](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced.html) - A cognitive function test (such as remembering a password or solving a puzzle) is not required for a...

16. [WCAG 2.2 is officially a W3C recommendation - AccessibleEU](https://accessible-eu-centre.ec.europa.eu/content-corner/news/wcag-22-officially-w3c-recommendation-2023-10-06_en) - This new version of the WCAG include a minimum and enhanced versions of Focus Not Obscured which req...

17. [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/) - The guidelines are organized under 4 principles: perceivable, operable, understandable, and robust.

18. [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) - When a user interface component receives keyboard focus, the component is not entirely hidden due to...

19. [Understanding Success Criterion 2.4.13: Focus Appearance - W3C](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) - When the keyboard focus indicator is visible, an area of the focus indicator meets all the following...

20. [Cambodia International Travel Information](https://travel.state.gov/en/international-travel/travel-advisories/cambodia.html) - This is a standardized QR code for mobile payments, using USD or Khmer Riel.

21. [KHQR SDK Document](https://bakong.nbc.gov.kh/download/KHQR/integration/KHQR%20SDK%20Document.pdf) - It only requires a single QR for receiving transactions from any payment provider through

22. [The Next-Generation Mobile Payments and Banking](https://bakong.nbc.gov.kh/en/) - KHQR is a standardization of QR Code (EMV) that will promote wider use of mobile retail payments in ...

23. [P500905-dd805ae0-d0ed-4b18-9300-1d8c35e1b973.txt](https://documents1.worldbank.org/curated/en/099053025065014145/txt/P500905-dd805ae0-d0ed-4b18-9300-1d8c35e1b973.txt) - Very few use banks or MFIs.
...
digital wallets remains low-especially outside urban areas.

24. [Key Findings on Financial Inclusion in Cambodia](https://documents1.worldbank.org/curated/en/099053025065014145/pdf/P500905-dd805ae0-d0ed-4b18-9300-1d8c35e1b973.pdf) - Digital Access: 88% own a mobile phone, 
...
phone, but only 17% have a bank or

25. [P500905-0979e27c-9f73-4836-a717 ... - Documents & Reports](https://documents1.worldbank.org/curated/en/099053025065012337/txt/P500905-0979e27c-9f73-4836-a717-af235b1d8ee8.txt) - through digitalisation confirmed that lack of digital and financial literacy is the biggest demand-s...

26. [Route Handlers and Middleware - Next.js](https://nextjs.org/docs/15/app/getting-started/route-handlers-and-middleware) - > Route Handlers are only available inside the `app` directory.

