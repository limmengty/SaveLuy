"use client";

import { useState } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { RotateCcw, Filter, Coffee, Utensils, Bike, Heart, ShoppingBag, Receipt, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { LedgerEmptyActivity } from "@/components/illustrations/ledger-lines";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney } from "@/lib/money";
import { Transaction } from "@/lib/wealth-engine/engine";
import { TransactionDetailModal } from "./transaction-detail-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function getCategoryIcon(label: string, envelope: "essentials" | "fun") {
  const l = label.toLowerCase();
  if (l.includes("coffee") || l.includes("កាហ្វេ")) return Coffee;
  if (l.includes("meal") || l.includes("food") || l.includes("បាយ") || l.includes("អាហារ")) return Utensils;
  if (l.includes("transport") || l.includes("passapp") || l.includes("grab") || l.includes("ធ្វើដំណើរ")) return Bike;
  if (l.includes("grocer") || l.includes("ផ្សារ")) return ShoppingBag;
  if (envelope === "fun") return Heart;
  return Receipt;
}

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

  const filterOptions = [
    { id: "all", label: t("all") },
    { id: "essentials", label: t("essentials") },
    { id: "fun", label: t("funMoney") },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Filter className="size-3.5" />
          </span>
          <span className="text-sm font-semibold text-foreground">{t("filterBy")}</span>
          <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded-full">
            {filteredTransactions.length}
          </span>
        </div>

        {/* Desktop & Tablet: Segmented Pill Control */}
        <div className="hidden sm:inline-flex items-center rounded-xl border border-border bg-card p-1 shadow-xs">
          {filterOptions.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEnvelopeFilter(tab.id === "all" ? null : tab.id)}
              className={cn(
                "h-8 rounded-lg px-3.5 text-xs font-semibold transition-all cursor-pointer",
                envelopeFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile: Accessible Radix Select Dropdown */}
        <div className="sm:hidden w-full">
          <Select
            value={envelopeFilter || "all"}
            onValueChange={(val) => setEnvelopeFilter(val === "all" ? null : val)}
          >
            <SelectTrigger className="h-10 w-full rounded-xl bg-card">
              <SelectValue placeholder={t("filterBy")} />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

              <ul className="divide-y divide-border/70 rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                {txs.map((txItem) => {
                  const Icon = getCategoryIcon(txItem.label, txItem.envelope);
                  const isFun = txItem.envelope === "fun";

                  return (
                    <li
                      key={txItem.id}
                      className={cn(
                        "item-enter flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-secondary/40",
                        txItem.reversed && "bg-secondary/20 opacity-60"
                      )}
                    >
                      {/* Category Icon Badge */}
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-transform",
                          txItem.reversed
                            ? "border-border bg-secondary/50 text-muted-foreground"
                            : isFun
                              ? "border-warning/30 bg-warning/10 text-warning"
                              : "border-primary/30 bg-primary/10 text-primary"
                        )}
                      >
                        {txItem.reversed ? (
                          <Undo2 className="size-4.5" />
                        ) : (
                          <Icon className="size-4.5" />
                        )}
                      </div>

                      {/* Title & Metadata */}
                      <div
                        onClick={() => !txItem.reversed && setSelectedTx(txItem)}
                        className={cn("min-w-0 flex-1", !txItem.reversed && "cursor-pointer")}
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className={cn("text-sm font-semibold truncate max-w-[160px] xs:max-w-none", txItem.reversed && "line-through text-muted-foreground")}>
                            {txItem.label}
                          </p>
                          {txItem.reversed && (
                            <span className="inline-flex shrink-0 items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                              {t("undone")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <span
                            className={cn(
                              "inline-block size-1.5 rounded-full shrink-0",
                              isFun ? "bg-warning" : "bg-primary"
                            )}
                          />
                          <span className="truncate">
                            {isFun ? tCommon("funMoney") : tCommon("essentials")}
                          </span>
                          <span>·</span>
                          <span className="shrink-0 whitespace-nowrap">
                            {new Date(txItem.createdAt).toLocaleTimeString(dateLocale, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Monetary Amount */}
                      <div className="text-right shrink-0">
                        <span className={cn(
                          "money text-sm font-bold tracking-tight block whitespace-nowrap",
                          txItem.reversed ? "line-through text-muted-foreground/60" : "text-foreground"
                        )}>
                          −{formatMoney(txItem.amount)}
                        </span>
                      </div>

                      {/* Undo Action */}
                      {!txItem.reversed && (
                        <button
                          aria-label={`${t("undo")} ${txItem.label}`}
                          title={t("undo")}
                          onClick={() => {
                            reverseTransaction(txItem.id);
                            toast(t("undoToast", { label: txItem.label }));
                          }}
                          className="grid size-9 place-items-center rounded-xl border border-transparent text-muted-foreground/80 hover:text-foreground hover:bg-secondary hover:border-border transition-all cursor-pointer active:scale-95"
                        >
                          <RotateCcw className="size-4" />
                        </button>
                      )}
                    </li>
                  );
                })}
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
