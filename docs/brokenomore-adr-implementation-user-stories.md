# BrokeNoMore — ADRs, Technical Implementation Plan, and User Stories

## Document metadata

| Field | Value |
|---|---|
| Product | BrokeNoMore |
| Document type | Architecture Decision Records + Technical Implementation + User Stories |
| Format | Markdown |
| Target stack | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase, next-intl, Zod, React Hook Form, TanStack Query, Bun, nuqs |
| Primary platforms | Responsive web app and PWA |
| Architecture baseline | App Router, server-first shell, client-enhanced financial interactions |
| Intended audience | Product owner, frontend engineer, full-stack engineer, designer, QA |
| Status | Implementation-ready |

Next.js App Router supports nested layouts, route handlers, Server Components, and loading/error boundaries, which align well with BrokeNoMore’s responsive application shell and route structure.[cite:91][cite:92][cite:94] Supabase provides official Next.js guidance for cookie-based auth and server-side clients, making it suitable for Google OAuth, protected app routes, and user-scoped data access.[cite:95][cite:103] next-intl is designed for the Next.js App Router and supports request-scoped translations, date/number formatting, and localized routing, which fits the project’s English/Khmer direction.[cite:121][cite:123] TanStack Query remains a strong fit for client-side shared cache, optimistic updates, and hydration in Next.js App Router applications.[cite:122][cite:124][cite:129] nuqs provides type-safe URL search-parameter state with Next.js App Router support, which is useful for filter, tab, and view state without manual URLSearchParams handling.[cite:120][cite:125][cite:128]

## How to use this document

This document is meant to be executed in order. The ADRs define the non-trivial technical choices. The implementation plan translates those choices into a delivery sequence. The user stories define the business-facing backlog and acceptance criteria. Together, they describe how to build BrokeNoMore end to end without drifting from product intent.

The recommended workflow is:

1. Review and approve the ADRs.
2. Scaffold the codebase exactly as defined in the implementation foundation phase.
3. Build the core domain and data model before UI-heavy features.
4. Implement vertical slices feature by feature.
5. Validate each slice against the user-story acceptance criteria.

## Architecture goals

The architecture must support a financial product that feels fast, explainable, offline-tolerant, and easy to evolve. The system should preserve a clear separation between domain logic, transport, persistence, and UI so that budget calculations stay trustworthy and independently testable.

### Primary goals

- Keep money and planning calculations deterministic and fully testable.
- Support responsive mobile-first and desktop-first experiences from one codebase.
- Use server rendering for app shell, auth, and initial data, while preserving rich client interactions where needed.
- Enable optimistic transaction capture with eventual synchronization.
- Support English first, but make Khmer and USD/KHR feasible without redesigning the application.
- Minimize accidental complexity in forms, filters, and URL state.
- Keep the system straightforward for a small team to maintain.

### Constraints

- Next.js 15 App Router is the target web framework.[cite:91][cite:97]
- Google OAuth via Supabase is the chosen authentication model.[cite:95][cite:102]
- The product is a planning tool, not a bank or payment rail.
- Mobile and desktop must both be first-class experiences.
- The codebase should be Bun-friendly for installation and scripts, while remaining standard enough for CI/CD and Vercel deployment.[cite:148][cite:153]

---

# Architecture Decision Records

## ADR-001 — Use Next.js 15 App Router as the application framework

### Status

Accepted.

### Context

BrokeNoMore needs route-level layouts, responsive app shells, authenticated and unauthenticated sections, loading boundaries, error boundaries, route handlers, and a mix of Server and Client Components. The team also needs a strong deployment path and mature ecosystem integration.

### Decision

Use Next.js 15 with the App Router as the application framework.

### Rationale

Next.js App Router provides file-system routing, nested layouts, loading states, and route handlers, which map directly to the product’s route structure and shell architecture.[cite:91][cite:93][cite:94] It also supports Server Components and Client Components in the same application, which suits a system where authentication, initial data, and static shell can render on the server, while interactive budgeting workflows remain client-enhanced.[cite:97][cite:101]

### Consequences

**Positive**

- Clean separation between route shell, server data bootstrap, and interactive client flows.
- Strong Vercel deployment alignment.
- Good support for middleware, route handlers, and modern React patterns.
- Compatible with next-intl, Supabase SSR auth, TanStack Query hydration, and nuqs.[cite:123][cite:124][cite:128]

**Negative**

- Requires disciplined boundaries between Server and Client Components.
- Search-parameter behavior needs explicit handling because `useSearchParams` is client-only and server data should use page `searchParams` props.[cite:130]
- Teams unfamiliar with App Router patterns can mix concerns too early.

### Implementation notes

- Keep route shells and initial data orchestration in Server Components.
- Move only interaction-heavy pieces to Client Components.
- Use route handlers for OAuth callbacks and selected server-side endpoints.[cite:94]

## ADR-002 — Use shadcn/ui as the component foundation, not as a final design system

### Status

Accepted.

### Context

The product needs accessible, customizable, composable UI primitives, but must avoid looking like a default template or generic AI-generated SaaS dashboard.

### Decision

Use shadcn/ui as the component foundation and build BrokeNoMore-specific design tokens, wrappers, patterns, and product components on top of it.

### Rationale

shadcn/ui provides composable, accessible components with code owned inside the project, which makes it suitable as a design-system foundation rather than a black-box dependency.[cite:157] The official docs support Next.js installation and component generation through the CLI.[cite:148][cite:154] This model aligns with the need to customize drawers, forms, cards, navigation, and alerts while preserving accessibility and ownership.

