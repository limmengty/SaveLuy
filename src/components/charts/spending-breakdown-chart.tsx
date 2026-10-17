"use client";

import { useMemo } from "react";
import { formatMoney } from "@/lib/money";
import { ChartCard } from "./chart-card";
import { AccessibleChartTable } from "./accessible-chart-table";
import { cn } from "@/lib/utils";
import type { SpendingBreakdownData, SpendingPeriod } from "@/features/analytics/types";

import { useTranslations } from "next-intl";

interface SpendingBreakdownChartProps {
  data: SpendingBreakdownData;
  period: SpendingPeriod;
  onPeriodChange: (p: SpendingPeriod) => void;
}

export function SpendingBreakdownChart({ data, period, onPeriodChange }: SpendingBreakdownChartProps) {
  const t = useTranslations("charts");

  const periodLabels: Record<SpendingPeriod, string> = {
    "this-week": t("thisWeek"),
    "last-week": t("lastWeek"),
    "this-month": t("thisMonth"),
  };

  const interpretation = useMemo(() => {
    if (data.totalSpentCents === 0) {
      return `No flexible purchases recorded in ${periodLabels[period].toLowerCase()}.`;
    }
    const maxCategory = [...data.points].sort((a, b) => b.amountCents - a.amountCents)[0];
    return `Most flexible spending went to ${maxCategory.name}: ${formatMoney(maxCategory.amountCents)}, or ${maxCategory.percentageOfFlexibleSpend}%.`;
  }, [data, period, periodLabels]);

  const accessibleSummary = `${interpretation} Total flexible spending: ${formatMoney(data.totalSpentCents)}.`;

  const tableHeaders = ["Category", "Amount", "Share"];
  const tableRows = data.points.map((p) => [
    p.name,
    formatMoney(p.amountCents),
    `${p.percentageOfFlexibleSpend}%`,
  ]);

  return (
    <ChartCard
      question={t("breakdownQuestion")}
      currentValue={formatMoney(data.totalSpentCents)}
      interpretation={interpretation}
      accessibleSummary={accessibleSummary}
      badge={
        <div className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:items-center rounded-xl border border-border/80 bg-secondary/50 p-1 text-xs">
          {(["this-week", "last-week", "this-month"] as SpendingPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 sm:py-1 text-center text-xs font-semibold transition-all cursor-pointer truncate",
                period === p
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-3.5 pt-2">
        {data.points.map((pt) => {
          return (
            <div key={pt.envelopeId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{pt.name}</span>
                <span className="font-mono text-muted-foreground">
                  {formatMoney(pt.amountCents)} ({pt.percentageOfFlexibleSpend}%)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary/60">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${pt.percentageOfFlexibleSpend}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <AccessibleChartTable
        caption="Flexible spending breakdown table"
        headers={tableHeaders}
        rows={tableRows}
      />
    </ChartCard>
  );
}
