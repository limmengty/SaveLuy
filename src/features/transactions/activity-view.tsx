"use client";

import { useState } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { RotateCcw, Filter } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { LedgerEmptyActivity } from "@/components/illustrations/ledger-lines";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney } from "@/lib/money";
import { Transaction } from "@/lib/wealth-engine/engine";
import { TransactionDetailModal } from "./transaction-detail-modal";
import { cn } from "@/lib/utils";

export function ActivityView() {
  const t = useTranslations("activity");
  const tCommon = useTranslations("today");
  const locale = useLocale();
  const { state, reverseTransaction } = useWealthEngine();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // nuqs shareable URL filter state
  const [envelopeFilter, setEnvelopeFilter] = useQueryState(
    "envelope",
    parseAsString.withDefault("all")
  );

  const filteredTransactions = state.transactions.filter((t) => {
    if (envelopeFilter === "essentials") return t.envelope === "essentials";
    if (envelopeFilter === "fun") return t.envelope === "fun";
    return true;
  });

  const dateLocale = locale === "km-KH" ? "km-KH" : "en-US";
  const groups = new Map<string, Transaction[]>();
  for (const t of filteredTransactions) {
    const k = new Date(t.createdAt).toLocaleDateString(dateLocale, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* nuqs-driven filter bar (sticky with comfortable touch targets) */}
      <div className="sticky top-14 z-10 -mx-4 -mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 lg:top-16 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Filter className="size-4 shrink-0 text-primary" /> {t("filterBy")}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: t("all") },
            { id: "essentials", label: t("essentials") },
            { id: "fun", label: t("funMoney") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEnvelopeFilter(tab.id === "all" ? null : tab.id)}
              className={cn(
                "inline-flex h-10 min-w-16 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-all cursor-pointer",
                envelopeFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-[0.98]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>


      {!filteredTransactions.length ? (
        <div className="rounded-2xl border border-dashed border-border p-10 flex flex-col items-center justify-center text-center space-y-3">
          <LedgerEmptyActivity className="opacity-80" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              {state.transactions.length === 0
                ? t("noRecordedPurchases")
                : t("noMatchingTransactions")}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              {state.transactions.length === 0
                ? t("emptyRecordedDesc")
                : t("emptyFilterDesc")}
            </p>
          </div>
          {envelopeFilter !== "all" && (
            <button
              onClick={() => setEnvelopeFilter(null)}
              className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              {t("clearFilter")}
            </button>
          )}
        </div>
      ) : (
        [...groups].map(([day, txs]) => {
          const dayTotal = txs
            .filter((t) => !t.reversed)
            .reduce((acc, t) => acc + t.amount, 0);

          return (
            <section key={day} aria-label={`Activity for ${day}`}>
              <div className="mb-2 flex justify-between text-xs font-semibold text-muted-foreground">
                <h2>{day}</h2>
                <span className="money">{formatMoney(dayTotal)}</span>
              </div>

              <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
                {txs.map((txItem) => (
                  <li
                    key={txItem.id}
                    className={cn(
                      "item-enter flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/40",
                      txItem.reversed && "opacity-50"
                    )}
                  >
                    <div
                      onClick={() => !txItem.reversed && setSelectedTx(txItem)}
                      className={cn("min-w-0 flex-1", !txItem.reversed && "cursor-pointer")}
                    >
                      <p className={cn("text-sm font-semibold", txItem.reversed && "line-through")}>
                        {txItem.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {txItem.envelope === "fun" ? tCommon("funMoney") : tCommon("essentials")} ·{" "}
                        {new Date(txItem.createdAt).toLocaleTimeString(dateLocale, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {txItem.reversed && ` · ${t("undone")}`}
                      </p>
                    </div>

                    <span className="money text-sm font-semibold">−{formatMoney(txItem.amount)}</span>

                    {!txItem.reversed && (
                      <button
                        aria-label={`${t("undo")} ${txItem.label}`}
                        title={t("undo")}
                        onClick={() => {
                          reverseTransaction(txItem.id);
                          toast(t("undoToast", { label: txItem.label }));
                        }}
                        className="grid size-11 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary cursor-pointer"
                      >
                        <RotateCcw className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          isOpen={true}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
}