### Consequences

**Positive**

- Full control over component code.
- Good integration with React Hook Form and Zod-based forms.[cite:141]
- Easier to create domain-specific wrappers such as `MoneyInput`, `PlanStatusBadge`, `ProtectedBucketCard`, and `PurchaseCheckPanel`.

**Negative**

- The team must own styling consistency and long-term upgrades.
- Uncontrolled component sprawl is possible if wrappers are not standardized.

### Implementation notes

- Treat `components/ui` as the primitive layer.
- Create a `components/product` layer for BrokeNoMore-specific UI.
- Do not import raw primitives directly into pages unless they are truly generic.

## ADR-003 — Use Supabase for authentication, Postgres, RLS, and durable persistence

### Status

Accepted.

### Context

The product requires Google OAuth, authenticated user data, row-level access control, a fast setup path, and a backend suitable for small-team execution without building a custom auth stack.

### Decision

Use Supabase Auth, Supabase Postgres, Row Level Security, and server-side auth patterns for persistence and authorization.

### Rationale

Supabase documents Next.js App Router integration for server-side auth and cookie-based sessions, which aligns with the required Google OAuth flow and protected routes.[cite:95][cite:103] The system’s core data model—plans, periods, buckets, transactions, wait items, rules, and reviews—fits relational storage very well, and RLS provides user-level isolation at the database boundary.

### Consequences

**Positive**

- Fast time to value for auth and persistence.
- Strong fit for user-owned financial planning data.
- Good support for typed queries and future storage or edge functions.

**Negative**

- Care is needed with SSR client/server separation and secure environment configuration.
- RLS policies must be tested rigorously.
- Client-side writes must still respect domain validation and not rely only on DB constraints.

### Implementation notes

- Use browser and server Supabase clients separated by environment.
- Enforce user isolation through RLS on every user-owned table.
- Prefer service-role access only in trusted server contexts where absolutely necessary.

## ADR-004 — Use next-intl for internationalization

### Status

Accepted.

### Context

The application must support English first and prepare for Khmer and localized formatting. Locale, number formatting, and route-aware translations need to work in App Router and Server Components.

### Decision

Use next-intl as the internationalization layer.

### Rationale

next-intl is purpose-built for Next.js and supports App Router, Server Components, request-scoped configuration, and formatting for messages, dates, and numbers.[cite:121][cite:123] This matches the need to localize product copy and financial formatting while preserving server-rendered correctness.

### Consequences

**Positive**

- Strong App Router fit.
- Clean message loading and request-scoped config.
- Good path toward localized routing if needed.

**Negative**

- Requires discipline around translation keys and message organization.
- Dynamic business copy must still be authored carefully for Khmer.

### Implementation notes

- Start with `en-KH` message files.
- Add `km-KH` after the English flow stabilizes.
- Separate labels, validation messages, and feature copy into bounded namespaces.

## ADR-005 — Use Zod as the canonical validation layer

### Status

Accepted.

### Context

The product contains financial inputs, plan setup, rules, settings, transaction editing, and server mutations. TypeScript alone cannot validate runtime values.

### Decision

Use Zod schemas as the shared source of truth for runtime validation and inferred TypeScript types.

### Rationale

Zod is TypeScript-first and supports schema definition, parsing, transformation, and static type inference from a single declaration.[cite:134][cite:137][cite:142] This fits the need to validate form inputs, mutation payloads, query parameters, and database-bound DTOs with one approach.

### Consequences

**Positive**

- Eliminates many duplicate types.
- Provides consistent client/server validation.
- Encourages domain-safe DTO contracts.

**Negative**

- Developers must distinguish domain entities from transport schemas.
- Overusing transforms inside UI schemas can make debugging harder.

### Implementation notes

- Keep schemas close to domain modules, not only inside components.
- Separate `form schemas`, `mutation schemas`, and `domain schemas` where necessary.
- Use `safeParse` for recoverable user input; use `parse` for trusted internal boundaries.

## ADR-006 — Use React Hook Form with Zod resolvers for interactive forms

### Status

Accepted.

### Context

The app includes onboarding, allocation editing, settings, filters, wait-list review, and transaction correction flows. Forms should remain performant and predictable on mobile.

### Decision

Use React Hook Form for client-side form state and `@hookform/resolvers/zod` for schema-backed validation.

### Rationale

React Hook Form is optimized to minimize re-renders and supports schema-based validation through resolvers, including Zod.[cite:135][cite:138][cite:146] shadcn/ui also provides a documented integration pattern with React Hook Form and Zod.[cite:141] This combination is well suited for mobile-first financial forms where responsiveness matters.

### Consequences

**Positive**

- Efficient form rendering.
- Clean integration with shadcn form components.
- Shared validation logic with Zod.

**Negative**

- Some highly dynamic derived financial inputs still need carefully managed watchers.
- Teams can misuse RHF for non-form state if boundaries are unclear.

### Implementation notes

- Use RHF for user-editable forms only.
- Avoid storing derived business calculations directly in RHF state unless necessary.
- Build controlled wrappers for currency inputs, segmented controls, and bucket selectors.

## ADR-007 — Use TanStack Query for client-side server-state caching, optimistic updates, and hydration

### Status

Accepted.

### Context

BrokeNoMore needs a shared client cache for transactions, plan summaries, optimistic transaction logging, background revalidation, and mobile/desktop consistency after mutation.

### Decision

