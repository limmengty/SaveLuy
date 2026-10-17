"use client";

import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { ChartCard } from "./chart-card";
import { AccessibleChartTable } from "./accessible-chart-table";
import type { WeeklyPaceData } from "@/features/analytics/types";

import { useTranslations } from "next-intl";

interface WeeklyPaceChartProps {
  data: WeeklyPaceData;
}

export function WeeklyPaceChart({ data }: WeeklyPaceChartProps) {
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
      return `No spending recorded this week. Your full ${formatMoney(data.weeklyFlexibleLimitCents)} flexible amount is still untouched.`;
    }
    if (data.status === "LIMIT_REACHED") {
      return `Your flexible limit is reached. Protected money remains safe and untouched.`;
    }
    if (data.paceVarianceCents >= 0) {
      return `You are ${formatMoney(data.paceVarianceCents)} under your planned pace for this point in the week.`;
    }
    return `You are ${formatMoney(Math.abs(data.paceVarianceCents))} ahead of pace. Tomorrow's safe-to-spend has adjusted smoothly.`;
  }, [data]);

  const accessibleSummary = `${interpretation} ${formatMoney(data.totalSpentCents)} used of ${formatMoney(data.weeklyFlexibleLimitCents)}. ${data.daysRemainingIncludingToday} days left in current cycle.`;

  const tableHeaders = ["Day", t("planned"), t("actual"), "Difference"];
  const tableRows = data.points.map((p) => [
    p.localizedDayLabel,
    formatMoney(p.plannedCumulativeCents),
    p.isFuture ? "—" : formatMoney(p.actualCumulativeCents),
    p.isFuture ? "—" : formatMoney(p.plannedCumulativeCents - p.actualCumulativeCents),
  ]);

  return (
    <ChartCard
      question={t("weeklyPaceQuestion")}
      currentValue={`${formatMoney(data.totalSpentCents)} of ${formatMoney(data.weeklyFlexibleLimitCents)}`}
      interpretation={interpretation}
      accessibleSummary={accessibleSummary}
      badge={
        data.status === "ON_PLAN" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <CheckCircle2 className="size-3.5" /> {t("onPlan")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
            <AlertCircle className="size-3.5" /> {t("pacingAdjusted")}
          </span>
        )
      }
    >
      <div className="h-[200px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="var(--chart-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--chart-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatMoney(v)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-card/95 p-3 shadow-lg text-xs backdrop-blur-xs space-y-1">
                      <p className="font-semibold text-foreground border-b border-border/50 pb-1">{d.name}</p>
                      <p className="text-primary font-mono flex justify-between gap-4">
                        <span>{t("actual")}:</span>
                        <b>{d.actual !== null ? formatMoney(d.actual) : "—"}</b>
                      </p>
                      <p className="text-muted-foreground font-mono flex justify-between gap-4">
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
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {/* Actual spend line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--chart-actual)"
              strokeWidth={3}
              connectNulls={false}
              dot={{ r: 4, fill: "var(--chart-actual)" }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <AccessibleChartTable
        caption="Detailed weekly cumulative pacing table"
        headers={tableHeaders}
        rows={tableRows}
      />
    </ChartCard>
  );
}
