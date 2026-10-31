/**
 * Split-Tender and Cash Change Calculation Engine for SaveLuy
 * 
 * In Cambodia's dual-currency cash and KHQR economy, transactions frequently involve:
 * - Paying in USD and receiving change in KHR (or mixed USD + KHR).
 * - Paying in KHR (e.g. 20,000 Riels) for a USD price ($4.50).
 * - Scanning a KHQR code priced in KHR for a user whose plan is paced in USD.
 * 
 * All internal SaveLuy calculations remain strictly integer USD cents.
 */

import { DEFAULT_KHR_EXCHANGE_RATE } from "./index";

export interface SplitTenderInput {
  billCents: number; // Stated purchase price in USD cents
  tenderedUsdCents?: number; // Total USD cash/card paid (in cents)
  tenderedKhr?: number; // Total KHR paid (in whole riels)
  changeUsdCents?: number; // USD change returned to user (in cents)
  changeKhr?: number; // KHR change returned to user (in whole riels)
  exchangeRate?: number; // e.g. 4000 KHR = $1 USD
}

export interface SplitTenderResult {
  billCents: number;
  totalTenderedCents: number;
  totalChangeCents: number;
  netPaidCents: number;
  differenceCents: number; // netPaidCents - billCents (should be 0 when balanced)
  isBalanced: boolean;
  tenderedKhrEquivalentCents: number;
  changeKhrEquivalentCents: number;
}

/**
 * Converts whole Cambodian Riels to USD cents using integer rounding.
 * Formula: round((riels / exchangeRate) * 100)
 */
export function khrToUsdCents(riels: number, exchangeRate: number = DEFAULT_KHR_EXCHANGE_RATE): number {
  if (!Number.isFinite(riels) || riels <= 0) return 0;
  const rate = exchangeRate > 0 ? exchangeRate : DEFAULT_KHR_EXCHANGE_RATE;
  return Math.round((riels / rate) * 100);
}

/**
 * Converts USD cents to whole Cambodian Riels using integer rounding.
 * Formula: round((cents / 100) * exchangeRate)
 */
export function usdCentsToKhr(cents: number, exchangeRate: number = DEFAULT_KHR_EXCHANGE_RATE): number {
  if (!Number.isFinite(cents) || cents <= 0) return 0;
  const rate = exchangeRate > 0 ? exchangeRate : DEFAULT_KHR_EXCHANGE_RATE;
  return Math.round((cents / 100) * rate);
}

/**
 * Calculates net cash paid and validates change given in dual currency.
 */
export function calculateSplitTender(input: SplitTenderInput): SplitTenderResult {
  const rate = input.exchangeRate && input.exchangeRate > 0 ? input.exchangeRate : DEFAULT_KHR_EXCHANGE_RATE;
  const billCents = Math.max(0, Math.round(input.billCents || 0));

  const tenderedUsdCents = Math.max(0, Math.round(input.tenderedUsdCents || 0));
  const tenderedKhr = Math.max(0, Math.round(input.tenderedKhr || 0));
  const tenderedKhrEquivalentCents = khrToUsdCents(tenderedKhr, rate);
  const totalTenderedCents = tenderedUsdCents + tenderedKhrEquivalentCents;

  const changeUsdCents = Math.max(0, Math.round(input.changeUsdCents || 0));
  const changeKhr = Math.max(0, Math.round(input.changeKhr || 0));
  const changeKhrEquivalentCents = khrToUsdCents(changeKhr, rate);
  const totalChangeCents = changeUsdCents + changeKhrEquivalentCents;

  const netPaidCents = Math.max(0, totalTenderedCents - totalChangeCents);
  const differenceCents = netPaidCents - billCents;
  const isBalanced = Math.abs(differenceCents) === 0;

  return {
    billCents,
    totalTenderedCents,
    totalChangeCents,
    netPaidCents,
    differenceCents,
    isBalanced,
    tenderedKhrEquivalentCents,
    changeKhrEquivalentCents,
  };
}

/**
 * Suggests standard change combinations for a given bill and cash payment in Cambodia.
 * E.g., Bill: $3.50 (350 cents), Tendered: $10 (1000 cents).
 * Change needed: $6.50 (650 cents).
 * Common Cambodian return: $6.00 in USD bills + 2,000 KHR note (assuming 4,000 rate).
 */
export function suggestChangeBreakdown(
  changeDueCents: number,
  exchangeRate: number = DEFAULT_KHR_EXCHANGE_RATE
): { usdCents: number; khr: number } {
  if (changeDueCents <= 0) return { usdCents: 0, khr: 0 };
  const rate = exchangeRate > 0 ? exchangeRate : DEFAULT_KHR_EXCHANGE_RATE;

  // In Cambodia, USD coins do not circulate; only paper USD bills >= $1.
  // Any fractional dollar change (< 100 cents) is almost always returned in KHR.
  const wholeDollars = Math.floor(changeDueCents / 100);
  const fractionalCents = changeDueCents % 100;

  const usdCents = wholeDollars * 100;
  const khr = usdCentsToKhr(fractionalCents, rate);

  return { usdCents, khr };
}
