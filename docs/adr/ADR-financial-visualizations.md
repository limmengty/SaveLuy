# Architectural Decision Record: Financial Visualizations for SaveLuy

- **Status**: Approved
- **Date**: 2026-10-17
- **Author**: Principal Product Designer & Senior Next.js Developer

## Context
SaveLuy is a mobile-first spending guardrail designed to deliver daily clarity: *"How much can I safely spend today without touching protected money?"*
Users need visual indicators to answer:
1. Am I on track this week?
2. Where did my flexible money go?
3. How much remains in each envelope?
4. Is my spending pace improving?
5. How much money have I kept protected?

Existing commercial dashboards introduce cognitive overload (gauges, 3D charts, nested donuts, complex multi-axis graphs). SaveLuy requires a calm, accessible "Quiet Glass Ledger" visualization system that is mobile-first, respects integer minor units, and is fully accessible without relying on color alone.

## Decision
1. **Chart Primitive**: Use **Recharts 3.10.1** wrapped in a lightweight, accessible `ChartCard` abstraction.
2. **Chart Typology**:
   - **Weekly Pace**: Cumulative step/line chart with neutral dashed line (Plan) and emerald solid line (Actual), highlighting over-pace with warning/rose indicators and status icons.
   - **Envelope Usage**: Horizontal bullet bars with exact fraction labels and accessible percentages.
   - **Spending Breakdown**: Ranked horizontal bars with period toggle (`this-week`, `last-week`, `this-month`).
   - **Protected Money Trend**: Step-line chart showing weekly protected vault integrity.
3. **Accessibility**:
   - Every chart includes an accessible text summary and an expandable accessible data table (`<table>`) for screen readers.
   - Never rely on color alone: use stroke styles (dashed vs solid), warning icons, and descriptive textual cues.
   - 44px touch targets on mobile.
4. **Data Integrity**:
   - Strictly integer minor units (cents / riels) passed through canonical aggregation functions.
   - Reversals excluded deterministically.
   - No historical fabrication or fake flat baselines.

## Consequences
- Fast initial paint on budget smartphones.
- Zero floating-point discrepancies across Today, Plan, Activity, and Progress.
- Seamless dual-language support in English (`en-KH`) and Khmer (`km-KH`).
