# BrokeNoMore PWA UX/UI Improvement PRD and AGY Implementation Prompt

**Document type:** UX/UI improvement PRD, PWA technical audit specification, and coding-agent execution prompt  
**Product:** BrokeNoMore  
**Target:** Next.js App Router PWA, Supabase Auth/Data, shadcn/ui, Tailwind CSS, Motion, next-intl  
**Primary viewport:** 390 × 844 CSS pixels  
**Evidence:** Fifteen mobile screenshots supplied on 17 October 2026  
**Status:** Implementation-ready specification; repository and runtime findings must still be verified by AGY

## Executive Decision

The existing interface has a credible foundation: the daily spending number is understandable, the five-tab navigation is learnable, the color palette is restrained, and the product avoids conventional finance-dashboard clutter. The next iteration should not replace that foundation with decorative glass everywhere. It should evolve the product into a **calm iOS-inspired financial control surface**: opaque content cards for readability, restrained glass only for navigation and transient controls, stronger hierarchy, safer financial validation, an instant-painted PWA shell, and a reversible onboarding flow.

A user **must review the generated plan before first activation**, because a template changes protected and spendable money. However, review should happen only during first-time setup or after meaningful plan changes—not after every login. Returning users with a complete plan should go directly to **Today**. First-time or incomplete users should resume the exact unfinished onboarding step.

## Audit Scope and Limitation

The findings below are based on the supplied screenshots, not repository inspection, network traces, Lighthouse output, database contents, or a physical installed-PWA test. AGY must reproduce each issue on iOS Safari, installed iOS PWA, Android Chrome, and installed Android PWA before changing behavior. Screenshot observations are evidence of symptoms, while code-level causes remain hypotheses until verified.

## Current Strengths

- The “Available today” concept is prominent and action-oriented.
- Quick-add options support low-friction expense capture.
- The Purchase Check drawer preserves context instead of forcing navigation.
- Protected funds, waiting, and undo mechanisms communicate the behavioral model.
- The palette uses green with neutral surfaces instead of excessive category colors.
- The onboarding sequence is short and uses understandable template choices.
- The application already exposes language, currency, theme, and advisor-tone preferences.

## Critical Findings

| Priority | Finding | Screenshot evidence | Risk | Required outcome |
|---|---|---|---|---|
| P0 | Financial plans can appear internally impossible. A $200 monthly income is shown alongside $160 protected monthly and $50 weekly flexible, which exceeds the declared income when weekly money is normalized to a month. | IMG_9880, IMG_9878, IMG_9879 | Users may trust an invalid safe-to-spend number. | Enforce cross-field allocation invariants on client and server before plan activation. |
| P0 | “Home and fixed” shows $20,000 and emergency access shows a $20,040 maximum while other values are around $20–$520. | IMG_9877, IMG_9875, IMG_9882 | Unit conversion or input parsing can catastrophically corrupt financial guidance. | Use integer minor units end to end, central currency parsing, bounds, confirmation, and server constraints. |
| P0 | Installed PWA reportedly displays a white screen for too long. | User-reported runtime symptom | Feels broken and can trigger repeat launches or abandonment. | Paint a branded app shell immediately; remove client-only auth gating; add iOS startup assets and measurable startup budgets. |
| P0 | App header/status-area behavior is inconsistent or hidden in PWA mode. Content appears to begin below an unclear blank/blurred region. | IMG_9874 through IMG_9884 | Loss of orientation; unsafe rendering around the notch/status bar. | Introduce one explicit app shell with safe-area ownership and a compact contextual top bar. |
| P1 | Onboarding has no visible Back action and does not make edits obviously reversible. | IMG_9880, IMG_9878, IMG_9879 | Users may abandon rather than correct a mistake. | Add Back on steps 2–3, preserve entered values, and support browser/gesture back safely. |
| P1 | Selected onboarding cards are tall, text-heavy, and visually repetitive. | IMG_9880, IMG_9878 | Excess scrolling and weak comparison. | Use compact radio cards, progressive disclosure, and a sticky action region. |
| P1 | Bottom navigation can cover content and dominates the viewport. | Multiple authenticated screens | Last controls and focused fields may be obscured. | Reserve scroll padding for the dock and safe area; validate keyboard and focus behavior. |
| P1 | The 24-hour list shows a prominent Buy action even when the item appears locked until Sunday. | IMG_9874 | Users may misunderstand whether cooling-off is enforced. | Disable purchase until expiry, show countdown and unlock state, and verify server time. |
| P1 | Activity contains duplicate and tiny-value events, including $0.01 and repeated undone coffee entries. | IMG_9872 | Accidental taps, duplicate submissions, and noisy history. | Add idempotency, tap locking, minimum/confirmation policy, and compact undo representation. |
| P1 | Account exposes an internal truncated user ID, while important product settings are buried in a long page. | IMG_9883, IMG_9884 | Technical noise and poor information hierarchy. | Remove internal IDs from normal UI; group settings and add a visible settings entry point. |
| P2 | “Other amo…” truncates on a primary quick-add card. | IMG_9870 | Looks unfinished and hurts comprehension. | Use “Custom” or a responsive label with no truncation at 320–430 px. |
| P2 | Most elements use similarly large rounded containers. | Authenticated light-theme screens | Weak hierarchy and template-like appearance. | Establish radius and elevation hierarchy; not every row should be a card. |
| P2 | Empty waiting-list space lacks useful guidance or illustration. | IMG_9874 | The screen appears unfinished. | Add a purposeful empty state or compact state-specific illustration. |
| P2 | Marketing claims such as “Private & encrypted” may be broader than what the UI proves. | IMG_9876 | Trust and compliance risk. | Use precise claims that match implemented storage, transport, RLS, and telemetry behavior. |

