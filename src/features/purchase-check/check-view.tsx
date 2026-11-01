"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  Briefcase,
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
  Sparkles,
  TrendingUp,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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
  { id: "meal", icon: Utensils, en: "Meal / Lunch", km: "អាហារ / បាយ", usdCents: 250, khrAmount: 10000, envelope: "essentials" },
  { id: "tuktuk", icon: Bike, en: "TukTuk / Ride", km: "PassApp / ម៉ូតូឌុប", usdCents: 125, khrAmount: 5000, envelope: "essentials" },
  { id: "groceries", icon: ShoppingBag, en: "Groceries", km: "ទិញម្ហូបផ្សារ", usdCents: 500, khrAmount: 20000, envelope: "essentials" },
  { id: "fuel", icon: Fuel, en: "Gasoline / Fuel", km: "ចាក់សាំង", usdCents: 300, khrAmount: 12000, envelope: "essentials" },
  { id: "pharmacy", icon: Pill, en: "Pharmacy", km: "ទិញថ្នាំពេទ្យ", usdCents: 400, khrAmount: 16000, envelope: "essentials" },
  { id: "coffee", icon: Coffee, en: "Coffee", km: "កាហ្វេ", usdCents: 150, khrAmount: 6000, envelope: "fun" },
  { id: "drink", icon: CupSoda, en: "Boba / Drink", km: "ភេសជ្ជៈ / តែគុជ", usdCents: 200, khrAmount: 8000, envelope: "fun" },
  { id: "snack", icon: Cookie, en: "Snack / Treat", km: "ចំណីចំណុក", usdCents: 100, khrAmount: 4000, envelope: "fun" },
];

