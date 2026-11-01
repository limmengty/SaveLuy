"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Lock,
  LayoutTemplate,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  History,
  Edit3,
  RotateCcw,
  Check,
  X,
  CalendarCheck,
  Trash2,
  Plus,
  Calendar,
  Wifi,
  Zap,
  Home,
  Droplets,
  Tv,
  Smartphone,
  Music,
  HeartHandshake,
  Dumbbell,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney, parseMoneyInputToCents, centsToInputValue, evaluatePlanFeasibility } from "@/lib/money";
import { ProgressBar } from "@/components/product/progress-bar";
import { EmergencyUnlockModal } from "./emergency-unlock-modal";
import { TemplateSwitcherModal } from "./template-switcher-modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlanSkeleton } from "@/app/[locale]/(app)/plan/loading";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/wealth-engine/engine";
import { generateTemplatesForIncome, type GeneratedTemplate } from "@/features/onboarding/template-generator";
import { EnvelopeUsageBars } from "@/components/charts/envelope-usage-bars";
import { aggregateEnvelopeUsage } from "@/features/analytics/utils/chart-aggregations";

export interface BillSuggestion {
  key: string;
  en: string;
  km: string;
  icon: LucideIcon;
  category: "housing" | "utilities" | "family" | "subscription" | "other";
  defaultDay: number;
}

export const SMART_BILL_SUGGESTIONS: BillSuggestion[] = [
  { key: "wifi", en: "Home WiFi / Internet", km: "អ៊ីនធឺណិត (WiFi)", icon: Wifi, category: "utilities", defaultDay: 15 },
  { key: "edc", en: "Electricity (EDC)", km: "ថ្លៃភ្លើង (EDC)", icon: Zap, category: "utilities", defaultDay: 10 },
  { key: "rent", en: "Apartment / Rent", km: "ថ្លៃផ្ទះជួល", icon: Home, category: "housing", defaultDay: 1 },
  { key: "water", en: "Clean Water", km: "ថ្លៃទឹកស្អាត", icon: Droplets, category: "utilities", defaultDay: 12 },
  { key: "netflix", en: "Netflix", km: "Netflix", icon: Tv, category: "subscription", defaultDay: 20 },
  { key: "mobile", en: "Mobile Phone / Data", km: "កាតទូរស័ព្ទ / អ៊ីនធឺណិត", icon: Smartphone, category: "utilities", defaultDay: 1 },
  { key: "spotify", en: "Spotify", km: "Spotify", icon: Music, category: "subscription", defaultDay: 18 },
  { key: "parents", en: "Parents Support", km: "ប្រាក់ឧបត្ថម្ភឪពុកម្តាយ", icon: HeartHandshake, category: "family", defaultDay: 1 },
  { key: "gym", en: "Gym Membership", km: "ថ្លៃហាត់ប្រាណ (Gym)", icon: Dumbbell, category: "other", defaultDay: 5 },
  { key: "trash", en: "Waste / Trash Fee", km: "ថ្លៃសម្រាម", icon: Trash2, category: "utilities", defaultDay: 15 },
];

// Zod schema for money field validation
export const moneyFieldSchema = z
  .number()
  .min(0, "Amount cannot be negative")
  .max(10_000_000_00, "Amount exceeds limit");

interface MoneyFieldProps {
  label: string;
  value: number; // in cents
  onChange: (cents: number) => void;
  hint: string;
  currency?: "USD" | "KHR";
  exchangeRate?: number;
}

/**
 * MoneyField component that syncs with external value updates
 * and validates with Zod before committing changes to recalculate the plan.
 */
