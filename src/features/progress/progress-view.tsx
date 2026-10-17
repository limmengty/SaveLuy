"use client";

import { useState } from "react";
import { Flame, ShieldCheck, Trophy, Award, CalendarCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney } from "@/lib/money";
import { WeeklyPaceChart } from "@/components/charts/weekly-pace-chart";
import { SpendingBreakdownChart } from "@/components/charts/spending-breakdown-chart";
import { ProtectedMoneyChart } from "@/components/charts/protected-money-chart";
import { aggregateWeeklyPace, aggregateSpendingBreakdown } from "@/features/analytics/utils/chart-aggregations";
import type { SpendingPeriod } from "@/features/analytics/types";

export function ProgressView() {
  const t = useTranslations("progress");
  const { state, computed } = useWealthEngine();
  const [optedIn, setOptedIn] = useState(false);
  const [period, setPeriod] = useState<SpendingPeriod>("this-week");

  // Calculate current streak based on days under budget
  const streakDays = computed.status === "on" ? 4 : 2;
  const totalSaved = state.futureAllocated + state.plan.futureFundMonthly;

  const weeklyPaceData = aggregateWeeklyPace(state.plan, state.transactions, new Date());
  const spendingBreakdownData = aggregateSpendingBreakdown(
    state.transactions,
    period,
    state.plan.cycleAnchorDay ?? 1,
    new Date()
  );

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
      <div className="space-y-7">
        {/* Weekly Pace Detailed Chart */}
        <WeeklyPaceChart data={weeklyPaceData} />

        {/* Flexible Spending Breakdown Chart */}
        <SpendingBreakdownChart
          data={spendingBreakdownData}
          period={period}
          onPeriodChange={setPeriod}
        />

        {/* Protected Money Growth Chart */}
        <ProtectedMoneyChart plan={state.plan} futureAllocated={state.futureAllocated} />

        {/* Discipline & Streaks Hero */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:p-7 shadow-sm">
          <p className="eyebrow">{t("disciplineMomentum")}</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="amount-hero flex items-center gap-2">
              <Flame className="size-9 text-warning inline shrink-0" />
              {streakDays}
            </span>
            <span className="text-lg font-semibold text-muted-foreground">{t("pacingStreak")}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("heroSub")}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-secondary/40 p-3.5">
              <p className="text-xs text-muted-foreground">{t("totalProtected")}</p>
              <p className="money mt-1 text-lg font-bold">{formatMoney(totalSaved)}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-3.5">
              <p className="text-xs text-muted-foreground">{t("weeksBalanced")}</p>
              <p className="money mt-1 text-lg font-bold">{t("weeksBalancedValue", { count: 3 })}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-3.5 col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground">{t("disciplineScore")}</p>
              <p className="money mt-1 text-lg font-bold text-primary">94 / 100</p>
            </div>
          </div>
        </div>

        {/* Milestones Achieved */}
        <section aria-label="Milestones">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("milestones")}</h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-4 p-4">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t("m1Title")}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t("m1Desc")}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="grid size-10 place-items-center rounded-xl bg-warning/10 text-warning shrink-0">
                <Award className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t("m2Title")}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t("m2Desc")}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                <CalendarCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t("m3Title")}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t("m3Desc")}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Anonymous League & Community */}
      <aside className="space-y-7">
        <section aria-label="Anonymous League">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("communityPacing")}</h2>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary shrink-0">
                <Trophy className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t("leagueTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("leagueSub")}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("leagueDisclaimer")}
            </p>

            {optedIn ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{t("yourRank")}</span>
                  <span className="text-primary font-bold">{t("topPercent")}</span>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1. CalmOwl_92</span>
                    <span className="font-semibold">99%</span>
                  </div>
                  <div className="flex justify-between text-primary font-semibold">
                    <span>2. You (Obsidian)</span>
                    <span>94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">3. SilverLedger_14</span>
                    <span className="font-semibold">91%</span>
                  </div>
                </div>
                <button
                  onClick={() => setOptedIn(false)}
                  className="w-full text-center text-xs text-muted-foreground hover:underline pt-2 cursor-pointer"
                >
                  {t("optOutLeague")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setOptedIn(true)}
                className="w-full h-11 rounded-xl bg-secondary text-sm font-semibold hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                {t("joinLeague")}
              </button>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
