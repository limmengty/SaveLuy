"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PiggyBank, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney } from "@/lib/money";
import { LedgerMilestoneSweep } from "@/components/illustrations/ledger-lines";
import { cn } from "@/lib/utils";

type ChoiceType = "future" | "carry" | "leave";

export function ReviewView() {
  const t = useTranslations("review");
  const { computed, allocateFuture } = useWealthEngine();
  const [choice, setChoice] = useState<ChoiceType>("future");
  const [completed, setCompleted] = useState(false);

  const remainder = Math.max(0, computed.periodRemaining);
  const funSpent = computed.envelopeSpent.fun;
  const essentialsSpent = computed.envelopeSpent.essentials;

  const reviewOptions = [
    {
      id: "future" as const,
      icon: PiggyBank,
      label: t("allocateFuture"),
      desc: t("allocateFutureDesc"),
      badge: remainder > 0 ? `+${formatMoney(remainder)}` : undefined,
    },
    {
      id: "carry" as const,
      icon: ArrowRight,
      label: t("carryNext"),
      desc: t("carryNextDesc"),
    },
    {
      id: "leave" as const,
      icon: ShieldCheck,
      label: t("leaveUnchanged"),
      desc: t("leaveUnchangedDesc"),
    },
  ];

  const handleConfirm = () => {
    if (choice === "future") {
      allocateFuture(remainder);
      toast.success(t("futureToast", { amount: formatMoney(remainder) }));
    } else if (choice === "carry") {
      toast.info(t("carryToast"));
    } else {
      toast.info(t("leaveToast"));
    }
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="max-w-2xl rounded-2xl border border-border bg-card p-10 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95">
        <LedgerMilestoneSweep />
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-foreground">{t("weekBalancedTitle")}</h2>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            {t("weekBalancedDesc")}
          </p>
        </div>
        <Link
          href="./today"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {t("returnToToday")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-7">
      {/* 3-stat breakdown summary banner */}
      <dl className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card shadow-xs">
        <div className="p-4 sm:p-5">
          <dt className="eyebrow">{t("planned")}</dt>
          <dd className="money mt-1 text-xl sm:text-2xl font-bold text-foreground">
            {formatMoney(computed.weeklyFlexibleLimit)}
          </dd>
        </div>
        <div className="p-4 sm:p-5">
          <dt className="eyebrow">{t("spent")}</dt>
          <dd className="money mt-1 text-xl sm:text-2xl font-bold text-foreground">
            {formatMoney(computed.confirmed)}
          </dd>
        </div>
        <div className="p-4 sm:p-5">
          <dt className="eyebrow text-primary">{t("remainder")}</dt>
          <dd className="money mt-1 text-xl sm:text-2xl font-black text-primary">
            {formatMoney(remainder)}
          </dd>
        </div>
      </dl>

      {/* Narrative status info */}
      <div className="rounded-xl border border-border/60 bg-secondary/30 p-4 space-y-1 text-xs text-muted-foreground leading-relaxed">
        <p>
          • {t("summaryBreakdown", {
            essentials: formatMoney(essentialsSpent),
            fun: formatMoney(funSpent),
          })}
        </p>
        <p>
          •{" "}
          {computed.daysRemainingIncludingToday > 1
            ? t("daysToGo", { count: computed.daysRemainingIncludingToday - 1 })
            : t("lastDay")}
        </p>
      </div>

      {/* Polished Interactive Option Cards */}
      <fieldset className="space-y-3">
        <legend className="mb-2 text-base font-semibold text-foreground">
          {t("question", { amount: formatMoney(remainder) })}
        </legend>
        <div className="space-y-3">
          {reviewOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = choice === opt.id;
            return (
              <label
                key={opt.id}
                className={cn(
                  "relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-150 select-none",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                    : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40"
                )}
              >
                <div
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl transition-colors mt-0.5",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {opt.label}
                    </span>
                    {opt.badge && (
                      <span className="money rounded-lg bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {opt.desc}
                  </p>
                </div>

                <div className="mt-1 flex shrink-0 items-center justify-center">
                  <div
                    className={cn(
                      "grid size-5 place-items-center rounded-full border transition-all",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-transparent"
                    )}
                  >
                    {isSelected && <CheckCircle2 className="size-3.5" />}
                  </div>
                </div>

                <input
                  type="radio"
                  name="review-choice"
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => setChoice(opt.id)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-3 pt-2">
        <button
          disabled={remainder === 0 && choice === "future"}
          onClick={handleConfirm}
          className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 sm:w-auto sm:px-8 cursor-pointer shadow-xs active:scale-[0.99]"
        >
          {t("confirm")}
        </button>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("disclaimer")}
        </p>
      </div>
    </div>
  );
}