## Product Experience Model

### Routing rules

| Session state | Onboarding state | Destination | Behavior |
|---|---|---|---|
| Signed out | Any | `/login` | Show login immediately without waiting for a client session request. |
| Signed in | No profile/onboarding record | `/onboarding/income` | Create or resume server-backed draft. |
| Signed in | Draft step 1 complete | `/onboarding/template` | Restore income and cadence. |
| Signed in | Draft step 2 complete | `/onboarding/review` | Restore selected template and calculated plan. |
| Signed in | Complete plan | `/today` | Do not replay onboarding or plan review. |
| Signed in | Plan invalid after migration | `/plan/repair` | Explain the issue; never silently calculate a safe-to-spend value. |

### First-run flow

1. **Login:** Google OAuth with a visible pending state, a retryable error state, and redirect preservation.
2. **Income rhythm:** Cadence and estimated monthly income. Input is formatted but stored as integer minor units.
3. **Template:** Show three recommendations calculated from actual available money, not fixed dollar values that can exceed income.
4. **Review and adjust:** Show the entire plan equation and editable allocations.
5. **Activate:** Perform server-side validation and create the first plan atomically.
6. **Today:** Show a short success transition, then the real dashboard—not a second tutorial.

### Mandatory plan review

Review is mandatory once because activation affects financial guidance. The review screen must answer:

- Monthly income: how much is available?
- Protected commitments: what amount is excluded?
- Flexible weekly amount: what amount can be spent?
- Monthly equivalent of weekly allocations: what is the normalized total?
- Unallocated buffer: what remains?
- If overallocated: by how much and which values can be adjusted?

Use the product’s agreed month-normalization policy consistently. If weekly values are converted to a monthly equivalent, use one documented constant or calendar-based engine everywhere rather than mixing four-week and average-month calculations.

## Visual Direction

### “Quiet Glass Ledger”

The style should combine the clarity of a paper ledger with the depth of iOS materials:

- **Content layer:** Solid or nearly solid surfaces for money, forms, lists, and explanatory text.
- **Navigation layer:** Translucent top bar, bottom dock, floating Check control, menus, and sheets.
- **Action color:** One emerald family for positive or primary interaction.
- **Risk color:** Rose/red only for irreversible or emergency actions.
- **Typography:** A clean UI sans for content; tabular numerals for money; monospaced styling only where it improves scanning, not for every value.
- **Shape:** Small radius for inputs and rows, medium radius for cards, large radius only for sheets and the navigation dock.
- **Depth:** Hairline borders and restrained shadows. Avoid glowing edges, gradient buttons, and glass on every card.

Apple’s material guidance recommends using Liquid Glass to distinguish interactive/navigation layers from content, and explicitly warns against using it throughout the content layer because that creates unnecessary complexity and hierarchy confusion.[cite:391] Translucent surfaces also need opaque fallbacks and testing under reduced-transparency and increased-contrast settings.[cite:389][cite:392]

### Material tokens

```css
:root {
  --canvas: 248 248 246;
  --surface: 255 255 255;
  --surface-raised: 255 255 255;
  --ink: 20 23 29;
  --ink-muted: 92 97 108;
  --line: 20 23 29 / 0.10;
  --accent: 12 137 92;
  --accent-strong: 7 111 73;
  --danger: 190 45 52;
  --warning: 177 107 0;
  --glass: 250 250 248 / 0.72;
  --glass-border: 255 255 255 / 0.55;
  --radius-control: 14px;
  --radius-card: 20px;
  --radius-sheet: 28px;
  --blur-dock: 24px;
}

.dark {
  --canvas: 8 10 14;
  --surface: 16 20 27;
  --surface-raised: 20 25 33;
  --ink: 246 247 249;
  --ink-muted: 158 164 177;
  --line: 255 255 255 / 0.10;
  --glass: 17 21 28 / 0.72;
  --glass-border: 255 255 255 / 0.12;
}

.glass-navigation {
  background: rgb(var(--glass));
  border: 1px solid rgb(var(--glass-border));
  box-shadow: 0 8px 30px rgb(0 0 0 / 0.10);
  -webkit-backdrop-filter: blur(var(--blur-dock)) saturate(140%);
  backdrop-filter: blur(var(--blur-dock)) saturate(140%);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass-navigation { background: rgb(var(--surface)); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

Do not depend on blur for contrast. Text-heavy dialogs, form cards, plan rows, and financial summaries should remain opaque. If a project-level “reduce transparency” preference is supported, switch glass tokens to solid surfaces.

## PWA App Shell

### Header and safe areas

Use a single shell that owns all viewport and safe-area behavior:

```text
html/body: fixed to viewport; no document scroll
└── AppShell: 100svh/100dvh with canvas background
    ├── SafeAreaTop / contextual AppBar
    ├── ScrollRoot: only vertical scroller
    └── GlassBottomDock: outside ScrollRoot
