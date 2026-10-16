"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { OnboardingTemplateSchema, type OnboardingTemplateInput } from "@/lib/validation/schemas";
import { formatMoney } from "@/lib/money";

interface TemplateStepProps {
  locale: string;
}

const templates = [
  {
    id: "balanced_starter",
    title: "Balanced Starter (Recommended)",
    desc: "Good for predictable routine expenses with a dedicated fun budget.",
    essentialsWeekly: 3000, // $30
    funWeekly: 2000,        // $20
    fixedMonthly: 12000,    // $120
    futureMonthly: 4000,    // $40
  },
  {
    id: "safety_first",
    title: "Safety First / Low Buffer",
    desc: "Maximizes protected home commitments and emergency buffer first.",
    essentialsWeekly: 2500, // $25
    funWeekly: 1000,        // $10
    fixedMonthly: 13000,    // $130
    futureMonthly: 5000,    // $50
  },
  {
    id: "flex_forward",
    title: "Flex Forward",
    desc: "Higher weekly day-to-day allowance for active social or transit needs.",
    essentialsWeekly: 3500, // $35
    funWeekly: 2500,        // $25
    fixedMonthly: 11000,    // $110
    futureMonthly: 3000,    // $30
  },
] as const;

export function TemplateStep({ locale }: TemplateStepProps) {
  const router = useRouter();

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

  const selectedTemplate = watch("templateId");

  const onSubmit = (data: OnboardingTemplateInput) => {
    sessionStorage.setItem("onboarding_template", JSON.stringify(data));
    router.push(`/${locale}/onboarding/review`);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <div className="space-y-1">
        <p className="eyebrow">Step 2 of 3</p>
        <h1 className="text-2xl font-bold tracking-tight">Choose a Template</h1>
        <p className="text-sm text-muted-foreground">
          Start with a tested baseline. You will be able to customize each number on the next screen.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3">
          {templates.map((tpl) => (
            <label
              key={tpl.id}
              className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-colors ${
                selectedTemplate === tpl.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  value={tpl.id}
                  {...register("templateId")}
                  className="mt-1 accent-[oklch(0.8_0.13_165)]"
                />
                <div className="flex-1">
                  <span className="block text-sm font-semibold">{tpl.title}</span>
                  <span className="text-xs text-muted-foreground">{tpl.desc}</span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/50 pt-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Weekly flexible: </span>
                  <span className="money font-semibold">
                    {formatMoney(tpl.essentialsWeekly + tpl.funWeekly)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Protected monthly: </span>
                  <span className="money font-semibold">
                    {formatMoney(tpl.fixedMonthly + tpl.futureMonthly)}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>

        {errors.templateId && (
          <p className="text-xs text-destructive">{errors.templateId.message}</p>
        )}

        <button
          type="submit"
          className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer"
        >
          Review My Plan
        </button>
      </form>
    </div>
  );
}
