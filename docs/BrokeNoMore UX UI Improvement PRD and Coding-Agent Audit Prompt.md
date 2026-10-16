# BrokeNoMore UX/UI Improvement PRD

**Document type:** UX/UI Improvement PRD and implementation audit brief  
**Product:** BrokeNoMore  
**Version:** 2.0  
**Status:** Ready for repository audit and implementation planning  
**Primary surfaces:** Mobile-first user PWA and responsive administration console  
**Baseline viewport:** 390 × 844px for the user PWA; 1440 × 900px for the admin console  
**Target stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Motion for React, Lucide, Supabase, next-intl, Zod, React Hook Form, TanStack Query, nuqs, and Bun

## Executive decision

BrokeNoMore should be redesigned as a **calm financial decision product with a playful optional layer**, not as a dark gamified dashboard filled with badges, emoji, colored cards, and simultaneous calls to action. The primary user experience must answer three questions in order: **What can be spent today? What changed? What should happen next?** The admin experience must help authorized staff monitor product health, moderate public features, manage configurable content, investigate exceptions, and change settings safely without exposing users’ private financial details.

The visual direction is **Obsidian Ledger**: precise financial typography, restrained near-black surfaces, one emerald action color, warm off-white text, tabular numbers, subtle physical depth, custom line-and-shape SVG illustrations, and motion that explains state changes. The product must avoid common AI-generated aesthetics: excessive gradients, interchangeable bento cards, decorative glowing blobs, emoji used as the main icon system, uniformly rounded containers, and animation without informational value.

The deployed URL could not be reliably inspected during this research pass. Consequently, findings about the current implementation are hypotheses derived from the supplied PRD rather than verified defects. The coding agent must inspect the repository and running application before changing code, preserve working behavior, and convert every verified problem into a traceable TODO.

## Evidence-based constraints

- WCAG requires visible keyboard focus, and current guidance treats focus visibility, focus obstruction, target sizing, reflow, non-text contrast, and meaningful page titles as explicit quality concerns.[^1][^2][^3][^4]
- Next.js uses the document title, then the page heading, then the URL for client-side route announcements, so every route requires a unique title and clear `h1`.[^5]
- Motion supports layout animation, shared-element transitions, and exit states, but the interface must replace movement with opacity or disable non-essential motion when the user requests reduced motion.[^6][^7][^8]
- Lucide recommends text labels for reliable comprehension, 44 × 44px interactive wrappers, non-color status cues, and accessible names on icon buttons rather than on decorative icons.[^9]
- Empty states should explain what belongs in the space and provide one contextual next action; decorative illustrations should use an empty alternative text.[^10]
- Data tables should receive enough width, use consistent row density, place search/filter/actions in a toolbar, and support sorting, expansion, selection, and pagination only where the workflow requires them.[^11][^12][^13]
- Supabase administration must be enforced with database authorization, not only hidden navigation. Exposed tables require RLS and explicit grants, while administrative bypass credentials must never be exposed to the browser.[^14][^15]

## Product goals

1. Make the next useful action obvious within one second.
2. Preserve the under-three-second quick-expense flow.
3. Explain financial consequences without shaming or overwhelming users.
4. Give the admin a focused operations console rather than a second analytics dashboard.
5. Establish one auditable design system for user and admin surfaces.
6. Add SVG illustration and motion only where they improve comprehension, orientation, feedback, or emotional safety.
7. Make every component production-ready across loading, empty, error, stale, offline, permission-denied, and success states.
8. Achieve WCAG 2.2 AA as the release baseline while using the stronger 44px internal touch-target standard.
9. Support English and Khmer without layouts depending on fixed English string lengths.
10. Produce a repository-derived TODO backlog that can be implemented incrementally without a risky full rewrite.

## Non-goals

- Turning the admin console into a tool for reading or editing individual users’ transaction details by default.
- Adding investment advice, credit scoring, lending, bank transfers, or regulated financial recommendations.
- Creating animation-heavy marketing screens inside authenticated workflows.
- Replacing familiar shadcn primitives with custom controls when composition and theming are sufficient.
- Using SVG illustrations as substitutes for labels, data, or instructions.
- Adding charts because dashboard space is available. A chart is allowed only when it supports a defined admin decision.

## Roles and permissions

| Role | Primary objective | Access model |
|---|---|---|
| User | Plan spending, log expenses, evaluate purchases, protect savings | Own profile and financial records only |
| Support agent | Resolve account and product issues | Minimum user identity and diagnostic metadata; no balance details unless a separately approved support flow requires them |
| Content manager | Manage coach copy, templates, illustration mappings, and announcements | Versioned content access; no user financial data |
| Moderator | Review leaderboard aliases and reported public content | Public identity, report context, moderation actions |
| Analyst | View privacy-safe aggregate product metrics | Aggregated and de-identified data only |
| Super admin | Manage staff roles, feature flags, strategy configuration, and system operations | Explicit permission grants, reasoned high-risk actions, full audit logging |

Use Supabase custom claims or a server-resolved permission model, but enforce permissions in RLS and server-side operations. Hiding a button is a usability behavior, not an authorization boundary.[^15][^14]

## Experience principles

### Decision before decoration

Every screen must have one dominant user decision. On the user dashboard it is **Log a spend**; in Purchase Check it is **Delay this purchase** or **Buy and re-pace**, selected by verdict; on an admin list it is the page’s primary management action. Secondary metrics must never compete visually with the decision.

### Calm before comedy

Mentor mode is the safe default for warnings, errors, blocked actions, authentication failures, and savings withdrawals. Roast mode may add one short optional line after the factual explanation, but must not mock low income, food, family obligations, debt, failed goals, or accessibility needs. System and error states never use roast copy.

### Progressive disclosure

Show the safe-spend amount, pace status, and one explanation first. Put formulas, 10-year opportunity cost, assumptions, and strategy details behind “How this is calculated.” Advanced filters, batch actions, and configuration fields in admin should appear only when relevant.