```

Requirements:

- Add `viewport-fit=cover` through Next.js viewport metadata.
- Apply top spacing with `env(safe-area-inset-top)` to the shell, not independently to every page.
- Apply bottom dock padding with `max(10px, env(safe-area-inset-bottom))`.
- Add scroll padding equal to dock height plus safe-area inset.
- Keep the top app bar and bottom dock outside the scroll container.
- Do not globally hide all `<header>` elements in standalone mode.
- In standalone mode, hide only the marketing header and render a compact app bar with page title, contextual action, and profile/settings trigger.
- Browser mode may retain browser chrome; installed mode must not imitate browser controls.
- Test portrait, landscape, display zoom, keyboard open, and 200% text zoom.

On iOS, standalone rendering and translucent status bars change the origin and require explicit safe-area treatment.[cite:380] An inner scrolling app shell also avoids content compositing unpredictably behind the status region while preserving edge-to-edge rendering.[cite:377]

### White-screen startup fix

The launch experience must have three layers:

1. **Native launch layer:** Manifest colors/icons plus iOS `apple-touch-startup-image` assets for supported viewport families. iOS can otherwise show a white opening screen while the PWA loads.[cite:380]
2. **Server-rendered shell:** The first HTML response paints the correct theme, logo mark, and skeleton without waiting for JavaScript or Supabase.
3. **Progressive application layer:** Server-rendered auth routing and streamed route content replace the shell without a blank frame.

Implementation requirements:

- Set `manifest.webmanifest` `background_color` and `theme_color` for the intended startup theme.
- Generate purpose-built maskable and standard icons; do not stretch one asset.
- Provide iOS startup images and media queries for supported devices.
- Inline only the tiny critical startup styles needed to paint canvas and shell.
- Resolve theme before hydration using a non-blocking, CSP-safe strategy; prevent dark-to-white flash.
- Never render `null`, an empty fragment, or a full blank page while waiting for `getSession()`.
- Verify authentication server-side using Supabase SSR cookies and verified claims, then redirect before sending the wrong page. Supabase’s current SSR guidance uses cookie-based sessions, separate browser/server clients, and a proxy for token refresh.[cite:293]
- Add route `loading.tsx` files that resemble the final layout. Next.js loading UI and Suspense allow progressive streaming instead of blocking an entire route.[cite:378][cite:93]
- Parallelize independent data reads and remove client-side request waterfalls.
- Use Server Components by default; isolate Motion, forms, and interactive controls as client islands.
- Self-host fonts with `next/font` and use variable/subset fonts to avoid external requests and layout shift.[cite:381]
- Cache versioned static assets in the service worker, use network-first or navigation-preload-aware behavior for authenticated HTML, and never cache private API responses in a shared cache. A service worker does not control the first visit, so it cannot replace server-rendered startup work.[cite:386]
- Add a branded offline page and an inline “Reconnect” state, not a blank error.

### Startup budgets

- First visual canvas or launch image: no white frame.
- Shell visible on cold start: target under 800 ms on a throttled modern mobile profile.
- LCP: 2.5 seconds or less at the 75th percentile.
- INP: 200 ms or less at the 75th percentile.
- CLS: 0.1 or less at the 75th percentile.[cite:403][cite:407]
- Returning installed launch: shell immediately, useful authenticated content as soon as the server response arrives.

Instrument `web-vitals`, navigation timing, auth resolution, route data, and service-worker state. Record anonymized timings, not financial values.

## Login Redesign

### Problems to address

- The current page is visually polished but tall and marketing-heavy for a returning installed-PWA user.
- The GitHub icon competes with the primary sign-in task.
- A large mock dashboard below the CTA increases initial work and can distract from authentication.
- The trust line may overstate implementation details.
- There is no visible pending, failure, offline, or already-authenticated state in the screenshot.

### New browser login

- Compact brand bar with language control; move GitHub to an About/footer destination.
- Specific heading: **“Know what you can safely spend today.”**
- Supporting text limited to two lines.
- Primary Google button with official mark, 52–56 px height, and clear focus state.
- Small three-item proof row: “No bank connection,” “Your plan stays private,” “Delete your data anytime”—only if each claim is implemented.
- A single product preview below the fold, rendered as lightweight HTML/SVG rather than a heavy image.

### New installed-PWA login

- One-screen layout without the full marketing preview.
- Logo, concise value statement, Google CTA, language, privacy link, and version/support entry.
- Match current system theme from the first frame.
- If offline, explain that sign-in needs a connection and offer Retry; do not leave the CTA spinning.
- On OAuth start, replace button content with progress and disable duplicate taps.
- On callback, show the app shell plus “Finishing sign-in…” rather than a white page.
- On error, preserve a human-readable cause, Retry, and a safe return to login.
- An authenticated user visiting `/login` should be redirected server-side to the correct onboarding step or `/today`.

## Onboarding Redesign

### Shared structure

Each step uses:

- A compact glass top bar with 44 × 44 Back target, “Step X of 3,” and optional “Save and exit.”
- A thin accessible progress indicator beneath the bar.
- One scrollable content region.
- A sticky glass action footer with one primary button and safe-area padding.
- Preserved values when navigating backward, refreshing, closing, or returning after OAuth.
- Inline errors near the relevant field and a summary only when multiple sections fail.

Progress indicators should communicate process state and whether navigation is available.[cite:396] Interactive targets should be at least 44 × 44 CSS pixels where practical, with visible focus and no sticky element obscuring focused controls.[cite:18][cite:17]

### Step 1: Income rhythm

- Title: **“How does money arrive?”**
- Replace four oversized cards with compact selection rows, each with title and one-line explanation.
- When “Irregular / freelance” is selected, reveal a short explanation and ask for a conservative monthly baseline or recent average.
- Use an input label that remains visible; set `inputmode="decimal"`; format on blur without moving the caret while typing.
- Show currency and period together: “Estimated monthly income (USD).”
- Include example guidance appropriate to the selected cadence.
- Back returns to login only after a confirmation: “Leave setup? Your draft is saved.”

### Step 2: Template

- Generate templates from validated income and protected baseline; do not hard-code dollar templates that can exceed income.
- Show each option as a compact radio card with three comparable rows: Protected, Flexible per week, Buffer.
- Put “Recommended” in a small semantic badge, not inside the title.
- Add “Why recommended?” disclosure.
- Update a sticky mini-summary when selection changes.
- Back returns to Step 1 without losing data.
- Primary action: **“Review this plan.”**

### Step 3: Review and adjust

- Show an allocation equation before individual envelopes:

```text
Monthly income
− protected commitments
− monthly equivalent of weekly flexible spending
= unallocated buffer
```

- Use status: Balanced, Unallocated money, or Overallocated.
- Allow inline edit through a sheet or expandable rows; do not make users go to another page to fix a value.
- Explain that no bank money moves and that these are planning limits.
- Prevent activation when overallocated, negative, non-finite, out of currency bounds, or inconsistent with server rules.
- Primary action: **“Activate my plan.”**
- Secondary action: **“Back to templates.”**
- After success, announce “Plan ready” and continue to Today.

## Authenticated App Improvements

### Today

- Keep “Available today” as the primary object, but reduce card height and move explanation into a small “How it’s calculated” sheet.
- Use a number transition of 180–240 ms after a confirmed transaction; use a static update under reduced motion.
- Quick Add cards should provide pressed, saving, success, and undo states.
- Rename “Other amo…” to **“Custom”**.
- Disable a chip during its request and attach an idempotency key to prevent duplicate taps.
- Use inline confirmation near Quick Add; reserve toast for secondary information.

### Plan

- Separate summary from editing. Default view shows four rows, remaining values, and Edit.
- Editing opens focused sections rather than displaying a very long form by default.
- Show a persistent validity summary when any change makes the plan impossible.
- Remove cents where the selected currency/product policy does not use displayed fractional values.
- Hide emergency access behind a clearly labeled, high-friction flow; calculate maximum server-side.
- Replace “Monthly flexible income” with a term matching the actual domain model.

### Check

- Keep the bottom sheet, but add a visible drag handle and a 44 × 44 close target.
- Respect sheet safe areas and keyboard resizing.
- Start with category selection and amount; show impact only after a nonzero amount.
- Use semantic verdicts: Safe, Re-pace, Wait 24 hours, Cannot fit plan.
- Disable both actions at zero and explain why.
- Use server time for waiting periods.

### Activity

- Group reversed entries beneath the original instead of showing repeated full rows.
- Make reversal available through row action/detail, not an unlabeled circular arrow alone.
- Add an accessible filter sheet on narrow screens.
- Show transaction detail with source, category, created time, reversal status, and effect on pace.
- Reject duplicate command IDs server-side.

### Progress

- Prioritize one useful weekly trend over many achievement cards.
- Render milestones as a compact timeline or list with progress, not identical large rows.
- Clearly mark community participation as opt-in.
- Avoid fabricated social proof or rankings.

### Settings

- Add a settings/profile trigger in the top app bar.
- Remove internal UUID from the default view.
- Split Account, Appearance, Localization, Coaching, Privacy, and About into navigable rows.
- Theme choices use actual previews, while selection remains obvious without color alone.
- Currency change requires impact preview and explicit confirmation; do not reinterpret stored minor units silently.

### Empty states and illustrations

Create a small custom SVG system using the product’s ledger-line motif:

- Waiting list empty: a clock protecting a shopping tag.
- Activity empty: two ledger lines and a small plus receipt.
- Progress first week: a shield sprouting a simple leaf.
- Offline: a disconnected line reconnecting to a shield.
- Plan repaired: aligned ledger lines with a check.

SVGs must be original, geometric, low-detail, use `currentColor`, include a fixed `viewBox`, and remain understandable at 96–160 px. Decorative SVGs use `aria-hidden="true"`; meaningful SVGs use a concise accessible label. Animate only one or two strokes on entry and remove stroke animation under reduced motion.

## Motion System

| Interaction | Motion | Duration | Rule |
|---|---|---:|---|
| Page transition | 4–8 px fade/translate | 180–220 ms | No large horizontal slides except direct back navigation. |
| Bottom sheet | Translate from bottom + dim | 260–320 ms | Gesture follows finger; avoid excessive spring bounce. |
| Card selection | Border/tint crossfade, 0.99 press scale | 120–180 ms | Never reflow surrounding cards. |
| Money update | Digit crossfade/short vertical roll | 180–240 ms | Tabular width; no celebration for routine spending. |
| Quick Add success | Check morph + inline undo | 180–240 ms | Optimistic only when reversal is reliable. |
| Plan activation | Short shield/ledger animation | ≤600 ms | One-time milestone only. |
| Skeleton | Subtle opacity pulse | 1.2–1.6 s | No bright sweeping shimmer. |

When Reduce Motion is enabled, replace spatial movement and blur animation with simple fades. Apple specifically recommends reducing repetitive/automatic motion, tightening springs, replacing axis movement with fades, and avoiding animation into or out of blur.[cite:390]

## Financial Integrity Requirements

Client validation improves UX but is not a trust boundary. Enforce these rules in server commands/database functions:

- All monetary values are integers in minor units.
- Currency is stored separately and cannot change the meaning of existing amounts.
- Values must be finite, nonnegative, and below explicit domain bounds.
- Protected monthly plus the monthly equivalent of weekly allocations cannot exceed income unless the product deliberately models another funding source.
- Available Today cannot be emitted from an invalid plan.
- Emergency maximum is derived from eligible protected balances, never client input.
- Plan activation, expense creation, reversal, waiting-list conversion, and emergency access are atomic operations.
- Every financial command accepts an idempotency key.
- Reversal appends an audit event; it does not delete history.
- Waiting-list unlock uses database/server time.
- RLS limits all user data to its owner.

## Accessibility Requirements

- WCAG 2.2 AA minimum.
- Body text contrast at least 4.5:1; large text and non-text controls at least 3:1.
- Visible focus ring with sufficient area and 3:1 change in contrast.[cite:18]
- Touch targets preferably 44 × 44 CSS px; never below WCAG’s 24 × 24 minimum without an applicable spacing exception.[cite:18][cite:17]
- Correct button, radio group, dialog, navigation, progressbar, status, and alert semantics.
- Dialog focus trap, initial focus, Escape handling, and focus restoration.
- Screen-reader announcements for plan status, transaction success/reversal, and amount changes; do not announce every animated frame.
- Text zoom to 200% without clipped labels, horizontal page scroll, or obscured controls.
- Khmer QA with a Khmer-capable font, longer labels, line-height review, and no English-dependent fixed widths.
- Forced colors, reduced motion, reduced transparency fallback, and high contrast testing.

## Technical Architecture Requirements

### Rendering boundaries

- Server Components: route guard, profile/plan bootstrap, page layout, static explanations.
- Client Components: radio/form interaction, Motion, sheets, quick actions, query mutations.
- Avoid wrapping the whole application in a client provider unless required.
- Keep auth and private routes dynamic; never ISR-cache user-specific HTML. Supabase warns against caching authenticated session-refresh routes and recommends verified claims rather than trusting the session user object alone.[cite:409][cite:103]

### Loading hierarchy

1. Static launch/startup layer.
2. Root server shell.
3. Route skeleton matching final geometry.
4. Critical above-fold data.
5. Secondary history/progress data.
6. Deferred noncritical analytics and illustrations.

### Suggested project structure

```text
src/
├── app/
│   ├── manifest.ts
│   ├── loading.tsx
│   ├── global-error.tsx
│   ├── (public)/login/
│   ├── (onboarding)/onboarding/
│   │   ├── layout.tsx
│   │   ├── income/
│   │   ├── template/
│   │   └── review/
│   └── (app)/
│       ├── layout.tsx
│       ├── today/
│       ├── plan/
│       ├── activity/
│       ├── progress/
│       └── settings/
├── components/
│   ├── shell/
│   ├── onboarding/
│   ├── finance/
│   ├── illustrations/
│   └── ui/
├── lib/
│   ├── money/
│   ├── pwa/
│   ├── supabase/
│   └── validation/
└── styles/
    └── tokens.css
