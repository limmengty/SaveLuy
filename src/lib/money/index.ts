/**
 * Format integer minor units (cents) into a localized currency string.
 * Automatically synchronizes with the active user preference currency (USD or KHR).
 */

let activeGlobalCurrency: "USD" | "KHR" = "USD";

export function setActiveCurrency(currency: "USD" | "KHR") {
  activeGlobalCurrency = currency;
}

export function getActiveCurrency(): "USD" | "KHR" {
  return activeGlobalCurrency;
}

export function formatMoney(
  cents: number,
  locale?: string,
  currency?: "USD" | "KHR" | string
): string {
  const isNegative = cents < 0;
  const abs = Math.abs(cents);
  const targetCurrency = (currency as "USD" | "KHR") || activeGlobalCurrency || "USD";
  const targetLocale = locale || (targetCurrency === "KHR" ? "km-KH" : "en-US");

  const formatted = (abs / 100).toLocaleString(targetLocale, {
    style: "currency",
    currency: targetCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isNegative ? `−${formatted}` : formatted;
}

export function parseMoneyInputToCents(val: string): number {
  const sanitized = val.replace(/[^0-9.]/g, "");
  const num = parseFloat(sanitized);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.round(num * 100));
}

export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}