function MoneyField({ label, value, onChange, hint, currency = "USD", exchangeRate = 4000 }: MoneyFieldProps) {
  // A null draft mirrors the prop value; edits live in the draft until committed
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const strValue = draft ?? centsToInputValue(value, currency, exchangeRate);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits, single decimal point (for USD), and empty string
    if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;

    setDraft(raw);
    setError(null);

    // Live calculation: immediately update parent state when valid
    const cents = parseMoneyInputToCents(raw, currency, exchangeRate);
    const result = moneyFieldSchema.safeParse(cents);
    if (result.success && cents !== value) {
      onChange(cents);
    }
  };

  const commitValue = () => {
    const cents = parseMoneyInputToCents(strValue, currency, exchangeRate);
    const result = moneyFieldSchema.safeParse(cents);

    if (!result.success) {
      const issue = result.error.issues[0]?.message;
      setError(issue || "Invalid value");
      setDraft(null);
      return;
    }

    setError(null);
    setDraft(null);

    if (cents !== value) {
      onChange(cents);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitValue();
      (e.target as HTMLInputElement).blur();
    }
  };

  const isKhr = currency === "KHR";

  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="mt-1.5">
        <Input
          inputMode={isKhr ? "numeric" : "decimal"}
          value={strValue}
          onFocus={() => setError(null)}
          onChange={handleChange}
          onBlur={commitValue}
          onKeyDown={handleKeyDown}
          placeholder={isKhr ? "0" : "0.00"}
          startAdornment={isKhr ? "៛" : "$"}
          className="money font-semibold"
        />
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs text-destructive">{error}</span>
      ) : (
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

export function PlanView({ locale }: { locale: string }) {
  const t = useTranslations("plan");
  const tEmergency = useTranslations("emergency");
  const {
    state,
    computed,
    isReady,
    updatePlan,
    revertEmergencyUnlock,
    clearAllEmergencyRelief,
    updateEmergencyReason,
    addScheduledCommitment,
    deleteScheduledCommitment,
  } = useWealthEngine();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEmergencyDetails, setShowEmergencyDetails] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editedReason, setEditedReason] = useState("");
  const [isAddingCommitment, setIsAddingCommitment] = useState(false);
  const [commitmentLabel, setCommitmentLabel] = useState("");
  const [commitmentDay, setCommitmentDay] = useState("");
  const [commitmentAmount, setCommitmentAmount] = useState("");
  const [commitmentCategory, setCommitmentCategory] = useState<
    "housing" | "utilities" | "family" | "subscription" | "other"
  >("utilities");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [billCatalogOpen, setBillCatalogOpen] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  const plan = state.plan;

  const totalCommitmentsCents = (plan.scheduledCommitments || []).reduce(
    (sum, c) => sum + (c.amountCents || 0),
    0
  );

  const handleSelectSuggestion = (s: BillSuggestion) => {
    const localizedLabel = locale === "km-KH" ? s.km : s.en;
    setCommitmentLabel(localizedLabel);
    setCommitmentCategory(s.category);
    if (!commitmentDay) {
      setCommitmentDay(s.defaultDay.toString());
    }
    setIsSuggestionsOpen(false);
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 60);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsContainerRef.current &&
        !suggestionsContainerRef.current.contains(event.target as Node)
      ) {
        setIsSuggestionsOpen(false);
      }
    }
    if (isSuggestionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSuggestionsOpen]);

  // Real-time live budget feasibility equation computed from current plan state
  const feasibility = evaluatePlanFeasibility({
    monthlyIncome: plan.monthlyFlexibleIncome,
    homeFixedMonthly: plan.homeFixedMonthly,
    futureFundMonthly: plan.futureFundMonthly,
    essentialsLimitWeekly: plan.essentialsLimit,
    funLimitWeekly: plan.funLimit,
  });

  if (!isReady) {
    return <PlanSkeleton />;
  }

  const setPlanField = (key: keyof Plan) => (cents: number) => {
    updatePlan({ [key]: cents });
  };

  const handleApplyTemplate = (tpl: GeneratedTemplate) => {
    // Deduct active emergency relief so the protected vault is not duplicated or overallocated
    const activeRelief = plan.emergencyReliefCents ?? 0;
    const adjustedHome = Math.max(0, tpl.homeFixedMonthly - activeRelief);

    updatePlan({
      essentialsLimit: tpl.essentialsWeekly,
      funLimit: tpl.funWeekly,
      homeFixedMonthly: adjustedHome,
      futureFundMonthly: tpl.futureFundMonthly,
    });
    if (activeRelief > 0) {
      toast.success(
        t("rebalancedWithEmergencyToast", {
          income: formatMoney(plan.monthlyFlexibleIncome),
          emergency: formatMoney(activeRelief),
        })
      );
    } else {
      toast.success(`${tpl.title} template applied`);
    }
  };

  const handleAutoRebalance = () => {
    const templates = generateTemplatesForIncome(plan.monthlyFlexibleIncome);
    const recommended = templates[0];
    const activeRelief = plan.emergencyReliefCents ?? 0;
    const adjustedHome = Math.max(0, recommended.homeFixedMonthly - activeRelief);

    updatePlan({
      essentialsLimit: recommended.essentialsWeekly,
      funLimit: recommended.funWeekly,
      homeFixedMonthly: adjustedHome,
      futureFundMonthly: recommended.futureFundMonthly,
    });
    if (activeRelief > 0) {
      toast.success(
        t("rebalancedWithEmergencyToast", {
          income: formatMoney(plan.monthlyFlexibleIncome),
          emergency: formatMoney(activeRelief),
        })
      );
    } else {
      toast.success(t("rebalancedToast", { income: formatMoney(plan.monthlyFlexibleIncome) }));
    }
  };

  const hasActiveEmergency = (plan.emergencyReliefCents ?? 0) > 0;
  const emergencyHistory = plan.emergencyHistory ?? (hasActiveEmergency && plan.lastEmergencyDate ? [{
    id: "active-latest",
    amountCents: plan.emergencyReliefCents ?? 0,
    reason: plan.lastEmergencyReason || "Emergency access",
    createdAt: plan.lastEmergencyDate,
  }] : []);

  return (
    <div className="space-y-6">
      {/* Active Emergency Protected Funds Indicator */}
      {hasActiveEmergency && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 transition-all">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 shrink-0 text-destructive mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-destructive">
                  {tEmergency("activeBannerTitle")}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEmergencyDetails(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:text-destructive/80 cursor-pointer bg-destructive/15 hover:bg-destructive/25 px-2.5 py-1 rounded-lg transition-all"
                >
                  <History className="size-3.5" />
                  <span>{tEmergency("viewLog")}</span>
                </button>
              </div>

              <p className="text-xs text-foreground leading-relaxed">
                {tEmergency("activeBannerDesc", {
                  amount: formatMoney(plan.emergencyReliefCents ?? 0),
                })}
              </p>

              {plan.lastEmergencyReason && (
                <p className="text-[11px] text-muted-foreground italic">
                  {tEmergency("reasonNote", {
                    reason: plan.lastEmergencyReason,
                  })}
                </p>
              )}

              <p className="text-[11px] text-muted-foreground pt-0.5">
                {tEmergency("replenishNote")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Weekly Flexible Envelopes */}
        <section aria-label="Flexible weekly envelopes">
          <h2 className="ios-section-header">{t("flexibleWeekly")}</h2>
          <div className="ios-list space-y-5 p-5">
            <MoneyField
              key="essentials"
              label={t("essentials")}
              value={plan.essentialsLimit}
              onChange={setPlanField("essentialsLimit")}
              hint={t("essentialsHint")}
              currency={state.preferences.currency}
              exchangeRate={state.preferences.khrExchangeRate}
            />
            <ProgressBar
              value={computed.envelopeSpent.essentials}
              max={plan.essentialsLimit + (plan.emergencyReliefCents ?? 0)}
            />
            {hasActiveEmergency && (
              <p className="text-[11px] font-medium text-destructive/90 -mt-2">
                + {formatMoney(plan.emergencyReliefCents ?? 0)} emergency relief credited
              </p>
            )}

            <MoneyField
              key="fun"
              label={t("funMoney")}
              value={plan.funLimit}
              onChange={setPlanField("funLimit")}
              hint={t("funMoneyHint")}
              currency={state.preferences.currency}
              exchangeRate={state.preferences.khrExchangeRate}
            />
            <ProgressBar
              value={computed.envelopeSpent.fun}
              max={plan.funLimit}
            />

            <div className="border-t border-border pt-4 space-y-1.5">
              <p className="money flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {hasActiveEmergency ? t("weeklyTotal") : t("weeklyTotal")}
                </span>
                <span className="font-semibold text-foreground">
                  {formatMoney(plan.essentialsLimit + plan.funLimit)}
                </span>
              </p>

              {hasActiveEmergency && (
                <p className="money flex justify-between text-sm text-destructive">
                  <span>{t("emergencyActiveWeeklyTotal")}</span>
                  <strong className="font-bold">
                    {formatMoney(plan.essentialsLimit + plan.funLimit + (plan.emergencyReliefCents ?? 0))}
                  </strong>
                </p>
              )}

              <p className="money flex justify-between text-sm text-muted-foreground pt-1 border-t border-border/40">
                <span>{hasActiveEmergency ? t("dailyBaseline") : t("dailyBaseline")}</span>
                <span>{formatMoney(Math.floor((plan.essentialsLimit + plan.funLimit) / 7))}</span>
              </p>

              {hasActiveEmergency && (
                <p className="money flex justify-between text-sm text-destructive/90 font-medium">
                  <span>{t("emergencyActiveDailyBaseline")}</span>
                  <span className="font-bold">{formatMoney(computed.baselineDaily)}</span>
                </p>
              )}

              {/* Envelope Usage Live Visualization */}
              <div className="pt-3 border-t border-border/40">
                <p className="text-xs font-semibold text-muted-foreground mb-3">{t("liveEnvelopeUsage")}</p>
                <EnvelopeUsageBars
                  envelopes={aggregateEnvelopeUsage(plan, state.transactions, new Date())}
                  locale={locale}
                />
              </div>
            </div>
          </div>
        </section>

      {/* Monthly Protected Commitments & Perspectives */}
      <div className="space-y-8">
        <section aria-label="Protected monthly commitments">
          <h2 className="ios-section-header">{t("protectedMonthly")}</h2>
          <div className="ios-list space-y-5 p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="size-4 shrink-0" /> {t("lockedNote")}
            </p>

            <MoneyField
              key="home"
              label={t("homeFixed")}
              value={plan.homeFixedMonthly}
              onChange={setPlanField("homeFixedMonthly")}
              hint={t("homeFixedHint")}
              currency={state.preferences.currency}
              exchangeRate={state.preferences.khrExchangeRate}
            />

            <MoneyField
              key="future"
              label={t("futureFund")}
              value={plan.futureFundMonthly}
              onChange={setPlanField("futureFundMonthly")}
              hint={t("futureFundHint")}
              currency={state.preferences.currency}
              exchangeRate={state.preferences.khrExchangeRate}
            />

            {plan.homeFixedMonthly + plan.futureFundMonthly <= 0 ? (
              <div className="mt-2 w-full rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-center text-xs font-semibold text-destructive/80">
                {tEmergency("vaultDepleted")}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowUnlockModal(true)}
                className="mt-2 w-full rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
              >
                {t("accessEmergency")}
              </button>
            )}
          </div>
        </section>

        {/* Scheduled Commitments & Bills (Dynamic Horizon Protection) */}
        <section aria-label="Scheduled commitments and bills">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <h2 className="ios-section-header">{t("scheduledCommitments")}</h2>
              {plan.scheduledCommitments && plan.scheduledCommitments.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-secondary/80 px-2.5 py-0.5 text-[11px] font-medium font-mono tabular-nums text-muted-foreground border border-border/40">
                  {plan.scheduledCommitments.length} · {formatMoney(totalCommitmentsCents, undefined, state.preferences.currency, state.preferences.khrExchangeRate)}/mo
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsAddingCommitment(!isAddingCommitment)}
              className={cn(
                "inline-flex items-center gap-1.5 min-h-[38px] sm:min-h-[32px] px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer",
                isAddingCommitment
                  ? "border-border bg-secondary text-foreground hover:bg-secondary/80"
                  : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 active:scale-95"
              )}
            >
              {isAddingCommitment ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
              <span>{isAddingCommitment ? t("cancel") : t("addCommitment")}</span>
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed flex items-start sm:items-center gap-2">
              <CalendarCheck className="size-4 shrink-0 text-primary mt-0.5 sm:mt-0" />
              <span>{t("scheduledCommitmentsHint")}</span>
            </p>

            {/* Form to add scheduled commitment */}
            {isAddingCommitment && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const cents = parseMoneyInputToCents(
                    commitmentAmount,
                    state.preferences.currency,
                    state.preferences.khrExchangeRate
                  );
                  const day = parseInt(commitmentDay, 10);
                  if (!commitmentLabel.trim() || cents <= 0 || !day || day < 1 || day > 31) {
                    toast.error(t("billErrorToast"));
                    return;
                  }
                  await addScheduledCommitment({
                    label: commitmentLabel.trim(),
                    amountCents: cents,
                    dueDayOfMonth: day,
                    category: commitmentCategory,
                  });
                  setCommitmentLabel("");
                  setCommitmentDay("");
                  setCommitmentAmount("");
                  setIsAddingCommitment(false);
                  setIsSuggestionsOpen(false);
                  toast.success(t("billAddedToast"));
                }}
                className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-secondary/30 space-y-4 animate-in fade-in duration-200"
              >
                {/* Smart Quick Suggestion Pills */}
                <div className="space-y-1.5 pb-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {t("suggestedBills")}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {SMART_BILL_SUGGESTIONS.slice(0, 3).map((s) => {
                      const label = locale === "km-KH" ? s.km : s.en;
                      const isSelected = commitmentLabel.trim().toLowerCase() === label.toLowerCase();
                      const ItemIcon = s.icon;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => handleSelectSuggestion(s)}
                          className={cn(
                            "inline-flex items-center gap-1.5 shrink-0 min-h-[34px] px-3 py-1 rounded-full border text-xs font-medium transition-all active:scale-95 cursor-pointer",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/40"
                              : "border-border/80 bg-card hover:bg-secondary hover:border-primary/40 text-foreground"
                          )}
                        >
                          <ItemIcon className="size-3.5 text-primary shrink-0" />
                          <span>{label}</span>
                        </button>
                      );
                    })}

                    {/* Action to show more in dialog / sheet */}
                    <button
                      type="button"
                      onClick={() => setBillCatalogOpen(true)}
                      className="inline-flex items-center gap-1.5 shrink-0 min-h-[34px] px-3 py-1 rounded-full border border-dashed border-border/90 hover:border-primary/50 bg-secondary/30 hover:bg-secondary/70 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer select-none"
                    >
                      <LayoutGrid className="size-3.5" />
                      <span>{t("more")}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Bill label */}
                  <div className="relative" ref={suggestionsContainerRef}>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5 truncate">
                      {t("billLabel")}
                    </label>
                    <Input
                      type="text"
                      placeholder={t("billLabelPlaceholder")}
                      value={commitmentLabel}
                      onChange={(e) => {
                        setCommitmentLabel(e.target.value);
                        setIsSuggestionsOpen(true);
                      }}
                      onFocus={() => setIsSuggestionsOpen(true)}
                      className="h-11 rounded-xl bg-card"
                      required
                      autoFocus
                    />

                    {/* Autocomplete floating list */}
                    {isSuggestionsOpen && commitmentLabel.trim().length > 0 && SMART_BILL_SUGGESTIONS.filter((s) => {
                      const q = commitmentLabel.trim().toLowerCase();
                      return s.en.toLowerCase().includes(q) || s.km.toLowerCase().includes(q) || s.key.toLowerCase().includes(q);
                    }).length > 0 && (
                      <div className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                        {SMART_BILL_SUGGESTIONS.filter((s) => {
                          const q = commitmentLabel.trim().toLowerCase();
                          return s.en.toLowerCase().includes(q) || s.km.toLowerCase().includes(q) || s.key.toLowerCase().includes(q);
                        }).map((s) => (
                          <button
                            key={s.key}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectSuggestion(s);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-xs hover:bg-secondary transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <s.icon className="size-4 shrink-0 text-primary" />
                              <span className="font-semibold text-foreground truncate">
                                {locale === "km-KH" ? s.km : s.en}
                              </span>
                            </div>
                            <span className="text-[11px] uppercase font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/80 shrink-0">
                              {s.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5 truncate">
                      {t("billCategory")}
                    </label>
                    <Select
                      value={commitmentCategory}
                      onValueChange={(val: "housing" | "utilities" | "family" | "subscription" | "other") =>
                        setCommitmentCategory(val)
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-card">
                        <SelectValue placeholder={t("billCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utilities">{t("catUtilities")}</SelectItem>
                        <SelectItem value="housing">{t("catHousing")}</SelectItem>
                        <SelectItem value="subscription">{t("catSubscription")}</SelectItem>
                        <SelectItem value="family">{t("catFamily")}</SelectItem>
                        <SelectItem value="other">{t("catOther")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Due Day */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5 truncate">
                      {t("dueDay")}
                    </label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={31}
                      placeholder="15"
                      value={commitmentDay}
                      onChange={(e) => setCommitmentDay(e.target.value)}
                      startAdornment={<Calendar className="size-4 text-muted-foreground" />}
                      className="h-11 rounded-xl bg-card font-mono"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-muted-foreground block truncate">
                        {t("billAmount")}
                      </label>
                      {commitmentAmount && parseMoneyInputToCents(commitmentAmount, state.preferences.currency, state.preferences.khrExchangeRate) > 0 && (
                        <span className="text-[11px] font-mono tabular-nums text-muted-foreground truncate">
                          ≈ {formatMoney(
                            parseMoneyInputToCents(commitmentAmount, state.preferences.currency, state.preferences.khrExchangeRate),
                            undefined,
                            state.preferences.currency === "USD" ? "KHR" : "USD",
                            state.preferences.khrExchangeRate
                          )}
                        </span>
                      )}
                    </div>
                    <Input
                      ref={amountInputRef}
                      type="text"
                      inputMode="decimal"
                      placeholder={state.preferences.currency === "KHR" ? "80000" : "20.00"}
                      value={commitmentAmount}
                      onChange={(e) => setCommitmentAmount(e.target.value)}
                      startAdornment={
                        <span className="font-semibold text-muted-foreground text-sm">
                          {state.preferences.currency === "KHR" ? "៛" : "$"}
                        </span>
                      }
                      endAdornment={
                        <span className="text-xs font-medium text-muted-foreground uppercase select-none">
                          {state.preferences.currency}
                        </span>
                      }
                      className="h-11 rounded-xl bg-card font-mono tabular-nums"
                      required
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCommitment(false);
                      setIsSuggestionsOpen(false);
                    }}
                    className="flex-1 sm:flex-none h-11 sm:h-10 px-5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-secondary active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none h-11 sm:h-10 px-6 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                  >
                    {t("saveBill")}
                  </button>
                </div>
              </form>
            )}

            {/* Commitments List */}
            {(!plan.scheduledCommitments || plan.scheduledCommitments.length === 0) ? (
              <div className="py-8 px-4 text-center rounded-xl bg-secondary/20 border border-dashed border-border/80 flex flex-col items-center justify-center gap-2">
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                  <CalendarCheck className="size-5" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{t("noCommitments")}</p>
              </div>
            ) : (
              <div className="ios-list">
                {plan.scheduledCommitments.map((cmt) => {
                  const altCurrency = state.preferences.currency === "USD" ? "KHR" : "USD";
                  const primaryFmt = formatMoney(cmt.amountCents, undefined, state.preferences.currency, state.preferences.khrExchangeRate);
                  const altFmt = formatMoney(cmt.amountCents, undefined, altCurrency, state.preferences.khrExchangeRate);

                  return (
                    <div
                      key={cmt.id}
                      className="ios-row ios-row-icon-sep group flex items-center justify-between p-3.5 transition-colors hover:bg-secondary/40"
                    >
                      {/* Left: Day Badge & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex flex-col items-center justify-center size-11 rounded-xl bg-secondary/80 border border-border/50 shrink-0 font-mono">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase leading-tight">DAY</span>
                          <span className="text-xs font-black text-foreground tabular-nums leading-tight">
                            {cmt.dueDayOfMonth}
                          </span>
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{cmt.label}</p>
                            {cmt.category && (
                              <span className="hidden sm:inline-flex items-center rounded-md bg-secondary/60 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                                {cmt.category}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {t("dueOnDay", { day: cmt.dueDayOfMonth })}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Delete Button */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right">
                          <span className="block font-mono text-sm font-bold text-foreground tabular-nums">
                            {primaryFmt}
                          </span>
                          <span className="hidden sm:block font-mono text-[11px] text-muted-foreground tabular-nums">
                            ≈ {altFmt}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteScheduledCommitment(cmt.id)}
                          className="min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all cursor-pointer"
                          title={t("deleteBillTitle")}
                          aria-label={`Delete ${cmt.label}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Income perspective & Real-time Budget Equation */}
        <section aria-label="Income perspective and allocation">
          <div className="flex items-center justify-between mb-3">
            <h2 className="ios-section-header">{t("perspective")}</h2>
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all cursor-pointer"
            >
              <LayoutTemplate className="size-3.5" />
              <span>{t("switchTemplate")}</span>
            </button>
          </div>

          <div className="ios-list space-y-5 p-5">
            <MoneyField
              key="income"
              label={t("monthlyIncome")}
              value={plan.monthlyFlexibleIncome}
              onChange={setPlanField("monthlyFlexibleIncome")}
              hint={t("monthlyIncomeHint")}
              currency={state.preferences.currency}
              exchangeRate={state.preferences.khrExchangeRate}
            />

            {/* Live Monthly Allocation Equation Card */}
            <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("allocationEquation")}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                    feasibility.isOverallocated
                      ? "bg-destructive/15 text-destructive"
                      : "bg-primary/15 text-primary"
                  )}
                >
                  {feasibility.isOverallocated ? (
                    <>
                      <AlertTriangle className="size-3" />
                      <span>{t("overallocatedBy")}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3" />
                      <span>{t("balancedPlan")}</span>
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-border/40">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Monthly Income</span>
                  <span className="money font-bold text-foreground">
                    {formatMoney(plan.monthlyFlexibleIncome)}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground">− Protected Commitments</span>
                  <span className="money font-semibold text-foreground">
                    −{formatMoney(feasibility.protectedMonthly)}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground">− Weekly Flexible (Mo. Eq)</span>
                  <span className="money font-semibold text-foreground">
                    −{formatMoney(feasibility.weeklyFlexibleMonthlyEquivalent)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-semibold">
                  <span className="text-foreground">= {t("monthlyBuffer")}</span>
                  <span
                    className={cn(
                      "money font-bold",
                      feasibility.isOverallocated ? "text-destructive" : "text-primary"
                    )}
                  >
                    {feasibility.isOverallocated
                      ? `−${formatMoney(feasibility.shortfallMonthly)}`
                      : `+${formatMoney(feasibility.unallocatedBufferMonthly)}`}
                  </span>
                </div>
              </div>

              {/* 1-Click Rebalance Action Available Anytime */}
              <div className="pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={handleAutoRebalance}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer",
                    feasibility.isOverallocated
                      ? "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                      : "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <RefreshCw className="size-3.5" />
                  <span>{t("autoRebalance")}</span>
                </button>
                <p className="mt-1.5 text-[11px] text-muted-foreground text-center">
                  {t("autoRebalanceDesc", { income: formatMoney(plan.monthlyFlexibleIncome) })}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Link
          href={`/${locale}/plan/wait-list`}
          className="ios-list flex items-center justify-between px-4 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          <span>{t("waitListLink", { count: state.waitList.length })}</span>
          <ChevronRight className="ios-chevron size-4" aria-hidden="true" />
        </Link>
      </div>

      <EmergencyUnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        maxAmountCents={plan.homeFixedMonthly + plan.futureFundMonthly}
      />

      <TemplateSwitcherModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        monthlyIncomeCents={plan.monthlyFlexibleIncome}
        currentPlan={plan}
        onSelectTemplate={handleApplyTemplate}
      />

      {/* Emergency Access Audit Log Dialog */}
      <Dialog open={showEmergencyDetails} onOpenChange={(open) => !open && setShowEmergencyDetails(false)}>
        <DialogContent className="max-w-md p-6 border-border">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5 shrink-0" />
              <DialogTitle className="text-base font-bold text-foreground">
                {tEmergency("detailsTitle")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground pt-0.5">
              {tEmergency("detailsSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Top Vault & Cycle Snapshot Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 space-y-0.5">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {tEmergency("totalUnlockedCycle")}
                </span>
                <span className="money text-base font-bold text-destructive block">
                  {formatMoney(plan.emergencyUnlockedTotalCents ?? plan.emergencyReliefCents ?? 0)}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-0.5">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {tEmergency("vaultRemaining")}
                </span>
                <span className="money text-base font-bold text-foreground block">
                  {formatMoney(plan.homeFixedMonthly + plan.futureFundMonthly)}
                </span>
              </div>
            </div>

            {/* Event List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground block">
                Audit Timeline
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {emergencyHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center">
                    {tEmergency("noAccessHistory")}
                  </p>
                ) : (
                  emergencyHistory.map((rec) => {
                    const isEditing = editingRecordId === rec.id;

                    return (
                      <div
                        key={rec.id}
                        className="rounded-xl border border-border bg-card p-3 text-xs space-y-2 shadow-xs"
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editedReason}
                              onChange={(e) => setEditedReason(e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingRecordId(null)}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                              >
                                <X className="size-3" />
                                <span>Cancel</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (editedReason.trim()) {
                                    await updateEmergencyReason(rec.id, editedReason.trim());
                                    toast.success(tEmergency("reasonUpdatedToast"));
                                  }
                                  setEditingRecordId(null);
                                }}
                                className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                              >
                                <Check className="size-3" />
                                <span>{tEmergency("save")}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 flex-1 pr-1">
                              <span className="font-semibold text-foreground line-clamp-2">
                                {rec.reason}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="money font-bold text-destructive">
                                −{formatMoney(rec.amountCents)}
                              </span>
                              <div className="flex items-center gap-1 border-l border-border/60 pl-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRecordId(rec.id);
                                    setEditedReason(rec.reason);
                                  }}
                                  title={tEmergency("editReason")}
                                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
                                >
                                  <Edit3 className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await revertEmergencyUnlock(rec.id);
                                    toast.success(
                                      tEmergency("returnedToast", {
                                        amount: formatMoney(rec.amountCents),
                                      })
                                    );
                                  }}
                                  title={tEmergency("returnToVault")}
                                  className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                                >
                                  <RotateCcw className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                          <span>
                            {new Date(rec.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="font-medium text-primary">
                            Credited to Essentials
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Note & Close button */}
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
              {tEmergency("replenishNote")}
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1">
              {hasActiveEmergency && (
                <button
                  type="button"
                  onClick={async () => {
                    const totalRelief = plan.emergencyReliefCents ?? 0;
                    await clearAllEmergencyRelief();
                    setShowEmergencyDetails(false);
                    toast.success(
                      tEmergency("clearAllEmergencyToast", {
                        amount: formatMoney(totalRelief),
                      })
                    );
                  }}
                  className="w-full rounded-xl border border-destructive/30 bg-destructive/10 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  {tEmergency("clearAllEmergency")}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowEmergencyDetails(false)}
                className="w-full rounded-xl border border-border bg-secondary/80 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                {tEmergency("close")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bill Presets Catalog Dialog (Modal on Desktop, Sheet on Mobile) */}
      <Dialog open={billCatalogOpen} onOpenChange={setBillCatalogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <LayoutGrid className="size-4 text-primary" />
              <span>{locale === "km-KH" ? "ការណែនាំវិក្កយបត្រទាំងអស់" : "All Bill Suggestions"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {locale === "km-KH"
                ? "ជ្រើសរើសវិក្កយបត្រណាមួយដើម្បីបំពេញឈ្មោះ ប្រភេទ និងកាលបរិច្ឆេទដោយស្វ័យប្រវត្តិ។"
                : "Select any bill to automatically pre-fill its name, category, and standard due day."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 max-h-[60vh] overflow-y-auto">
            {(["utilities", "housing", "subscription", "family", "other"] as const).map((cat) => {
              const items = SMART_BILL_SUGGESTIONS.filter((s) => s.category === cat);
              if (items.length === 0) return null;
              const catLabel = {
                utilities: locale === "km-KH" ? "សេវាប្រើប្រាស់ទូទៅ" : "Utilities & Services",
                housing: locale === "km-KH" ? "ការស្នាក់នៅ" : "Housing & Rent",
                subscription: locale === "km-KH" ? "ការជាវប្រចាំខែ" : "Digital & Subscriptions",
                family: locale === "km-KH" ? "គ្រួសារ" : "Family & Support",
                other: locale === "km-KH" ? "ផ្សេងៗ" : "Other Commitments",
              }[cat];

              return (
                <div key={cat} className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {catLabel}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((s) => {
                      const label = locale === "km-KH" ? s.km : s.en;
                      const ItemIcon = s.icon;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => {
                            handleSelectSuggestion(s);
                            setBillCatalogOpen(false);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl border border-border/80 bg-secondary/20 hover:bg-secondary/60 hover:border-primary/50 text-left transition-all cursor-pointer group"
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border group-hover:border-primary/40 text-primary transition-colors">
                            <ItemIcon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-foreground truncate">
                              {label}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              {locale === "km-KH" ? `ថ្ងៃទី ${s.defaultDay}` : `Day ${s.defaultDay}`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  );
}