```

## Verification Matrix

Test at minimum:

- iPhone SE-size width, iPhone 390 px, large iPhone, iPad portrait.
- iOS Safari normal tab and Add-to-Home-Screen standalone mode.
- Android Chrome browser and installed PWA.
- Light, dark, and system theme.
- English and Khmer.
- USD and KHR display policy.
- Online, slow 3G, offline after first visit, expired session, OAuth canceled, OAuth error.
- Fresh user, partial onboarding, complete user, invalid legacy plan.
- Software keyboard open on each form and sheet.
- Reduce Motion, increased contrast, reduced transparency fallback, 200% text zoom.
- Back button, edge-swipe back, refresh, force-close/reopen, duplicate tap, and rapid navigation.

## Acceptance Criteria

### Startup and shell

- No unbranded white frame appears during an installed iOS launch on supported test devices.
- Server HTML contains a visible shell before client JavaScript runs.
- No route returns an empty root while auth initializes.
- Top content never sits under status icons, and bottom controls never sit under the home indicator.
- Marketing header is hidden only where intended; every authenticated screen retains an orientation bar or clear page heading.

### Login

- Google can be tapped once; duplicate OAuth launches are prevented.
- Pending, offline, canceled, callback-error, and retry states are designed.
- Authenticated users never see login flash before redirect.

### Onboarding

- Back is present on steps 2 and 3 and preserves all data.
- Closing and reopening resumes the exact unfinished step.
- Template values are derived from current income.
- Review exposes the complete allocation equation.
- Invalid or overallocated plans cannot be activated on client or server.
- Successful activation routes once to Today and is idempotent.

### Visual quality

- Glass is limited to navigation, overlays, and floating controls.
- Text-heavy financial content remains legible on opaque surfaces.
- No label truncates at 320–430 px or under Khmer localization.
- Radius, border, typography, spacing, and elevation use documented tokens.
- Motion respects reduced-motion preferences.

### Data safety

- $200 cannot become $20,000 because of focus/blur, locale, or minor-unit conversion.
- Duplicate quick taps create at most one transaction.
- Waiting-list purchase cannot execute before server-side expiry.
- Emergency maximum cannot exceed eligible protected funds.

## Phased Implementation Plan

### Phase 0: Audit and reproduce

- Capture repository architecture, route map, providers, middleware/proxy, manifest, service worker, auth flow, and money helpers.
- Reproduce every screenshot issue and record device/mode.
- Collect cold-start video, server timing, JS bundle, route waterfall, LCP, INP, CLS, and hydration warnings.
- Produce `docs/ux-audit.md` and `docs/ux-todo.md` before code changes.

### Phase 1: Financial safety

- Centralize money parsing/formatting and currency policy.
- Add Zod cross-field plan schema plus matching server/database constraints.
- Add idempotency and command-level tests.
- Repair or quarantine invalid legacy plans.
- Do not redesign calculations until regression tests describe current and expected behavior.

### Phase 2: PWA shell and startup

- Implement viewport metadata, manifest, startup assets, theme bootstrapping, app shell, safe areas, scroll root, and bottom dock spacing.
- Replace client-only auth loading with SSR routing.
- Add loading/error/offline states.
- Measure cold and warm starts before and after.

### Phase 3: Login and onboarding

- Redesign login variants.
- Add durable onboarding draft and explicit back behavior.
- Rebuild compact income/template/review screens.
- Implement mandatory valid plan review and atomic activation.

### Phase 4: Authenticated UI system

- Apply tokens and restrained glass navigation.
- Refactor Today, Plan, Check, Activity, Progress, Settings, and empty states.
- Add original SVG illustration components and motion tokens.

### Phase 5: Accessibility and localization

- Keyboard/screen-reader audit, contrast, target sizes, 200% zoom, reduced motion/transparency.
- Khmer and currency QA.

### Phase 6: Performance and release

- Bundle analysis, route waterfalls, font and icon optimization, service-worker policy, RUM dashboards.
- Automated Playwright journeys and visual regression.
- Staged rollout, error monitoring, rollback plan, and final evidence report.

## Master Prompt for AGY

Copy the prompt below into AGY with repository and Supabase MCP access.

```text
You are the principal UX engineer, senior Next.js engineer, PWA specialist, and financial-data safety reviewer for BrokeNoMore.