Use TanStack Query for shared browser cache, mutation orchestration, optimistic updates, and server-to-client hydration.

### Rationale

Next.js recommends TanStack Query when Client Components need a shared cache and coordinated client-side data fetching.[cite:124][cite:129] TanStack Query supports App Router hydration, server prefetching, dehydrate/hydrate flows, optimistic updates, and advanced SSR patterns.[cite:119][cite:122][cite:149]

### Consequences

**Positive**

- Strong fit for transaction and plan-summary invalidation.
- Supports optimistic UI and retry strategies.
- Good separation between server state and UI state.

**Negative**

- Requires explicit query-key discipline.
- Some initial data can exist both in Server Components and Query cache if hydration is not planned carefully.

### Implementation notes

- Hydrate initial user, plan summary, and current-period aggregates where needed.
- Use one QueryClient per request during SSR hydration paths.[cite:159]
- Keep a clear policy for stale times and invalidation.

## ADR-008 — Use nuqs for URL query-state management

### Status

Accepted.

### Context

Activity filters, period selectors, tabs, sorting, and desktop split-view state should be shareable and restorable from the URL. Manual URLSearchParams handling is brittle.

### Decision

Use nuqs for type-safe URL search-parameter state management.

### Rationale

nuqs supports Next.js App Router, provides a `useState`-like API for query parameters, and supports type-safe parsers and server-friendly patterns.[cite:120][cite:128] It also defaults to client-first updates and can optionally notify the server when needed.[cite:125]

### Consequences

**Positive**

- Cleaner query-state code.
- Shareable filter/sort/tab URLs.
- Better type safety around search params.

**Negative**

- Adds one more abstraction developers must learn.
- Must be used consistently to avoid mixed search-param patterns.

### Implementation notes

- Use nuqs for page filter/sort/view state.
- Do not use it for ephemeral local UI such as open drawers or toasts.
- When server rendering depends on query state, use server-aware patterns and page `searchParams` appropriately.[cite:125][cite:130]

## ADR-009 — Use Bun as the primary local package manager and script runner

### Status

Accepted.

### Context

The project should be quick to install and run locally, and the user explicitly wants Bun in the stack.

### Decision

Use Bun as the default local package manager and script runner, while keeping package scripts and project structure standard Node-compatible.

### Rationale

The shadcn setup flow supports Bun in its Next.js installation flow.[cite:148][cite:153] Bun is fast for install and script execution, but the project should avoid Bun-only behavior that would complicate CI or hosting portability.

### Consequences

**Positive**

- Fast local installs and commands.
- Matches the requested stack.

**Negative**

- Some tooling examples in the ecosystem assume npm or pnpm.
- Team CI must verify compatibility explicitly.

### Implementation notes

- Commit a lockfile based on the chosen package manager.
- Keep scripts standard: `dev`, `build`, `lint`, `test`, `typecheck`, `format`.
- Verify Vercel build behavior before relying on Bun-only semantics.

## ADR-010 — Use a domain-first modular architecture, not a flat component/pages architecture

### Status

Accepted.

### Context

The product contains multiple interacting business concepts: plan periods, transactions, protected funds, wait items, rules, weekly review, localization, and auth. A flat `components + pages + hooks` structure will become hard to scale.

### Decision

Use a domain-first modular architecture organized around features and core business modules.

### Rationale

The most fragile part of this product is not generic UI; it is trust in calculations and planning state transitions. A domain-first structure protects the financial engine from UI sprawl.

### Consequences

**Positive**

- Easier reasoning about business logic.
- Better testability.
- Lower chance of duplicated calculation rules.

**Negative**

- Requires early discipline in file organization.
- Teams used to flat patterns may need adjustment.

### Implementation notes

- Put pure money and planning logic in `src/lib/wealth-engine` or `src/features/planning/domain`.
- Keep UI primitives separate from feature modules.
- Do not let page files accumulate business logic.

## ADR-011 — Use local-first optimistic transaction capture with durable server sync

### Status

Accepted.

### Context

Daily expense logging must feel nearly instant and remain usable during weak connectivity. At the same time, durable cloud persistence is necessary for signed-in users.

### Decision

Record new transactions optimistically on the client and synchronize them to Supabase asynchronously using idempotent mutation IDs.

### Rationale

The product promise depends on extremely fast daily interactions. Waiting for round trips before updating `Available today` would undermine the UX. TanStack Query supports optimistic mutation flows, while Supabase persistence can remain the durable source of truth after acknowledgment.[cite:124][cite:127]

### Consequences

**Positive**

- Near-instant feedback for daily actions.
- Better offline and low-network behavior.
- More natural mobile experience.

**Negative**

- Requires careful rollback and conflict logic.
- Derived totals must come from event state, not independent counters.

### Implementation notes

- Generate `clientMutationId` per transaction mutation.
- Persist pending mutations locally until confirmed.
- Represent reversals as explicit events when possible.

## ADR-012 — Store monetary values in integer minor units and keep financial calculations in pure functions

### Status

Accepted.

### Context

The product’s trust depends on exact calculations and reproducible results. Floating-point errors or UI-layer arithmetic are unacceptable.

### Decision

Store monetary amounts as integers in minor units and keep all calculation logic in pure tested functions.

### Rationale

Budgeting and re-pacing logic must remain deterministic across server, client, and tests. Pure functions and integer money representation reduce drift and make fixtures reliable.

### Consequences

**Positive**

- Predictable math.
- Reproducible acceptance tests.
- Easier validation of `Available today`, `Adjusted`, and weekly review states.