### Reversible by default

Quick logs, chip customization, content edits, and low-risk admin settings should prefer optimistic updates plus Undo. Irreversible or security-sensitive actions require an explicit consequence summary, reason, and re-authentication where appropriate.

### Privacy in the interface

Admin metrics display percentages, cohorts, counts, and pseudonymous identifiers unless exact financial data is essential to a permissioned investigation. Logs must record who performed an action, when, what changed, and the reason, without copying sensitive payloads unnecessarily.

## Information architecture

### User PWA

Use four persistent destinations and one contextual primary action:

| Destination | Purpose | Key content |
|---|---|---|
| Today | Daily decision home | Safe to spend, pace, quick log, latest activity |
| Plan | Buckets and strategy | Envelopes, vault, rules, strategy selection |
| Activity | Financial history and corrections | Searchable transaction timeline, undo/edit, weekly summaries |
| Progress | Streaks and privacy-safe league | Discipline trend, sweep, achievements, leaderboard opt-in |
| Purchase Check | Contextual center action | Amount entry, bucket, impact, verdict, decision |

The existing dashboard should stop trying to display the entire product in one viewport. The four-bucket bento is reduced to a compact “Your plan” summary with a route to Plan. The missing Activity destination is mandatory because users need a trusted place to verify, edit, and correct logs.

### Admin console

| Section | Purpose | Primary workflows |
|---|---|---|
| Overview | Operational attention queue | Review incidents, moderation queue, configuration warnings, experiment health |
| Users | Account support, not financial surveillance | Search account, status, consent, locale, support timeline |
| Strategies | Configure life templates and rules | Draft, validate, preview, publish, rollback |
| Coach content | Manage Mentor/Roast copy | Edit keys, preview contexts, localize, approve, version |
| Leaderboard | Privacy and moderation | Alias reports, opt-outs, season controls, removal reasons |
| Campaigns | Sunday Sweep and announcements | Schedule, audience, preview, pause, results |
| Feature flags | Controlled rollout | Environment/cohort targeting, owner, expiry, kill switch |
| Audit log | Accountability | Actor, action, target, before/after summary, reason, timestamp |
| System | Operational status | Job health, failed events, webhook status, release metadata |
| Staff & access | RBAC administration | Invite, role, permission review, revoke sessions |

Do not use KPI cards merely to fill the Overview. The first viewport is an **attention queue**: items requiring action, ordered by severity and age. Aggregate trends follow beneath it.

## Visual direction

### Style definition

**Name:** Obsidian Ledger  
**Personality:** disciplined, supportive, financially precise, locally approachable  
**Keywords:** calm, tactile, concise, protective, credible  
**Avoid:** casino gamification, crypto-neon, childish emoji walls, generic SaaS gradients, glassmorphism everywhere

### Composition

- User PWA: single primary column, 390px baseline, maximum shell width 440px; desktop adds surrounding breathing room rather than stretching the app.
- Admin: responsive application shell with a collapsible sidebar above 768px and sheet navigation below 768px. The data region can expand to 1440px, while forms remain 640–760px wide.
- Use a 4px spacing base with a practical interface sequence of 4, 8, 12, 16, 20, 24, 32, and 40px.
- Use fewer, more meaningful containers. Do not wrap every text group in a Card.
- Default to left alignment. Reserve centered alignment for login, milestone completion, and a small number of intentionally focused empty states.

### Typography

Use **Geist Sans** or **Satoshi** for UI and **Geist Mono** for money, percentages, dates in tables, and calculation details. Khmer must use a tested Khmer-capable family such as Noto Sans Khmer as a locale-specific fallback. Do not force monospace onto Khmer prose.

| Token | Mobile | Admin desktop | Use |
|---|---:|---:|---|
| `display-money` | 48/52, 750 | 44/48, 750 | Safe-spend value only |
| `page-title` | 24/30, 650 | 28/34, 650 | One `h1` per page |
| `section-title` | 18/24, 650 | 18/24, 650 | Sections and panels |
| `body` | 16/24, 400 | 14/21, 400 | Standard copy |
| `label` | 14/20, 550 | 13/18, 550 | Controls and table text |
| `meta` | 12/16, 500 | 12/16, 500 | Metadata only; never essential instructions |

Apply `font-variant-numeric: tabular-nums lining-nums` to currency, scores, percentages, timers, and table numbers. Currency formatting must be locale-aware and never assembled by string concatenation.

### Color tokens

Retain dark mode as the brand default for the user PWA, but provide a tested light theme and honor system preference on first visit. Admin defaults to light because long sessions, dense tables, and form review benefit from a bright neutral canvas; dark mode remains available.

| Semantic token | Dark direction | Light direction | Purpose |
|---|---|---|---|
| `background` | near-black blue | warm gray-white | App canvas |
| `surface-1` | raised slate | white | Main sections |
| `surface-2` | interactive slate | subtle gray | Hover, selected, nested region |
| `foreground` | warm white | charcoal | Primary text |
| `muted-foreground` | cool gray | medium gray | Secondary text that still passes contrast |
| `primary` | emerald | deep emerald | Main action and positive wealth state |
| `warning` | amber | dark amber | Re-paced or attention-required state |
| `destructive` | rose-red | deep red | Loss, failed operation, destructive action |
| `info` | restrained blue | deep blue | Neutral system information |
| `ring` | high-contrast mint/white | deep teal | Keyboard focus |

Use violet only if required to distinguish an actual data series. Do not treat XP as a reason to introduce a persistent fifth accent. Status cannot be communicated by color alone; pair color with label, icon, shape, or pattern.[^9]

### Radius and elevation

- Controls: 8–10px.
- Cards and panels: 12–16px.
- Pills: fully rounded only for compact statuses, filters, and segmented controls.
- Avoid making every component a pill.
- Use one quiet 1px alpha border for most structure.
- Reserve shadow elevation for floating drawers, dialogs, popovers, and sticky command surfaces.
- Nested radius must be smaller than its parent radius by approximately the internal gap.

