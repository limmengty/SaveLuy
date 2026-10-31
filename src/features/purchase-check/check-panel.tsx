"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bike,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coffee,
  Coins,
  Cookie,
  CupSoda,
  Delete,
  Fuel,
  Gauge,
  Heart,
  LayoutGrid,
  Pill,
  ShoppingBag,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import {
  futureValue,
  projectNextDaily,
  purchaseStatus,
  workHours,
  type EnvelopeId,
} from "@/lib/wealth-engine/engine";
import { formatMoney, parseMoneyInputToCents } from "@/lib/money";
import {
  calculateSplitTender,
  khrToUsdCents,
  usdCentsToKhr,
} from "@/lib/money/split-tender";
import { cn } from "@/lib/utils";

export interface QuickCheckItem {
  id: string;
  icon: LucideIcon;
  en: string;
  km: string;
  usdCents: number;
  khrAmount: number;
  envelope: EnvelopeId;
}

export const QUICK_CHECK_ITEMS: QuickCheckItem[] = [
  { id: "coffee", icon: Coffee, en: "Coffee", km: "កាហ្វេ", usdCents: 150, khrAmount: 6000, envelope: "fun" },
  { id: "meal", icon: Utensils, en: "Meal / Lunch", km: "អាហារ / បាយ", usdCents: 250, khrAmount: 10000, envelope: "essentials" },
  { id: "tuktuk", icon: Bike, en: "TukTuk / Ride", km: "PassApp / ម៉ូតូឌុប", usdCents: 125, khrAmount: 5000, envelope: "essentials" },
  { id: "groceries", icon: ShoppingBag, en: "Groceries", km: "ទិញម្ហូបផ្សារ", usdCents: 500, khrAmount: 20000, envelope: "essentials" },
  { id: "drink", icon: CupSoda, en: "Boba / Drink", km: "ភេសជ្ជៈ / តែគុជ", usdCents: 200, khrAmount: 8000, envelope: "fun" },
  { id: "fuel", icon: Fuel, en: "Gasoline / Fuel", km: "ចាក់សាំង", usdCents: 300, khrAmount: 12000, envelope: "essentials" },
  { id: "snack", icon: Cookie, en: "Snack / Treat", km: "ចំណីចំណុក", usdCents: 100, khrAmount: 4000, envelope: "fun" },
  { id: "pharmacy", icon: Pill, en: "Pharmacy", km: "ទិញថ្នាំពេទ្យ", usdCents: 400, khrAmount: 16000, envelope: "essentials" },
];