**Negative**

- Formatting and conversion require deliberate utility functions.
- Developers must avoid ad hoc display-to-domain conversion logic.

### Implementation notes

- Introduce shared money format/parse utilities.
- Cover currency rounding and period-boundary rules with tests.

---

# Technical implementation

## Target repository structure

```text
brokenomore/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (marketing)/
│   │   │   │   └── login/page.tsx
│   │   │   ├── (onboarding)/
│   │   │   │   └── onboarding/
│   │   │   │       ├── income/page.tsx
│   │   │   │       ├── template/page.tsx
│   │   │   │       └── review/page.tsx
│   │   │   ├── (app)/
│   │   │   │   ├── today/page.tsx
│   │   │   │   ├── activity/page.tsx
│   │   │   │   ├── activity/[transactionId]/page.tsx
│   │   │   │   ├── check/page.tsx
│   │   │   │   ├── plan/page.tsx
│   │   │   │   ├── plan/[bucketId]/page.tsx
│   │   │   │   ├── plan/rules/page.tsx
│   │   │   │   ├── plan/wait-list/page.tsx
│   │   │   │   ├── review/page.tsx
│   │   │   │   ├── community/page.tsx
│   │   │   │   └── settings/
│   │   │   ├── layout.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── auth/callback/route.ts
│   │   ├── api/
│   │   ├── layout.tsx
│   │   ├── error.tsx
│   │   └── loading.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── app-shell/
│   │   ├── forms/
│   │   └── product/
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── planning/
│   │   ├── transactions/
│   │   ├── purchase-check/
│   │   ├── review/
│   │   ├── settings/
│   │   ├── community/
│   │   └── sync/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── query/
│   │   ├── i18n/
│   │   ├── money/
│   │   ├── wealth-engine/
│   │   ├── validation/
│   │   ├── analytics/
│   │   └── utils/
│   ├── hooks/
│   ├── stores/
│   ├── messages/
│   │   ├── en-KH/
│   │   └── km-KH/
│   ├── styles/
│   ├── types/
│   └── tests/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── policies/
├── public/
├── docs/
├── package.json
├── bun.lockb
├── tsconfig.json
├── next.config.ts
├── middleware.ts
├── components.json
└── env.example
```

## Technical standards

### Naming

- Pages and route folders use kebab or route-normal naming.
- Domain modules use singular names where appropriate, such as `transaction`, `plan-period`, `wait-item`.
- Zod schemas end with `Schema`.
- Server-side repositories end with `Repository`.
- TanStack query keys live in dedicated `queryKeys.ts` files.

### Code boundaries

- `components/ui`: raw shadcn primitives and lightly wrapped primitives.
- `components/product`: shared product widgets such as `AvailableTodayCard`.
- `features/*`: domain workflows, hooks, mutations, selectors, and feature components.
- `lib/wealth-engine`: pure financial logic, no framework imports.
- `lib/supabase`: auth and DB client factories.
- `lib/i18n`: next-intl helpers.

### Testing layers

- Pure domain unit tests for calculations and planners.
- Component tests for form wrappers and key interactions.
- Integration tests for mutations and route behavior.
- E2E for primary mobile and desktop flows.

---

# Step-by-step implementation plan

## Phase 0 — Foundation and repository setup

### Objective

Create a stable, repeatable baseline before domain and UI work begins.

### Deliverables

- Initialized Next.js 15 App Router project.
- Bun package setup.
- Tailwind CSS and shadcn/ui installed and configured.[cite:148][cite:152]
- TypeScript path aliases.
- ESLint, Prettier, and basic test runner setup.
- next-intl bootstrapped.
- Supabase clients scaffolded.
- TanStack Query provider scaffolded.
- nuqs adapter scaffolded.[cite:128]

### Tasks

1. Create the project with Next.js App Router and TypeScript.
2. Configure Bun as the primary package manager.
3. Install and initialize shadcn/ui for Next.js.[cite:148][cite:154]
4. Install dependencies:
   - `@supabase/supabase-js`
   - `@supabase/ssr` or current recommended SSR helper stack
   - `next-intl`
   - `zod`
   - `react-hook-form`
   - `@hookform/resolvers`
   - `@tanstack/react-query`
   - `nuqs`
   - optional supporting libraries such as `date-fns`, `sonner`, `lucide-react`
5. Add `NuqsAdapter` to the root client boundary where required by the library.[cite:128]
6. Add TanStack Query provider and hydration boundary structure.[cite:122][cite:124]
7. Add locale-aware route structure using next-intl.[cite:123]
8. Commit the initial design token layer and base app theme.

### Exit criteria

- App boots locally.
- Locale routing works for the default locale.
- shadcn button renders.
- Supabase environment variables resolve without client leaks.
- Query provider is active.
- A trivial URL state using nuqs works.

## Phase 1 — Core domain and schema design

### Objective

Define the business model before feature UIs multiply.

### Deliverables

- Money utilities.
- Wealth engine pure functions.
- Zod schemas for key domain inputs and mutations.
- Domain types and fixture states.
- Reproducible acceptance examples.

### Tasks

1. Implement `Money` type and formatting utilities.
2. Implement wealth-engine modules:
   - period calculations
   - available-today calculation
   - projected purchase impact
   - protected/flexible bucket checks
   - work-time equivalent
   - future-value helper
3. Write Zod schemas for:
   - onboarding plan creation
   - transaction create/edit
   - purchase check input
   - wait item create/resolve
   - rule update
   - settings update
