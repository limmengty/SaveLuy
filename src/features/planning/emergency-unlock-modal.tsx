"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useWealthEngine } from "@/lib/wealth-engine/provider";
import { formatMoney } from "@/lib/money";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface EmergencyUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxAmountCents: number;
}

export function EmergencyUnlockModal({
  isOpen,
  onClose,
  maxAmountCents,
}: EmergencyUnlockModalProps) {
  const t = useTranslations("emergency");
  const { unlockEmergencyMoney, state } = useWealthEngine();
  const currency = state.preferences.currency || "USD";
  const exchangeRate = state.preferences.khrExchangeRate || 4000;
  const isKhr = currency === "KHR";

  const emergencySchema = z.object({
    amount: z
      .number()
      .positive(t("invalidAmount"))
      .refine(
        (val) => {
          const cents = isKhr
            ? Math.round((val / exchangeRate) * 100)
            : Math.round(val * 100);
          return cents <= maxAmountCents;
        },
        {
          message: t("amountExceeds"),
        }
      ),
    reason: z
      .string()
      .min(3, t("reasonRequired"))
      .max(200, "Reason too long"),
  });

  type EmergencyFormData = z.infer<typeof emergencySchema>;

  const defaultInputAmount = isKhr
    ? Math.min(200000, Math.max(1000, Math.round((maxAmountCents / 100) * exchangeRate)))
    : Math.min(50, Math.max(1, Math.round(maxAmountCents / 100)));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<EmergencyFormData>({
    resolver: zodResolver(emergencySchema),
    mode: "onChange",
    defaultValues: {
      amount: defaultInputAmount,
      reason: "",
    },
  });

  const onSubmit = async (data: EmergencyFormData) => {
    const cents = isKhr
      ? Math.round((data.amount / exchangeRate) * 100)
      : Math.round(data.amount * 100);
    try {
      await unlockEmergencyMoney(cents, data.reason.trim());
      toast.success(t("successToast", { amount: formatMoney(cents) }));
      reset();
      onClose();
    } catch {
      toast.error(t("errorToast"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm border-destructive/40 p-6">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            <DialogTitle className="text-base text-foreground">{t("title")}</DialogTitle>
          </div>
          <DialogDescription className="text-xs leading-relaxed pt-1">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              {t("amountLabel", { max: formatMoney(maxAmountCents) })}
            </label>
            <Input
              type="number"
              step={isKhr ? "100" : "any"}
              inputMode={isKhr ? "numeric" : "decimal"}
              {...register("amount", { valueAsNumber: true })}
              startAdornment={isKhr ? "៛" : "$"}
              placeholder={isKhr ? "0" : "0.00"}
              className={cn(
                "money font-bold text-foreground",
                errors.amount && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.amount && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              {t("reasonLabel")}
            </label>
            <Textarea
              rows={2}
              {...register("reason")}
              placeholder={t("reasonPlaceholder")}
              className={cn(
                errors.reason && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.reason && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="flex-1 h-11 rounded-xl bg-destructive px-4 text-xs font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {isSubmitting ? "Unlocking..." : t("confirmUnlock")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-border px-4 text-xs font-semibold hover:bg-secondary cursor-pointer"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
