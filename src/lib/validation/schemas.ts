import { z } from "zod";

export const EnvelopeIdSchema = z.enum(["essentials", "fun"]);

// Integer cents (positive)
export const MinorUnitsSchema = z.number().int().min(0, "Amount must be a non-negative number of cents");

export const CreateTransactionSchema = z.object({
  amount: z.number().int().positive("Amount must be greater than zero"),
  envelope: EnvelopeIdSchema,
  label: z.string().min(1, "Label is required").max(60, "Label cannot exceed 60 characters"),
});

export const EditTransactionSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive("Amount must be greater than zero"),
  envelope: EnvelopeIdSchema,
  label: z.string().min(1, "Label is required").max(60, "Label cannot exceed 60 characters"),
});

export const PurchaseCheckInputSchema = z.object({
  amount: z.number().int().positive("Amount must be greater than zero"),
  envelope: EnvelopeIdSchema,
});

export const CreateWaitItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  amount: z.number().int().positive("Amount must be greater than zero"),
  envelope: EnvelopeIdSchema,
});

export const UpdatePlanSchema = z.object({
  essentialsLimit: MinorUnitsSchema,
  funLimit: MinorUnitsSchema,
  homeFixedMonthly: MinorUnitsSchema,
  futureFundMonthly: MinorUnitsSchema,
  monthlyFlexibleIncome: MinorUnitsSchema,
  monthlyWorkHours: z.number().int().min(1).max(720),
});

export const OnboardingIncomeSchema = z.object({
  rhythm: z.enum(["monthly", "twice_monthly", "weekly", "irregular"], {
    message: "Please select your income cadence",
  }),
  monthlyIncome: z.number().int().min(100, "Please enter an estimated income amount"),
});

export const OnboardingTemplateSchema = z.object({
  templateId: z.enum(["balanced_starter", "safety_first", "flex_forward"], {
    message: "Please choose a planning template",
  }),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type EditTransactionInput = z.infer<typeof EditTransactionSchema>;
export type PurchaseCheckInput = z.infer<typeof PurchaseCheckInputSchema>;
export type CreateWaitItemInput = z.infer<typeof CreateWaitItemSchema>;
export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;
export type OnboardingIncomeInput = z.infer<typeof OnboardingIncomeSchema>;
export type OnboardingTemplateInput = z.infer<typeof OnboardingTemplateSchema>;
