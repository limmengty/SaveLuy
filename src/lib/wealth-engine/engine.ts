// Pure, deterministic money engine. All amounts are integer cents.

export type EnvelopeId = "essentials" | "fun";
export type Status = "ON_PLAN" | "ADJUSTED" | "NEEDS_DECISION";

export interface Transaction {
  id: string;
  amount: number; // integer cents (positive)
  envelope: EnvelopeId;
  label: string;
  createdAt: string; // ISO string
  reversed?: boolean;
}

export interface EmergencyUnlockRecord {
  id: string;
  amountCents: number;
  reason: string;
  createdAt: string; // ISO date string
}

export interface Plan {
  essentialsLimit: number; // cents
  funLimit: number; // cents
  homeFixedMonthly: number; // cents
  futureFundMonthly: number; // cents
  monthlyFlexibleIncome: number; // cents
  monthlyWorkHours: number; // hours
  emergencyReliefCents?: number; // one-time emergency spend relief credited to active cycle (cents)
  emergencyUnlockedTotalCents?: number; // cumulative emergency funds unlocked this cycle (cents)
  lastEmergencyReason?: string; // audit note of latest emergency draw
  lastEmergencyDate?: string; // ISO date string of latest unlock
  emergencyHistory?: EmergencyUnlockRecord[]; // audit records of emergency unlocks
  cycleAnchorDay?: number; // 0 = Sunday, 1 = Monday (default), etc.
  lastReviewedWeekStart?: string; // ISO date string of reviewed cycle start
  lastReviewAction?: "future" | "carry" | "leave"; // disposition choice made
}

export interface DayInputs {
  weeklyFlexibleLimit: number; // cents
  spendBeforeToday: number; // cents
  spendToday: number; // cents
  daysInPeriod: number;
  daysRemainingIncludingToday: number;
}

export interface DailyCalculationResult {
  baselineDaily: number;
  periodRemaining: number;
  startOfDayRemaining: number;
  todayStartLimit: number;
  availableToday: number;
  confirmed: number;
}

export function daily(i: DayInputs): DailyCalculationResult {
  const baselineDaily = Math.floor(i.weeklyFlexibleLimit / i.daysInPeriod);
  const confirmed = i.spendBeforeToday + i.spendToday;
  const periodRemaining = i.weeklyFlexibleLimit - confirmed;
  const startOfDayRemaining = i.weeklyFlexibleLimit - i.spendBeforeToday;
  const paceCapacityToday = Math.floor(
    Math.max(0, startOfDayRemaining) / i.daysRemainingIncludingToday,
  );
  const todayStartLimit = Math.min(baselineDaily, paceCapacityToday);
  const availableToday = Math.max(0, todayStartLimit - i.spendToday);
  return {
    baselineDaily,
    periodRemaining,
    startOfDayRemaining,
    todayStartLimit,
    availableToday,
    confirmed,
  };
}

export function projectNextDaily(
  periodRemaining: number,
  purchase: number,
  baselineDaily: number,
  daysRemainingAfterToday: number,
) {
  const projectedRemaining = periodRemaining - purchase;
  const projectedNextDaily =
    daysRemainingAfterToday > 0
      ? Math.max(
          0,
          Math.min(baselineDaily, Math.floor(projectedRemaining / daysRemainingAfterToday)),
        )
      : Math.max(0, projectedRemaining);
  return { projectedRemaining, projectedNextDaily };
}

export function purchaseStatus(
  amount: number,
  availableToday: number,
  envelopeRemaining: number,
  periodRemaining: number,
): Status {
  if (amount > envelopeRemaining || amount > periodRemaining) return "NEEDS_DECISION";
  if (amount > availableToday) return "ADJUSTED";
  return "ON_PLAN";
}

export function workHours(
  amount: number,
  monthlyFlexibleIncome: number,
  monthlyWorkHours: number,
): number {
  if (monthlyFlexibleIncome <= 0 || monthlyWorkHours <= 0) return 0;
  return amount / (monthlyFlexibleIncome / monthlyWorkHours);
}

export function futureValue(amount: number, annualRate = 0.09, years = 10): number {
  return Math.round(amount * Math.pow(1 + annualRate, years));
}

// Week runs from anchor day (default Monday = 1) 00:00 -> anchor day - 1 23:59 local time
export function weekStart(now: Date, anchorDay: number = 1): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentDow = d.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const diff = (currentDow - anchorDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function computeToday(plan: Plan, txs: Transaction[], now: Date) {
  const anchorDay = typeof plan.cycleAnchorDay === "number" ? plan.cycleAnchorDay : 1;
  const start = weekStart(now, anchorDay);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysElapsed = Math.round((todayStart.getTime() - start.getTime()) / 86400000);
  const daysRemainingIncludingToday = Math.max(1, 7 - daysElapsed);
  const live = txs.filter((t) => !t.reversed && new Date(t.createdAt) >= start);

  let before = 0;
  let today = 0;
  let ess = 0;
  let fun = 0;

  for (const t of live) {
    if (new Date(t.createdAt) < todayStart) {
      before += t.amount;
    } else {
      today += t.amount;
    }

    if (t.envelope === "essentials") {
      ess += t.amount;
    } else {
      fun += t.amount;
    }
  }

  const emergencyRelief = Math.max(0, plan.emergencyReliefCents ?? 0);
  const weeklyFlexibleLimit = plan.essentialsLimit + plan.funLimit + emergencyRelief;
  const d = daily({
    weeklyFlexibleLimit,
    spendBeforeToday: before,
    spendToday: today,
    daysInPeriod: 7,
    daysRemainingIncludingToday,
  });

  const status: "on" | "adjusted" | "attention" =
    d.periodRemaining <= 0
      ? "attention"
      : d.todayStartLimit < d.baselineDaily
        ? "adjusted"
        : d.availableToday === 0
          ? "attention"
          : "on";

  return {
    ...d,
    weeklyFlexibleLimit,
    spendBeforeToday: before,
    spendToday: today,
    daysRemainingIncludingToday,
    daysRemainingAfterToday: Math.max(0, daysRemainingIncludingToday - 1),
    envelopeSpent: { essentials: ess, fun },
    envelopeRemaining: {
      essentials: plan.essentialsLimit + emergencyRelief - ess,
      fun: plan.funLimit - fun,
    },
    emergencyRelief,
    status,
    weekStart: start,
  };
}
