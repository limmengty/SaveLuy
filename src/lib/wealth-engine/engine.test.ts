import { describe, expect, test } from "bun:test";
import {
  daily,
  projectNextDaily,
  purchaseStatus,
  workHours,
  futureValue,
} from "./engine";

describe("Wealth Engine Calculations", () => {
  test("daily calculations with positive limit and no prior spend", () => {
    const res = daily({
      weeklyFlexibleLimit: 7000, // $70.00
      spendBeforeToday: 0,
      spendToday: 0,
      daysInPeriod: 7,
      daysRemainingIncludingToday: 7,
    });

    expect(res.baselineDaily).toBe(1000); // $10.00
    expect(res.periodRemaining).toBe(7000);
    expect(res.todayStartLimit).toBe(1000);
    expect(res.availableToday).toBe(1000);
  });

  test("daily calculations after spending earlier in the week", () => {
    // 3 days elapsed, $3000 spent before today out of $7000, 4 days remaining
    const res = daily({
      weeklyFlexibleLimit: 7000,
      spendBeforeToday: 3000,
      spendToday: 500,
      daysInPeriod: 7,
      daysRemainingIncludingToday: 4,
    });

    // Start of day remaining = 4000. 4000 / 4 days = 1000.
    // todayStartLimit = min(baseline 1000, pace 1000) = 1000.
    // availableToday = 1000 - 500 = 500.
    expect(res.baselineDaily).toBe(1000);
    expect(res.todayStartLimit).toBe(1000);
    expect(res.availableToday).toBe(500);
    expect(res.confirmed).toBe(3500);
  });

  test("over-spending paces down remaining days", () => {
    // $5000 spent before today out of $7000, 4 days remaining
    const res = daily({
      weeklyFlexibleLimit: 7000,
      spendBeforeToday: 5000,
      spendToday: 0,
      daysInPeriod: 7,
      daysRemainingIncludingToday: 4,
    });

    // startOfDayRemaining = 2000. 2000 / 4 days = 500.
    // todayStartLimit = min(baseline 1000, pace 500) = 500.
    expect(res.todayStartLimit).toBe(500);
    expect(res.availableToday).toBe(500);
  });

  test("purchaseStatus classifies ON_PLAN, ADJUSTED, and NEEDS_DECISION correctly", () => {
    // Available: $10, Envelope left: $30, Period left: $50
    expect(purchaseStatus(800, 1000, 3000, 5000)).toBe("ON_PLAN");
    expect(purchaseStatus(1500, 1000, 3000, 5000)).toBe("ADJUSTED");
    expect(purchaseStatus(3500, 1000, 3000, 5000)).toBe("NEEDS_DECISION");
    expect(purchaseStatus(6000, 1000, 3000, 5000)).toBe("NEEDS_DECISION");
  });

  test("projectNextDaily calculates ripple effect of a purchase", () => {
    // Period remaining: $40.00, purchase: $10.00, baseline: $10.00, 3 days after today
    const { projectedRemaining, projectedNextDaily: nextDaily } = projectNextDaily(
      4000,
      1000,
      1000,
      3
    );
    expect(projectedRemaining).toBe(3000);
    expect(nextDaily).toBe(1000); // 3000 / 3 = 1000
  });

  test("workHours conversion", () => {
    // Monthly flexible income: $200.00, 160 hours = $1.25/hour ($125 cents/hr)
    // $2.50 purchase (250 cents) = 2.0 hours
    const hours = workHours(250, 20000, 160);
    expect(hours).toBeCloseTo(2.0, 1);
  });

  test("futureValue compound calculation", () => {
    // $100 invested at 9% for 10 years ≈ $237
    const fv = futureValue(10000, 0.09, 10);
    expect(fv).toBe(23674);
  });
});