MISSION
Audit and fully improve the current BrokeNoMore UI/PWA using the attached “BrokeNoMore PWA UX/UI Improvement PRD.” Preserve the product’s central idea—one trustworthy Available Today number—but make the experience faster, safer, more polished, more accessible, and distinctly human-designed. Apply restrained iOS-inspired glass only to navigation and transient interactive layers. Do not apply blur to every content card.

MANDATORY OPERATING MODE
1. Audit first. Do not change code until you have inspected the repository, reproduced the flows, and written the audit and phased TODO documents.
2. Verify every screenshot symptom against code and runtime. Do not assume the proposed root cause is correct.
3. Protect financial correctness before visual polish. A visually improved app with invalid money calculations is a failed implementation.
4. Make small reviewable phases. After each phase, run tests, lint, type-check, production build, and relevant mobile/PWA verification.
5. Never modify production Supabase directly without explicit approval. Use Supabase MCP read-only first to inspect schema, migrations, RLS, functions, indexes, and policies. Propose migrations in repository files. Apply only to local/development or an explicitly approved branch project.
6. Never expose service-role keys, access tokens, refresh tokens, user financial data, or MCP secrets in code, logs, screenshots, test fixtures, or reports.
7. Do not overwrite existing migrations. Add forward migrations with rollback notes.
8. Do not redesign working domain behavior silently. Record any behavior change in an ADR.