## Design-system work

Create a dedicated `/design-system` development route or Storybook-equivalent that renders tokens and every component state. It must include light/dark themes, English/Khmer copy, 320/390/768/1440 widths, 200% zoom, keyboard focus, reduced motion, loading, empty, error, disabled, and permission-denied examples.

### Required foundations

- Semantic CSS variables mapped to shadcn tokens; no raw color classes in feature components.
- One spacing scale, one radius scale, one shadow scale, and one z-index map.
- Variant management with `class-variance-authority` for Button, Badge, Status, and composite action styles.
- Central money, date, percentage, duration, and compact-number formatters.
- Central animation tokens and a single `MotionProvider` policy.
- Central illustration wrapper controlling size, theme, animation permission, and accessible behavior.

### Component hierarchy

| Layer | Examples | Rule |
|---|---|---|
| Primitive | Button, Input, Dialog, Drawer, Tooltip | shadcn source with token-level changes only |
| Composite | MoneyInput, StatusBadge, EmptyState, MetricDelta | Product semantics; no page-specific data fetching |
| Feature | SafeSpendHero, PurchaseVerdict, StrategyEditor | Owns feature presentation and callbacks |
| Page | Today, Strategy detail, Admin users | Orchestrates queries, URL state, permissions, and layouts |

## User-surface improvements

### Login

Replace rotating meme copy with one stable, specific value proposition and a small interactive financial breakdown. Rotation harms scanning and localization. Use a custom **Shield Path** SVG showing income flowing through Home, Vault, and Today; animate the path once after load, then stop.

The Google button remains the only primary action. Include privacy and terms links, loading state, OAuth error recovery, offline explanation, unique route title, and keyboard-visible focus. Do not fabricate community counts such as “1,240+ savers” unless supplied by a real aggregate query.

### Onboarding

Turn the four template cards into a short step flow:

1. Choose a starting plan.
2. Review the money split.
3. Choose coaching style and privacy defaults.
4. Confirm and enter Today.

Preselecting a recommended template is acceptable, but explain why it is recommended. Show the exact bucket totals and validate that allocated amounts equal available income before confirmation. Preserve user control with “Adjust amounts,” but keep the default path one tap per step.

Use a compact horizontal progress indicator with text (“Step 2 of 4”), not four decorative circles alone. Animate the selected plan’s allocation bars with layout motion, but not the entire page.

### Today dashboard

Recommended vertical order:

1. Compact header: greeting/time context, streak, avatar.
2. Safe-to-spend hero: value, status label, one-sentence explanation, “How calculated.”
3. Quick log: five user-configured chips and Add custom.
4. Latest activity: last three entries, Undo/Edit affordances, View all.
5. Plan summary: Vault protected, Essentials remaining, Guilt-free remaining.
6. Contextual nudge: Sunday Sweep, re-pace explanation, or no action.

Remove strategy name, XP, streak, avatar, status, weekly progress, and multiple bucket cards from the same top viewport. The header should not become a badge shelf.

A quick-expense chip uses a category icon, amount, and optional short name. Emoji may remain in user-created labels, but product-owned categories use Lucide or a consistent custom SVG mini-icon. The chip needs an active press state, optimistic balance update, inline latest-activity insertion, and Undo. Use a toast only as secondary confirmation.

### Purchase Check

Use a two-stage bottom sheet on mobile and centered dialog on larger screens:

- Stage 1: amount keypad and category.
- Stage 2: verdict and decision.

Do not show three analytical metrics before the user enters a complete value. After value entry, reveal one verdict headline, one consequence sentence, and one recommended action. Put work hours and future value in a collapsible Impact details section with plain-language assumptions.

Verdict rules:

| Verdict | Presentation | Primary action |
|---|---|---|
| Safe | Emerald status dot, check icon, factual copy | Log purchase |
| Re-pace | Amber status, revised daily amount | Buy and re-pace |
| Cooling-off | Rose status, unlock time | Add to 24-hour list |

“Buy anyway” must remain available when policy permits, but it should not visually compete with the recommended protective action. If spending is impossible because of a hard rule, explain the rule and path forward instead of presenting a disabled mystery control.

### Plan and vault

Present envelopes as a vertical account-like list rather than a 2 × 2 bento grid. Each row shows icon, name, remaining/allocated amount, progress, and state. The Vault detail displays Emergency Shield and Skill/Growth allocations, withdrawal policy, request timeline, and consequences.

A withdrawal request requires amount, reason category, confirmation, and an explicit unlock timestamp. It must be cancelable during cooling off. Never award XP merely for entering and canceling a withdrawal repeatedly; server-side rules must prevent farming.

### Activity

Add a dedicated transaction timeline with date grouping, category filter, search, and corrections. Mobile uses list rows; desktop/tablet may use a simple table. Editing shows the original value and recalculated impact before saving. Deletion should offer immediate Undo for a short window rather than a modal for ordinary records.

### Progress and leaderboard

Separate personal progress from social ranking. Personal progress is default. Leaderboard participation is opt-in, uses a user-selected alias, and provides Leave league and Report controls. Explain the scoring formula and prevent ranking from revealing salary, exact balances, or transaction values.

## Admin-console requirements

### Admin shell

Use shadcn `SidebarProvider`, a collapsible Sidebar, sticky top bar, breadcrumb, page title, environment badge, command/search trigger, notification/inbox button, and account menu. A sidebar pattern supports collapsible state and configurable desktop/mobile widths, but the implementation still requires product-specific navigation, permissions, and responsive behavior.[^16]

- Desktop >1024px: labeled sidebar.
- Tablet 768–1024px: icon rail with tooltips.
- Mobile <768px: no fixed sidebar; use a Sheet triggered from the header.
- Keep one page scroll container. Sticky table headers belong inside the content region, not a nested page-level scroll trap.
- URL state must preserve search, filters, sort, page, selected tab, and drawer target through nuqs.

