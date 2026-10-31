"use client";

import { useEffect, useState } from "react";
import { Clock, Trash2, ShieldCheck, Bell, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { LedgerEmptyWaitlist } from "@/components/illustrations/ledger-lines";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const RESISTED_STORAGE_KEY = "saveluy_resisted_impulses_v1";

interface ResistedStats {
  totalCents: number;
  count: number;
}

export function WaitListView() {
  const t = useTranslations("waitList");
  const tCommon = useTranslations("today");
  const locale = useLocale();
  const { state, removeWaitItem, addTransaction } = useWealthEngine();
  const [resistedStats, setResistedStats] = useState<ResistedStats>({ totalCents: 0, count: 0 });
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const permission = "Notification" in window ? Notification.permission : "unsupported";
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(RESISTED_STORAGE_KEY);
        if (raw) {
          setResistedStats(JSON.parse(raw));
        }
      } catch {
        // Safe read
      }
      setNotifPermission(permission);
    });
  }, []);

  const handleCelebrateSave = (amountCents: number, itemId: string) => {
    const updated = {
      totalCents: resistedStats.totalCents + amountCents,
      count: resistedStats.count + 1,
    };
    setResistedStats(updated);
    try {
      localStorage.setItem(RESISTED_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Safe write
    }
    removeWaitItem(itemId);
    toast.success(t("resistedToast", { amount: formatMoney(amountCents) }));
  };

  const handleRequestNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
      if (res === "granted") {
        toast.success(t("notificationAlertsEnabled"));
      }
    } catch {
      // Safe fallback
    }
  };

  if (!state.waitList.length) {
    return (
      <div className="w-full space-y-6 max-w-2xl">
        {resistedStats.totalCents > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs font-semibold text-foreground">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <span>{t("resistedBanner", { amount: formatMoney(resistedStats.totalCents), count: resistedStats.count })}</span>
          </div>
        )}

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
              <p className="text-xs font-semibold text-foreground">{t("checkBeforeTapTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("checkBeforeTapDesc")}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
              <p className="text-xs font-semibold text-foreground">{t("coolingPeriodTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("coolingPeriodDesc")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Resisted Impulse Positive Reinforcement Banner */}
      {resistedStats.totalCents > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs font-semibold text-foreground animate-in fade-in">
          <ShieldCheck className="size-5 shrink-0 text-primary" />
          <span>{t("resistedBanner", { amount: formatMoney(resistedStats.totalCents), count: resistedStats.count })}</span>
        </div>
      )}

      {/* Header and Optional Push Reminder Prompt */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-primary" />
          <span>{t("headerNote")}</span>
        </div>
        {notifPermission === "default" && (
          <button
            onClick={handleRequestNotification}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer font-medium"
          >
            <Bell className="size-3.5" />
            <span>{t("enableAlert")}</span>
          </button>
        )}
      </div>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {state.waitList.map((item) => {
          const isReadyToReview = new Date(item.unlockAt) <= new Date();

          return (
            <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground">{item.label}</p>
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

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="money text-sm font-bold mr-1">{formatMoney(item.amount)}</span>

                {isReadyToReview ? (
                  <>
                    <button
                      onClick={() => handleCelebrateSave(item.amount, item.id)}
                      className="px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      {t("dontNeedIt")}
                    </button>
                    <button
                      onClick={() => {
                        addTransaction({
                          amount: item.amount,
                          envelope: item.envelope,
                          label: item.label,
                        });
                        removeWaitItem(item.id);
                        toast.success(t("addedToSpending", { label: item.label }));
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground hover:opacity-95 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      {t("buy")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-xl bg-secondary text-muted-foreground text-xs font-medium cursor-not-allowed border border-border flex items-center gap-1.5"
                    >
                      <Clock className="size-3" />
                      <span>{t("buy")}</span>
                    </button>
                    <button
                      onClick={() => {
                        removeWaitItem(item.id);
                        toast.info(t("removedFromWaitList"));
                      }}
                      aria-label={t("remove")}
                      className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-secondary cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
