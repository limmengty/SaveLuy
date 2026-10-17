"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Shield, LogOut } from "lucide-react";
import { OnboardingIncomeSchema, type OnboardingIncomeInput } from "@/lib/validation/schemas";
import { centsToInputValue, parseMoneyInputToCents, formatMoney } from "@/lib/money";
import { Input } from "@/components/ui/input";

import { STORAGE_KEYS, getMigratedStorageItem } from "@/lib/storage/migrate-storage";

interface IncomeStepProps {
  locale: string;
}

const rhythmOptions = [
  { id: "monthly", label: "Monthly", desc: "Once a month (e.g. at month end)" },
  { id: "twice_monthly", label: "Twice Monthly", desc: "1st & 15th or every two weeks" },
  { id: "weekly", label: "Weekly", desc: "Every Friday or Monday" },
  { id: "irregular", label: "Irregular / Freelance", desc: "Variable or project-based earnings" },
] as const;

export function IncomeStep({ locale }: IncomeStepProps) {
  const router = useRouter();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Restore draft from localStorage if available
  const [initialData] = useState<OnboardingIncomeInput>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved =
          getMigratedStorageItem(STORAGE_KEYS.DRAFT_INCOME, STORAGE_KEYS.LEGACY_DRAFT_INCOME) ||
          sessionStorage.getItem("onboarding_income");
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      rhythm: "monthly",
      monthlyIncome: 20000, // $200.00
    };
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingIncomeInput>({
    resolver: zodResolver(OnboardingIncomeSchema),
    defaultValues: initialData,
  });

  const selectedRhythm = watch("rhythm");
  const incomeValue = watch("monthlyIncome");

  // Save changes to durable draft storage
  useEffect(() => {
    if (typeof window !== "undefined" && incomeValue > 0) {
      try {
        const draft = { rhythm: selectedRhythm, monthlyIncome: incomeValue };
        localStorage.setItem(STORAGE_KEYS.DRAFT_INCOME, JSON.stringify(draft));
        sessionStorage.setItem("onboarding_income", JSON.stringify(draft));
      } catch {
        // Safe write
      }
    }
  }, [selectedRhythm, incomeValue]);

  const onSubmit = (data: OnboardingIncomeInput) => {
    localStorage.setItem(STORAGE_KEYS.DRAFT_INCOME, JSON.stringify(data));
    sessionStorage.setItem("onboarding_income", JSON.stringify(data));
    router.push(`/${locale}/onboarding/template`);
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top Bar with Exit Confirmation and Step Indicator */}
      <header className="shrink-0 border-b border-border/80 bg-background/85 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
            aria-label="Exit setup"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Step 1 of 3</span>
            <div className="flex gap-1">
              <span className="h-1.5 w-6 rounded-full bg-primary" />
              <span className="h-1.5 w-6 rounded-full bg-border" />
              <span className="h-1.5 w-6 rounded-full bg-border" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Scrollable Form Content */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-6">
        <div className="mx-auto max-w-md space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">How does money arrive?</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your payment cadence establishes your weekly reset cycle. We use estimated monthly income to protect your savings and calculate your daily allowance.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} id="income-form" className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Cadence</label>
              <div className="grid gap-2">
                {rhythmOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                      selectedRhythm === opt.id
                        ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
                        : "border-border bg-card hover:bg-secondary/60"
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.id}
                      {...register("rhythm")}
                      className="mt-1 accent-primary size-4"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-foreground">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.rhythm && (
                <p className="text-xs text-destructive">{errors.rhythm.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="monthly-income-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Estimated Monthly Income (USD)
              </label>
              <Input
                id="monthly-income-input"
                type="text"
                inputMode="decimal"
                defaultValue={centsToInputValue(incomeValue)}
                onChange={(e) => {
                  const parsed = parseMoneyInputToCents(e.target.value);
                  setValue("monthlyIncome", parsed, { shouldValidate: true });
                }}
                className="money text-lg font-bold"
                placeholder="0.00"
                startAdornment={<span className="text-lg font-bold text-muted-foreground">$</span>}
              />
              <p className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Equivalent to {formatMoney(incomeValue)} per month</span>
                {incomeValue > 0 && (
                  <span className="font-semibold text-primary">
                    ~{formatMoney(Math.floor(incomeValue / 4.3333))}/wk
                  </span>
                )}
              </p>
              {errors.monthlyIncome && (
                <p className="text-xs text-destructive">{errors.monthlyIncome.message}</p>
              )}
            </div>

            {selectedRhythm === "irregular" && (
              <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">💡 Tip for Irregular Income:</p>
                <p>Use a conservative monthly baseline (e.g. your lowest earning month in the last 6 months). Any extra money can be captured into your future fund.</p>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Sticky Bottom Action Footer */}
      <footer className="shrink-0 border-t border-border/80 bg-background/90 backdrop-blur-md p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto max-w-md">
          <button
            type="submit"
            form="income-form"
            className="h-13 w-full rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
          >
            Continue to Templates
          </button>
        </div>
      </footer>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="size-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
              <Shield className="size-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">Leave Setup?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your draft is saved locally. You can sign in anytime and resume your plan right where you left off.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 h-11 rounded-xl border border-border bg-secondary text-sm font-semibold hover:bg-secondary/80 cursor-pointer"
              >
                Keep Going
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/${locale}/login`);
                }}
                className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
