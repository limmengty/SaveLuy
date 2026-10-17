"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { formatMoney } from "@/lib/money";
import { ChartCard } from "./chart-card";
import { AccessibleChartTable } from "./accessible-chart-table";
import type { WeeklyPaceData } from "@/features/analytics/types";

import { useTranslations } from "next-intl";

interface WeeklyPaceMiniProps {
  data: WeeklyPaceData;
  locale?: string;
}

export function WeeklyPaceMini({ data, locale = "en-KH" }: WeeklyPaceMiniProps) {
  const t = useTranslations("charts");

  const chartData = useMemo(() => {
    return data.points.map((p) => ({
      name: p.localizedDayLabel,
      actual: p.isFuture ? null : p.actualCumulativeCents,
      planned: p.plannedCumulativeCents,
      isToday: p.isToday,
      rawActual: p.actualCumulativeCents,
      rawPlanned: p.plannedCumulativeCents,
    }));
  }, [data.points]);

  const interpretation = useMemo(() => {
    if (data.totalSpentCents === 0) {
      return `No spending recorded this week. Full ${formatMoney(data.weeklyFlexibleLimitCents)} is available.`;
    }
    if (data.status === "LIMIT_REACHED") {
      return `Weekly limit reached. Protected money remains untouched.`;
    }
    if (data.paceVarianceCents >= 0) {
      return `You are ${formatMoney(data.paceVarianceCents)} under your planned pace.`;
    }
    return `You are ${formatMoney(Math.abs(data.paceVarianceCents))} ahead of pace. Daily safe amount has adjusted.`;
  }, [data]);

  const accessibleSummary = `${interpretation} ${formatMoney(data.totalSpentCents)} used of ${formatMoney(data.weeklyFlexibleLimitCents)}. ${data.daysRemainingIncludingToday} days left in cycle.`;

  const tableHeaders = ["Day", t("planned"), t("actual")];
  const tableRows = data.points.map((p) => [
    p.localizedDayLabel,
    formatMoney(p.plannedCumulativeCents),
    p.isFuture ? "—" : formatMoney(p.actualCumulativeCents),
  ]);

  return (
    <ChartCard
      question={t("weeklyPaceQuestion")}
      currentValue={`${formatMoney(data.totalSpentCents)} used`}
      interpretation={interpretation}
      accessibleSummary={accessibleSummary}
      badge={
        data.status === "ON_PLAN" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-2xs font-semibold text-primary">
            <CheckCircle2 className="size-3" /> {t("onPlan")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-2xs font-semibold text-warning">
            <AlertCircle className="size-3" /> {t("pacingAdjusted")}
          </span>
        )
      }
      action={
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <span>{t("daysLeft", { days: data.daysRemainingIncludingToday, amount: formatMoney(data.remainingCents) })}</span>
          <Link
            href={`/${locale}/progress`}
            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
          >
            <span>{t("viewWeeklyDetails")}</span>
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      }
    >
      <div className="h-[130px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="name"
              stroke="var(--chart-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--chart-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatMoney(v)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card/95 p-2.5 shadow-md text-xs backdrop-blur-xs space-y-1">
                      <p className="font-semibold text-foreground border-b border-border/50 pb-0.5">{d.name}</p>
                      <p className="text-primary font-mono flex justify-between gap-3">
                        <span>{t("actual")}:</span>
                        <b>{d.actual !== null ? formatMoney(d.actual) : "—"}</b>
                      </p>
                      <p className="text-muted-foreground font-mono flex justify-between gap-3">
                        <span>{t("planned")}:</span>
                        <span>{formatMoney(d.planned)}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Planned line: neutral dashed */}
            <Line
              type="monotone"
              dataKey="planned"
              stroke="var(--chart-plan)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            {/* Actual spend line: SaveLuy Emerald */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--chart-actual)"
              strokeWidth={2.5}
              connectNulls={false}
              dot={{ r: 3, fill: "var(--chart-actual)" }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <AccessibleChartTable
        caption="Weekly cumulative pacing data"
        headers={tableHeaders}
        rows={tableRows}
      />
    </ChartCard>
  );
}
