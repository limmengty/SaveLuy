"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Gauge, Lock, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney } from "@/lib/money";
import { ProgressBar } from "@/components/product/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LedgerIconCoffee,
  LedgerIconMeal,
  LedgerIconTransport,
  LedgerIconDrink,
  LedgerIconGroceries,
} from "@/components/illustrations/ledger-lines";

interface TodayViewProps {
  locale: string;
}

export function TodayView({ locale }: TodayViewProps) {
  const t = useTranslations("today");
  const { computed, state, isReady, addTransaction, reverseTransaction, setCheckOpen } = useWealthEngine();
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  if (!isReady) {
    return (
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-7">
          {/* Hero Card Skeleton */}
          <div className="rounded-2xl border border-border bg-card p-5 lg:p-7 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-14 w-44" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>

          {/* Quick Add Skeleton */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[68px] rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Latest Activity Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Side Cards Skeleton */}
        <aside className="space-y-7">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </aside>
      </div>
    );
  }


  const statusConfig = {
    on: {
      label: t("onPlan"),
      icon: CheckCircle2,
      cls: "text-primary",
      line: t("onPlanSub"),
    },
    adjusted: {
      label: t("adjusted"),
      icon: Gauge,
      cls: "text-warning",
      line: t("adjustedSub"),
    },
    attention: {
      label: t("attention"),
      icon: AlertTriangle,
      cls: "text-destructive",
      line:
        computed.periodRemaining <= 0
          ? t("periodExceededSub")
          : t("attentionSub"),
    },
  }[computed.status];

  const recentTxs = state.transactions.filter((t) => !t.reversed).slice(0, 5);

  return (
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
      <div className="space-y-7">
        {/* Hero Card */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:p-7 shadow-sm">
          <p className="eyebrow">{t("availableToday")}</p>
          <p key={computed.availableToday} className="amount-hero fade-num mt-1">
            {formatMoney(computed.availableToday)}
          </p>

          <p className={cn("mt-2 flex items-center gap-1.5 text-sm font-semibold", statusConfig.cls)}>
            <statusConfig.icon className="size-4" /> {statusConfig.label}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{statusConfig.line}</p>

          <div className="mt-5 space-y-2">
            <ProgressBar
              value={computed.confirmed}
              max={computed.weeklyFlexibleLimit}
              tone={
                computed.status === "on"
                  ? "primary"
                  : computed.status === "adjusted"
                    ? "warning"
                    : "destructive"
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="money">
                {t("usedOf", {
                  used: formatMoney(computed.confirmed),
                  total: formatMoney(computed.weeklyFlexibleLimit),
                })}
              </span>
              <span>
                {t("daysLeft", { count: computed.daysRemainingIncludingToday })}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowCalculationDetails(true)}
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <HelpCircle className="size-4 text-primary" />
            {t("whyThisAmount")}
          </button>

          <Dialog open={showCalculationDetails} onOpenChange={setShowCalculationDetails}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HelpCircle className="size-5 text-primary" />
                  {t("whyThisAmount")}
                </DialogTitle>
                <DialogDescription>
                  {t("underspendNote")}
                </DialogDescription>
              </DialogHeader>

              <dl className="money mt-2 grid gap-2 rounded-xl bg-secondary/50 p-4 text-sm border border-border/50 divide-y divide-border/40">
                {[
                  [t("weeklyLimit"), formatMoney(computed.weeklyFlexibleLimit)],
                  [t("spentBeforeToday"), formatMoney(computed.spendBeforeToday)],
                  [t("dailyBaseline"), formatMoney(computed.baselineDaily)],
                  [
                    t("remainingPaced", { days: computed.daysRemainingIncludingToday }),
                    formatMoney(
                      Math.floor(
                        Math.max(0, computed.startOfDayRemaining) /
                          computed.daysRemainingIncludingToday
                      )
                    ),
                  ],
                  [t("todayStartsAt"), formatMoney(computed.todayStartLimit)],
                  [t("spentToday"), formatMoney(computed.spendToday)],
                ].map(([k, v], idx) => (
                  <div key={k} className={cn("flex justify-between gap-4", idx > 0 && "pt-2")}>
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Add */}
        <section aria-label={t("quickAdd")}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">{t("quickAdd")}</h2>
            <span className="text-xs text-muted-foreground">1-tap capture</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {state.quickActions.map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  const tx = addTransaction({
                    amount: q.amount,
                    envelope: q.envelope,
                    label: q.label,
                  });
                  toast(`${q.label} added · ${formatMoney(q.amount)}`, {
                    action: {
                      label: "Undo",
                      onClick: () => reverseTransaction(tx.id),
                    },
                  });
                }}
                className="group flex h-[68px] items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:bg-secondary/60 active:scale-[0.98] cursor-pointer"
              >
                <div
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary sm:size-11"
                >
                  {q.label.toLowerCase().includes("coffee") ? (
                    <LedgerIconCoffee className="size-5" />
                  ) : q.label.toLowerCase().includes("meal") || q.label.toLowerCase().includes("food") ? (
                    <LedgerIconMeal className="size-5" />
                  ) : q.label.toLowerCase().includes("transport") ? (
                    <LedgerIconTransport className="size-5" />
                  ) : q.label.toLowerCase().includes("drink") ? (
                    <LedgerIconDrink className="size-5" />
                  ) : (
                    <LedgerIconGroceries className="size-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-[13px] font-bold text-foreground group-hover:text-primary transition-colors sm:text-sm">
                    {q.label}
                  </p>
                  <p className="money truncate text-xs font-semibold text-muted-foreground">
                    {formatMoney(q.amount)}
                  </p>
                </div>
              </button>
            ))}

            <button
              onClick={() => setCheckOpen(true)}
              className="group flex h-[68px] items-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card/40 p-3 text-left transition-all hover:border-primary/50 hover:bg-secondary/40 active:scale-[0.98] cursor-pointer"
            >
              <div
                aria-hidden
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
              >
                <Plus className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {t("otherAmount")}
                </p>
                <p className="text-xs text-muted-foreground/70">Custom</p>
              </div>
            </button>
          </div>
        </section>

        {/* Latest Activity */}
        <section aria-label={t("latestActivity")}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">{t("latestActivity")}</h2>
            <Link
              href={`/${locale}/activity`}
              className="flex min-h-11 items-center px-1 text-sm font-semibold text-primary hover:underline"
            >
              {t("seeAll")}
            </Link>
          </div>

          {recentTxs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              Nothing yet. Tap a quick-add above when you spend.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
              {recentTxs.map((tx) => (
                <li key={tx.id} className="item-enter flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/40">
                  <div>
                    <p className="text-sm font-semibold">{tx.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.envelope === "fun" ? t("funMoney") : t("essentials")} ·{" "}
                      {new Date(tx.createdAt).toLocaleString(undefined, {
                        weekday: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="money text-sm font-semibold">−{formatMoney(tx.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Side Summary */}
      <aside className="space-y-7">
        <section aria-label={t("protected")}>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("protected")}</h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {[
              ["Home and fixed", state.plan.homeFixedMonthly],
              ["Future fund", state.plan.futureFundMonthly + state.futureAllocated],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-center justify-between px-4 py-3">
                <span className="flex items-center gap-2 text-sm">
                  <Lock className="size-4 text-muted-foreground" /> {k}
                </span>
                <span className="money text-sm font-semibold">
                  {formatMoney(v as number)}
                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                </span>
              </div>
            ))}
            <p className="px-4 py-3 text-xs text-muted-foreground">
              {t("protectedNote")}
            </p>
          </div>
        </section>

        <section aria-label={t("thisWeek")}>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("thisWeek")}</h2>
          <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
            {(["essentials", "fun"] as const).map((e) => {
              const lim = e === "fun" ? state.plan.funLimit : state.plan.essentialsLimit;
              return (
                <div key={e} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>{e === "fun" ? t("funMoney") : t("essentials")}</span>
                    <span className="money text-muted-foreground">
                      {t("left", { amount: formatMoney(computed.envelopeRemaining[e]) })}
                    </span>
                  </div>
                  <ProgressBar value={computed.envelopeSpent[e]} max={lim} />
                </div>
              );
            })}
          </div>
        </section>

        {state.waitList.length > 0 && (
          <Link
            href={`/${locale}/plan/wait-list`}
            className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
          >
            <p className="text-sm font-semibold">{state.waitList.length} on your wait list</p>
            <p className="text-xs text-muted-foreground">Review when the 24 hours are up.</p>
          </Link>
        )}

        <Link
          href={`/${locale}/review`}
          className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
        >
          <p className="text-sm font-semibold">Weekly review</p>
          <p className="text-xs text-muted-foreground">Decide what to do with the weekly remainder.</p>
        </Link>
      </aside>
    </div>
  );
}