### Overview

The first row is an attention queue, not four decorative KPIs:

- Failed scheduled jobs.
- Strategy drafts awaiting review.
- Leaderboard reports.
- Expiring feature flags.
- Unusual error-rate or login changes.

Each item displays severity, age, owner, and direct action. Beneath it, show only decision-relevant aggregates: onboarding completion, seven-day active users, quick-log success rate, Purchase Check completion, delayed-purchase conversion, and vault-withdrawal completion. Every metric requires definition, comparison period, freshness timestamp, and link to deeper analysis.

### User support

Provide account search by ID, email, display name, and OAuth subject where policy permits. The user detail page shows identity, auth/provider status, locale, consent, leaderboard enrollment, support notes, and recent system events. Financial values remain masked or absent by default. Any temporary reveal requires a specific permission, reason, audit entry, and automatic timeout.

High-risk actions—suspend, revoke sessions, delete account—use a consequence dialog with affected resources, reason input, typed confirmation only where proportional, and post-action receipt.

### Strategy management

Treat strategy templates as versioned configuration:

- Draft, validation, review, publish, archive, rollback.
- Allocation editor with live total and validation.
- Preview at $300, $500, and a custom income.
- English and Khmer labels/copy.
- Rule simulator for mid-week re-pacing and vault locks.
- Change diff before publishing.
- Existing users remain pinned to a version unless migration is explicitly approved.

### Coach content

Use a key-based content table with context preview rather than free-form global text fields. Fields include message key, surface, verdict, tone, locale, text, status, version, and last editor. Show Mentor and Roast copy side-by-side, flag sensitive terms, and preview with real UI widths.

No admin-entered content is rendered as raw HTML. Validate length and interpolation variables with Zod. Publishing requires all required locale/tone combinations or an explicit approved fallback.

### Leaderboard moderation

The moderation table includes report reason, alias, season, public content, reporter count, age, and status. Actions are Remove alias, Reset alias, Temporarily hide, Dismiss, and Suspend league participation. Each action has a reason and audit record. Moderators do not need salary or transaction access.

### Feature flags

Each flag requires description, owner, created date, target environment, audience rule, rollout percentage, expiry date, and emergency disable. Show stale/expired flags in the attention queue. Dangerous flags include a dependency and impact summary.

### Audit log

Use an append-only view with filters for actor, action, target, date, risk, and result. Each row expands to a redacted before/after summary. Export honors the same permission and filtering rules. The table uses native semantics, sortable header buttons, and `aria-sort` on the active column.[^12][^13]

## Data tables and forms

### Table rules

- Give operational tables the full available content width; do not put a dense table inside a narrow Card.[^10]
- Default admin row height: 44–48px; offer Compact and Comfortable density only if users demonstrate a need.
- Left-align text; right-align money, percentages, counts, and dates where scannability benefits.[^11]
- Make the whole sortable header label/button target interactive and expose sort state through `aria-sort`.[^12]
- Keep filter chips above the table, show active filter count, and provide Clear all.
- Hide unavailable actions rather than leaving unexplained disabled buttons; permission errors still require server enforcement.
- On small screens, switch to a task-oriented card list. Do not shrink a seven-column table until it becomes unreadable.
- If no data exists, replace the table body with a contextual empty state rather than leaving empty headers and pagination.[^10]

### Form rules

- React Hook Form manages field interaction; Zod is the shared validation contract.
- Labels are always visible. Placeholder text is an example, not a label.
- Validate on blur and submit; avoid aggressive error messages before interaction.
- Place errors next to the relevant field and focus the first invalid field after submission.
- Long admin forms are divided into meaningful sections with a sticky action footer only when it does not obscure focused content.
- Unsaved changes produce navigation protection and a clear Save/Discard choice.
- Destructive actions never share the same visual treatment as Save.

## SVG illustration system

### Illustration language

Create a small in-house SVG family named **Ledger Lines**. It uses 1.75–2px rounded strokes, geometric containers, one emerald fill, optional amber/rose status accents, and subtle off-white highlights. Shapes reference envelopes, shields, paths, locks, coins, calendars, and growth—not mascots, money bags, rockets, or generic corporate people.

### Required assets

| Asset | Surface | Story | Motion |
|---|---|---|---|
| `income-path.svg` | Login/onboarding | Income is intentionally divided into Home, Vault, and Today | One-time path draw and node fill |
| `vault-shield.svg` | Vault empty/protected state | Savings sit behind a protective boundary | Shield settles; lock closes once |
| `cooling-clock.svg` | Wishlist jail | Time creates distance from impulse | Clock arc progresses from actual time; no looping spin |
| `quiet-ledger.svg` | Activity empty state | Nothing logged yet | Pencil nudges once toward Add |
| `sweep-envelope.svg` | Sunday Sweep | Unspent money moves into protected savings | Coin/path transfer after confirmation |
| `no-results.svg` | Admin searches | Filters returned no matches | Static by default |
| `permission-lock.svg` | Admin denied state | Access is intentionally restricted | Static |
| `system-recovery.svg` | Recoverable error | Retry can restore the operation | Brief reset on Retry only |

### SVG implementation

- Build illustrations as typed React components using `currentColor` and semantic CSS variables.
- Keep `viewBox`, stable aspect ratio, and explicit size variants.
- Decorative illustrations use `aria-hidden="true"` or empty alt semantics; informative diagrams require nearby text and an accessible description.
- Optimize production SVG with SVGO, but preserve stable path IDs needed by animation.
- Do not embed translatable text inside SVG.
- Do not download random illustration packs with inconsistent licensing or style.
- Keep mobile illustration payloads small and lazy-load below-fold assets.

## Motion system

### Motion principles

