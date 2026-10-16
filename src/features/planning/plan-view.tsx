"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney, parseMoneyInputToCents, centsToInputValue } from "@/lib/money";
import { ProgressBar } from "@/components/product/progress-bar";
import { EmergencyUnlockModal } from "./emergency-unlock-modal";
import type { Plan } from "@/lib/wealth-engine/engine";

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
}

/**
 * MoneyField component that syncs with external value updates
 * and validates with Zod before committing changes to recalculate the plan.
 */
function MoneyField({ label, value, onChange, hint }: MoneyFieldProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [strValue, setStrValue] = useState(() => centsToInputValue(value));
  const [error, setError] = useState<string | null>(null);

  // Sync internal input state when external value changes (React state-derived-from-props pattern)
  if (prevValue !== value) {
    setPrevValue(value);
    setStrValue(centsToInputValue(value));
    setError(null);
  }

  const commitValue = () => {
    const cents = parseMoneyInputToCents(strValue);
    const result = moneyFieldSchema.safeParse(cents);

    if (!result.success) {
      const issue = result.error.issues[0]?.message;
      setError(issue || "Invalid value");
      setStrValue(centsToInputValue(value));
      return;
    }

    setError(null);
    setStrValue(centsToInputValue(cents));

    // Only trigger update and recalculation if value actually changed
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

  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="mt-1 flex h-12 items-center rounded-xl border border-border bg-background px-3 focus-within:ring-2 focus-within:ring-ring lg:h-11">
        <span className="text-muted-foreground">$</span>
        <input
          inputMode="decimal"
          value={strValue}
          onChange={(e) => {
            setStrValue(e.target.value);
            if (error) setError(null);
          }}
          onBlur={commitValue}
          onKeyDown={handleKeyDown}
          className="money w-full bg-transparent px-1 outline-none text-foreground"
        />
      </div>
      {error ? (
        <span className="mt-1 block text-xs text-destructive">{error}</span>
      ) : (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

export function PlanView({ locale }: { locale: string }) {
  const t = useTranslations("plan");
  const { state, computed, updatePlan } = useWealthEngine();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const plan = state.plan;

  const setPlanField = (key: keyof Plan) => (cents: number) => {
    updatePlan({ [key]: cents });
    toast.success(t("planUpdated"));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Weekly Flexible Envelopes */}
      <section aria-label="Flexible weekly envelopes">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("flexibleWeekly")}</h2>
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
          <MoneyField
            key={`essentials-${plan.essentialsLimit}`}
            label={t("essentials")}
            value={plan.essentialsLimit}
            onChange={setPlanField("essentialsLimit")}
            hint={t("essentialsHint")}
          />
          <ProgressBar
            value={computed.envelopeSpent.essentials}
            max={plan.essentialsLimit}
          />

          <MoneyField
            key={`fun-${plan.funLimit}`}
            label={t("funMoney")}
            value={plan.funLimit}
            onChange={setPlanField("funLimit")}
            hint={t("funMoneyHint")}
          />
          <ProgressBar
            value={computed.envelopeSpent.fun}
            max={plan.funLimit}
          />

          <div className="border-t border-border pt-4">
            <p className="money flex justify-between text-sm">
              <span className="text-muted-foreground">{t("weeklyTotal")}</span>
              <strong className="font-bold text-foreground">
                {formatMoney(plan.essentialsLimit + plan.funLimit)}
              </strong>
            </p>
            <p className="money mt-1 flex justify-between text-sm text-muted-foreground">
              <span>{t("dailyBaseline")}</span>
              <span>{formatMoney(computed.baselineDaily)}</span>
            </p>
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
              key={`home-${plan.homeFixedMonthly}`}
              label={t("homeFixed")}
              value={plan.homeFixedMonthly}
              onChange={setPlanField("homeFixedMonthly")}
              hint={t("homeFixedHint")}
            />

            <MoneyField
              key={`future-${plan.futureFundMonthly}`}
              label={t("futureFund")}
              value={plan.futureFundMonthly}
              onChange={setPlanField("futureFundMonthly")}
              hint={t("futureFundHint")}
            />

            <button
              type="button"
              onClick={() => setShowUnlockModal(true)}
              className="mt-2 w-full rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
            >
              {t("accessEmergency")}
            </button>
          </div>
        </section>

        <section aria-label="Income perspective">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("perspective")}</h2>
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
            <MoneyField
              key={`income-${plan.monthlyFlexibleIncome}`}
              label={t("monthlyIncome")}
              value={plan.monthlyFlexibleIncome}
              onChange={setPlanField("monthlyFlexibleIncome")}
              hint={t("monthlyIncomeHint")}
            />
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
    </div>
  );
}
