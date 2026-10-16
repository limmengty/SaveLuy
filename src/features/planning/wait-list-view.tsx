"use client";

import { Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { LedgerEmptyWaitlist } from "@/components/illustrations/ledger-lines";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney } from "@/lib/money";

export function WaitListView() {
  const t = useTranslations("waitList");
  const tCommon = useTranslations("today");
  const locale = useLocale();
  const { state, removeWaitItem, addTransaction } = useWealthEngine();

  if (!state.waitList.length) {
    return (
      <div className="w-full space-y-6">
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-4">
          <LedgerEmptyWaitlist className="size-32 sm:size-40 opacity-90 transition-transform hover:scale-105" />
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-foreground sm:text-lg">{t("emptyTitle")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("emptyDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 w-full max-w-md text-left">
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
              <p className="text-xs font-semibold text-foreground">1. Check before you tap</p>
              <p className="text-xs text-muted-foreground">Test if a purchase fits your week without recording it yet.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
              <p className="text-xs font-semibold text-foreground">2. 24-Hour cooling period</p>
              <p className="text-xs text-muted-foreground">Impulse urges naturally fade after a restful night of sleep.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4 shrink-0" /> {t("headerNote")}
      </div>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {state.waitList.map((item) => {
          const isReadyToReview = new Date(item.unlockAt) <= new Date();

          return (
            <li key={item.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {item.envelope === "fun" ? tCommon("funMoney") : tCommon("essentials")} ·{" "}
                  {isReadyToReview
                    ? t("unlockedForDecision")
                    : t("unlocksAt", {
                        time: new Date(item.unlockAt).toLocaleString(locale === "km-KH" ? "km-KH" : "en-US", {
                          weekday: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        }),
                      })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="money text-sm font-semibold">{formatMoney(item.amount)}</span>
                <button
                  onClick={() => {
                    addTransaction({
                      amount: item.amount,
                      envelope: item.envelope,
                      label: item.label,
                    });
                    removeWaitItem(item.id);
                    toast(t("addedToSpending", { label: item.label }));
                  }}
                  className="min-h-11 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 cursor-pointer"
                >
                  {t("buy")}
                </button>
                <button
                  onClick={() => {
                    removeWaitItem(item.id);
                    toast(t("removedFromWaitList"));
                  }}
                  aria-label={t("remove")}
                  className="grid min-h-11 min-w-11 place-items-center rounded-xl text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