Motion must communicate **cause, continuity, hierarchy, or completion**. If removing an animation does not reduce understanding or feedback, remove it. Motion supports layout and shared-element transitions, while `AnimatePresence` can preserve exiting elements long enough for an exit state.[^7][^6]

### Tokens

| Token | Duration | Use |
|---|---:|---|
| `instant` | 80ms | Press feedback and color response |
| `fast` | 140ms | Tooltip, hover, compact menu |
| `standard` | 220ms | Drawer content, tabs, accordion |
| `emphasis` | 320ms | Verdict reveal, number transition, shared element |
| `celebration` | 500–700ms | Rare onboarding completion or sweep success |

Use a restrained ease such as `[0.16, 1, 0.3, 1]` for entrances and layout response. Springs are allowed for direct manipulation, sheets, and count settling, but overshoot must not make financial values feel unstable.

### Required interactions

- Safe-spend number: animate only changed digits or count between values; announce the final value through a polite live region, not every frame.
- Quick log: 80ms scale/brightness press response, immediate row insertion, subtle number update.
- Undo: removed activity row collapses with layout animation; restored row returns to its previous position.
- Drawer/dialog: opacity plus 8–16px translation; no dramatic full-screen fly-ins.
- Tabs: shared underline or surface using `layoutId`, not sliding all content long distances.[^17]
- Verdict: status mark, headline, and consequence enter in a short sequence under 320ms total.
- Sunday Sweep: the coin/path transfer runs only after server confirmation and only once.
- Admin table: do not animate every row on first load; use skeletons, then a short opacity transition for the table region.

### Reduced motion

Use `MotionConfig reducedMotion="user"` and `useReducedMotion`. Replace x/y travel, parallax, path drawing, and confetti with opacity or immediate state changes; stop decorative loops and autoplay. The product remains fully understandable with all animation disabled.[^10]

## State design

Every data component must define these states before implementation:

| State | Required behavior |
|---|---|
| Loading | Shape-matched skeleton, reserved dimensions, no layout jump |
| Empty | Specific title, short explanation, one contextual next action |
| No results | Preserve query/filter context and offer Clear filters |
| Error | Plain-language problem, Retry or recovery path, diagnostic ID if useful |
| Offline | Explain queued vs unavailable actions; never imply server success |
| Stale | Show last-updated time and allow refresh without blanking content |
| Partial | Render available sections and identify failed sections independently |
| Permission denied | Explain access level and how to request it; do not expose hidden data |
| Success | Confirm near the action; move focus only when context changes materially |

Carbon’s guidance distinguishes no-data, user-action, and error-management empty states; each should be contextual and avoid dead ends.[^10]

## Accessibility requirements

- Meet WCAG 2.2 AA across both surfaces.
- Use semantic landmarks, a skip link, one `h1`, logical headings, unique page titles, and route-level descriptions.
- All functions work by keyboard. Escape closes the topmost dismissible layer and returns focus to its trigger.
- Visible focus is never covered by sticky headers, footers, dialogs, or mobile navigation.[^4][^1]
- Internal target standard is 44 × 44px even though WCAG’s minimum criterion can be met at smaller sizes under conditions.[^1]
- Normal text meets 4.5:1; large text and meaningful graphical controls meet the applicable contrast criteria.[^18]
- Status uses words/icons in addition to color.
- Charts have textual summaries and accessible tabular alternatives where the data matters.
- Currency and date announcements are meaningful in English and Khmer.
- Decorative SVG is excluded from the accessibility tree; icon buttons have accessible names on the button.[^19][^9]
- At 200% zoom, navigation, dialogs, tables, and sticky actions remain usable without hidden controls.
- Test VoiceOver/Safari and NVDA/Chrome for login, onboarding, quick log, Purchase Check, strategy publishing, and moderation.

## Internationalization requirements

- No user-facing string in feature components.
- Use ICU messages for plurals, dates, countdowns, and interpolation.
- Design for 30–50% text expansion.
- Do not truncate button labels that represent actions.
- Keep category icons culturally understandable; avoid English idioms and culture-specific icon puns.[^9]
- Use locale-aware currency and decimal input while storing integer minor units.
- Khmer screenshots and visual tests are required for onboarding, Today, Purchase Check, admin tables, and dialogs.
- Roast content is separately translated and reviewed; it is never generated by mechanically intensifying Mentor copy.

## Performance requirements

- User PWA target: LCP <2.0s, INP <150ms, CLS <0.05 on a representative mid-range mobile profile.
- Admin target: first usable shell <2.0s on repeat visit; table/filter interaction responds within 100ms locally and gives feedback immediately for network work.
- Reserve image/SVG dimensions and skeleton dimensions to prevent layout shift; explicit sizing is a primary CLS control.[^20]
- Lazy-load admin charts, large editors, and below-fold illustrations.
- Import Lucide icons individually and use Motion only in client components that animate.
- Prefer server components for page shells and initial data; keep client boundaries close to interactive components.
- TanStack Query owns server-state caching and mutation lifecycle; it must not duplicate URL state or form state.
- Run bundle analysis before release and define route budgets rather than accepting uncontrolled growth.

## Telemetry and success measures

Track events with privacy-safe IDs and no raw financial amounts unless a separately approved analytic requirement exists.

| Experience | Metric | Target direction |
|---|---|---|
| Onboarding | Completion and time to first useful dashboard | Higher completion, lower time without increased correction rate |
| Quick log | Median interaction-to-confirmation time | Under 3 seconds |
| Quick log | Undo/edit within 60 seconds | Monitor as a quality signal, not a failure target alone |
| Purchase Check | Completion and chosen action by verdict | Understand whether guidance changes decisions |
| Cooling off | Items not purchased after 24 hours | Increase without coercive blocking |
| Activity | Correction success and error rate | High completion, low support demand |
| Admin | Median time to resolve attention item | Decrease |
| Admin | High-risk actions with reason and audit receipt | 100% |
| Accessibility | Critical automated/manual defects | Zero at release |
| Performance | Routes meeting budgets | 100% of release-critical routes |