export function CheckView({ locale }: { locale: string }) {
  const router = useRouter();
  const t = useTranslations("check");
  const tToday = useTranslations("today");
  const tCommon = useTranslations("common");
  const mobile = useIsMobile();
  const { computed, now, state, addTransaction, reverseTransaction, addWaitItem } = useWealthEngine();

  const [amountStr, setAmountStr] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [env, setEnv] = useState<EnvelopeId>("essentials");
  const [currency, setCurrency] = useState<"USD" | "KHR">(state.preferences.currency || "USD");
  const [showKeypad, setShowKeypad] = useState(true);
  const [presetsDialogOpen, setPresetsDialogOpen] = useState(false);
  const exchangeRate = state.preferences.khrExchangeRate || 4000;

  // Split-tender drawer toggle
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

  const handleSelectPreset = (item: QuickCheckItem) => {
    setEnv(item.envelope);
    setCustomLabel(locale === "km-KH" ? item.km : item.en);
    if (currency === "USD") {
      const dollars = (item.usdCents / 100).toFixed(2);
      setAmountStr(dollars.endsWith(".00") ? (item.usdCents / 100).toString() : dollars);
    } else {
      setAmountStr(item.khrAmount.toString());
    }
    setPresetsDialogOpen(false);
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

  // Keyboard support for typing amounts directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currency]);

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
      badgeCls: "border-primary/40 bg-primary/10 text-primary",
      cardCls: "border-primary/30 bg-primary/5",
    },
    ADJUSTED: {
      label: t("adjustsWeek"),
      icon: Gauge,
      badgeCls: "border-warning/40 bg-warning/10 text-warning",
      cardCls: "border-warning/30 bg-warning/5",
    },
    NEEDS_DECISION: {
      label: t("needsDecision"),
      icon: AlertTriangle,
      badgeCls: "border-destructive/40 bg-destructive/10 text-destructive",
      cardCls: "border-destructive/30 bg-destructive/5",
    },
  };

  const s = statusUi[status];
  const over = amount - computed.availableToday;
  const hrs = workHours(amount, state.plan.monthlyFlexibleIncome, state.plan.monthlyWorkHours);
  const fv = futureValue(amount);

  const explain =
    status === "ON_PLAN"
      ? t("leavesForToday", { amount: formatMoney(Math.max(0, computed.availableToday - amount)) })
      : status === "ADJUSTED"
        ? t("aboveTodayTarget", { over: formatMoney(over), nextDaily: formatMoney(nextDaily) })
        : t("takesFromProtected", { amount: formatMoney(amount - computed.periodRemaining) });

  const handleRecord = () => {
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

    toast(`${labelToSave} added · ${formatMoney(amount)}`, {
      action: {
        label: tCommon("undo"),
        onClick: () => reverseTransaction(tx.id),
      },
    });

    router.push(`/${locale}/today`);
  };

  const handleWait = () => {
    const defaultLabel = env === "fun" ? tToday("funMoney") : tToday("essentials");
    const labelToSave = customLabel.trim() || defaultLabel;
    addWaitItem({
      label: labelToSave,
      amount,
      envelope: env,
    });
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
    router.push(`/${locale}/plan/wait-list`);
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
      toast.success(`${t("netExpense")} applied · ${formatMoney(splitResult.netPaidCents)}`);
    }
  };

  return (
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px] pb-12">
      {/* Left Column: Purchase Entry, Presets, Split Calculator */}
      <div className="space-y-7">
        {/* Purchase Amount Card */}
        <div className="rounded-[10px] bg-card p-5 lg:p-6 shadow-sm space-y-5">
          {/* Amount Box with Integrated Currency Switcher */}
          <div className="rounded-xl border border-border/80 bg-secondary/25 p-5 relative">
            {/* Header row inside card */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("amountTitle")}
              </span>

              <div className="flex items-center gap-1 bg-card/90 p-0.5 rounded-lg border border-border shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleCurrency("USD")}
                  className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
                    currency === "USD"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  $ USD
                </button>
                <button
                  type="button"
                  onClick={() => toggleCurrency("KHR")}
                  className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
                    currency === "KHR"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  ៛ KHR
                </button>
              </div>
            </div>

            {/* Amount Display with Direct Interactive Input */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="flex items-center justify-center gap-1.5 w-full">
                <span className="text-3xl sm:text-4xl font-black text-muted-foreground select-none">
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
                    "max-w-[240px] sm:max-w-xs text-center bg-transparent border-none outline-none font-black tracking-tight text-foreground transition-all placeholder:text-placeholder focus:ring-0 p-0 selection:bg-primary/20",
                    amount >= 10000000
                      ? "text-3xl sm:text-4xl"
                      : amount >= 100000
                        ? "text-4xl sm:text-5xl"
                        : "text-5xl sm:text-6xl"
                  )}
                  aria-label="Purchase amount"
                />
              </div>

              <p className="money text-sm font-medium text-muted-foreground mt-1.5 flex items-center gap-1.5 select-none">
                <span>≈</span>
                {currency === "USD" ? (
                  <span>{usdCentsToKhr(amount, exchangeRate).toLocaleString()} ៛</span>
                ) : (
                  <span>{formatMoney(amount, undefined, "USD")}</span>
                )}
                <span className="text-xs text-muted-foreground">(@{exchangeRate.toLocaleString()} ៛/$)</span>
              </p>
            </div>

            {/* Clear button if amountStr exists */}
            {amountStr && (
              <button
                type="button"
                onClick={() => setAmountStr("")}
                className="absolute bottom-3 right-3 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-md hover:bg-secondary/70 transition-colors cursor-pointer"
              >
                {t("clearAmount")}
              </button>
            )}
          </div>

          {/* Spend From Envelope Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("spendFromEnvelope")}
            </label>
            <div role="radiogroup" aria-label="Envelope" className="grid grid-cols-2 gap-3">
              {(["essentials", "fun"] as const).map((e) => {
                const isSelected = env === e;
                const isFun = e === "fun";
                const EnvelopeIcon = isFun ? Heart : ShoppingBag;
                const remaining = computed.envelopeRemaining[e];

                return (
                  <button
                    key={e}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setEnv(e)}
                    className={cn(
                      "flex flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                      isSelected
                        ? isFun
                          ? "border-warning bg-warning/10 shadow-xs ring-1 ring-warning/30"
                          : "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                        : "border-border bg-card hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className={cn("size-4", isSelected ? (isFun ? "text-warning" : "text-primary") : "text-muted-foreground")} />
                      <span className="text-sm font-bold text-foreground">
                        {isFun ? tToday("funMoney") : tToday("essentials")}
                      </span>
                    </div>
                    <span className="money text-xs font-semibold text-muted-foreground">
                      {tToday("left", { amount: formatMoney(remaining) })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Note Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("purchaseNote")}
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder={t("notePlaceholder")}
                className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-border/80 bg-card text-foreground text-sm placeholder:text-placeholder focus:ring-1 focus:ring-primary outline-hidden"
              />
              {customLabel && (
                <button
                  type="button"
                  onClick={() => setCustomLabel("")}
                  className="absolute right-3 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
                  aria-label="Clear note"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Increment Bumper Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("quickAdjust")}
              </span>
              <button
                type="button"
                onClick={() => setShowKeypad(!showKeypad)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{showKeypad ? t("hideKeypad") : t("showKeypad")}</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(currency === "USD" ? [100, 200, 500, 1000] : [2000, 5000, 10000, 20000]).map((increment) => {
                const label = currency === "USD" ? `+$${increment / 100}` : `+${(increment / 1000)}k ៛`;
                return (
                  <button
                    key={increment}
                    type="button"
                    onClick={() => addQuickBump(increment)}
                    className="flex h-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/30 text-xs font-bold text-foreground hover:bg-secondary active:scale-95 transition-all cursor-pointer shadow-2xs select-none"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency-Adaptive Keypad */}
          {showKeypad && (
            <div className="pt-2 border-t border-border/60 animate-in fade-in space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => press(k)}
                    className="money flex h-11 items-center justify-center rounded-xl border border-border/70 bg-card text-base font-bold text-foreground transition-all hover:bg-secondary active:scale-95 cursor-pointer shadow-2xs select-none"
                  >
                    {k}
                  </button>
                ))}
                {/* Row 4: . or 000, 0, del */}
                <button
                  type="button"
                  onClick={() => press(currency === "USD" ? "." : "000")}
                  aria-label={currency === "USD" ? "Decimal point" : "Add thousand"}
                  className="money flex h-11 items-center justify-center rounded-xl border border-border/70 bg-card text-base font-bold text-foreground transition-all hover:bg-secondary active:scale-95 cursor-pointer shadow-2xs select-none"
                >
                  {currency === "USD" ? "." : "000"}
                </button>
                <button
                  type="button"
                  onClick={() => press("0")}
                  className="money flex h-11 items-center justify-center rounded-xl border border-border/70 bg-card text-base font-bold text-foreground transition-all hover:bg-secondary active:scale-95 cursor-pointer shadow-2xs select-none"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => press("del")}
                  aria-label="Delete last digit"
                  className="money flex h-11 items-center justify-center rounded-xl border border-border/70 bg-card text-base font-bold text-foreground transition-all hover:bg-secondary active:scale-95 cursor-pointer shadow-2xs select-none"
                >
                  <Delete className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestions Card (Show a few + Action for More / See More) */}
        <div className="rounded-[10px] bg-card p-5 lg:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("allPresetsTitle")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("allPresetsSubtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPresetsDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/30 hover:bg-secondary text-xs font-bold text-primary transition-all cursor-pointer shadow-2xs select-none"
            >
              <LayoutGrid className="size-3.5" />
              <span>{t("moreSuggestions")}</span>
            </button>
          </div>

          {/* Top 3-4 Quick Suggestions Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {QUICK_CHECK_ITEMS.slice(0, 4).map((item) => {
              const itemLabel = locale === "km-KH" ? item.km : item.en;
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
                  onClick={() => handleSelectPreset(item)}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer group",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                      : "border-border/80 bg-secondary/20 hover:bg-secondary/60 hover:border-primary/40"
                  )}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-card border border-border group-hover:border-primary/40 text-primary transition-colors">
                    <ItemIcon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-foreground truncate">
                      {itemLabel}
                    </span>
                    <span className="money block text-[11px] font-semibold text-muted-foreground">
                      {displayAmount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Split Cash & Change Calculator Section */}
        <div className="rounded-[10px] bg-card p-5 shadow-sm space-y-3">
          <button
            type="button"
            onClick={() => setSplitOpen(!splitOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Coins className="size-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">
                  {t("splitTenderTitle")}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {t("splitTenderSubtitle")}
                </p>
              </div>
            </div>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", splitOpen && "rotate-180")} />
          </button>

          {splitOpen && (
            <div className="pt-3 border-t border-border/80 space-y-3 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">
                    {t("paidAmount")} (USD)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="$0.00"
                    value={tenderedUsd}
                    onChange={(e) => setTenderedUsd(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">
                    {t("paidAmount")} (KHR)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0 ៛"
                    value={tenderedKhr}
                    onChange={(e) => setTenderedKhr(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">
                    {t("changeReturned")} (USD)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="$0.00"
                    value={changeUsd}
                    onChange={(e) => setChangeUsd(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">
                    {t("changeReturned")} (KHR)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0 ៛"
                    value={changeKhr}
                    onChange={(e) => setChangeKhr(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/30 text-foreground font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                </div>
              </div>

              {splitResult.totalTenderedCents > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-border/80">
                  <div>
                    <span className="text-xs text-muted-foreground">{t("netExpense")}: </span>
                    <span className="text-sm font-black font-mono text-foreground">
                      {formatMoney(splitResult.netPaidCents)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={applySplitNet}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 shadow-xs cursor-pointer"
                  >
                    {t("applyNet")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Live Wealth Simulator & Decision (Same proportion as TodayView) */}
      <div className="space-y-7 lg:sticky lg:top-4">
        {/* Status Decision Card */}
        <div className={cn("rounded-2xl border p-5 lg:p-6 shadow-sm transition-all space-y-4", s.cardCls)}>
          <div className="flex items-center justify-between">
            <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", s.badgeCls)}>
              <s.icon className="size-4" />
              <span>{s.label}</span>
            </span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {t("simulatorTitle")}
            </span>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed font-medium">
            {amount > 0 ? explain : t("simulatePrompt")}
          </p>

          {/* Before vs After Impact Box */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("beforeVsAfter")}
            </h4>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50">
                <dt className="text-muted-foreground">{t("todayAfter")}</dt>
                <dd className="money text-base font-black text-foreground mt-0.5">
                  {formatMoney(Math.max(0, computed.availableToday - amount))}
                </dd>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  {t("startsAt", { amount: formatMoney(computed.availableToday) })}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50">
                <dt className="text-muted-foreground">{t("nextDaysPace")}</dt>
                <dd className="money text-base font-black text-foreground mt-0.5">
                  {formatMoney(nextDaily)}/day
                </dd>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  {t("throughEndOfWeek")}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50">
                <dt className="text-muted-foreground">{t("weeklyRemaining")}</dt>
                <dd className="money text-sm font-bold text-foreground mt-0.5">
                  {formatMoney(projectedRemaining)}
                </dd>
              </div>

              <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50">
                <dt className="text-muted-foreground">{t("chosenEnvelope")}</dt>
                <dd className="money text-sm font-bold text-foreground mt-0.5">
                  {tToday("left", { amount: formatMoney(Math.max(0, computed.envelopeRemaining[env] - amount)) })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Trade-offs & Perspectives */}
          {amount > 0 && (
            <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>{t("opportunityCost")}</span>
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <Briefcase className="size-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">{t("workHoursEquiv")}: </span>
                    <span>{t("workHoursText", { hours: hrs.toFixed(1) })}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <TrendingUp className="size-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">{t("futureFundEquiv")}: </span>
                    <span>{t("futureFundText", { amount: formatMoney(fv) })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              disabled={!amount}
              onClick={handleRecord}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{t("addPurchase")}</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              disabled={!amount}
              onClick={handleWait}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground transition-all hover:bg-secondary active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Clock className="size-4 text-muted-foreground" />
              <span>{t("wait24h")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Presets Catalog: Dialog on Desktop, Bottom Sheet on Mobile */}
      {mobile ? (
        <Sheet open={presetsDialogOpen} onOpenChange={setPresetsDialogOpen}>
          <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-[12px] border-border bg-card p-0 flex flex-col">
            <div className="flex justify-center pt-3 pb-1">
              <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            </div>
            <SheetHeader className="px-5 pb-3 text-left border-b border-border/60">
              <SheetTitle className="text-base font-bold text-foreground">
                {t("allPresetsTitle")}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                {t("allPresetsSubtitle")}
              </p>
            </SheetHeader>
            <div className="overflow-y-auto p-5 space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("presetsEssentials")}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_CHECK_ITEMS.filter((i) => i.envelope === "essentials").map((item) => {
                    const itemLabel = locale === "km-KH" ? item.km : item.en;
                    const ItemIcon = item.icon;
                    const displayAmount =
                      currency === "USD"
                        ? formatMoney(item.usdCents, undefined, "USD")
                        : `${item.khrAmount.toLocaleString()} ៛`;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectPreset(item)}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-border/70 bg-card hover:bg-secondary/50 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                          <ItemIcon className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-foreground truncate">
                            {itemLabel}
                          </span>
                          <span className="money block text-[11px] text-muted-foreground">
                            {displayAmount}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("presetsFun")}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_CHECK_ITEMS.filter((i) => i.envelope === "fun").map((item) => {
                    const itemLabel = locale === "km-KH" ? item.km : item.en;
                    const ItemIcon = item.icon;
                    const displayAmount =
                      currency === "USD"
                        ? formatMoney(item.usdCents, undefined, "USD")
                        : `${item.khrAmount.toLocaleString()} ៛`;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectPreset(item)}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-border/70 bg-card hover:bg-secondary/50 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-warning">
                          <ItemIcon className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-foreground truncate">
                            {itemLabel}
                          </span>
                          <span className="money block text-[11px] text-muted-foreground">
                            {displayAmount}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={presetsDialogOpen} onOpenChange={setPresetsDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                {t("allPresetsTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {t("allPresetsSubtitle")}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("presetsEssentials")}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {QUICK_CHECK_ITEMS.filter((i) => i.envelope === "essentials").map((item) => {
                    const itemLabel = locale === "km-KH" ? item.km : item.en;
                    const ItemIcon = item.icon;
                    const displayAmount =
                      currency === "USD"
                        ? formatMoney(item.usdCents, undefined, "USD")
                        : `${item.khrAmount.toLocaleString()} ៛`;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectPreset(item)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-secondary/20 hover:bg-secondary/60 hover:border-primary/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border group-hover:border-primary/40 text-primary transition-colors">
                          <ItemIcon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-foreground truncate">
                            {itemLabel}
                          </span>
                          <span className="money block text-[11px] font-semibold text-muted-foreground">
                            {displayAmount}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("presetsFun")}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {QUICK_CHECK_ITEMS.filter((i) => i.envelope === "fun").map((item) => {
                    const itemLabel = locale === "km-KH" ? item.km : item.en;
                    const ItemIcon = item.icon;
                    const displayAmount =
                      currency === "USD"
                        ? formatMoney(item.usdCents, undefined, "USD")
                        : `${item.khrAmount.toLocaleString()} ៛`;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectPreset(item)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-secondary/20 hover:bg-secondary/60 hover:border-warning/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border group-hover:border-warning/40 text-warning transition-colors">
                          <ItemIcon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-foreground truncate">
                            {itemLabel}
                          </span>
                          <span className="money block text-[11px] font-semibold text-muted-foreground">
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
      )}
    </div>
  );
}