STACK
- Next.js App Router and TypeScript
- Supabase Auth/Postgres/RLS with @supabase/ssr
- Tailwind CSS and shadcn/ui
- Motion for React, loaded only in client components that need motion
- next-intl
- Zod and React Hook Form
- TanStack Query for client server-state and mutations
- nuqs only for shareable/filter URL state, never for secrets or money drafts
- Bun commands where supported by the repository

INPUT EVIDENCE
Review all supplied screenshots, especially:
- Login marketing page
- Onboarding steps 1–3
- Today, Plan, Activity, Progress, Settings
- Purchase Check sheet
- Waiting list
- Emergency protected-fund dialog
Look specifically for the visible $200 income / $160 protected / $50 weekly inconsistency, the $20,000 protected amount, the $20,040 emergency maximum, duplicate activity rows, tiny-value transactions, absent onboarding Back actions, truncated quick-add labels, status/safe-area issues, and content hidden by the bottom navigation.

PHASE 0 — AUDIT ONLY
Create:
- docs/ux-audit.md
- docs/pwa-startup-audit.md
- docs/financial-integrity-audit.md
- docs/ux-todo.md
- docs/adr/ADR-xxx-pwa-app-shell.md
- docs/adr/ADR-xxx-money-minor-units.md
- docs/adr/ADR-xxx-onboarding-draft-and-activation.md