Do not optimize for XP earned, notification clicks, or roast engagement at the expense of financial wellbeing.

## Component audit matrix

The coding agent must inventory every component and record the following fields:

| Field | Required evidence |
|---|---|
| Component and route | Exact path and import references |
| User job | Why the component exists |
| Primary action | One clear action or “none” |
| Visual hierarchy | Screenshot and issue description |
| Responsive behavior | 320, 390, 768, 1024, 1440px |
| Themes/locales | Light, dark, English, Khmer |
| Keyboard/focus | Tab order, Escape, focus return, focus visibility |
| Screen reader | Name, role, value, state announcement |
| Data states | Loading, empty, error, stale, offline, partial |
| Authorization | UI permission and server/RLS enforcement |
| Motion | Purpose, duration, reduced-motion behavior |
| Performance | Bundle impact, render behavior, image/SVG sizing |
| Reuse | Primitive/composite/feature classification |
| Decision | Keep, restyle, refactor, replace, remove |
| Priority | P0–P3 with effort and dependency |

### Mandatory component coverage

- App shell, mobile frame, admin shell, sidebar, top bar, breadcrumbs, bottom navigation.
- Button, icon button, link, input, money input, select, combobox, checkbox, switch, radio, slider, textarea.
- Card, status badge, progress, avatar, tooltip, popover, dropdown, tabs, accordion.
- Dialog, AlertDialog, Drawer, Sheet, Toast/Sonner.
- Data table, pagination, sorting, filters, search, bulk action bar, row actions.
- SafeSpendHero, QuickTapChips, LatestActivity, PlanSummary, SmartBucketRow.
- BuyCheckDrawer, PurchaseVerdict, ImpactDetails, numeric keypad.
- StrategySwitcher, strategy editor, coach content editor, feature flag editor.
- Leaderboard, Sunday Sweep, moderation queue, audit log.
- Loading skeletons, empty states, error boundary, not-found, permission-denied, offline banner.
- All SVG illustrations and Motion wrappers.

## Delivery plan

### Phase 0 — Repository evidence

- Run the application with Bun using the repository’s documented environment setup.
- Map routes, components, Supabase calls, permissions, forms, query keys, URL state, and i18n messages.
- Capture screenshots at required widths, themes, locales, and states.
- Run lint, typecheck, unit tests, build, axe, Lighthouse, and interaction smoke tests.
- Produce the component inventory and verified findings before changing visual design.

**Exit criterion:** Every issue links to code and reproduction evidence; no speculative rewrite has started.

### Phase 1 — Foundations

- Normalize semantic tokens and remove raw feature colors.
- Establish typography, money formatting, spacing, radius, elevation, z-index, and motion tokens.
- Build the design-system proof route and core state components.
- Add accessibility and visual-regression test scaffolding.

**Exit criterion:** Primitives and composites pass themes, locales, widths, focus, reduced motion, and contrast checks.

### Phase 2 — User core loop

- Redesign login and onboarding.
- Rebuild Today hierarchy and Quick Log feedback.
- Add Activity and correction flows.
- Rebuild Purchase Check as amount then verdict.
- Convert bucket bento to Plan list/detail.

**Exit criterion:** First-time setup, quick log, correction, purchase decision, and vault request pass end-to-end tests.

### Phase 3 — Progress and illustration

- Separate personal Progress from leaderboard.
- Add privacy controls and moderation reporting.
- Implement Ledger Lines SVG set.
- Add approved motion and reduced-motion alternatives.

**Exit criterion:** Illustrations are optimized, accessible, and purposeful; social participation is optional and reversible.

### Phase 4 — Admin operations

- Implement RBAC/RLS verification, shell, attention queue, user support, and audit log.
- Add versioned strategy and coach-content workflows.
- Add moderation, campaigns, feature flags, and system health.

**Exit criterion:** Every high-risk action is permissioned, reasoned, logged, and test-covered.

### Phase 5 — Hardening

- Khmer visual review and content review.
- Manual keyboard and screen-reader testing.
- Performance and bundle-budget remediation.
- Cross-browser/PWA/offline testing.
- Analytics validation and privacy review.

**Exit criterion:** All release gates pass with no P0/P1 issue open.

## Prioritization model

- **P0:** Security/privacy exposure, destructive action without protection, inaccessible critical flow, incorrect financial calculation, data loss.
- **P1:** Core flow confusion, mobile obstruction, missing error recovery, inconsistent authorization, broken Khmer layout, serious performance regression.
- **P2:** Design-system drift, weak empty state, non-essential component inconsistency, low-risk admin inefficiency.
- **P3:** Delight, rare animation polish, optional shortcut, cosmetic refinement.

Each TODO must contain: ID, priority, finding, evidence, user impact, proposed change, affected files, dependencies, acceptance criteria, tests, estimate (S/M/L), and rollout/rollback notes.

## Definition of done

- The user can identify available-to-spend and log a common expense without scrolling at 390 × 844px.
- The latest logged item is visible and correctable from Today.
- Purchase Check progressively reveals analysis and always states why a verdict was reached.
- Vault cooling off has a visible timeline, cancellation path, and server-enforced rule.
- Admin users see only authorized navigation and server-enforced data/actions.
- Every route has a unique title and `h1`; client navigation is announced correctly.[^5]
- Every critical component has loading, empty, error, stale/offline where applicable, and permission states.
- All interactive targets are at least 44 × 44px internally; keyboard focus is visible and unobscured.
- English and Khmer pass visual tests at required widths and 200% zoom.
- Reduced motion removes travel, parallax, confetti, and non-essential SVG loops.
- Data tables remain structurally meaningful and usable at responsive breakpoints.[^11]
- No raw service-role key or authorization bypass appears in browser code.[^14]
- No P0/P1 audit finding remains open, and release budgets pass.

# Coding-agent master prompt

