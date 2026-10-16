"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clock, Delete, Gauge } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import {
  futureValue,
  projectNextDaily,
  purchaseStatus,
  workHours,
  type EnvelopeId,
} from "@/lib/wealth-engine/engine";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export function CheckPanel() {
  const t = useTranslations("check");
  const tToday = useTranslations("today");
  const { checkOpen, setCheckOpen, computed, state, addTransaction, reverseTransaction, addWaitItem } =
    useWealthEngine();
  const mobile = useIsMobile();
  const [digits, setDigits] = useState("");
  const [env, setEnv] = useState<EnvelopeId>("fun");
  const [more, setMore] = useState(false);
  const amount = parseInt(digits || "0", 10);
  const press = (k: string) =>
    setDigits((d) => (k === "del" ? d.slice(0, -1) : (d + k).replace(/^0+/, "").slice(0, 7)));

  useEffect(() => {
    if (!checkOpen) return;
    const h = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("del");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [checkOpen]);

  const status = purchaseStatus(
    amount,
    computed.availableToday,
    computed.envelopeRemaining[env],
    computed.periodRemaining
  );
  const { projectedRemaining, projectedNextDaily: nextDaily } = projectNextDaily(
    computed.periodRemaining,
    amount,
    computed.baselineDaily,
    computed.daysRemainingAfterToday
  );
  const statusUi = {
    ON_PLAN: {
      label: t("fitsToday"),
      icon: CheckCircle2,
      cls: "border-primary/40 bg-primary/10 text-primary",
    },
    ADJUSTED: {
      label: t("adjustsWeek"),
      icon: Gauge,
      cls: "border-warning/40 bg-warning/10 text-warning",
    },
    NEEDS_DECISION: {
      label: t("needsDecision"),
      icon: AlertTriangle,
      cls: "border-destructive/40 bg-destructive/10 text-destructive",
    },
  };

  const s = statusUi[status];
  const over = amount - computed.availableToday;
  const hrs = workHours(amount, state.plan.monthlyFlexibleIncome, state.plan.monthlyWorkHours);

  const explain =
    status === "ON_PLAN"
      ? `Leaves ${formatMoney(computed.availableToday - amount)} for today. The rest of the week stays as planned.`
      : status === "ADJUSTED"
        ? state.preferences.voice === "calm"
          ? `This is ${formatMoney(over)} above today's amount. If you add it, the next days become about ${formatMoney(nextDaily)} a day through Sunday.`
          : `It fits the week, but the rest gets tighter: about ${formatMoney(nextDaily)} a day.`
        : `This is more than ${amount > computed.periodRemaining ? "the weekly remainder" : `what's left in ${env === "fun" ? tToday("funMoney") : tToday("essentials")}`}. Weekly remaining would be ${formatMoney(projectedRemaining)}.`;

  const handleAdd = () => {
    const tx = addTransaction({
      amount,
      envelope: env,
      label: env === "fun" ? "Fun purchase" : "Essentials purchase",
    });
    setCheckOpen(false);
    toast(`${env === "fun" ? tToday("funMoney") : tToday("essentials")} added · ${formatMoney(amount)}`, {
      action: {
        label: "Undo",
        onClick: () => reverseTransaction(tx.id),
      },
    });
  };

  const handleWait = () => {
    addWaitItem({
      label: env === "fun" ? "Fun purchase" : "Essentials purchase",
      amount,
      envelope: env,
    });
    setCheckOpen(false);
    const unlockTime = new Date(Date.now() + 86400000);
    toast(`Wait list · Review ${unlockTime.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}`);
  };

  return (
    <Sheet
      open={checkOpen}
      onOpenChange={(open) => {
        if (!open) {
          setDigits("");
          setMore(false);
        }
        setCheckOpen(open);
      }}
    >
      <SheetContent
        side={mobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col gap-0 overflow-y-auto border-border bg-card p-0",
          mobile ? "max-h-[92dvh] rounded-t-3xl" : "w-[420px] sm:max-w-[420px]"
        )}
      >
        <SheetHeader className="px-5 pb-2 pt-5 text-left">
          <SheetTitle className="text-lg">{t("title")}</SheetTitle>
          <SheetDescription>
            {t("subtitle")}
          </SheetDescription>
        </SheetHeader>

        <div className="px-5">
          <p
            className="money py-3 text-center text-[40px] font-bold leading-[44px] lg:text-[48px] lg:leading-[52px]"
            aria-live="polite"
          >
            {formatMoney(amount)}
          </p>

          <div role="radiogroup" aria-label="Envelope" className="grid grid-cols-2 gap-2">
            {(["essentials", "fun"] as const).map((e) => (
              <button
                key={e}
                role="radio"
                aria-checked={env === e}
                onClick={() => setEnv(e)}
                className={cn(
                  "min-h-12 rounded-xl border px-3 py-2 text-left transition-colors cursor-pointer",
                  env === e
                    ? "border-primary bg-primary/10"
                    : "bg-secondary/40 hover:bg-secondary"
                )}
              >
                <span className="block text-sm font-semibold">
                  {e === "fun" ? tToday("funMoney") : tToday("essentials")}
                </span>
                <span className="money block text-xs text-muted-foreground">
                  {tToday("left", { amount: formatMoney(computed.envelopeRemaining[e]) })}
                </span>
              </button>
            ))}
          </div>

          {amount > 0 && (
            <div className={cn("mt-4 rounded-2xl border p-4", s.cls)} aria-live="polite">
              <p className="flex items-center gap-2 font-bold">
                <s.icon className="size-5" /> {s.label}
              </p>
              <p className="mt-1 text-sm text-foreground">{explain}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-foreground">
                <div>
                  <dt className="text-xs text-muted-foreground">{t("weeklyRemaining")}</dt>
                  <dd className="money font-semibold">{formatMoney(projectedRemaining)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("nextDays")}</dt>
                  <dd className="money font-semibold">{formatMoney(nextDaily)}/day</dd>
                </div>
              </dl>
              <button
                onClick={() => setMore(!more)}
                className="mt-3 flex items-center gap-1 text-xs font-semibold text-muted-foreground cursor-pointer"
                aria-expanded={more}
              >
                {t("otherPerspectives")}{" "}
                <ChevronDown className={cn("size-4 transition-transform", more && "rotate-180")} />
              </button>
              {more && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>
                    ≈ {hrs.toFixed(1)} hours of flexible-income work (
                    {formatMoney(
                      Math.round(state.plan.monthlyFlexibleIncome / state.plan.monthlyWorkHours)
                    )}
                    /hr, not your actual wage).
                  </li>
                  <li>
                    Could become about {formatMoney(futureValue(amount))} in 10 years at an assumed
                    9% annual return. Not guaranteed.
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1.5 px-5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"].map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              aria-label={k === "del" ? "Delete digit" : k}
              className="money grid h-12 place-items-center rounded-xl bg-secondary/50 text-xl font-semibold transition-colors hover:bg-secondary active:bg-secondary cursor-pointer"
            >
              {k === "del" ? <Delete className="size-5" /> : k}
            </button>
          ))}
        </div>

        <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-2 border-t bg-card p-5">
          <button
            disabled={!amount}
            onClick={handleWait}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border font-semibold hover:bg-secondary disabled:opacity-40 cursor-pointer"
          >
            <Clock className="size-4" /> {t("wait24h")}
          </button>
          <button
            disabled={!amount}
            onClick={handleAdd}
            className="min-h-12 rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            {t("addPurchase")}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
