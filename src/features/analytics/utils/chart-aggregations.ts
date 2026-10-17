import type { Transaction, Plan } from "@/lib/wealth-engine/engine";
import { weekStart } from "@/lib/wealth-engine/engine";
import type { WeeklyPaceData, WeeklyPacePoint, EnvelopeUsagePoint, SpendingBreakdownData, SpendingPeriod } from "../types";

/**
 * Calculates 7-day cumulative pacing data matching engine invariants
 */
export function aggregateWeeklyPace(plan: Plan, txs: Transaction[], now: Date, locale: string = "en-US"): WeeklyPaceData {
  const anchorDay = typeof plan.cycleAnchorDay === "number" ? plan.cycleAnchorDay : 1;
  const start = weekStart(now, anchorDay);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const emergencyRelief = Math.max(0, plan.emergencyReliefCents ?? 0);
  const weeklyFlexibleLimitCents = plan.essentialsLimit + plan.funLimit + emergencyRelief;
  const activeTxs = txs.filter((t) => !t.reversed && new Date(t.createdAt) >= start);

  const points: WeeklyPacePoint[] = [];
  let cumulativeActual = 0;
  let totalSpentCents = 0;

  // Daily budget increment across 7 days
  const dailyPlannedRate = Math.floor(weeklyFlexibleLimitCents / 7);

  const dayFormat = new Intl.DateTimeFormat(locale === "km-KH" ? "km-KH" : "en-US", { weekday: "short" });

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dEnd = new Date(dStart.getTime() + 86400000);

    const isToday = dStart.getTime() === todayStart.getTime();
    const isFuture = dStart.getTime() > todayStart.getTime();

    // Spending on this specific day
    const daySpend = activeTxs
      .filter((t) => {
        const tTime = new Date(t.createdAt).getTime();
        return tTime >= dStart.getTime() && tTime < dEnd.getTime();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (!isFuture) {
      cumulativeActual += daySpend;
      totalSpentCents += daySpend;
    }

    // Planned cumulative at end of day (i + 1)
    const plannedCumulativeCents = Math.min(weeklyFlexibleLimitCents, (i + 1) * dailyPlannedRate);

    points.push({
      dayIndex: i,
      localDate: dStart.toISOString().split("T")[0],
      localizedDayLabel: dayFormat.format(dStart),
      plannedCumulativeCents,
      actualCumulativeCents: isFuture ? cumulativeActual : cumulativeActual,
      dailySpentCents: daySpend,
      isToday,
      isFuture,
    });
  }

  const remainingCents = Math.max(0, weeklyFlexibleLimitCents - totalSpentCents);
  const daysElapsed = Math.round((todayStart.getTime() - start.getTime()) / 86400000);
  const daysRemainingIncludingToday = Math.max(1, 7 - daysElapsed);

  // Planned cumulative up to today
  const todayPlanned = Math.min(weeklyFlexibleLimitCents, (daysElapsed + 1) * dailyPlannedRate);
  const paceVarianceCents = todayPlanned - totalSpentCents;

  let status: WeeklyPaceData["status"] = "ON_PLAN";
  if (remainingCents === 0) {
    status = "LIMIT_REACHED";
  } else if (paceVarianceCents < 0) {
    status = "NEAR_LIMIT";
  }

  return {
    points,
    weeklyFlexibleLimitCents,
    totalSpentCents,
    remainingCents,
    daysRemainingIncludingToday,
    paceVarianceCents,
    status,
  };
}

/**
 * Calculates envelope usage points (Essentials vs Fun Money)
 */
export function aggregateEnvelopeUsage(plan: Plan, txs: Transaction[], now: Date): EnvelopeUsagePoint[] {
  const anchorDay = typeof plan.cycleAnchorDay === "number" ? plan.cycleAnchorDay : 1;
  const start = weekStart(now, anchorDay);
  const emergencyRelief = Math.max(0, plan.emergencyReliefCents ?? 0);

  const activeTxs = txs.filter((t) => !t.reversed && new Date(t.createdAt) >= start);

  const spentEssentials = activeTxs
    .filter((t) => t.envelope === "essentials")
    .reduce((sum, t) => sum + t.amount, 0);

  const spentFun = activeTxs
    .filter((t) => t.envelope === "fun")
    .reduce((sum, t) => sum + t.amount, 0);

  const allocatedEssentials = plan.essentialsLimit + emergencyRelief;
  const allocatedFun = plan.funLimit;

  return [
    {
      envelopeId: "essentials",
      name: "Essentials",
      allocatedCents: allocatedEssentials,
      spentCents: spentEssentials,
      remainingCents: Math.max(0, allocatedEssentials - spentEssentials),
      percentageUsed: allocatedEssentials > 0 ? Math.round((spentEssentials / allocatedEssentials) * 100) : 0,
      isOverLimit: spentEssentials > allocatedEssentials,
      overageCents: Math.max(0, spentEssentials - allocatedEssentials),
    },
    {
      envelopeId: "fun",
      name: "Fun Money",
      allocatedCents: allocatedFun,
      spentCents: spentFun,
      remainingCents: Math.max(0, allocatedFun - spentFun),
      percentageUsed: allocatedFun > 0 ? Math.round((spentFun / allocatedFun) * 100) : 0,
      isOverLimit: spentFun > allocatedFun,
      overageCents: Math.max(0, spentFun - allocatedFun),
    },
  ];
}

/**
 * Calculates flexible spending breakdown across chosen period (this-week, last-week, this-month)
 */
export function aggregateSpendingBreakdown(
  txs: Transaction[],
  period: SpendingPeriod,
  anchorDay: number = 1,
  now: Date = new Date()
): SpendingBreakdownData {
  let periodStart: Date;
  let periodEnd: Date;

  const currentWeekStart = weekStart(now, anchorDay);

  if (period === "this-week") {
    periodStart = currentWeekStart;
    periodEnd = new Date(now.getTime() + 86400000);
  } else if (period === "last-week") {
    periodStart = new Date(currentWeekStart.getTime() - 7 * 86400000);
    periodEnd = currentWeekStart;
  } else {
    // this-month
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const inPeriodTxs = txs.filter((t) => {
    if (t.reversed) return false;
    const tTime = new Date(t.createdAt).getTime();
    return tTime >= periodStart.getTime() && tTime < periodEnd.getTime();
  });

  const essentialsTotal = inPeriodTxs
    .filter((t) => t.envelope === "essentials")
    .reduce((sum, t) => sum + t.amount, 0);

  const funTotal = inPeriodTxs
    .filter((t) => t.envelope === "fun")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpentCents = essentialsTotal + funTotal;

  return {
    period,
    totalSpentCents,
    points: [
      {
        envelopeId: "essentials",
        name: "Essentials",
        amountCents: essentialsTotal,
        percentageOfFlexibleSpend: totalSpentCents > 0 ? Math.round((essentialsTotal / totalSpentCents) * 100) : 0,
        previousAmountCents: null,
        changePercentage: null,
      },
      {
        envelopeId: "fun",
        name: "Fun Money",
        amountCents: funTotal,
        percentageOfFlexibleSpend: totalSpentCents > 0 ? Math.round((funTotal / totalSpentCents) * 100) : 0,
        previousAmountCents: null,
        changePercentage: null,
      },
    ],
  };
}