Copy the following prompt into AGY or another repository-capable coding agent.

```text
You are a principal UX engineer, product designer, accessibility specialist, and senior Next.js/Supabase developer auditing BrokeNoMore.

MISSION
Inspect the existing repository and running application, compare it against the BrokeNoMore UX/UI Improvement PRD, and produce an evidence-based implementation backlog. Do not begin a visual rewrite until the audit and TODO plan are complete and approved.

STACK TO EXPECT
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui + Lucide
- Motion for React
- Supabase Auth/Postgres/RLS
- next-intl
- Zod + React Hook Form
- TanStack Query
- nuqs
- Bun

NON-NEGOTIABLE BEHAVIOR
1. Read package.json, Bun lockfile, Next config, Tailwind/theme files, shadcn registry/config, middleware, route tree, providers, Supabase clients/migrations/policies, message catalogs, tests, and deployment configuration.
2. Run the project using its documented Bun commands. Never guess that the app builds.
3. Run lint, typecheck, tests, production build, and existing E2E tests. Record exact command and result.
4. Inspect the application at 320, 390, 768, 1024, and 1440px in light/dark themes and English/Khmer.
5. Audit keyboard-only use, focus order/return, screen-reader names, headings, route titles, landmarks, contrast, 200% zoom, reduced motion, touch targets, loading, empty, no-results, error, stale, offline, partial-data, and permission-denied states.
6. Trace every admin permission from visible UI to server operation and Supabase RLS. A hidden button is not authorization.
7. Verify all financial formulas and integer minor-unit handling. Flag any float arithmetic that can affect balances.
8. Inventory every UI component. Classify it as primitive, composite, feature, or page. Identify duplicated components and raw one-off styling.
9. Audit every SVG and animation for purpose, accessibility, reduced-motion behavior, bundle cost, and visual consistency.
10. Do not add packages, replace architecture, change database schema, or rewrite shadcn primitives without documenting the need and obtaining approval.
11. Preserve working behavior. Prefer small, testable vertical changes over a big-bang rewrite.
12. Do not invent metrics, user counts, financial values, test results, screenshots, or defects. Label anything not reproducible as “Needs verification.”

DESIGN DIRECTION
Use “Obsidian Ledger”: calm financial precision, restrained neutrals, emerald primary, functional amber/rose, tabular money, limited surfaces, meaningful custom line SVGs, and purposeful motion. Avoid AI-template aesthetics: purple gradients, glowing blobs, excessive bento cards, emoji as the primary icon system, identical rounded cards, decorative animation, and feature-dump dashboards.

USER EXPERIENCE PRIORITY
1. Available to spend today.
2. Quick expense log.
3. Latest activity and correction.
4. Purchase Check decision.
5. Plan/vault details.
6. Progress and optional leaderboard.

ADMIN EXPERIENCE PRIORITY
1. Attention queue.
2. User support with privacy-preserving access.
3. Versioned strategies.
4. Coach/localization content.
5. Leaderboard moderation.
6. Campaigns and feature flags.
7. Audit log and system health.
8. Staff roles and permissions.

AUDIT EACH COMPONENT FOR
- User job and primary action
- Information hierarchy and copy
- Responsive behavior
- Light/dark and English/Khmer
- Keyboard, focus, screen reader, and touch target
- Loading/empty/error/stale/offline/partial/permission states
- Authorization boundary
- Motion purpose and reduced-motion alternative
- Render/bundle/performance impact
- Reuse and design-token compliance
- Recommendation: keep, restyle, refactor, replace, or remove

REQUIRED OUTPUT FILES
Create these Markdown files without modifying product code in the audit pass:

1. docs/audits/ux-ui-audit.md
   - Executive summary
   - Test environment and commands
   - Route-by-route findings
   - Component inventory
   - Accessibility findings
   - Responsive/i18n findings
   - Admin authorization findings
   - SVG/motion findings
   - Performance findings
   - Screenshots or paths to evidence
   - P0/P1/P2/P3 issue list

2. docs/plans/ux-ui-improvement-todo.md
   Use this exact checklist format for every task:

   - [ ] UX-### — Short action title
     - Priority: P0 | P1 | P2 | P3
     - Area: User | Admin | Design system | Accessibility | Motion | SVG | Performance | Security
     - Finding: What is wrong
     - Evidence: Route, component/file, screenshot/test output
     - User impact: Why it matters
     - Proposed change: Smallest safe improvement
     - Files likely affected: Exact paths
     - Dependencies: Task IDs or “None”
     - Acceptance criteria:
       - [ ] Observable outcome 1
       - [ ] Observable outcome 2
     - Tests:
       - [ ] Unit/component/E2E/a11y/visual tests required
     - Effort: S | M | L
     - Rollout/rollback: Feature flag or rollback path

3. docs/design/design-system-audit.md
   - Current tokens and raw-value violations
   - Type, color, spacing, radius, elevation, z-index, and motion recommendations
   - Primitive/composite/feature ownership
   - Component state matrix
   - English/Khmer and theme proof requirements

4. docs/design/svg-motion-plan.md
   - Existing asset inventory
   - Ledger Lines asset list
   - Motion token table
   - Interaction-by-interaction animation plan
   - Reduced-motion equivalents
   - Performance and accessibility checks

5. docs/plans/implementation-waves.md
   - Phase 0 evidence
   - Phase 1 foundations
   - Phase 2 user core loop
   - Phase 3 progress/SVG/motion
   - Phase 4 admin
   - Phase 5 hardening
   - Dependencies, risks, release gates, and rollback strategy

SCREENSHOT MATRIX
Capture or test these states where the app supports them:
- Login: default, loading, OAuth failure, offline
- Onboarding: every step, validation error, Khmer
- Today: fresh user, populated, re-paced, cap reached, loading/error/offline
- Quick log: press, optimistic success, rollback, undo
- Purchase Check: empty, typing, safe, re-pace, cooling off
- Plan/vault: protected, withdrawal requested, cooldown complete
- Activity: populated, empty, no results, correction
- Progress/leaderboard: opted out, opted in, report flow
- Admin: attention queue, users, strategy draft/publish, content localization, moderation, feature flags, audit log, permission denied

TEST GATES
- bun lint
- bun typecheck (or repository equivalent)
- bun test
- bun run build
- E2E critical flows
- axe on release-critical routes
- Keyboard walkthrough
- 200% zoom/reflow
- prefers-reduced-motion
- English and Khmer visual regression
- Supabase RLS allow/deny tests
- Bundle and Core Web Vitals review

ORDER OF WORK
A. Repository map and baseline commands.
B. Screenshot/test evidence.
C. Component and route inventory.
D. Verified findings with severity.
E. TODO backlog with dependencies.
F. Implementation waves.
G. Stop and request approval before changing product code.

QUALITY BAR
- No vague tasks such as “improve UI.”
- No task without evidence and acceptance criteria.
- No destructive or permission-sensitive action without server enforcement and auditability.
- No animation without purpose and reduced-motion behavior.
- No custom SVG without consistent style, optimization, and accessible treatment.
- No new design token that duplicates an existing semantic role.
- No layout that depends on English-only string length.
- No release while a P0 or P1 finding remains unresolved.

At the end, print:
1. Audit completion status.
2. Counts by priority and area.
3. Top ten dependencies in recommended order.
4. Commands that failed or could not run.
5. Decisions requiring product-owner approval.
Then stop. Do not implement until approval is given.
```

