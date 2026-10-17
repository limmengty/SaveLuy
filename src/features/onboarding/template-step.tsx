"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { ArrowLeft, Check, CheckCircle2, HelpCircle } from "lucide-react";
import { OnboardingTemplateSchema, type OnboardingTemplateInput } from "@/lib/validation/schemas";
import { formatMoney } from "@/lib/money";
import { generateTemplatesForIncome } from "./template-generator";
import { STORAGE_KEYS, getMigratedStorageItem } from "@/lib/storage/migrate-storage";

interface TemplateStepProps {
  locale: string;
}

export function TemplateStep({ locale }: TemplateStepProps) {
  const router = useRouter();

  // Retrieve saved income from durable storage
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
        // Fallback
      }
    }
    return 20000; // $200.00 default fallback
  }, []);

  // Dynamically generate mathematically balanced templates from actual declared income
  const dynamicTemplates = useMemo(() => {
    return generateTemplatesForIncome(incomeCents);
  }, [incomeCents]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingTemplateInput>({
    resolver: zodResolver(OnboardingTemplateSchema),
    defaultValues: {
      templateId: "balanced_starter",
    },
  });

  const selectedTemplateId = watch("templateId");
  const selectedTemplate = dynamicTemplates.find((t) => t.id === selectedTemplateId) || dynamicTemplates[0];

  const onSubmit = (data: OnboardingTemplateInput) => {
    sessionStorage.setItem("onboarding_template", JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.DRAFT_TEMPLATE, JSON.stringify(data));
    router.push(`/${locale}/onboarding/review`);
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top Bar with Reversible Back Action */}
      <header className="shrink-0 border-b border-border/80 bg-background/85 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/onboarding/income`)}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
            aria-label="Back to Income"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Step 2 of 3</span>
            <div className="flex gap-1">
              <span className="h-1.5 w-6 rounded-full bg-primary/40" />
              <span className="h-1.5 w-6 rounded-full bg-primary" />
              <span className="h-1.5 w-6 rounded-full bg-border" />
            </div>
          </div>
          <div className="w-11" />
        </div>
      </header>

      {/* Content Scroller */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-6">
        <div className="mx-auto max-w-md space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Choose a Template</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These starting recommendations are calibrated to your declared {formatMoney(incomeCents)}/mo income. You will review and customize every number next.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} id="template-form" className="space-y-4">
            <div className="grid gap-3">
              {dynamicTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                const weeklyFlexible = tpl.essentialsWeekly + tpl.funWeekly;
                const monthlyProtected = tpl.homeFixedMonthly + tpl.futureFundMonthly;

                return (
                  <label
                    key={tpl.id}
                    className={`flex cursor-pointer flex-col gap-3 rounded-2xl border p-4.5 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm shadow-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-card hover:bg-secondary/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          value={tpl.id}
                          {...register("templateId")}
                          className="mt-1 accent-primary size-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-foreground">{tpl.title}</span>
                            {tpl.badge && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                                <CheckCircle2 className="size-3" />
                                {tpl.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{tpl.desc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown table */}
                    <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-xs">
                      <div className="rounded-xl bg-secondary/50 p-2 text-center">
                        <span className="block text-muted-foreground text-[10px] font-semibold uppercase">Protected</span>
                        <span className="money font-bold text-foreground">{formatMoney(monthlyProtected)}/mo</span>
                      </div>
                      <div className="rounded-xl bg-secondary/50 p-2 text-center">
                        <span className="block text-muted-foreground text-[10px] font-semibold uppercase">Flexible</span>
                        <span className="money font-bold text-foreground">{formatMoney(weeklyFlexible)}/wk</span>
                      </div>
                      <div className="rounded-xl bg-secondary/50 p-2 text-center">
                        <span className="block text-muted-foreground text-[10px] font-semibold uppercase">Buffer</span>
                        <span className="money font-bold text-emerald-500">+{formatMoney(tpl.unallocatedBuffer)}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {errors.templateId && (
              <p className="text-xs text-destructive">{errors.templateId.message}</p>
            )}
          </form>
        </div>
      </main>

      {/* Sticky Bottom Action Footer */}
      <footer className="shrink-0 border-t border-border/80 bg-background/90 backdrop-blur-md p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto max-w-md">
          <button
            type="submit"
            form="template-form"
            className="h-13 w-full rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
          >
            Review & Adjust Plan
          </button>
        </div>
      </footer>
    </div>
  );
}
