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

export interface ProtectedTrendPoint {
  periodLabel: string;
  weekStartDate: string;
  protectedBalanceCents: number;
  emergencyUnlocksCount: number;
  netChangeCents: number;
}

export interface ChartSummary {
  title: string;
  description: string;
  accessibleSummary: string;
  status: "ON_PLAN" | "NEAR_LIMIT" | "LIMIT_REACHED" | "NO_DATA";
}
