/**
 * BrokeNoMore Pure Integer Minor Units Money Engine
 *
 * All monetary amounts across the system (database, domain state, calculation engine)
 * are stored as non-negative integers in minor units:
 * - USD: minor unit is 1 cent (1 USD = 100 cents).
 * - KHR: minor unit is 1 riel (whole riel, 0 fractional digits in common display).
 *
 * Normalization constant:
 * 1 Month = 52 / 12 = 4.3333333333... weeks.
 */

export type CurrencyCode = "USD" | "KHR";

export interface CurrencyMetadata {
  code: CurrencyCode;
  symbol: string;
  decimals: number;
  minorUnitName: string;
  defaultLocale: string;
  stepMinorUnits: number;
}

export const CURRENCY_REGISTRY: Record<CurrencyCode, CurrencyMetadata> = {
  USD: {
    code: "USD",
    symbol: "$",
    decimals: 2,
    minorUnitName: "cents",
    defaultLocale: "en-US",
    stepMinorUnits: 100, // $1.00
  },
  KHR: {
    code: "KHR",
    symbol: "៛",
    decimals: 0,
    minorUnitName: "riels",
    defaultLocale: "km-KH",
    stepMinorUnits: 1000, // 1000៛
  },
};

/**
 * Exact standard banking ratio: 52 weeks in a 12-month calendar year.
 */
export const WEEKS_PER_MONTH = 52 / 12; // 4.333333333333334

let activeGlobalCurrency: CurrencyCode = "USD";

export function setActiveCurrency(currency: CurrencyCode) {
  activeGlobalCurrency = currency;
}

export function getActiveCurrency(): CurrencyCode {
  return activeGlobalCurrency;
}

/**
 * Format integer minor units into a localized currency string.
 * Strictly avoids IEEE 754 float drift by using integer division and modulo.
 */