The audit must include:
- Current route and layout tree
- Client vs Server Component boundaries
- Auth cookie/proxy/callback flow
- Why any blank page can render
- Manifest, icons, startup images, service worker, caching rules
- Theme initialization and hydration behavior
- Safe-area and scroll ownership
- All money parsing, formatting, conversion, and plan equations
- Current Supabase tables, functions, constraints, triggers, RLS, and indexes
- Accessibility/component inventory
- Bundle and request-waterfall findings
- Reproduction steps and evidence for each issue
- P0/P1/P2/P3 priorities, dependencies, file paths, tests, and acceptance checks

Stop after the audit and present findings unless explicit permission has already been given to execute all phases.

PHASE 1 — FINANCIAL INTEGRITY
- Add one money module using integer minor units.
- Add currency metadata and explicit display policy.
- Replace ad hoc parseFloat/string multiplication logic.
- Add Zod schemas with cross-field refinements.
- Add matching database constraints or transactional RPC validation.
- Make plan activation, transaction creation, reversal, wait-list conversion, and emergency unlock atomic and idempotent.
- Derive emergency maximum server-side.
- Use server/database time for cooldowns.
- Add tests proving $200 never becomes $20,000 and an overallocated plan cannot activate.
- Detect invalid legacy rows and route them to a repair flow rather than calculating Available Today.

PHASE 2 — PWA STARTUP AND SHELL
- Implement viewport-fit cover and one owner for safe-area insets.
- Lock document scrolling and use one inner scroll root where compatible with the existing architecture.
- Keep contextual top bar and glass bottom dock outside the scroller.
- Add content padding so the dock never covers controls or focus.
- Hide only the marketing header in standalone mode; never globally hide all headers.
- Add manifest colors, maskable icons, and iOS startup images.
- Paint a theme-correct static/server shell immediately.
- Remove any return-null/client-only auth gate.
- Verify auth server-side with Supabase SSR cookies and verified claims.
- Add route loading, global error, offline, OAuth callback pending, and retry states.
- Review service-worker navigation and private-data caching rules.
- Record before/after cold-start video and timings.

