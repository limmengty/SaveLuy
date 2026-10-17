"use client";

import { useState, useMemo, useEffect } from "react";
import { LayoutTemplate, Check, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";
import { generateTemplatesForIncome, type GeneratedTemplate } from "@/features/onboarding/template-generator";
import type { Plan } from "@/lib/wealth-engine/engine";

interface TemplateSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyIncomeCents: number;
  currentPlan?: Plan;
  onSelectTemplate: (template: GeneratedTemplate) => void;
}

export function TemplateSwitcherModal({
  isOpen,
  onClose,
  monthlyIncomeCents,
  currentPlan,
  onSelectTemplate,
}: TemplateSwitcherModalProps) {
  const t = useTranslations("plan");
  const templates = useMemo(
    () => generateTemplatesForIncome(monthlyIncomeCents),
    [monthlyIncomeCents]
  );

  // Identify which template matches the active plan allocations
  const activeTemplateId = useMemo(() => {
    if (!currentPlan) return templates[0]?.id ?? "balanced_starter";
    const found = templates.find(
      (t) =>
        t.essentialsWeekly === currentPlan.essentialsLimit &&
        t.funWeekly === currentPlan.funLimit &&
        t.homeFixedMonthly === currentPlan.homeFixedMonthly &&
        t.futureFundMonthly === currentPlan.futureFundMonthly
    );
    return found ? found.id : (templates[0]?.id ?? "balanced_starter");
  }, [currentPlan, templates]);

  const [selectedId, setSelectedId] = useState<string>(activeTemplateId);

  // Always sync draft selection to active plan when dialog opens or active template changes
  useEffect(() => {
    if (isOpen) {
      setSelectedId(activeTemplateId);
    }
  }, [isOpen, activeTemplateId]);

  // Handle dismiss without applying: discard local draft state and reset to active template
  const handleDismiss = () => {
    setSelectedId(activeTemplateId);
    onClose();
  };

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeTemplateId]);

  if (!isOpen) return null;

  const currentTpl = templates.find((t) => t.id === selectedId) || templates[0];

  const handleApply = () => {
    onSelectTemplate(currentTpl);
    onClose();
  };

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-t sm:border border-border bg-card shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-modal-title"
      >
        {/* Mobile Drag Indicator */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LayoutTemplate className="size-4" />
              </span>
              <h2 id="template-modal-title" className="text-xl font-bold tracking-tight text-foreground">
                {t("chooseStrategy")}
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t("chooseStrategyDesc", { income: formatMoney(monthlyIncomeCents) })}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="hidden sm:block rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid gap-3.5">
            {templates.map((tpl) => {
              const isSelected = selectedId === tpl.id;
              const weeklyFlexible = tpl.essentialsWeekly + tpl.funWeekly;
              const monthlyProtected = tpl.homeFixedMonthly + tpl.futureFundMonthly;

              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedId(tpl.id)}
                  className={`flex cursor-pointer flex-col gap-3 rounded-2xl border p-4.5 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/10 ring-1 ring-primary/40"
                      : "border-border bg-card/60 hover:bg-secondary/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                      }`}>
                        {isSelected && <Check className="size-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{tpl.title}</span>
                          {tpl.badge && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {tpl.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{tpl.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Envelope Breakdown Preview */}
                  <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-3 text-xs">
                    <div className="rounded-xl bg-secondary/60 p-2 text-center">
                      <span className="block text-[10px] text-muted-foreground font-medium">Protected /mo</span>
                      <span className="money font-bold text-foreground">{formatMoney(monthlyProtected)}</span>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-2 text-center">
                      <span className="block text-[10px] text-muted-foreground font-medium">Flexible /wk</span>
                      <span className="money font-bold text-foreground">{formatMoney(weeklyFlexible)}</span>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-2 text-center">
                      <span className="block text-[10px] text-muted-foreground font-medium">Buffer /mo</span>
                      <span className="money font-bold text-primary">+{formatMoney(tpl.unallocatedBuffer)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-border/60 bg-card/90">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{t("applyTemplate")}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
