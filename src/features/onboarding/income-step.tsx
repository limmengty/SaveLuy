"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { OnboardingIncomeSchema, type OnboardingIncomeInput } from "@/lib/validation/schemas";
import { centsToInputValue, parseMoneyInputToCents } from "@/lib/money";

interface IncomeStepProps {
  locale: string;
}

const rhythmOptions = [
  { id: "monthly", label: "Monthly", desc: "Once a month (e.g. at month end)" },
  { id: "twice_monthly", label: "Twice Monthly", desc: "1st & 15th or every two weeks" },
  { id: "weekly", label: "Weekly", desc: "Every Friday or Monday" },
  { id: "irregular", label: "Irregular / Freelance", desc: "Project by project or variable" },
] as const;

export function IncomeStep({ locale }: IncomeStepProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingIncomeInput>({
    resolver: zodResolver(OnboardingIncomeSchema),
    defaultValues: {
      rhythm: "monthly",
      monthlyIncome: 20000, // $200.00
    },
  });

  const selectedRhythm = watch("rhythm");
  const incomeValue = watch("monthlyIncome");

  const onSubmit = (data: OnboardingIncomeInput) => {
    sessionStorage.setItem("onboarding_income", JSON.stringify(data));
    router.push(`/${locale}/onboarding/template`);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <div className="space-y-1">
        <p className="eyebrow">Step 1 of 3</p>
        <h1 className="text-2xl font-bold tracking-tight">Income Rhythm</h1>
        <p className="text-sm text-muted-foreground">
          How often does your primary income arrive? We use this to set up your weekly review cadence.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Payment Cadence</label>
          <div className="grid gap-2">
            {rhythmOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                  selectedRhythm === opt.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary"
                }`}
              >
                <input
                  type="radio"
                  value={opt.id}
                  {...register("rhythm")}
                  className="mt-1 accent-[oklch(0.8_0.13_165)]"
                />
                <div>
                  <span className="block text-sm font-semibold">{opt.label}</span>
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
          <label className="text-xs font-semibold text-muted-foreground">
            Estimated Monthly Income
          </label>
          <div className="flex h-12 items-center rounded-xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
            <span className="text-muted-foreground">$</span>
            <input
              type="text"
              inputMode="decimal"
              defaultValue={centsToInputValue(incomeValue)}
              onChange={(e) => {
                setValue("monthlyIncome", parseMoneyInputToCents(e.target.value), {
                  shouldValidate: true,
                });
              }}
              className="money w-full bg-transparent px-2 text-sm outline-none"
              placeholder="0.00"
            />
          </div>
          {errors.monthlyIncome && (
            <p className="text-xs text-destructive">{errors.monthlyIncome.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer"
        >
          Continue to Templates
        </button>
      </form>
    </div>
  );
}
