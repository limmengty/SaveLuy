"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clock, Delete, Gauge, Heart, ShoppingBag } from "lucide-react";
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
        hideCloseButton={mobile}
        className={cn(
          "flex flex-col gap-0 overflow-y-auto border-border bg-card p-0",
          mobile ? "max-h-[92dvh] rounded-t-3xl" : "w-[420px] sm:max-w-[420px]"
        )}
      >
        {/* Mobile iOS Sheet Drag Handle */}
        {mobile && (
          <div className="flex justify-center pt-3 pb-1">
            <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        <SheetHeader className="px-5 pb-2 pt-3 text-left">
          <SheetTitle className="text-xl font-bold tracking-tight text-foreground">{t("title")}</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground leading-relaxed">
            {t("subtitle")}
          </SheetDescription>
        </SheetHeader>

        <div className="px-5">
          {/* Calibrated Dynamic Money Display */}
          <div className="my-2 flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-secondary/30 p-4">
            <p
              className={cn(
                "money font-black tracking-tight text-foreground transition-all",
                amount >= 10000000
                  ? "text-2xl leading-tight"
                  : amount >= 100000
                    ? "text-3xl leading-tight"
                    : "text-4xl leading-tight sm:text-5xl"
              )}
              aria-live="polite"
            >
              {formatMoney(amount)}
            </p>
          </div>

          {/* Envelope Selector Cards */}
          <div role="radiogroup" aria-label="Envelope" className="grid grid-cols-2 gap-2.5">
            {(["essentials", "fun"] as const).map((e) => {
              const isSelected = env === e;
              const isFun = e === "fun";
              const EnvelopeIcon = isFun ? Heart : ShoppingBag;

              return (
                <button
                  key={e}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setEnv(e)}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                    isSelected
                      ? isFun
                        ? "border-warning bg-warning/10 shadow-xs shadow-warning/20 ring-1 ring-warning/30"
                        : "border-primary bg-primary/10 shadow-xs shadow-primary/20 ring-1 ring-primary/30"
                      : "border-border bg-card hover:bg-secondary/60"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <EnvelopeIcon className={cn("size-3.5", isSelected ? (isFun ? "text-warning" : "text-primary") : "text-muted-foreground")} />
                    <span className="block text-xs font-bold leading-normal text-foreground">
                      {isFun ? tToday("funMoney") : tToday("essentials")}
                    </span>
                  </div>
                  <span className="money block text-[11px] font-semibold text-muted-foreground">
                    {tToday("left", { amount: formatMoney(computed.envelopeRemaining[e]) })}
                  </span>
                </button>
              );
            })}
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

        {/* Tactile Keypad */}
        <div className="mt-3 grid grid-cols-3 gap-2 px-5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"].map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              aria-label={k === "del" ? "Delete digit" : k}
              className="money flex h-13 items-center justify-center rounded-2xl border border-border/60 bg-secondary/40 text-xl font-bold text-foreground transition-all hover:bg-secondary active:scale-95 active:bg-secondary/90 cursor-pointer shadow-2xs select-none"
            >
              {k === "del" ? <Delete className="size-5 text-muted-foreground" /> : k}
            </button>
          ))}
        </div>

        {/* Bottom Actions with Safe Padding */}
        <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-3 border-t border-border/80 bg-card/95 backdrop-blur-md p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
          <button
            disabled={!amount}
            onClick={handleWait}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 text-xs font-bold text-foreground transition-all hover:bg-secondary active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Clock className="size-4 text-muted-foreground" />
            <span>{t("wait24h")}</span>
          </button>
          <button
            disabled={!amount}
            onClick={handleAdd}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{t("addPurchase")}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
