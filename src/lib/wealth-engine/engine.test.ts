import { describe, expect, test } from "bun:test";
import {
  daily,
  projectNextDaily,
  purchaseStatus,
  workHours,
  futureValue,
  computeToday,
  type Plan,
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

  test("computeToday factors emergencyReliefCents into spending envelopes without baseline inflation", () => {
    const { computeToday } = require("./engine");
    const plan = {
      essentialsLimit: 830, // $8.30
      funLimit: 550,        // $5.50
      homeFixedMonthly: 10000,
      futureFundMonthly: 3000,
      monthlyFlexibleIncome: 20000,
      monthlyWorkHours: 160,
      emergencyReliefCents: 5000, // $50.00 emergency relief
    };

    const res = computeToday(plan, [], new Date());
    expect(res.emergencyRelief).toBe(5000);
    // Weekly flexible limit includes relief for spending: 830 + 550 + 5000 = 6380
    expect(res.weeklyFlexibleLimit).toBe(6380);
    // Essentials envelope receives the relief credit: 830 + 5000 = 5830
    expect(res.envelopeRemaining.essentials).toBe(5830);
  });

  test("cycleAnchorDay customizes start of week and paces mid-cycle days accurately", () => {
    const plan: Plan = {
      essentialsLimit: 7000, // $70/wk
      funLimit: 3500,       // $35/wk
      homeFixedMonthly: 10000,
      futureFundMonthly: 3000,
      monthlyFlexibleIncome: 20000,
      monthlyWorkHours: 160,
      cycleAnchorDay: 5, // Friday = 5
    };

    // Simulate Saturday (1 day after Friday anchor)
    // 2026-10-17 is a Saturday (dow = 6)
    const saturday = new Date(2026, 9, 17, 10, 0, 0);
    const resSat = computeToday(plan, [], saturday);

    // Days elapsed = 1 (Friday to Saturday), days remaining including today = 6
    expect(resSat.daysRemainingIncludingToday).toBe(6);
    // Flexible limit: 7000 + 3500 = 10500
    expect(resSat.weeklyFlexibleLimit).toBe(10500);
    // Baseline daily = 10500 / 7 = 1500; paceCapacityToday = 10500 / 6 = 1750
    // todayStartLimit caps at baselineDaily (1500) so user is not prompted to overspend early in the week
    expect(resSat.baselineDaily).toBe(1500);
    expect(resSat.availableToday).toBe(1500);

    // If spending earlier was higher (e.g. $45 spent on Friday):
    // startOfDayRemaining = 10500 - 4500 = 6000
    // paceCapacityToday across 6 remaining days = 6000 / 6 = 1000
    const txFriday = [{
      id: "t1",
      amount: 4500,
      envelope: "essentials" as const,
      label: "Dinner",
      createdAt: new Date(2026, 9, 16, 20, 0, 0).toISOString(),
    }];
    const resAfterSpend = computeToday(plan, txFriday, saturday);
    expect(resAfterSpend.spendBeforeToday).toBe(4500);
    expect(resAfterSpend.daysRemainingIncludingToday).toBe(6);
    expect(resAfterSpend.availableToday).toBe(1000); // 6000 / 6 = 1000
  });
});

