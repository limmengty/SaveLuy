import { describe, expect, it } from "bun:test";
import {
  formatMoney,
  parseMoneyInputToCents,
  centsToInputValue,
  weeklyToMonthlyEquivalent,
  evaluatePlanFeasibility,
} from "./index";

describe("Money Module — Minor Units & Financial Invariants", () => {
  it("parses user input strings without float IEEE 754 precision errors", () => {
    expect(parseMoneyInputToCents("200")).toBe(20000);
    expect(parseMoneyInputToCents("200.00")).toBe(20000);
    expect(parseMoneyInputToCents("200.5")).toBe(20050);
    expect(parseMoneyInputToCents("200.55")).toBe(20055);
    expect(parseMoneyInputToCents("0.01")).toBe(1);
    expect(parseMoneyInputToCents("19.99")).toBe(1999);
    expect(parseMoneyInputToCents("$1,500.25")).toBe(150025);
    expect(parseMoneyInputToCents("")).toBe(0);
    expect(parseMoneyInputToCents("invalid")).toBe(0);
  });

  it("formats integer cents accurately into localized currency strings", () => {
    expect(formatMoney(20000, "en-US", "USD")).toBe("$200.00");
    expect(formatMoney(1, "en-US", "USD")).toBe("$0.01");
    expect(formatMoney(1999, "en-US", "USD")).toBe("$19.99");
    expect(formatMoney(-500, "en-US", "USD")).toBe("−$5.00");
  });

  it("converts integer cents back to clean HTML input values", () => {
    expect(centsToInputValue(20000)).toBe("200.00");
    expect(centsToInputValue(1999)).toBe("19.99");
    expect(centsToInputValue(50)).toBe("0.50");
    expect(centsToInputValue(0)).toBe("");
  });

  it("normalizes weekly flexible spending to monthly equivalent using 52/12 ratio", () => {
    // $50 weekly = 5000 cents
    // 5000 * (52 / 12) = 21666.666... -> rounds to 21667 ($216.67)
    expect(weeklyToMonthlyEquivalent(5000)).toBe(21667);
  });

  it("detects the $200 income vs $160 protected + $50 weekly overallocation as IMPOSSIBLE", () => {
    // Declared monthly income: $200.00 (20000 cents)
    // Protected: Fixed $120.00 (12000) + Future $40.00 (4000) = $160.00 (16000 cents)
    // Weekly flexible: Essentials $30.00 (3000) + Fun $20.00 (2000) = $50.00 (5000 cents)
    const result = evaluatePlanFeasibility({
      monthlyIncome: 20000,
      homeFixedMonthly: 12000,
      futureFundMonthly: 4000,
      essentialsLimitWeekly: 3000,
      funLimitWeekly: 2000,
    });

    expect(result.isOverallocated).toBe(true);
    expect(result.status).toBe("overallocated");
    // $160 + $216.67 = $376.67 commitment against $200 income -> $176.67 shortfall (17667 cents)
    expect(result.totalMonthlyCommitment).toBe(37667);
    expect(result.shortfallMonthly).toBe(17667);
  });

  it("approves a properly balanced plan within declared income", () => {
    // Declared monthly income: $200.00 (20000 cents)
    // Protected: Fixed $80.00 (8000) + Future $20.00 (2000) = $100.00 (10000 cents)
    // Weekly flexible: Essentials $12.00 (1200) + Fun $8.00 (800) = $20.00 (2000 cents)
    // $20/wk * 4.3333 = $86.67/mo (8667 cents)
    // Total commitment = $100.00 + $86.67 = $186.67 <= $200.00 -> $13.33 unallocated buffer
    const result = evaluatePlanFeasibility({
      monthlyIncome: 20000,
      homeFixedMonthly: 8000,
      futureFundMonthly: 2000,
      essentialsLimitWeekly: 1200,
      funLimitWeekly: 800,
    });

    expect(result.isOverallocated).toBe(false);
    expect(result.status).toBe("unallocated");
    expect(result.unallocatedBufferMonthly).toBe(1333);
    expect(result.shortfallMonthly).toBe(0);
  });
});