4. Add fixtures for canonical cases including the $1.50 quick expense and $15 purchase check.
5. Write unit tests for all formulas.

### Exit criteria

- Financial fixtures produce deterministic outputs.
- Every domain mutation payload has a validated schema.
- No calculation logic lives in component files.

## Phase 2 — Database design and Supabase setup

### Objective

Create the persistent model and authorization layer.

### Deliverables

- SQL migrations.
- RLS policies.
- Seed data for demo fixtures.
- Supabase client factories.

### Suggested tables

- `profiles`
- `user_preferences`
- `plans`
- `plan_periods`
- `buckets`
- `transactions`
- `quick_actions`
- `wait_items`
- `rules`
- `weekly_reviews`
- `audit_events`
- optional `community_profiles`
- optional `challenge_participation`

### Tasks

1. Create the Supabase project and configure Google OAuth.[cite:95][cite:102]
2. Write migrations for all core tables.
3. Add foreign keys and useful indexes.
4. Write RLS policies per table.
5. Add SQL seed fixtures.
6. Generate or maintain typed database interfaces.
7. Implement server/browser client factories.

### Exit criteria

- Signed-in user can only read and write own rows.
- OAuth callback works locally and in preview.
- Seed/demo fixtures can initialize a starter account.

## Phase 3 — App shell, auth, and localization

### Objective

Build the frame all future features rely on.

### Deliverables

- Localized route structure.
- Auth gate patterns.
- App shell for mobile and desktop.
- Theme and typography baseline.

### Tasks

1. Implement `[locale]` segment and message loading.
2. Add middleware for locale negotiation if needed.
3. Build login route with Google and demo mode.
4. Implement auth callback route handler.[cite:94][cite:95]
5. Build responsive shell:
   - mobile bottom navigation
   - tablet rail
   - desktop sidebar
6. Add sync state indicator and avatar menu placeholders.
7. Add route protection for app routes.

### Exit criteria

- User can sign in and reach protected routes.
- Unauthenticated users are redirected correctly.
- App shell renders correctly at mobile and desktop widths.

## Phase 4 — Onboarding vertical slice

### Objective

Deliver a working starter-plan creation flow.

### Deliverables

- Income rhythm step.
- Template selection step.
- Review and confirm step.
- Plan creation mutation.

### Tasks

1. Build RHF + Zod onboarding forms.[cite:135][cite:141]
2. Create product form components for segmented choices and amount displays.
3. Persist plan, plan period, buckets, preferences, and starter quick actions.
4. Add optimistic loading and disabled/pending states.
5. Add demo-mode path with local persistence.

### Exit criteria

- New user can create a valid plan without errors.
- Result lands in Today with correct starter values.
- Validation messages are localized.

## Phase 5 — Today dashboard and quick actions

### Objective

Deliver the daily command center.

### Deliverables

- Available-today hero.
- Why-this-amount sheet.
- Quick actions.
- Protected summary.
- Latest activity preview.

### Tasks

1. Build Today page server bootstrap and client hydration.
2. Implement query keys for current plan summary and latest transactions.
3. Build optimistic quick-add mutation with TanStack Query.
4. Add Sonner confirmation with Undo.
5. Expose explanation breakdown for the daily amount.

### Exit criteria

- Quick action updates UI in under one interaction cycle.
- Undo fully restores derived values.
- Today amount explanation matches fixture math.

## Phase 6 — Activity and transaction correction

### Objective

Make capture trustworthy through visibility and correction.

### Deliverables

- Activity list page.
- Filters and view state.
- Transaction detail and edit flows.
- Reverse/delete behavior.

### Tasks

1. Use nuqs for period, bucket, and sort state in Activity.[cite:120][cite:125]
2. Build mobile list and desktop table variants.
3. Add edit and reverse forms using RHF + Zod.
4. Add query invalidation and optimistic cache repair.
5. Preserve direct-linkable filter state.

### Exit criteria

- Users can filter and correct transactions on both mobile and desktop.
- URL reflects current filter state.
- Derived totals stay consistent after edits.

## Phase 7 — Purchase Check and Wait 24 Hours

### Objective

Implement pre-purchase decision support.

### Deliverables

- Check drawer/panel.
- Keypad and hardware-keyboard support.
- Impact results with statuses.
- Wait item creation and review flow.

### Tasks

1. Build `PurchaseCheckPanel` as a client component.
2. Use Zod schema for amount and bucket validation.
3. Calculate status and projected impact via the wealth engine.
4. Add optional perspective disclosures for work-time and future value.
5. Create wait item mutation and list page.

### Exit criteria

- The canonical $15 fixture yields the expected projected result.
- Wait items can be created, resumed, dismissed, and converted to purchases.

## Phase 8 — Plan, rules, and protected-fund review

### Objective

Allow deeper control of money structure without sacrificing clarity.

### Deliverables

- Plan page.
- Bucket detail pages.
- Rule toggles and descriptions.
- Protected-fund adjustment flow.

### Tasks

1. Build master-detail or single-column plan views depending on viewport.
2. Add editable allocations with impact preview.
3. Add rule update mutations.
4. Implement emergency-access path for protected funds.
5. Write audit events for protected-fund changes.

### Exit criteria

- Protected and flexible groups are clearly separated.
- Rule changes persist and affect future calculations where intended.
- Protected-fund access is explicit and recoverable.

## Phase 9 — Weekly review and period rollover

### Objective

Close the loop on period-based planning.

### Deliverables

