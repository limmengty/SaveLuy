# Financial Visualizations Implementation Plan

## Phase 1: Foundations & Shared Components
- [ ] Add semantic chart tokens to `src/app/globals.css` (`--chart-actual`, `--chart-plan`, `--chart-protected`, `--chart-warning`, `--chart-danger`, `--chart-muted`).
- [ ] Create `src/components/charts/chart-card.tsx` with question-title, prominent current value, one-sentence interpretation, and accessible summary.
- [ ] Create `src/components/charts/accessible-chart-table.tsx` for screen-reader friendly data tables.
- [ ] Create `src/components/charts/chart-skeleton.tsx` and `chart-empty-state.tsx`.
- [ ] Build aggregation utility `src/features/analytics/utils/chart-aggregations.ts`.

## Phase 2: Envelope Usage Visualization (Plan Screen)
- [ ] Create `src/components/charts/envelope-usage-bars.tsx`.
- [ ] Embed into `src/features/planning/plan-view.tsx`.
- [ ] Connect rows to navigate to `/activity?envelope=essentials` or `/activity?envelope=fun`.
- [ ] Verify test suite against zero spend, partial spend, and over-budget states.

## Phase 3: Weekly Pace Visualization (Today & Progress Screens)
- [ ] Create `src/components/charts/weekly-pace-mini.tsx` for `/today` (compact, below Available Today explanation).
- [ ] Create `src/components/charts/weekly-pace-chart.tsx` for `/progress` (detailed cumulative 7-day view).
- [ ] Integrate into `src/features/planning/today-view.tsx` and `src/features/progress/progress-view.tsx`.
- [ ] Add accessible table and tooltip.

## Phase 4: Spending Breakdown & Protected Trend (Progress Screen)
- [ ] Create `src/components/charts/spending-breakdown-chart.tsx` with `nuqs` period toggle (`this-week`, `last-week`, `this-month`).
- [ ] Create `src/components/charts/protected-money-chart.tsx` using real historical reviews/audit events.
- [ ] Integrate both into `src/features/progress/progress-view.tsx`.

## Phase 5: Verification & Parity
- [ ] Add translation strings in `src/messages/en-KH.json` and `src/messages/km-KH.json`.
- [ ] Run `bun test` and write unit tests for aggregation math.
- [ ] Run `bun run typecheck`.
- [ ] Verify responsive layouts at 320px, 375px, and 390px widths.
