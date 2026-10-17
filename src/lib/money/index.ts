/**
 * SaveLuy Pure Integer Minor Units Money Engine
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

export const DEFAULT_KHR_EXCHANGE_RATE = 4000; // 4000 KHR = $1 USD (100 cents)

let activeGlobalCurrency: CurrencyCode = "USD";
let activeKhrExchangeRate: number = DEFAULT_KHR_EXCHANGE_RATE;

export function setActiveCurrency(currency: CurrencyCode) {
  activeGlobalCurrency = currency;
}

export function getActiveCurrency(): CurrencyCode {
  return activeGlobalCurrency;
}

export function setActiveExchangeRate(rate: number) {
  if (rate > 0) activeKhrExchangeRate = rate;
}

export function getActiveExchangeRate(): number {
  return activeKhrExchangeRate;
}

/**
 * Format integer minor units (stored in USD cents) into a localized currency string.
 * When currency is KHR, converts USD cents to Cambodian Riels using the exchange rate:
 * riels = round((cents / 100) * exchangeRate).
 */
export function formatMoney(
  minorUnits: number,
  locale?: string,
  currency?: CurrencyCode | string,
  exchangeRate: number = activeKhrExchangeRate
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
    // Convert USD cents to Cambodian Riels: (cents / 100) * exchangeRate
    const riels = Math.round((absUnits / 100) * exchangeRate);
    const formatted = riels.toLocaleString(targetLocale, {
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
 * Parses user text input into canonical integer cents (USD).
 * If user enters input in KHR (e.g. 20,000 Riels), converts back to USD cents:
 * cents = round((riels / exchangeRate) * 100)
 */
export function parseMoneyInputToCents(
  val: string,
  currency: CurrencyCode = activeGlobalCurrency,
  exchangeRate: number = activeKhrExchangeRate
): number {
  if (!val || typeof val !== "string") return 0;

  // Clean out commas, spaces, currency symbols
  const cleaned = val.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;

  if (currency === "KHR") {
    // User typed Cambodian Riels directly (e.g. "80000" or "80,000")
    const integerPart = cleaned.split(".")[0];
    const riels = parseInt(integerPart, 10);
    if (!Number.isFinite(riels) || riels <= 0) return 0;
    // Convert Riels to USD cents
    const rate = exchangeRate > 0 ? exchangeRate : DEFAULT_KHR_EXCHANGE_RATE;
    const cents = Math.round((riels / rate) * 100);
    return Math.min(10_000_000_000, Math.max(0, cents));
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
 * Converts stored minor units (USD cents) to a clean string suitable for an HTML input value.
 * In USD: 2076 cents -> "20.76"
 * In KHR: 2076 cents -> (2076 / 100) * 4000 = 83040 -> "83040"
 */
export function centsToInputValue(
  cents: number,
  currency: CurrencyCode = activeGlobalCurrency,
  exchangeRate: number = activeKhrExchangeRate
): string {
  if (!Number.isFinite(cents) || cents <= 0) return "";

  if (currency === "KHR") {
    const rate = exchangeRate > 0 ? exchangeRate : DEFAULT_KHR_EXCHANGE_RATE;
    const riels = Math.round((cents / 100) * rate);
    return riels.toString();
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