- Weekly review page.
- Remainder allocation options.
- New-period initialization flow.

### Tasks

1. Build review summary query.
2. Add remainder allocation decision mutation.
3. Generate next period state.
4. Preserve auditability of rollover decisions.

### Exit criteria

- Weekly review shows planned, spent, and remainder accurately.
- Next period reflects chosen rollover policy.

## Phase 10 — Settings, localization expansion, and accessibility hardening

### Objective

Stabilize the product for broader real use.

### Deliverables

- Settings pages.
- Language and currency settings.
- Reduced-motion and accessibility preferences.
- Khmer message groundwork.

### Tasks

1. Build settings routes and forms.
2. Add locale switcher and currency settings.
3. Add reduced-motion and theme preference handling.
4. Run accessibility audit on primary flows.
5. Start `km-KH` message translation baseline.

### Exit criteria

- User can change settings safely.
- Product remains usable under keyboard and screen-reader checks.
- Locale formatting behaves correctly.

## Phase 11 — Community and optional engagement systems

### Objective

Add optional, privacy-safe motivation only after the core tool is trustworthy.

### Deliverables

- Opt-in community profile.
- Challenge list.
- Pseudonymous rankings or consistency views.

### Tasks

1. Implement separate opt-in consent.
2. Build non-financial derived challenge metrics.
3. Prevent private-money leakage by design.
4. Keep Community outside the primary daily loop.

### Exit criteria

- Community is optional, pseudonymous, and privacy-safe.
- No raw financial amounts are displayed publicly.

---

# Technical implementation details by concern

## 1. UI and component architecture

### Layering model

- `components/ui`: direct shadcn primitives.
- `components/forms`: wrappers for RHF-integrated controls.
- `components/product`: app-level reusable units.
- `features/*/components`: workflow-specific UI.

### Product-level components to create early

- `AppShell`
- `MobileBottomNav`
- `DesktopSidebar`
- `AvailableTodayCard`
- `QuickActionButton`
- `ProtectedSummaryCard`
- `MoneyValue`
- `PlanStatusBadge`
- `PurchaseCheckPanel`
- `WhyThisAmountSheet`
- `TransactionRow`
- `TransactionTable`
- `BucketRow`
- `RuleToggleRow`
- `WeeklyReviewSummary`

### Form wrappers

- `FormMoneyInput`
- `FormSegmentedControl`
- `FormRadioCards`
- `FormSwitchField`
- `FormDateOrPeriodSelector`
- `FormTextareaOptional`

## 2. State management strategy

### State categories

**Server state**

- current plan
- current period
- transactions
- wait items
- rules
- reviews

Use TanStack Query.[cite:124][cite:127]

**Form state**

- onboarding inputs
- edit transaction values
- settings values

Use React Hook Form + Zod.[cite:138][cite:141]

**URL state**

- filters
- tabs
- sort
- selected period
- desktop panel state where shareable

Use nuqs.[cite:120][cite:128]

**Ephemeral UI state**

- open drawer
- selected quick-action editor
- toast visibility
- keypad draft

Use local component state or a very small UI store where truly cross-cutting.

## 3. Query architecture

### Query-key strategy

```ts
export const queryKeys = {
  auth: ['auth'] as const,
  profile: ['profile'] as const,
  preferences: ['preferences'] as const,
  currentPlan: ['plan', 'current'] as const,
  currentPeriod: ['period', 'current'] as const,
  periodSummary: (periodId: string) => ['period', periodId, 'summary'] as const,
  transactions: (filters: unknown) => ['transactions', filters] as const,
  transaction: (id: string) => ['transaction', id] as const,
  waitItems: ['wait-items'] as const,
  rules: ['rules'] as const,
  weeklyReview: (periodId: string) => ['weekly-review', periodId] as const,
};
```

### Query principles

- Co-locate queries with features.
- Keep summary queries separate from detail queries.
- Use hydration for initial critical views.
- Invalidate narrowly after mutations.
- Set non-zero `staleTime` where hydration would otherwise immediately refetch.[cite:159]

## 4. Validation architecture

### Schema categories

- `domain schemas`: internal invariants.
- `input schemas`: user-entered forms.
- `mutation schemas`: API/server action payloads.
- `query-state schemas`: nuqs parser contracts or auxiliary validation.

### Example schema boundaries

- `CreateTransactionInputSchema`
- `UpdateBucketAllocationSchema`
- `PurchaseCheckSchema`
- `CreateWaitItemSchema`
- `UpdatePreferencesSchema`

## 5. Internationalization architecture

### Message namespaces

- `common`
- `auth`
- `onboarding`
- `today`
- `activity`
- `plan`
- `check`
- `review`
- `settings`
- `validation`
- `community`

### Rules

- Never hardcode user-facing strings in feature components.
- Keep validation messages translatable.
- Use localized currency/date formatting helpers through next-intl-aware utilities.[cite:123]

## 6. Supabase implementation model

### Server-side usage

- read authenticated session
- fetch initial route data
- perform trusted mutations where server execution is beneficial

### Client-side usage

- limited auth-aware interactions
- possibly live auth state listeners if needed
- avoid exposing any privileged behavior

### Policy pattern

Every user-owned row includes `user_id`, and policies should follow a strict owner-only model unless a public opt-in feature explicitly needs derived exposure.

## 7. Offline and optimistic sync model

### Approach

- Queue optimistic transaction mutations locally.
- Mark items `pending` until confirmed.
- Retry automatically.
- Roll back or reconcile when server rejects a mutation.
- Maintain idempotency using `clientMutationId`.

