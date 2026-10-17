# SaveLuy Financial Visualization Data Contracts

## 1. Core Principles
- All money values are strictly integer minor units (`amountCents`). No floating-point values are stored or aggregated.
- All timestamps are ISO 8601 UTC strings.
- Local calendar calculations convert to the user's localized week and day boundaries.
- Reversed transactions are filtered out before calculating cumulative or category spending.

---

## 2. TypeScript Data Contracts

### 2.1. Weekly Pace Point
```typescript
export interface WeeklyPacePoint {
  dayIndex: number; // 0 to 6 relative to cycle anchor
  localDate: string; // YYYY-MM-DD
  localizedDayLabel: string; // "Mon", "Tue" / "ចន្ទ", "អង្គារ"
  plannedCumulativeCents: number;
  actualCumulativeCents: number;
  dailySpentCents: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface WeeklyPaceData {
  points: WeeklyPacePoint[];
  weeklyFlexibleLimitCents: number;
  totalSpentCents: number;
  remainingCents: number;
  daysRemainingIncludingToday: number;
  paceVarianceCents: number; // planned - actual (positive = ahead/under-budget)
  status: "ON_PLAN" | "NEAR_LIMIT" | "LIMIT_REACHED" | "NO_DATA";
}
```

### 2.2. Envelope Usage Point
```typescript
export interface EnvelopeUsagePoint {
  envelopeId: "essentials" | "fun" | string;
  name: string; // localized envelope name
  allocatedCents: number;
  spentCents: number;
  remainingCents: number;
  percentageUsed: number; // clamped to 100 for visual bar, exact for text
  isOverLimit: boolean;
  overageCents: number;
}
```

### 2.3. Spending Breakdown Point
```typescript
export type SpendingPeriod = "this-week" | "last-week" | "this-month";

export interface SpendingBreakdownPoint {
  envelopeId: string;
  name: string;
  amountCents: number;
  percentageOfFlexibleSpend: number;
  previousAmountCents: number | null;
  changePercentage: number | null;
}

export interface SpendingBreakdownData {
  period: SpendingPeriod;
  totalSpentCents: number;
  points: SpendingBreakdownPoint[];
}
```

### 2.4. Protected Trend Point
```typescript
export interface ProtectedTrendPoint {
  periodLabel: string; // e.g. "Week 41", "Week 42"
  weekStartDate: string;
  protectedBalanceCents: number;
  emergencyUnlocksCount: number;
  netChangeCents: number;
}
```

### 2.5. Accessible Chart Summary
```typescript
export interface ChartSummary {
  title: string;
  description: string;
  accessibleSummary: string;
  status: "ON_PLAN" | "NEAR_LIMIT" | "LIMIT_REACHED" | "NO_DATA";
}
```