export function formatMoney(
  minorUnits: number,
  locale?: string,
  currency?: CurrencyCode | string
): string {
  if (!Number.isFinite(minorUnits)) return "$0.00";

  const targetCurrency: CurrencyCode =
    currency === "KHR" || (!currency && activeGlobalCurrency === "KHR")
      ? "KHR"
      : "USD";

  const meta = CURRENCY_REGISTRY[targetCurrency];
  const targetLocale =
    locale || (targetCurrency === "KHR" ? "km-KH" : "en-US");

  const isNegative = minorUnits < 0;
  const absUnits = Math.round(Math.abs(minorUnits));

  if (targetCurrency === "KHR") {
    // KHR uses 0 decimals
    const formatted = absUnits.toLocaleString(targetLocale, {
      style: "currency",
      currency: "KHR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
    return isNegative ? `−${formatted}` : formatted;
  }

  // USD: exactly 2 decimals
  const major = Math.floor(absUnits / 100);
  const minor = absUnits % 100;
  const decimalPart = minor.toString().padStart(2, "0");

  const majorFormatted = major.toLocaleString(targetLocale);
  const formatted = `$${majorFormatted}.${decimalPart}`;

  return isNegative ? `−${formatted}` : formatted;
}

/**
 * Parses user text input into exact integer minor units (cents)
 * WITHOUT using parseFloat(val) * 100.
 *
 * Examples:
 * "200" -> 20000 cents
 * "200.5" -> 20050 cents
 * "200.55" -> 20055 cents
 * "0.01" -> 1 cent
 * "1,500.00" -> 150000 cents
 * "$200" -> 20000 cents
 */
export function parseMoneyInputToCents(
  val: string,
  currency: CurrencyCode = activeGlobalCurrency
): number {
  if (!val || typeof val !== "string") return 0;

  // Clean out commas, spaces, currency symbols
  const cleaned = val.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;

  if (currency === "KHR") {
    // KHR has no fractional cents in common usage; parse integer directly
    const integerPart = cleaned.split(".")[0];
    const parsed = parseInt(integerPart, 10);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  // USD parsing: split on decimal point
  const parts = cleaned.split(".");
  const dollarsStr = parts[0] || "0";
  const centsStr = parts[1] || "";

  const dollars = parseInt(dollarsStr, 10) || 0;
  // Take at most 2 digits from cents portion; pad with trailing zero if single digit
  const normalizedCentsStr = centsStr.slice(0, 2).padEnd(2, "0");
  const cents = parseInt(normalizedCentsStr, 10) || 0;

  const totalCents = dollars * 100 + cents;

  // Bound check: max 100 million dollars ($100,000,000.00 = 10,000,000,000 cents)
  return Math.min(10_000_000_000, Math.max(0, totalCents));
}

/**
 * Converts stored minor units (cents) to a clean string suitable for an HTML input value.
 * Example: 20000 cents -> "200.00"
 */
export function centsToInputValue(
  cents: number,
  currency: CurrencyCode = activeGlobalCurrency
): string {
  if (!Number.isFinite(cents) || cents <= 0) return "";

  if (currency === "KHR") {
    return Math.round(cents).toString();
  }

  const absUnits = Math.round(cents);
  const major = Math.floor(absUnits / 100);
  const minor = absUnits % 100;
  return `${major}.${minor.toString().padStart(2, "0")}`;
}

/**
 * Normalizes a weekly minor unit amount to its equivalent monthly amount
 * using the standard banking constant (52 / 12 weeks/month).
 */
export function weeklyToMonthlyEquivalent(weeklyCents: number): number {
  return Math.round(weeklyCents * WEEKS_PER_MONTH);
}

/**
 * Converts a monthly minor unit allocation to a weekly ceiling.
 */
export function monthlyToWeeklyEquivalent(monthlyCents: number): number {
  return Math.floor(monthlyCents / WEEKS_PER_MONTH);
}

/**
 * Core Financial Invariant: Plan Feasibility Equation
 *
 * Evaluates whether a proposed plan is mathematically balanced, has surplus, or is overallocated.
 */
export interface PlanFeasibility {
  monthlyIncome: number;
  protectedMonthly: number;
  weeklyFlexibleTotal: number;
  weeklyFlexibleMonthlyEquivalent: number;
  totalMonthlyCommitment: number;
  unallocatedBufferMonthly: number;
  isOverallocated: boolean;
  shortfallMonthly: number;
  status: "balanced" | "unallocated" | "overallocated";
}

export function evaluatePlanFeasibility(plan: {
  monthlyIncome: number;
  homeFixedMonthly: number;
  futureFundMonthly: number;
  essentialsLimitWeekly: number;
  funLimitWeekly: number;
}): PlanFeasibility {
  const monthlyIncome = Math.max(0, Math.round(plan.monthlyIncome));
  const protectedMonthly = Math.max(
    0,
    Math.round(plan.homeFixedMonthly + plan.futureFundMonthly)
  );
  const weeklyFlexibleTotal = Math.max(
    0,
    Math.round(plan.essentialsLimitWeekly + plan.funLimitWeekly)
  );

  const weeklyFlexibleMonthlyEquivalent = weeklyToMonthlyEquivalent(weeklyFlexibleTotal);
  const totalMonthlyCommitment = protectedMonthly + weeklyFlexibleMonthlyEquivalent;

  const unallocatedBufferMonthly = monthlyIncome - totalMonthlyCommitment;
  const isOverallocated = unallocatedBufferMonthly < 0;
  const shortfallMonthly = isOverallocated ? Math.abs(unallocatedBufferMonthly) : 0;

  let status: PlanFeasibility["status"] = "balanced";
  if (isOverallocated) {
    status = "overallocated";
  } else if (unallocatedBufferMonthly > 0) {
    status = "unallocated";
  }

  return {
    monthlyIncome,
    protectedMonthly,
    weeklyFlexibleTotal,
    weeklyFlexibleMonthlyEquivalent,
    totalMonthlyCommitment,
    unallocatedBufferMonthly,
    isOverallocated,
    shortfallMonthly,
    status,
  };
}
