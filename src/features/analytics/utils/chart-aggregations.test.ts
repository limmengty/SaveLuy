import { describe, expect, test } from "bun:test";
import {
  aggregateWeeklyPace,
  aggregateEnvelopeUsage,
  aggregateSpendingBreakdown,
} from "./chart-aggregations";
import type { Plan, Transaction } from "@/lib/wealth-engine/engine";

describe("Chart Aggregations & Financial Invariants", () => {
  const plan: Plan = {
    essentialsLimit: 7000, // $70/wk
    funLimit: 3500,       // $35/wk
    homeFixedMonthly: 10000,
    futureFundMonthly: 3000,
    monthlyFlexibleIncome: 20000,
    monthlyWorkHours: 160,
    cycleAnchorDay: 1, // Monday
  };

  test("aggregateWeeklyPace produces exact 7 points and respects plan budget", () => {
    const monday = new Date(2026, 9, 12, 10, 0, 0); // Monday Oct 12 2026
    const paceData = aggregateWeeklyPace(plan, [], monday, "en-US");

    expect(paceData.points.length).toBe(7);
    expect(paceData.weeklyFlexibleLimitCents).toBe(10500); // 7000 + 3500
    expect(paceData.totalSpentCents).toBe(0);
    expect(paceData.remainingCents).toBe(10500);
    expect(paceData.status).toBe("ON_PLAN");
  });

  test("aggregateEnvelopeUsage reconciles with spending invariants and excludes reversals", () => {
    const monday = new Date(2026, 9, 12, 10, 0, 0);
    const txs: Transaction[] = [
      {
        id: "tx-1",
        amount: 2500,
        envelope: "essentials",
        label: "Groceries",
        createdAt: new Date(2026, 9, 12, 12, 0, 0).toISOString(),
      },
      {
        id: "tx-2",
        amount: 1500,
        envelope: "fun",
        label: "Coffee",
        createdAt: new Date(2026, 9, 12, 14, 0, 0).toISOString(),
      },
      {
        id: "tx-reversed",
        amount: 5000,
        envelope: "fun",
        label: "Accidental Charge",
        createdAt: new Date(2026, 9, 12, 15, 0, 0).toISOString(),
        reversed: true, // Must be excluded
      },
    ];

    const envelopes = aggregateEnvelopeUsage(plan, txs, monday);
    const essentials = envelopes.find((e) => e.envelopeId === "essentials")!;
    const fun = envelopes.find((e) => e.envelopeId === "fun")!;

    expect(essentials.spentCents).toBe(2500);
    expect(essentials.remainingCents).toBe(4500); // 7000 - 2500
    expect(essentials.isOverLimit).toBe(false);

    expect(fun.spentCents).toBe(1500); // 5000 reversed excluded
    expect(fun.remainingCents).toBe(2000); // 3500 - 1500
    expect(fun.isOverLimit).toBe(false);
  });

  test("aggregateSpendingBreakdown correctly groups by envelope and computes percentages", () => {
    const monday = new Date(2026, 9, 12, 10, 0, 0);
    const txs: Transaction[] = [
      {
        id: "tx-1",
        amount: 3000,
        envelope: "essentials",
        label: "Groceries",
        createdAt: new Date(2026, 9, 12, 12, 0, 0).toISOString(),
      },
      {
        id: "tx-2",
        amount: 1000,
        envelope: "fun",
        label: "Snacks",
        createdAt: new Date(2026, 9, 12, 14, 0, 0).toISOString(),
      },
    ];

    const breakdown = aggregateSpendingBreakdown(txs, "this-week", 1, monday);
    expect(breakdown.totalSpentCents).toBe(4000);

    const ess = breakdown.points.find((p) => p.envelopeId === "essentials")!;
    const fun = breakdown.points.find((p) => p.envelopeId === "fun")!;

    expect(ess.amountCents).toBe(3000);
    expect(ess.percentageOfFlexibleSpend).toBe(75); // 3000 / 4000 * 100

    expect(fun.amountCents).toBe(1000);
    expect(fun.percentageOfFlexibleSpend).toBe(25); // 1000 / 4000 * 100
  });
});
