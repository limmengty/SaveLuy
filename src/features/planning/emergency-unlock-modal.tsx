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
  const { unlockEmergencyMoney } = useWealthEngine();

  const emergencySchema = z.object({
    amount: z
      .number()
      .positive(t("invalidAmount"))
      .refine((val) => Math.round(val * 100) <= maxAmountCents, {
        message: t("amountExceeds"),
      }),
    reason: z
      .string()
      .min(3, t("reasonRequired"))
      .max(200, "Reason too long"),
  });

  type EmergencyFormData = z.infer<typeof emergencySchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmergencyFormData>({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
      amount: Math.min(50, Math.round(maxAmountCents / 100)),
      reason: "",
    },
  });

  const onSubmit = async (data: EmergencyFormData) => {
    const cents = Math.round(data.amount * 100);
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
            <label className="text-xs font-semibold text-muted-foreground">
              {t("amountLabel", { max: formatMoney(maxAmountCents) })}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-muted-foreground font-semibold">$</span>
              <Input
                type="number"
                step="any"
                {...register("amount", { valueAsNumber: true })}
                className="pl-8 money font-bold text-foreground"
              />
            </div>
            {errors.amount && (
              <p className="text-xs font-medium text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              {t("reasonLabel")}
            </label>
            <textarea
              rows={2}
              {...register("reason")}
              placeholder={t("reasonPlaceholder")}
              className="w-full rounded-xl border border-input bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.reason && (
              <p className="text-xs font-medium text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-destructive px-4 text-xs font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
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