export function CheckPanel() {
  const t = useTranslations("check");
  const tToday = useTranslations("today");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { checkOpen, setCheckOpen, computed, now, state, addTransaction, reverseTransaction, addWaitItem } =
    useWealthEngine();
  const mobile = useIsMobile();
  const [amountStr, setAmountStr] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [env, setEnv] = useState<EnvelopeId>("fun");
  const [more, setMore] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "KHR">(state.preferences.currency || "USD");
  const [presetsDialogOpen, setPresetsDialogOpen] = useState(false);
  const exchangeRate = state.preferences.khrExchangeRate || 4000;

  // Split cash & change drawer state
  const [splitOpen, setSplitOpen] = useState(false);
  const [tenderedUsd, setTenderedUsd] = useState("");
  const [tenderedKhr, setTenderedKhr] = useState("");
  const [changeUsd, setChangeUsd] = useState("");
  const [changeKhr, setChangeKhr] = useState("");

  const amount = parseMoneyInputToCents(amountStr, currency, exchangeRate);
  const rawNum = currency === "KHR" ? parseInt(amountStr.replace(/\D/g, "") || "0", 10) : amount;

  const press = (k: string) => {
    if (k === "del") {
      setAmountStr((prev) => prev.slice(0, -1));
      return;
    }

    if (k === "clear") {
      setAmountStr("");
      return;
    }

    if (k === ".") {
      if (currency === "KHR") return;
      setAmountStr((prev) => {
        if (!prev) return "0.";
        if (prev.includes(".")) return prev;
        return prev + ".";
      });
      return;
    }

    if (k === "000") {
      if (currency !== "KHR") return;
      setAmountStr((prev) => {
        if (!prev || prev === "0") return "";
        if (prev.length >= 9) return prev;
        return prev + "000";
      });
      return;
    }

    setAmountStr((prev) => {
      if (currency === "USD" && prev.includes(".")) {
        const decimals = prev.split(".")[1] || "";
        if (decimals.length >= 2) return prev;
      }
      if (prev === "0") {
        return k === "0" ? "0" : k;
      }
      if (prev.length >= 10) return prev;
      return prev + k;
    });
  };

  const handleInputChange = (val: string) => {
    if (currency === "USD") {
      const cleaned = val.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length > 2) return;
      if (parts[1] && parts[1].length > 2) return;
      setAmountStr(cleaned);
    } else {
      const cleaned = val.replace(/[^0-9]/g, "");
      setAmountStr(cleaned);
    }
  };

  const handleSelectQuickItem = (item: QuickCheckItem) => {
    setEnv(item.envelope);
    setCustomLabel(locale === "km" ? item.km : item.en);
    if (currency === "USD") {
      const dollars = (item.usdCents / 100).toFixed(2);
      setAmountStr(dollars.endsWith(".00") ? (item.usdCents / 100).toString() : dollars);
    } else {
      setAmountStr(item.khrAmount.toString());
    }
  };

  const addQuickBump = (increment: number) => {
    if (currency === "USD") {
      const currentCents = parseMoneyInputToCents(amountStr, "USD", exchangeRate);
      const nextCents = currentCents + increment;
      const dollars = (nextCents / 100).toFixed(2);
      setAmountStr(dollars.endsWith(".00") ? (nextCents / 100).toString() : dollars);
    } else {
      const currentRiels = parseInt(amountStr.replace(/\D/g, "") || "0", 10);
      const nextRiels = currentRiels + increment;
      setAmountStr(nextRiels.toString());
    }
  };

  const toggleCurrency = (newCurr: "USD" | "KHR") => {
    if (newCurr === currency) return;
    if (newCurr === "KHR") {
      const khrVal = usdCentsToKhr(amount, exchangeRate);
      setAmountStr(khrVal > 0 ? khrVal.toString() : "");
    } else {
      if (amount > 0) {
        const dollars = (amount / 100).toFixed(2);
        setAmountStr(dollars.endsWith(".00") ? (amount / 100).toString() : dollars);
      } else {
        setAmountStr("");
      }
    }
    setCurrency(newCurr);
  };

  useEffect(() => {
    if (!checkOpen) return;
    const h = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isKeypadInput = target?.getAttribute("data-keypad-input") === "true";
      if (target?.tagName === "INPUT" && !isKeypadInput) return;

      if (/^\d$/.test(e.key)) {
        if (!isKeypadInput) {
          e.preventDefault();
          press(e.key);
        }
      } else if (e.key === "." && currency === "USD") {
        if (!isKeypadInput) {
          e.preventDefault();
          press(".");
        }
      } else if (e.key === "Backspace") {
        if (!isKeypadInput) {
          e.preventDefault();
          press("del");
        }
      } else if (e.key === "Escape") {
        setAmountStr("");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [checkOpen, currency]);

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
      ? `Leaves ${formatMoney(computed.availableToday - amount)} for today. Week stays on track.`
      : status === "ADJUSTED"
        ? state.preferences.voice === "calm"
          ? `${formatMoney(over)} above today. Next days become ~${formatMoney(nextDaily)}/day.`
          : `Fits week, but rest gets tighter: ~${formatMoney(nextDaily)}/day.`
        : `Over ${amount > computed.periodRemaining ? "weekly remainder" : "envelope"}. Remaining would be ${formatMoney(projectedRemaining)}.`;

  const handleAdd = () => {
    const defaultLabel = env === "fun" ? tToday("funMoney") : tToday("essentials");
    const labelToSave = customLabel.trim() || defaultLabel;
    const tx = addTransaction({
      amount,
      envelope: env,
      label: labelToSave,
      inputCurrency: currency,
      exchangeRateSnapshot: exchangeRate,
      rawKhrAmount: currency === "KHR" ? rawNum : undefined,
    });
    setCheckOpen(false);
    toast(`${labelToSave} added · ${formatMoney(amount)}`, {
      action: {
        label: tCommon("undo"),
        onClick: () => reverseTransaction(tx.id),
      },
    });
  };

  const handleWait = () => {
    const defaultLabel = env === "fun" ? tToday("funMoney") : tToday("essentials");
    const labelToSave = customLabel.trim() || defaultLabel;
    addWaitItem({
      label: labelToSave,
      amount,
      envelope: env,
    });
    setCheckOpen(false);
    const unlockTime = new Date(now.getTime() + 86400000);
    toast(
      t("addedToWaitListToast", {
        time: unlockTime.toLocaleString(locale === "km-KH" ? "km-KH" : "en-US", {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        }),
      })
    );
  };

  // Split-Tender Calculations
  const splitResult = calculateSplitTender({
    billCents: amount,
    tenderedUsdCents: parseMoneyInputToCents(tenderedUsd, "USD"),
    tenderedKhr: parseInt(tenderedKhr || "0", 10),
    changeUsdCents: parseMoneyInputToCents(changeUsd, "USD"),
    changeKhr: parseInt(changeKhr || "0", 10),
    exchangeRate,
  });

  const applySplitNet = () => {
    if (splitResult.netPaidCents > 0) {
      if (currency === "USD") {
        const dollars = (splitResult.netPaidCents / 100).toFixed(2);
        setAmountStr(dollars.endsWith(".00") ? (splitResult.netPaidCents / 100).toString() : dollars);
      } else {
        const khr = usdCentsToKhr(splitResult.netPaidCents, exchangeRate);
        setAmountStr(khr.toString());
      }
      setSplitOpen(false);
      toast.success(`${t("netExpense")} · ${formatMoney(splitResult.netPaidCents)}`);
    }
  };

  return (
    <>
      <Sheet
        open={checkOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAmountStr("");
            setCustomLabel("");
            setMore(false);
            setSplitOpen(false);
          }
          setCheckOpen(open);
        }}
      >
        <SheetContent
          side={mobile ? "bottom" : "right"}
          hideCloseButton={mobile}
          className={cn(
            "flex flex-col justify-between overflow-y-auto border-border bg-card p-0",
            mobile
              ? "max-h-[94dvh] rounded-t-3xl pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
              : "w-[410px] sm:max-w-[410px]"
          )}
        >
          {/* Top Section */}
          <div className="flex flex-col gap-2.5">
            {/* Mobile iOS Sheet Drag Handle */}
            {mobile && (
              <div className="flex justify-center pt-2.5 pb-0.5">
                <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
              </div>
            )}

            {/* Header & Split Toggle Link */}
            <SheetHeader className="px-5 pt-3 pb-0 text-left">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-bold tracking-tight text-foreground">
                  {t("title")}
                </SheetTitle>
                <button
                  type="button"
                  onClick={() => setSplitOpen(!splitOpen)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    splitOpen
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                  title={t("splitTenderTitle")}
                >
                  <Coins className="size-3.5" />
                  <span className="text-[11px] font-semibold">{t("splitTenderTitle")}</span>
                </button>
              </div>
            </SheetHeader>

            {/* Segmented Controls: Envelope Selector & Currency Switcher */}
            <div className="flex items-center justify-between gap-2 px-5">
              {/* Compact Segmented Envelope Switcher */}
              <div
                role="radiogroup"
                aria-label="Envelope"
                className="flex items-center bg-secondary/40 p-0.5 rounded-xl border border-border/70"
              >
                {(["essentials", "fun"] as const).map((e) => {
                  const isSelected = env === e;
                  const isFun = e === "fun";
                  const EnvelopeIcon = isFun ? Heart : ShoppingBag;
                  return (
                    <button
                      key={e}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setEnv(e)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                        isSelected
                          ? isFun
                            ? "bg-warning/20 text-warning border border-warning/30 shadow-2xs"
                            : "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <EnvelopeIcon className="size-3" />
                      <span>{isFun ? tToday("funMoney") : tToday("essentials")}</span>
                      <span className="text-[10px] font-mono opacity-80">
                        ({formatMoney(computed.envelopeRemaining[e])})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center bg-secondary/40 rounded-xl border border-border/70 p-0.5">
                <button
                  type="button"
                  onClick={() => toggleCurrency("USD")}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer",
                    currency === "USD"
                      ? "bg-card text-foreground shadow-2xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  $ USD
                </button>
                <button
                  type="button"
                  onClick={() => toggleCurrency("KHR")}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer",
                    currency === "KHR"
                      ? "bg-card text-foreground shadow-2xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  ៛ KHR
                </button>
              </div>
            </div>

            {/* Compact Amount Display Box */}
            <div className="px-5">
              <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-secondary/25 px-4 py-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-xl sm:text-2xl font-black text-muted-foreground select-none">
                    {currency === "USD" ? "$" : "៛"}
                  </span>
                  <input
                    type="text"
                    data-keypad-input="true"
                    inputMode={currency === "USD" ? "decimal" : "numeric"}
                    value={amountStr}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="0"
                    className={cn(
                      "w-28 sm:w-36 bg-transparent border-none outline-none font-black tracking-tight text-foreground transition-all placeholder:text-muted-foreground/30 focus:ring-0 p-0 selection:bg-primary/20",
                      amount >= 10000000
                        ? "text-xl sm:text-2xl"
                        : amount >= 100000
                          ? "text-2xl sm:text-3xl"
                          : "text-2xl sm:text-3xl"
                    )}
                    aria-label="Purchase amount"
                  />
                  <span className="money text-xs font-medium text-muted-foreground truncate">
                    ≈{" "}
                    {currency === "USD"
                      ? `${usdCentsToKhr(amount, exchangeRate).toLocaleString()} ៛`
                      : formatMoney(amount, undefined, "USD")}
                  </span>
                </div>

                {amountStr && (
                  <button
                    type="button"
                    onClick={() => setAmountStr("")}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-md hover:bg-secondary/60 cursor-pointer shrink-0"
                  >
                    {t("clearAmount")}
                  </button>
                )}
              </div>
            </div>

            {/* Description & Inline Top 3 Suggestions + More Button */}
            <div className="px-5 space-y-1.5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder={t("notePlaceholder")}
                  className="w-full px-3 py-1.5 pr-8 rounded-xl border border-border/70 bg-card text-foreground text-xs placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary outline-hidden"
                />
                {customLabel && (
                  <button
                    type="button"
                    onClick={() => setCustomLabel("")}
                    className="absolute right-2 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
                    aria-label="Clear note"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* 2-3 Quick Suggestions + "More..." Action */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {QUICK_CHECK_ITEMS.slice(0, 3).map((item) => {
                  const itemLabel = locale.startsWith("km") ? item.km : item.en;
                  const isSelected = customLabel === itemLabel;
                  const ItemIcon = item.icon;
                  const displayAmount =
                    currency === "USD"
                      ? formatMoney(item.usdCents, undefined, "USD")
                      : `${item.khrAmount.toLocaleString()} ៛`;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectQuickItem(item)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer select-none",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                          : "border-border/70 bg-card hover:bg-secondary/60 text-foreground"
                      )}
                    >
                      <ItemIcon
                        className={cn(
                          "size-3.5",
                          isSelected ? "text-primary-foreground" : "text-muted-foreground"
                        )}
                      />
                      <span>{itemLabel}</span>
                      <span
                        className={cn(
                          "text-[10px] font-mono",
                          isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                        )}
                      >
                        {displayAmount}
                      </span>
                    </button>
                  );
                })}

                {/* More / See More Button */}
                <button
                  type="button"
                  onClick={() => setPresetsDialogOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-border hover:border-primary/50 bg-secondary/20 hover:bg-secondary/60 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer select-none"
                >
                  <LayoutGrid className="size-3" />
                  <span>{t("moreSuggestions")}</span>
                </button>
              </div>
            </div>

            {/* Split Tender Drawer (Only Takes Space When Toggled Open) */}
            {splitOpen && (
              <div className="mx-5 p-3 rounded-xl border border-border/80 bg-secondary/20 space-y-2.5 animate-in fade-in slide-in-from-top-1">
                <p className="text-[11px] text-muted-foreground">{t("splitTenderSubtitle")}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                      {t("paidAmount")} (USD)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="$0.00"
                      value={tenderedUsd}
                      onChange={(e) => setTenderedUsd(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 rounded-lg border border-border bg-card text-foreground font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                      {t("paidAmount")} (KHR)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0 ៛"
                      value={tenderedKhr}
                      onChange={(e) => setTenderedKhr(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 rounded-lg border border-border bg-card text-foreground font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                      {t("changeReturned")} (USD)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="$0.00"
                      value={changeUsd}
                      onChange={(e) => setChangeUsd(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 rounded-lg border border-border bg-card text-foreground font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                      {t("changeReturned")} (KHR)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0 ៛"
                      value={changeKhr}
                      onChange={(e) => setChangeKhr(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 rounded-lg border border-border bg-card text-foreground font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
                    />
                  </div>
                </div>

                {splitResult.totalTenderedCents > 0 && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
                    <div className="text-xs">
                      <span className="text-muted-foreground">{t("netExpense")}: </span>
                      <span className="font-bold font-mono text-foreground">
                        {formatMoney(splitResult.netPaidCents)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={applySplitNet}
                      className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 cursor-pointer shadow-2xs"
                    >
                      {t("applyNet")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Plan Impact Bar */}
            {amount > 0 && (
              <div className="px-5">
                <div className={cn("rounded-xl border px-3 py-1.5 text-xs transition-all", s.cls)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <s.icon className="size-3.5" />
                      <span>{s.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMore(!more)}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <span className="font-mono">{tToday("left", { amount: formatMoney(projectedRemaining) })}</span>
                      <ChevronDown
                        className={cn("size-3 transition-transform", more && "rotate-180")}
                      />
                    </button>
                  </div>
                  <p className="mt-0.5 text-[11px] text-foreground/90 leading-tight">{explain}</p>
                  {more && (
                    <div className="mt-1.5 pt-1.5 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-foreground">{t("weeklyRemaining")}: </span>
                        <span className="font-semibold font-mono">
                          {formatMoney(projectedRemaining)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("nextDays")}: </span>
                        <span className="font-semibold font-mono">
                          {formatMoney(nextDaily)}/day
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Keypad & Actions (Fits Screen Comfortably) */}
          <div className="mt-2 flex flex-col gap-2">
            {/* Quick Bump Pills */}
            <div className="grid grid-cols-4 gap-1.5 px-5">
              {(currency === "USD" ? [100, 200, 500, 1000] : [2000, 5000, 10000, 20000]).map(
                (increment) => {
                  const label =
                    currency === "USD" ? `+$${increment / 100}` : `+${increment / 1000}k ៛`;
                  return (
                    <button
                      key={increment}
                      type="button"
                      onClick={() => addQuickBump(increment)}
                      className="flex h-8 items-center justify-center rounded-xl border border-border/70 bg-secondary/30 text-xs font-semibold text-foreground hover:bg-secondary active:scale-95 transition-all cursor-pointer shadow-2xs select-none"
                    >
                      {label}
                    </button>
                  );
                }
              )}
            </div>

            {/* Tactile Keypad */}
            <div className="grid grid-cols-3 gap-1.5 px-5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => press(k)}
                  className="money flex h-11 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 text-lg font-bold text-foreground transition-all hover:bg-secondary active:scale-95 active:bg-secondary/90 cursor-pointer shadow-2xs select-none"
                >
                  {k}
                </button>
              ))}
              <button
                type="button"
                onClick={() => press(currency === "USD" ? "." : "000")}
                aria-label={currency === "USD" ? "Decimal point" : "Add thousand"}
                className="money flex h-11 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 text-lg font-bold text-foreground transition-all hover:bg-secondary active:scale-95 active:bg-secondary/90 cursor-pointer shadow-2xs select-none"
              >
                {currency === "USD" ? "." : "000"}
              </button>
              <button
                type="button"
                onClick={() => press("0")}
                className="money flex h-11 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 text-lg font-bold text-foreground transition-all hover:bg-secondary active:scale-95 active:bg-secondary/90 cursor-pointer shadow-2xs select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => press("del")}
                aria-label="Delete last digit"
                className="money flex h-11 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 text-lg font-bold text-foreground transition-all hover:bg-secondary active:scale-95 active:bg-secondary/90 cursor-pointer shadow-2xs select-none"
              >
                <Delete className="size-4 text-muted-foreground" />
              </button>
            </div>

            {/* Sticky Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 border-t border-border/80 bg-card p-4 pt-3">
              <button
                type="button"
                disabled={!amount}
                onClick={handleWait}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground transition-all hover:bg-secondary active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Clock className="size-4 text-muted-foreground" />
                <span>{t("wait24h")}</span>
              </button>
              <button
                type="button"
                disabled={!amount}
                onClick={handleAdd}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{t("addPurchase")}</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick Presets Catalog Dialog (Modal on Desktop, Bottom Sheet on Mobile) */}
      <Dialog open={presetsDialogOpen} onOpenChange={setPresetsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <LayoutGrid className="size-4 text-primary" />
              <span>{t("allPresetsTitle")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("allPresetsSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Essentials Section */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                {tToday("essentials")}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_CHECK_ITEMS.filter((i) => i.envelope === "essentials").map((item) => {
                  const itemLabel = locale.startsWith("km") ? item.km : item.en;
                  const ItemIcon = item.icon;
                  const displayAmount =
                    currency === "USD"
                      ? formatMoney(item.usdCents, undefined, "USD")
                      : `${item.khrAmount.toLocaleString()} ៛`;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleSelectQuickItem(item);
                        setPresetsDialogOpen(false);
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-secondary/20 hover:bg-secondary/60 hover:border-primary/50 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border group-hover:border-primary/40 text-foreground transition-colors">
                        <ItemIcon className="size-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-foreground truncate">
                          {itemLabel}
                        </span>
                        <span className="money block text-[11px] font-mono text-muted-foreground">
                          {displayAmount}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fun Money Section */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                {tToday("funMoney")}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_CHECK_ITEMS.filter((i) => i.envelope === "fun").map((item) => {
                  const itemLabel = locale.startsWith("km") ? item.km : item.en;
                  const ItemIcon = item.icon;
                  const displayAmount =
                    currency === "USD"
                      ? formatMoney(item.usdCents, undefined, "USD")
                      : `${item.khrAmount.toLocaleString()} ៛`;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleSelectQuickItem(item);
                        setPresetsDialogOpen(false);
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-secondary/20 hover:bg-secondary/60 hover:border-warning/50 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border group-hover:border-warning/40 text-foreground transition-colors">
                        <ItemIcon className="size-4 text-warning" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-foreground truncate">
                          {itemLabel}
                        </span>
                        <span className="money block text-[11px] font-mono text-muted-foreground">
                          {displayAmount}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
