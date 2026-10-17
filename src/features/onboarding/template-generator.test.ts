import { describe, expect, it } from "bun:test";
import { generateTemplatesForIncome } from "./template-generator";
import { evaluatePlanFeasibility } from "@/lib/money";

describe("Template Generator — Dynamic & Feasible Allocations", () => {
  it("generates 100% feasible, non-overallocated templates for $200 income", () => {
    const templates = generateTemplatesForIncome(20000); // $200.00
    expect(templates.length).toBe(3);

    for (const t of templates) {
      const feasibility = evaluatePlanFeasibility({
        monthlyIncome: 20000,
        homeFixedMonthly: t.homeFixedMonthly,
        futureFundMonthly: t.futureFundMonthly,
        essentialsLimitWeekly: t.essentialsWeekly,
        funLimitWeekly: t.funWeekly,
      });

      expect(feasibility.isOverallocated).toBe(false);
      expect(feasibility.totalMonthlyCommitment).toBeLessThanOrEqual(20000);
    }
  });

  it("scales templates proportionately for higher incomes ($3,000 / mo)", () => {
    const templates = generateTemplatesForIncome(300000); // $3,000.00
    for (const t of templates) {
      const feasibility = evaluatePlanFeasibility({
        monthlyIncome: 300000,
        homeFixedMonthly: t.homeFixedMonthly,
        futureFundMonthly: t.futureFundMonthly,
        essentialsLimitWeekly: t.essentialsWeekly,
        funLimitWeekly: t.funWeekly,
      });

      expect(feasibility.isOverallocated).toBe(false);
      expect(feasibility.totalMonthlyCommitment).toBeLessThanOrEqual(300000);
      expect(t.homeFixedMonthly).toBeGreaterThan(100000); // at least $1,000
    }
  });
});
