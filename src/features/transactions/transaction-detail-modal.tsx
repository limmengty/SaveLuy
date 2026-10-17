"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney } from "@/lib/money";
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
  label: z.string().min(1, "Label is required").max(50, "Label is too long"),
  envelope: z.enum(["essentials", "fun"]),
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
  const { editTransaction } = useWealthEngine();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      label: transaction.label,
      envelope: transaction.envelope,
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: EditFormData) => {
    editTransaction(transaction.id, {
      label: data.label,
      envelope: data.envelope,
    });
    toast.success(t("txUpdated"));
    setIsEditing(false);
    onClose();
  };

  const dateLocale = locale === "km-KH" ? "km-KH" : "en-US";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm p-6">
        <DialogHeader className="text-left">
          <DialogTitle>{t("txDetails")}</DialogTitle>
        </DialogHeader>

        {!isEditing ? (
          <div className="space-y-4 pt-2">
            <div>
              <span className="text-xs text-muted-foreground">{t("amount")}</span>
              <p className="money text-2xl font-black text-foreground">
                −{formatMoney(transaction.amount)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-secondary/50 p-3">
                <span className="block text-xs text-muted-foreground">{t("description")}</span>
                <span className="font-semibold text-foreground truncate block">{transaction.label}</span>
              </div>
              <div className="rounded-xl bg-secondary/50 p-3">
                <span className="block text-xs text-muted-foreground">{t("envelope")}</span>
                <span className="font-semibold capitalize text-foreground truncate block">
                  {transaction.envelope === "fun" ? t("funMoney") : t("essentials")}
                </span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {t("recordedAt", { time: new Date(transaction.createdAt).toLocaleString(dateLocale) })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary h-11 px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 cursor-pointer"
              >
                <Edit2 className="size-4" /> {t("edit")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border h-11 px-4 text-sm font-semibold hover:bg-secondary cursor-pointer"
              >
                {t("close")}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block">{t("description")}</label>
              <Input
                {...register("label")}
                placeholder="e.g. Lunch with team or Groceries"
              />
              {errors.label && (
                <p className="text-xs text-destructive mt-1">{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block">{t("envelope")}</label>
              <Select
                defaultValue={transaction.envelope}
                onValueChange={(val: "essentials" | "fun") => setValue("envelope", val, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("envelope")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essentials">{t("essentials")}</SelectItem>
                  <SelectItem value="fun">{t("funMoney")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.envelope && (
                <p className="text-xs text-destructive mt-1">{errors.envelope.message}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {t("saveChanges")}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-11 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-secondary cursor-pointer"
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