PHASE 3 — LOGIN AND ONBOARDING
- Build browser and installed-PWA login variants.
- Implement duplicate-submit protection, pending, canceled, offline, callback-error, and retry states.
- Redirect authenticated users server-side without flashing login.
- Persist onboarding draft per user in Supabase or the existing approved durable model.
- Add 44x44 Back action on steps 2 and 3; Step 1 exit requires confirmation and preserves draft.
- Preserve state across Back, browser history, refresh, force-close, and OAuth return.
- Rebuild compact Income Rhythm selection.
- Generate template amounts from valid income rather than fixed incompatible values.
- Build mandatory Review & Adjust with allocation equation, status, editable rows, and server validation.
- Activate the plan atomically and route to Today once.
- Returning complete users go directly to Today; do not ask them to review on every login.

PHASE 4 — DESIGN SYSTEM AND APP SCREENS
- Create semantic light/dark tokens for canvas, surfaces, text, line, accent, warning, danger, glass, radii, shadow, and motion.
- Use glass only on top app bar, bottom dock, floating Check action, popovers, and sheets.
- Keep forms, money cards, dialogs, and dense lists opaque.
- Provide backdrop-filter fallback and a project-level reduced-transparency fallback.
- Refine Today, Plan, Check, Activity, Progress, Waiting List, and Settings according to the PRD.
- Replace “Other amo…” with “Custom.”
- Disable quick-add controls while pending and send idempotency keys.
- Disable waiting-list Buy until server expiry.
- Remove internal UUID from standard account UI.
- Reduce repeated large rounded cards and introduce a clear radius/elevation hierarchy.
- Create original currentColor SVG illustrations for empty/offline/success states; do not download a generic illustration pack.

PHASE 5 — MOTION, ACCESSIBILITY, I18N
- Use purposeful Motion transitions from the PRD.
- Respect prefers-reduced-motion; do not animate blur under reduced motion.
- Ensure focus trapping/restoration for sheets and dialogs.
- Meet WCAG 2.2 AA contrast and target requirements.
- Test screen readers, keyboard, 200% zoom, forced colors, and reduced transparency fallback.
- Verify Khmer line height, wrapping, fonts, and every 320–430px width.
- Verify USD and KHR formatting and prevent currency changes from reinterpreting stored amounts.

PHASE 6 — QA AND RELEASE
Required commands, adapted to repository scripts:
- bun install --frozen-lockfile
- bun run lint
- bun run typecheck
- bun run test
- bun run build
- Playwright smoke, auth, onboarding, money safety, duplicate tap, wait-list expiry, emergency access, and back-navigation suites
- Lighthouse/PWA checks plus real iOS installed-PWA checks

Test matrix:
- iOS Safari and installed PWA
- Android Chrome and installed PWA
- 320, 375, 390, 430, 768 CSS px
- Light/dark/system
- English/Khmer
- USD/KHR
- Fresh, partial-onboarding, returning, expired-session, invalid-plan users
- Online, slow, offline, OAuth canceled/error
- Keyboard open, landscape, text zoom, Reduce Motion

REQUIRED OUTPUT AFTER EACH PHASE
- Files changed and why
- Database migrations/functions/policies changed
- Screens and flows changed
- Tests added and exact results
- Before/after performance measurements
- Accessibility findings
- Remaining risks and TODOs
- Screenshots or recordings at 390x844 in light and dark
- Explicit acceptance-criteria checklist

DEFINITION OF DONE
The work is not done when the UI merely looks more modern. It is done only when:
- Installed launch shows no unexplained white screen.
- Safe areas and headers are correct in browser and standalone modes.
- Login never flashes for authenticated users and handles all failure states.
- Onboarding is reversible, resumable, compact, and validates the full financial equation.
- Returning users with a complete valid plan go directly to Today.
- No invalid plan can produce Available Today.
- Money unit conversion, duplicate commands, waiting periods, and emergency limits are server-safe.
- Glass is restrained, readable, and has accessibility fallbacks.
- All core flows pass automated and real-device checks.
- Documentation and ADRs match the final implementation.

Begin with Phase 0. Inspect first; report evidence; do not guess.
```

## TODO Format for AGY

```markdown
- [ ] UX-P0-001 — Prevent invalid plan activation
  - Area: Money engine / onboarding / Supabase RPC
  - Evidence: IMG_9880, IMG_9878, IMG_9879
  - Current behavior: Declared allocations can exceed monthly income.
  - Expected behavior: Cross-field validation blocks activation and explains the exact shortfall.
  - Dependencies: Currency policy, month-normalization ADR
  - Files: To be discovered during audit
  - Database impact: Constraint or transactional validation required
  - Tests: Unit + RPC + Playwright onboarding
  - Acceptance: Invalid plan cannot be activated through UI, direct API, or replayed request.
  - Status: Not started
```

## Final Review Gate

Before merge, require sign-off from product/UX, frontend, database/security, and QA. The release reviewer should compare implementation against the screenshots, the PRD, real installed-PWA behavior, and financial invariants—not only visual snapshots.
