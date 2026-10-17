import { WEEKS_PER_MONTH } from "@/lib/money";

export interface GeneratedTemplate {
  id: "balanced_starter" | "safety_first" | "flex_forward";
  title: string;
  badge?: string;
  desc: string;
  essentialsWeekly: number; // integer cents
  funWeekly: number;        // integer cents
  homeFixedMonthly: number; // integer cents
  futureFundMonthly: number;// integer cents
  unallocatedBuffer: number;// integer cents
}

/**
 * Generates three balanced, feasible planning templates scaled directly
 * to the user's declared monthly income.
 *
 * All allocations strictly obey:
 * Fixed + Future + (Essentials + Fun) * (52 / 12) <= Monthly Income
 */
export function generateTemplatesForIncome(monthlyIncomeCents: number): GeneratedTemplate[] {
  const income = Math.max(100, Math.round(monthlyIncomeCents));

  // 1. Balanced Starter (Recommended)
  // 50% Fixed, 15% Future, 18% Essentials (monthly), 12% Fun (monthly), 5% buffer
  const fixed1 = Math.round(income * 0.50);
  const future1 = Math.round(income * 0.15);
  const essentials1Monthly = Math.round(income * 0.18);
  const fun1Monthly = Math.round(income * 0.12);
  const essentials1Weekly = Math.max(100, Math.floor(essentials1Monthly / WEEKS_PER_MONTH));
  const fun1Weekly = Math.max(100, Math.floor(fun1Monthly / WEEKS_PER_MONTH));
  const commit1 = fixed1 + future1 + Math.round((essentials1Weekly + fun1Weekly) * WEEKS_PER_MONTH);
  const buffer1 = Math.max(0, income - commit1);

  // 2. Safety First / Low Buffer
  // 55% Fixed, 20% Future, 14% Essentials (monthly), 6% Fun (monthly), 5% buffer
  const fixed2 = Math.round(income * 0.55);
  const future2 = Math.round(income * 0.20);
  const essentials2Monthly = Math.round(income * 0.14);
  const fun2Monthly = Math.round(income * 0.06);
  const essentials2Weekly = Math.max(100, Math.floor(essentials2Monthly / WEEKS_PER_MONTH));
  const fun2Weekly = Math.max(50, Math.floor(fun2Monthly / WEEKS_PER_MONTH));
  const commit2 = fixed2 + future2 + Math.round((essentials2Weekly + fun2Weekly) * WEEKS_PER_MONTH);
  const buffer2 = Math.max(0, income - commit2);

  // 3. Flex Forward
  // 40% Fixed, 10% Future, 25% Essentials (monthly), 20% Fun (monthly), 5% buffer
  const fixed3 = Math.round(income * 0.40);
  const future3 = Math.round(income * 0.10);
  const essentials3Monthly = Math.round(income * 0.25);
  const fun3Monthly = Math.round(income * 0.20);
  const essentials3Weekly = Math.max(100, Math.floor(essentials3Monthly / WEEKS_PER_MONTH));
  const fun3Weekly = Math.max(100, Math.floor(fun3Monthly / WEEKS_PER_MONTH));
  const commit3 = fixed3 + future3 + Math.round((essentials3Weekly + fun3Weekly) * WEEKS_PER_MONTH);
  const buffer3 = Math.max(0, income - commit3);

  return [
    {
      id: "balanced_starter",
      title: "Balanced Starter",
      badge: "Recommended",
      desc: "Predictable routine expenses with a dedicated weekly fun budget.",
      essentialsWeekly: essentials1Weekly,
      funWeekly: fun1Weekly,
      homeFixedMonthly: fixed1,
      futureFundMonthly: future1,
      unallocatedBuffer: buffer1,
    },
    {
      id: "safety_first",
      title: "Safety First / Low Buffer",
      desc: "Maximizes protected home commitments and emergency buffer first.",
      essentialsWeekly: essentials2Weekly,
      funWeekly: fun2Weekly,
      homeFixedMonthly: fixed2,
      futureFundMonthly: future2,
      unallocatedBuffer: buffer2,
    },
    {
      id: "flex_forward",
      title: "Flex Forward",
      desc: "Higher weekly allowance for active transit, social, and day-to-day needs.",
      essentialsWeekly: essentials3Weekly,
      funWeekly: fun3Weekly,
      homeFixedMonthly: fixed3,
      futureFundMonthly: future3,
      unallocatedBuffer: buffer3,
    },
  ];
}
