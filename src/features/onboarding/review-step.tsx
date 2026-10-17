"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import type { Plan } from "@/lib/wealth-engine/engine";
import { formatMoney, parseMoneyInputToCents, centsToInputValue, evaluatePlanFeasibility } from "@/lib/money";
import { generateTemplatesForIncome } from "./template-generator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { STORAGE_KEYS, getMigratedStorageItem, removeAllStorageKeys } from "@/lib/storage/migrate-storage";

interface ReviewStepProps {
  locale: string;
}

export function ReviewStep({ locale }: ReviewStepProps) {
  const router = useRouter();
  const { state, updatePlan } = useWealthEngine();

  // Retrieve draft income
  const incomeCents = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const stored =
          getMigratedStorageItem(STORAGE_KEYS.DRAFT_INCOME, STORAGE_KEYS.LEGACY_DRAFT_INCOME) ||
          sessionStorage.getItem("onboarding_income");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.monthlyIncome) return Number(parsed.monthlyIncome);
        }
      } catch {
        // Safe fallback
      }
    }
    return 20000; // $200.00
  }, []);

  // Retrieve chosen template
  const templateId = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const stored =
          getMigratedStorageItem(STORAGE_KEYS.DRAFT_TEMPLATE, STORAGE_KEYS.LEGACY_DRAFT_TEMPLATE) ||
          sessionStorage.getItem("onboarding_template");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.templateId) return parsed.templateId;
        }
      } catch {
        // Safe fallback
      }
    }
    return "balanced_starter";
  }, []);

  // Base template numbers dynamically calibrated to income
  const baseTemplate = useMemo(() => {
    const templates = generateTemplatesForIncome(incomeCents);
    return templates.find((t) => t.id === templateId) || templates[0];
  }, [incomeCents, templateId]);

  // Editable local state for envelopes
  const [essentialsWeekly, setEssentialsWeekly] = useState(baseTemplate.essentialsWeekly);
  const [funWeekly, setFunWeekly] = useState(baseTemplate.funWeekly);
  const [homeFixedMonthly, setHomeFixedMonthly] = useState(baseTemplate.homeFixedMonthly);
  const [futureFundMonthly, setFutureFundMonthly] = useState(baseTemplate.futureFundMonthly);
  const [submitting, setSubmitting] = useState(false);

  // Compute live feasibility equation
  const feasibility = useMemo(() => {
    return evaluatePlanFeasibility({
      monthlyIncome: incomeCents,
      homeFixedMonthly,
      futureFundMonthly,
      essentialsLimitWeekly: essentialsWeekly,
      funLimitWeekly: funWeekly,
    });
  }, [incomeCents, homeFixedMonthly, futureFundMonthly, essentialsWeekly, funWeekly]);

  const handleFinish = async () => {
    if (submitting || feasibility.isOverallocated) return;
    setSubmitting(true);

    const finalPlan: Plan = {
      ...state.plan,
      essentialsLimit: essentialsWeekly,
      funLimit: funWeekly,
      homeFixedMonthly,
      futureFundMonthly,
      monthlyFlexibleIncome: incomeCents,
      monthlyWorkHours: 160,
    };

    updatePlan(finalPlan);

    try {
      const { supabaseApi } = await import("@/lib/api/supabase-service");
      await supabaseApi.completeOnboarding(finalPlan);
    } catch (err) {
      console.error("Failed to sync onboarding to database:", err);
    }

    toast("Plan activated! Welcome to SaveLuy.");
    removeAllStorageKeys([
      STORAGE_KEYS.DRAFT_INCOME,
      STORAGE_KEYS.LEGACY_DRAFT_INCOME,
      STORAGE_KEYS.DRAFT_TEMPLATE,
      STORAGE_KEYS.LEGACY_DRAFT_TEMPLATE,
    ]);
    sessionStorage.removeItem("onboarding_income");
    sessionStorage.removeItem("onboarding_template");
    router.replace(`/${locale}/today`);
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top Bar with Reversible Back Action */}
      <header className="shrink-0 border-b border-border/80 bg-background/85 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/onboarding/template`)}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
            aria-label="Back to Templates"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Step 3 of 3</span>
            <div className="flex gap-1">
              <span className="h-1.5 w-6 rounded-full bg-primary/40" />
              <span className="h-1.5 w-6 rounded-full bg-primary/40" />
              <span className="h-1.5 w-6 rounded-full bg-primary" />
            </div>
          </div>
          <div className="w-11" />
        </div>
      </header>

      {/* Content Scroller */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-6">
        <div className="mx-auto max-w-md space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Review & Adjust</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Confirm your complete budget equation. No bank money moves; these boundaries power your daily spending clarity.
            </p>
          </div>

          {/* Allocation Equation Card */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Allocation Equation</h3>
            <div className="space-y-2 text-sm divide-y divide-border/40">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Monthly Income</span>
                <span className="money font-bold text-foreground">{formatMoney(incomeCents)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground">− Protected Commitments</span>
                <span className="money font-semibold text-foreground">−{formatMoney(feasibility.protectedMonthly)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground">− Weekly Flexible (Mo. Eq)</span>
                <span className="money font-semibold text-foreground">−{formatMoney(feasibility.weeklyFlexibleMonthlyEquivalent)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-semibold text-foreground">= Unallocated Buffer</span>
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

            {/* Invariant Status Badge */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl p-3 text-xs font-semibold",
                feasibility.isOverallocated
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-primary/10 text-primary border border-primary/20"
              )}
            >
              {feasibility.isOverallocated ? (
                <>
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Overallocated by {formatMoney(feasibility.shortfallMonthly)}/mo. Adjust your envelopes below to activate.</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Plan is feasible and balanced. Your Available Today starting baseline is ready.</span>
                </>
              )}
            </div>
          </div>

          {/* Editable Envelopes Section */}
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weekly Flexible Envelopes</h3>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">Essentials /wk</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  defaultValue={centsToInputValue(essentialsWeekly)}
                  onChange={(e) => setEssentialsWeekly(parseMoneyInputToCents(e.target.value))}
                  className="money font-bold"
                  placeholder="0.00"
                  startAdornment="$"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">Fun Money /wk</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  defaultValue={centsToInputValue(funWeekly)}
                  onChange={(e) => setFunWeekly(parseMoneyInputToCents(e.target.value))}
                  className="money font-bold"
                  placeholder="0.00"
                  startAdornment="$"
                />
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-3">Protected Monthly Money</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Lock className="size-3.5 text-muted-foreground" /> Home & fixed /mo
                </span>
                <Input
                  type="text"
                  inputMode="decimal"
                  defaultValue={centsToInputValue(homeFixedMonthly)}
                  onChange={(e) => setHomeFixedMonthly(parseMoneyInputToCents(e.target.value))}
                  className="money font-bold"
                  placeholder="0.00"
                  startAdornment="$"
                />
              </div>

              <div className="space-y-1.5">
                <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Lock className="size-3.5 text-muted-foreground" /> Future fund /mo
                </span>
                <Input
                  type="text"
                  inputMode="decimal"
                  defaultValue={centsToInputValue(futureFundMonthly)}
                  onChange={(e) => setFutureFundMonthly(parseMoneyInputToCents(e.target.value))}
                  className="money font-bold"
                  placeholder="0.00"
                  startAdornment="$"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Footer */}
      <footer className="shrink-0 border-t border-border/80 bg-background/90 backdrop-blur-md p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleFinish}
            disabled={submitting || feasibility.isOverallocated}
            className="h-13 w-full rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                <span>Activating Plan...</span>
              </>
            ) : (
              <span>Activate My Plan</span>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