### Why it matters

This is essential for fast daily logging and aligns with the product’s UX promise more than any animation or gamification layer.

## 8. Testing implementation

### Unit

- `wealth-engine` functions
- money parsing/formatting
- bucket impact calculations
- status derivation

### Integration

- onboarding save flow
- quick-action add/undo
- transaction edit/reverse
- purchase-check to wait-item flow
- weekly review close flow

### E2E

- mobile onboarding to Today
- one-tap expense logging
- desktop activity filtering
- protected-fund review
- locale switch

---

# User stories

## Story format

Each story includes:

- role
- need
- outcome
- acceptance criteria
- implementation notes
- priority

## Epic 1 — Authentication and entry

### US-001 — Sign in with Google

**As a** returning user  
**I want** to continue with Google  
**So that** I can access my plan without remembering another password.

**Acceptance criteria**

- Login screen shows a primary Continue with Google action.
- OAuth round-trip returns the user to the correct localized route.
- Existing users go to Today.
- New users go to onboarding.
- Failed or cancelled sign-in returns a clear recoverable message.

**Priority**: P0

### US-002 — Try the product in demo mode

**As a** first-time evaluator  
**I want** to try the app without creating an account  
**So that** I can understand its value before signing in.

**Acceptance criteria**

- Login screen shows a Try demo action.
- Demo mode loads starter fixtures locally.
- Demo state is visibly labeled.
- A signed-in import path is available later.

**Priority**: P0

## Epic 2 — Onboarding and initial plan setup

### US-003 — Choose my income rhythm

**As a** new user  
**I want** to choose how often I get income  
**So that** the app can create the right planning cadence.

**Acceptance criteria**

- User can choose monthly, twice monthly, weekly, or irregular.
- Selection persists through the onboarding flow.
- Validation prevents moving forward without a valid choice.

**Priority**: P0

### US-004 — Start from a template

**As a** new user  
**I want** to start from a relevant template  
**So that** I can avoid building a plan from scratch.

**Acceptance criteria**

- Templates show clear amounts and descriptions.
- User can select one template with one tap/click.
- Real users must confirm the resulting numbers before saving.

**Priority**: P0

### US-005 — Review my plan before saving

**As a** new user  
**I want** to see my protected, flexible, and future amounts  
**So that** I understand what the app will use to calculate today’s amount.

**Acceptance criteria**

- Review step shows all key allocations.
- User can go back and edit previous choices.
- Save creates a valid plan and the first plan period.

**Priority**: P0

## Epic 3 — Daily dashboard and quick logging

### US-006 — See Available today immediately

**As a** returning user  
**I want** to see my available-today amount immediately on Today  
**So that** I can decide what is reasonable to spend.

**Acceptance criteria**

- Available-today amount appears above the fold on mobile and desktop.
- Amount includes state such as On plan or Adjusted.
- A Why this amount action exists.

**Priority**: P0

### US-007 — Log a common expense in one tap

**As a** daily user  
**I want** to tap a saved quick action  
**So that** I can record a routine expense with no typing.

**Acceptance criteria**

- Tapping a quick action creates an optimistic transaction.
- Available today updates immediately.
- A confirmation with Undo appears.
- Undo reverses all derived state.

**Priority**: P0

### US-008 — Understand where my daily amount came from

**As a** cautious user  
**I want** to inspect the calculation behind my daily amount  
**So that** I can trust the number.

**Acceptance criteria**

- Why-this-amount view shows period limit, spend, remaining days, and current result.
- Values reconcile with the visible Today amount.
- Copy is plain and localized.

**Priority**: P0

## Epic 4 — Purchase check and cooling-off support

### US-009 — Check a purchase before recording it

**As a** user considering a purchase  
**I want** to enter an amount and category  
**So that** I can see the impact on the rest of the week.

**Acceptance criteria**

- User can enter a valid amount.
- User can choose the relevant flexible bucket.
- App shows status and projected next-daily impact.
- Optional deeper metrics are hidden by default.

**Priority**: P0

### US-010 — Delay a discretionary purchase

**As a** user who is unsure about a purchase  
**I want** to wait 24 hours  
**So that** I can revisit the decision later.

**Acceptance criteria**

- Wait action creates a wait item with a review timestamp.
- User can optionally add a short name.
- Wait item appears in the Wait list.
- User can later buy, extend, or dismiss it.

**Priority**: P1

## Epic 5 — Activity and correction

### US-011 — Review my recent activity

**As a** user  
**I want** to see my transactions by period  
**So that** I can confirm what has been recorded.

**Acceptance criteria**

- Activity page shows recent items clearly on mobile and desktop.
- User can filter by period and bucket.
- Pending sync state is visible where relevant.

**Priority**: P0

### US-012 — Correct a mistaken transaction

**As a** user  
**I want** to edit or reverse a mistaken transaction  
**So that** my plan remains accurate.

**Acceptance criteria**

- User can open transaction detail.
- User can edit valid fields or reverse the entry.
- Derived totals update correctly afterward.

**Priority**: P0

## Epic 6 — Plan management

### US-013 — Review protected and flexible groups

**As a** planner  
**I want** to see my plan groups clearly  
**So that** I understand what money is protected and what remains flexible.

**Acceptance criteria**

- Plan page groups protected and flexible buckets separately.
- Each bucket shows allocated and remaining values.
- User can open a bucket for detail.

**Priority**: P0

### US-014 — Adjust a bucket allocation

