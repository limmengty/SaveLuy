"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import type { Plan } from "@/lib/wealth-engine/engine";
import { formatMoney } from "@/lib/money";

interface ReviewStepProps {
  locale: string;
}

export function ReviewStep({ locale }: ReviewStepProps) {
  const router = useRouter();
  const { state, updatePlan } = useWealthEngine();
  const [templateId] = useState(() => {
    if (typeof window === "undefined") return "balanced_starter";
    try {
      const stored = sessionStorage.getItem("onboarding_template");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.templateId) return parsed.templateId;
      }
    } catch {
      // Fallback
    }
    return "balanced_starter";
  });

  const templateMap = {
    balanced_starter: {
      essentialsWeekly: 3000,
      funWeekly: 2000,
      fixedMonthly: 12000,
      futureMonthly: 4000,
    },
    safety_first: {
      essentialsWeekly: 2500,
      funWeekly: 1000,
      fixedMonthly: 13000,
      futureMonthly: 5000,
    },
    flex_forward: {
      essentialsWeekly: 3500,
      funWeekly: 2500,
      fixedMonthly: 11000,
      futureMonthly: 3000,
    },
  }[templateId as "balanced_starter" | "safety_first" | "flex_forward"] || {
    essentialsWeekly: 3000,
    funWeekly: 2000,
    fixedMonthly: 12000,
    futureMonthly: 4000,
  };

  const handleFinish = async () => {
    const finalPlan: Plan = {
      ...state.plan,
      essentialsLimit: templateMap.essentialsWeekly,
      funLimit: templateMap.funWeekly,
      homeFixedMonthly: templateMap.fixedMonthly,
      futureFundMonthly: templateMap.futureMonthly,
    };

    updatePlan(finalPlan);

    try {
      const { supabaseApi } = await import("@/lib/api/supabase-service");
      await supabaseApi.completeOnboarding(finalPlan);
    } catch {
      // Local fallback continues
    }

    toast("Plan activated! Welcome to BrokeNoMore.");
    sessionStorage.removeItem("onboarding_income");
    sessionStorage.removeItem("onboarding_template");
    router.push(`/${locale}/today`);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <div className="space-y-1">
        <p className="eyebrow">Step 3 of 3</p>
        <h1 className="text-2xl font-bold tracking-tight">Review Your Plan</h1>
        <p className="text-sm text-muted-foreground">
          Confirm your starting numbers. You can fine-tune these any time in the Plan tab.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-xs font-semibold text-muted-foreground">Flexible Weekly Envelopes</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-secondary/50 p-3">
            <span className="block text-xs text-muted-foreground">Essentials</span>
            <span className="money text-base font-bold text-foreground">
              {formatMoney(templateMap.essentialsWeekly)}/wk
            </span>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3">
            <span className="block text-xs text-muted-foreground">Fun money</span>
            <span className="money text-base font-bold text-foreground">
              {formatMoney(templateMap.funWeekly)}/wk
            </span>
          </div>
        </div>

        <h2 className="text-xs font-semibold text-muted-foreground pt-2">Protected Monthly Money</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
            <span className="flex items-center gap-2">
              <Lock className="size-4 text-muted-foreground" /> Home & fixed
            </span>
            <span className="money font-bold">{formatMoney(templateMap.fixedMonthly)}/mo</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
            <span className="flex items-center gap-2">
              <Lock className="size-4 text-muted-foreground" /> Future fund
            </span>
            <span className="money font-bold">{formatMoney(templateMap.futureMonthly)}/mo</span>
          </div>
        </div>

        <p className="pt-2 text-xs text-muted-foreground">
          Protected funds are excluded from your daily spending allowance. Only flexible envelopes feed your Available Today number.
        </p>
      </div>

      <button
        onClick={handleFinish}
        className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer"
      >
        Save &amp; Start Today
      </button>
    </div>
  );
}
