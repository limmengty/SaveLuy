export const queryKeys = {
  auth: ["auth"] as const,
  profile: ["profile"] as const,
  preferences: ["preferences"] as const,
  currentPlan: ["plan", "current"] as const,
  currentPeriod: ["period", "current"] as const,
  periodSummary: (periodId: string) => ["period", periodId, "summary"] as const,
  transactions: (filters?: unknown) => ["transactions", filters] as const,
  transaction: (id: string) => ["transaction", id] as const,
  waitItems: ["wait-items"] as const,
  rules: ["rules"] as const,
  weeklyReview: (periodId: string) => ["weekly-review", periodId] as const,
};
