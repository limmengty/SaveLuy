"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, LayoutTemplate, SlidersHorizontal, CheckCircle2, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, History, Edit3, RotateCcw, Check, X } from "lucide-react";
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
  const [strValue, setStrValue] = useState(() => centsToInputValue(value, currency, exchangeRate));
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync from props only when the input is NOT currently focused by the user
  useEffect(() => {
    if (!isFocused) {
      setStrValue(centsToInputValue(value, currency, exchangeRate));
      setError(null);
    }
  }, [value, isFocused, currency, exchangeRate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits, single decimal point (for USD), and empty string
    if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;

    setStrValue(raw);
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
      setStrValue(centsToInputValue(value, currency, exchangeRate));
      return;
    }

    setError(null);
    setStrValue(centsToInputValue(cents, currency, exchangeRate));

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
          onFocus={() => setIsFocused(true)}
          onChange={handleChange}
          onBlur={() => {
            setIsFocused(false);
            commitValue();
          }}
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
  } = useWealthEngine();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEmergencyDetails, setShowEmergencyDetails] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editedReason, setEditedReason] = useState("");
  const plan = state.plan;

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
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("flexibleWeekly")}</h2>
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
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
                <p className="text-xs font-semibold text-muted-foreground mb-3">Live Cycle Envelope Usage</p>
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
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("protectedMonthly")}</h2>
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
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

        {/* Income perspective & Real-time Budget Equation */}
        <section aria-label="Income perspective and allocation">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">{t("perspective")}</h2>
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all cursor-pointer"
            >
              <LayoutTemplate className="size-3.5" />
              <span>{t("switchTemplate")}</span>
            </button>
          </div>

          <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
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
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
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
          className="block rounded-2xl border border-border bg-card p-4 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          {t("waitListLink", { count: state.waitList.length })}
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
    </div>
  </div>
  );
}