**As a** planner  
**I want** to change a bucket allocation  
**So that** my plan reflects real life changes.

**Acceptance criteria**

- User can edit allocation through a validated form.
- App previews the impact before save.
- Saving updates Today and related summaries.

**Priority**: P1

### US-015 — Use protected money in an emergency

**As a** user facing a real need  
**I want** to adjust protected money explicitly  
**So that** I can respond to emergencies without hidden consequences.

**Acceptance criteria**

- Flow explains which commitments are affected.
- Emergency path is always available.
- Change is auditable and updates the plan transparently.

**Priority**: P1

## Epic 7 — Weekly review and rollover

### US-016 — Review my completed week

**As a** user  
**I want** to see planned, spent, and remaining amounts for the week  
**So that** I can learn and decide what to do next.

**Acceptance criteria**

- Review page shows plan vs actual.
- At least one clear useful insight is shown.
- User can choose a remainder action.

**Priority**: P1

### US-017 — Decide what to do with my remainder

**As a** user  
**I want** to allocate, carry, or leave my remainder  
**So that** the next period starts correctly.

**Acceptance criteria**

- User can choose one remainder action.
- Next period preview updates before confirmation.
- Result persists correctly.

**Priority**: P1

## Epic 8 — Settings and personalization

### US-018 — Change my language and display preferences

**As a** user  
**I want** to choose language, currency, and theme preferences  
**So that** the app matches how I work.

**Acceptance criteria**

- Settings page exposes language and display preferences.
- Changes update formatting and UI correctly.
- Preferences persist per account or local demo state.

**Priority**: P1

### US-019 — Choose my guidance style

**As a** user  
**I want** to choose calm or straight-talk guidance  
**So that** the app communicates in a tone that helps me.

**Acceptance criteria**

- User can switch styles from settings.
- Preview is shown before applying.
- Protected-fund, emergency, and security flows always use neutral factual copy.

**Priority**: P2

## Epic 9 — Optional community

### US-020 — Join a challenge without exposing my finances

**As a** user  
**I want** to join an optional challenge privately  
**So that** I can get motivation without revealing salary or spending.

**Acceptance criteria**

- Community requires explicit opt-in.
- Default identity is pseudonymous.
- No salary, balance, or raw transaction amounts are shown.

**Priority**: P3

---

# Suggested implementation backlog by sprint order

## Sprint 1

- US-001 Sign in with Google
- US-002 Try demo mode
- Phase 0 and Phase 1 foundations

## Sprint 2

- US-003 Choose income rhythm
- US-004 Start from a template
- US-005 Review plan before saving

## Sprint 3

- US-006 See Available today immediately
- US-007 Log a common expense in one tap
- US-008 Understand where my daily amount came from

## Sprint 4

- US-011 Review my recent activity
- US-012 Correct a mistaken transaction

## Sprint 5

- US-009 Check a purchase before recording it
- US-010 Delay a discretionary purchase

## Sprint 6

- US-013 Review protected and flexible groups
- US-014 Adjust a bucket allocation
- US-015 Use protected money in an emergency

## Sprint 7

- US-016 Review my completed week
- US-017 Decide what to do with my remainder

## Sprint 8

- US-018 Change language and display preferences
- US-019 Choose guidance style
- accessibility hardening
- localization baseline for Khmer

## Sprint 9+

- US-020 Join a challenge privately
- engagement experiments
- advanced import/integration ideas

---

# End-to-end completion checklist

## Product foundation

- [ ] Approved ADRs.
- [ ] Repository initialized with Bun, Next.js 15, Tailwind, shadcn/ui.
- [ ] Supabase project configured.
- [ ] next-intl configured.
- [ ] TanStack Query configured.
- [ ] nuqs configured.

## Domain and data

- [ ] Wealth engine implemented and tested.
- [ ] Money utilities implemented.
- [ ] Zod schemas implemented.
- [ ] DB migrations complete.
- [ ] RLS policies tested.

## Core flows

- [ ] Login and demo mode complete.
- [ ] Onboarding complete.
- [ ] Today complete.
- [ ] Quick actions and Undo complete.
- [ ] Activity and correction complete.
- [ ] Purchase Check complete.
- [ ] Wait list complete.
- [ ] Plan management complete.
- [ ] Weekly review complete.

## Quality

- [ ] Mobile and desktop responsive QA complete.
- [ ] Keyboard and screen-reader pass complete.
- [ ] Localized formatting verified.
- [ ] Canonical financial fixtures pass.
- [ ] Error and offline states handled.
- [ ] Analytics excludes sensitive amounts and titles.

## Release readiness

- [ ] Seed/demo fixtures available.
- [ ] CI runs lint, typecheck, tests.
- [ ] Preview deployment works.
- [ ] Production environment variables documented.
- [ ] Support and audit logging baseline ready.

## Final direction

BrokeNoMore should be implemented as a domain-trustworthy financial planner with a server-first shell and client-enhanced daily interactions. Next.js App Router provides the structural frame, shadcn/ui provides owned component primitives, Supabase provides authentication and secure persistence, next-intl prepares the app for Cambodia-ready localization, Zod and React Hook Form provide safe and maintainable forms, TanStack Query provides synchronized client-side server state, nuqs keeps filter and view state shareable, and Bun provides a fast local developer workflow.[cite:91][cite:95][cite:121][cite:124][cite:134][cite:138][cite:148]

The most important technical rule is to keep financial logic pure, validated, and separate from UI concerns. If that principle holds, the product can scale in features without losing user trust.