## Agent review checklist

Before accepting the agent’s output, verify:

- Findings reference actual routes, files, screenshots, or command output.
- The agent did not claim to test states it could not reach.
- TODOs describe outcomes rather than vague visual preferences.
- P0/P1 tasks are sequenced before SVG polish or celebration motion.
- Component consolidation does not erase necessary semantic differences.
- User and admin scopes remain separated by privacy and authorization.
- Financial calculations receive tests before visual animation is changed.
- The plan includes Khmer, reduced motion, keyboard, screen reader, and 200% zoom.
- The agent stops after producing the audit/backlog and waits for approval.

---

## References

1. [WebAIM: WebAIM's WCAG 2 Checklist](https://webaim.org/standards/wcag/wcag22) - - Pointer input target sizes are at least 24 by 24 pixels unless: - A 24 pixel diameter circle cente...

2. [Understanding Success Criterion 2.4.13: Focus Appearance - W3C](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) - When the keyboard focus indicator is visible, an area of the focus indicator meets all the following...

3. [Understanding WCAG 2.2 | WAI - W3C](https://www.w3.org/WAI/WCAG22/Understanding/) - - 2.4.11 Focus Not Obscured (Minimum)

4. [www.w3.org › WAI › WCAG22Understanding Success Criterion 2.4.7: Focus Visible | WAI | W3C](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) - While this criterion does not specify what that form is, 2.4.13 Focus Appearance (Level AAA) provide...

5. [Accessibility](https://nextjs.org/docs/architecture/accessibility) - The Next.js route announcer looks for the page name to announce by first inspecting document.title ,...

6. [AnimatePresence | React exit animations - Framer Motion](https://motion.dev/docs/react-animate-presence) - AnimatePresence works by detecting when its direct children are removed from the React tree. ... Any...

7. [Layout Animation | React FLIP & Shared Element](https://motion.dev/docs/react-layout-animations) - Motion (previously Framer Motion) can automatically animate an element's size and position when its ...

8. [Motion for React: Get started - React Animation Library](https://motion.dev/docs/react) - Motion's layout animation engine detects layout changes (size, position, reorder) and smoothly anima...

9. [Accessibility in depth](https://lucide.dev/how-to/accessibility) - Accessibility in depth Icons are pictures that convey meaning without using words. They can help peo...

10. [Lucide Angular](https://v0.lucide.dev/guide/packages/lucide-angular) - You can add accessibility attributes using aria-labels.
...
<lucide-icon name="check" aria-label="Ta...

11. [Tips and Tricks](https://www.w3.org/WAI/tutorials/tables/tips/) - It’s usually better to break up complex tables into simple individual tables, each containing the da...

12. [www.w3.org › examples › tableSortable Table Example | WAI-ARIA Authoring Practices 1.2](https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2-20211129/examples/table/sortable-table.html) - The `aria-sort` attribute is set on the column header of the currently sorted column, and the header...

13. [Sortable Table Example | APG | WAI](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/) - The example uses HTML table markup for all elements of the table structure, e.g., cells, rows, colum...

14. [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - Postgres Row Level Security (RLS) gives you granular authorization rules that run inside the databas...

15. [Custom Claims & Role-based Access Control (RBAC)](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac) - This guide uses the Slack Clone example to demonstrate how to add a user_role claim and use it in yo...

16. [ui.shadcn.com · docs · componentsSidebar - shadcn/ui](https://ui.shadcn.com/docs/components/radix/sidebar) - If you have a single sidebar in your application, you can use the `SIDEBAR_WIDTH` and `SIDEBAR_WIDTH...

17. [Smooth Tabs example & tutorial for React | Motion](https://motion.dev/examples/react-smooth-tabs) - This tab animation moves one indicator between tabs with a shared `layoutId`, so Motion animates it ...

18. [Easy Checks – A First Review of Web Accessibility](https://www.w3.org/WAI/test-evaluate/preliminary/) - - Check that the information makes sense when read in the order it is shown; for example, headings a...

19. [Accessibility - Angular](https://lucide.dev/guide/angular/advanced/accessibility) - To expose an icon to assistive technologies, provide an accessible name by binding the title input o...

20. [The most effective ways to improve Core Web Vitals | Articles](https://web.dev/articles/top-cwv) - Interaction to Next Paint (INP). 1. Yield often to break up long tasks ; Largest Contentful Paint (L...

