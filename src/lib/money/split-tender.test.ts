import { describe, expect, it } from "bun:test";
import {
  calculateSplitTender,
  khrToUsdCents,
  suggestChangeBreakdown,
  usdCentsToKhr,
} from "./split-tender";

describe("Split-Tender & Cambodian Dual-Currency Engine", () => {
  it("converts Cambodian Riels to USD cents accurately", () => {
    // At standard 4000 KHR = $1 (100 cents):
    // 4000 KHR -> 100 cents
    expect(khrToUsdCents(4000, 4000)).toBe(100);
    // 20000 KHR -> 500 cents ($5.00)
    expect(khrToUsdCents(20000, 4000)).toBe(500);
    // 2000 KHR -> 50 cents ($0.50)
    expect(khrToUsdCents(2000, 4000)).toBe(50);
    // At custom rate 4100 KHR = $1:
    // 41000 KHR -> 1000 cents ($10.00)
    expect(khrToUsdCents(41000, 4100)).toBe(1000);
  });

  it("converts USD cents to Cambodian Riels accurately", () => {
    // 100 cents ($1.00) at 4000 rate -> 4000 KHR
    expect(usdCentsToKhr(100, 4000)).toBe(4000);
    // 50 cents ($0.50) at 4000 rate -> 2000 KHR
    expect(usdCentsToKhr(50, 4000)).toBe(2000);
    // 150 cents ($1.50) at 4000 rate -> 6000 KHR
    expect(usdCentsToKhr(150, 4000)).toBe(6000);
  });

  it("calculates realistic Cambodian register transaction: $10 USD paid for $3.50 bill with $6 USD + 2000 KHR change", () => {
    // Bill: $3.50 (350 cents)
    // Tendered: $10.00 (1000 cents) USD
    // Change: $6.00 (600 cents) USD + 2,000 KHR (50 cents USD)
    const result = calculateSplitTender({
      billCents: 350,
      tenderedUsdCents: 1000,
      tenderedKhr: 0,
      changeUsdCents: 600,
      changeKhr: 2000,
      exchangeRate: 4000,
    });

    expect(result.totalTenderedCents).toBe(1000);
    expect(result.changeKhrEquivalentCents).toBe(50);
    expect(result.totalChangeCents).toBe(650);
    expect(result.netPaidCents).toBe(350);
    expect(result.differenceCents).toBe(0);
    expect(result.isBalanced).toBe(true);
  });

  it("calculates KHR cash payment: 20,000 KHR paid for $4.25 bill with 3,000 KHR change", () => {
    // Bill: $4.25 (425 cents)
    // Tendered: 20,000 KHR = $5.00 (500 cents)
    // Change: 3,000 KHR = $0.75 (75 cents)
    const result = calculateSplitTender({
      billCents: 425,
      tenderedUsdCents: 0,
      tenderedKhr: 20000,
      changeUsdCents: 0,
      changeKhr: 3000,
      exchangeRate: 4000,
    });

    expect(result.totalTenderedCents).toBe(500);
    expect(result.totalChangeCents).toBe(75);
    expect(result.netPaidCents).toBe(425);
    expect(result.isBalanced).toBe(true);
  });

  it("suggests standard Cambodian change breakdown (whole USD + fractional KHR notes)", () => {
    // Change due: $6.50 (650 cents)
    // In Cambodia: $6.00 USD paper bill + 2,000 KHR note ($0.50 * 4000 = 2000)
    const breakdown = suggestChangeBreakdown(650, 4000);
    expect(breakdown.usdCents).toBe(600);
    expect(breakdown.khr).toBe(2000);

    // Change due: $0.75 (75 cents)
    // $0 USD + 3,000 KHR
    const smallBreakdown = suggestChangeBreakdown(75, 4000);
    expect(smallBreakdown.usdCents).toBe(0);
    expect(smallBreakdown.khr).toBe(3000);
  });
});
