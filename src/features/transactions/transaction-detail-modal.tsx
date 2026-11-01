"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import {
  formatMoney,
  parseMoneyInputToCents,
  centsToInputValue,
  CURRENCY_REGISTRY,
} from "@/lib/money";
import type { Transaction } from "@/lib/wealth-engine/engine";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const editSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(80, "Description is too long"),
  envelope: z.enum(["essentials", "fun"]),
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val.replace(/[^0-9.]/g, ""));
      return !Number.isNaN(num) && num > 0;
    }, "Please enter a valid positive amount")
    .refine((val) => {
      const num = parseFloat(val.replace(/[^0-9.]/g, ""));
      return num <= 100_000_000;
    }, "Amount exceeds limit"),
});

type EditFormData = z.infer<typeof editSchema>;

interface TransactionDetailModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailModalProps) {
  const t = useTranslations("activity");
  const locale = useLocale();
  const { editTransaction, state } = useWealthEngine();
  const [isEditing, setIsEditing] = useState(false);

  const currency = state?.preferences?.currency || "USD";
  const exchangeRate = state?.preferences?.khrExchangeRate || 4000;
  const currencyMeta = CURRENCY_REGISTRY[currency];
  const alternateCurrency = currency === "USD" ? "KHR" : "USD";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      label: transaction.label,
      envelope: transaction.envelope,
      amount: centsToInputValue(transaction.amount, currency, exchangeRate),
    },
  });

  // Reset form values when transaction or modal opening state changes
  useEffect(() => {
    if (isOpen && transaction) {
      reset({
        label: transaction.label,
        envelope: transaction.envelope,
        amount: centsToInputValue(transaction.amount, currency, exchangeRate),
      });
      setIsEditing(false);
    }
  }, [isOpen, transaction, currency, exchangeRate, reset]);

  if (!isOpen) return null;

  const watchedAmount = watch("amount");
  const previewCents = watchedAmount
    ? parseMoneyInputToCents(watchedAmount, currency, exchangeRate)
    : 0;

  const onSubmit = (data: EditFormData) => {
    const updatedCents = parseMoneyInputToCents(
      data.amount,
      currency,
      exchangeRate
    );

    if (updatedCents <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    editTransaction(transaction.id, {
      label: data.label.trim(),
      envelope: data.envelope,
      amount: updatedCents,
    });

    toast.success(t("txUpdated"));
    setIsEditing(false);
    onClose();
  };

  const dateLocale = locale === "km-KH" ? "km-KH" : "en-US";
  const primaryFormatted = formatMoney(
    transaction.amount,
    locale,
    currency,
    exchangeRate
  );
  const alternateFormatted = formatMoney(
    transaction.amount,
    locale,
    alternateCurrency,
    exchangeRate
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 sm:rounded-2xl">
        <DialogHeader className="text-left pb-1">
          <DialogTitle className="text-lg font-bold tracking-tight">
            {t("txDetails")}
          </DialogTitle>
        </DialogHeader>

        {!isEditing ? (
          <div className="space-y-4 pt-1">
            {/* Amount Display */}
            <div className="rounded-2xl bg-secondary/30 p-4 border border-border/50">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                {t("amount")}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono tabular-nums tracking-tight text-foreground">
                  −{primaryFormatted}
                </span>
                <span className="text-xs font-mono tabular-nums text-muted-foreground">
                  (≈ {alternateFormatted})
                </span>
              </div>
            </div>

            {/* Description & Envelope Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-sm">
              <div className="rounded-xl bg-secondary/50 p-3.5 border border-border/30">
                <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  {t("description")}
                </span>
                <span className="font-semibold text-foreground truncate block text-sm">
                  {transaction.label}
                </span>
              </div>
              <div className="rounded-xl bg-secondary/50 p-3.5 border border-border/30">
                <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  {t("envelope")}
                </span>
                <span className="font-semibold capitalize text-foreground truncate block text-sm">
                  {transaction.envelope === "fun"
                    ? t("funMoney")
                    : t("essentials")}
                </span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground px-1">
              {t("recordedAt", {
                time: new Date(transaction.createdAt).toLocaleString(dateLocale, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary h-11 px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <Edit2 className="size-4" /> {t("edit")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border h-11 px-5 text-sm font-semibold hover:bg-secondary active:scale-[0.98] transition-all cursor-pointer"
              >
                {t("close")}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            {/* Amount / Price Edit Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="tx-edit-amount"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  {t("editAmount")}
                </label>
                {previewCents > 0 && (
                  <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                    ≈ {formatMoney(previewCents, locale, alternateCurrency, exchangeRate)}
                  </span>
                )}
              </div>

              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted-foreground font-semibold text-sm">
                  {currencyMeta.symbol}
                </div>
                <Input
                  id="tx-edit-amount"
                  {...register("amount")}
                  type="text"
                  inputMode="decimal"
                  placeholder={currency === "KHR" ? "40000" : "10.00"}
                  className="h-11 pl-9 pr-14 font-mono tabular-nums text-base rounded-xl font-semibold"
                  autoFocus
                />
                <span className="pointer-events-none absolute right-3 text-xs font-medium text-muted-foreground uppercase">
                  {currency}
                </span>
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="tx-edit-label"
                className="text-xs font-semibold text-muted-foreground block"
              >
                {t("description")}
              </label>
              <Input
                id="tx-edit-label"
                {...register("label")}
                placeholder="e.g. Lunch with team or Groceries"
                className="h-11 rounded-xl"
              />
              {errors.label && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.label.message}
                </p>
              )}
            </div>

            {/* Envelope Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block">
                {t("envelope")}
              </label>
              <Select
                defaultValue={transaction.envelope}
                onValueChange={(val: "essentials" | "fun") =>
                  setValue("envelope", val, { shouldValidate: true })
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder={t("envelope")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essentials">{t("essentials")}</SelectItem>
                  <SelectItem value="fun">{t("funMoney")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.envelope && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.envelope.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {t("saveChanges")}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-11 rounded-xl border border-border px-5 text-sm font-semibold hover:bg-secondary active:scale-[0.98] transition-all cursor-pointer"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
