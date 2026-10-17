import { z } from "zod";
import { evaluatePlanFeasibility } from "@/lib/money";

export const EnvelopeIdSchema = z.enum(["essentials", "fun"]);

// Integer cents (positive non-negative bounds: up to $10,000,000.00 = 1,000,000,000 cents)
export const MinorUnitsSchema = z
  .number()
  .int("Amount must be a whole integer of minor units")
  .min(0, "Amount cannot be negative")
  .max(1_000_000_000, "Amount exceeds system limits");

export const CreateTransactionSchema = z.object({
  clientMutationId: z.string().min(1, "Idempotency key required"),
  amount: z
    .number()
    .int("Amount must be an integer of minor units")
    .positive("Amount must be greater than zero")
    .max(100_000_000, "Transaction amount exceeds limit"),
  envelope: EnvelopeIdSchema,
  label: z.string().trim().min(1, "Label is required").max(60, "Label cannot exceed 60 characters"),
});

export const EditTransactionSchema = z.object({
  id: z.string().min(1),
  amount: z
    .number()
    .int("Amount must be an integer of minor units")
    .positive("Amount must be greater than zero"),
  envelope: EnvelopeIdSchema,
  label: z.string().trim().min(1, "Label is required").max(60, "Label cannot exceed 60 characters"),
});

export const PurchaseCheckInputSchema = z.object({
  amount: z.number().int().positive("Amount must be greater than zero"),
  envelope: EnvelopeIdSchema,
});

export const CreateWaitItemSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(60, "Label cannot exceed 60 characters"),
  amount: z.number().int().positive("Amount must be greater than zero"),
  envelope: EnvelopeIdSchema,
});

/**
 * Plan Schema with Cross-Field Invariant Refinement
 * Guarantees that declared commitments never exceed income.
 */
export const PlanFeasibilitySchema = z
  .object({
    essentialsLimit: MinorUnitsSchema,
    funLimit: MinorUnitsSchema,
    homeFixedMonthly: MinorUnitsSchema,
    futureFundMonthly: MinorUnitsSchema,
    monthlyFlexibleIncome: MinorUnitsSchema.min(100, "Income must be at least $1.00"),
    monthlyWorkHours: z.number().int().min(1).max(720),
  })
  .refine(
    (data) => {
      const feasibility = evaluatePlanFeasibility({
        monthlyIncome: data.monthlyFlexibleIncome,
        homeFixedMonthly: data.homeFixedMonthly,
        futureFundMonthly: data.futureFundMonthly,
        essentialsLimitWeekly: data.essentialsLimit,
        funLimitWeekly: data.funLimit,
      });
      return !feasibility.isOverallocated;
    },
    {
      message:
        "Total commitments exceed declared monthly income. Please adjust your weekly envelopes or protected savings.",
      path: ["monthlyFlexibleIncome"],
    }
  );

export const UpdatePlanSchema = PlanFeasibilitySchema;

export const OnboardingIncomeSchema = z.object({
  rhythm: z.enum(["monthly", "twice_monthly", "weekly", "irregular"], {
    message: "Please select your income cadence",
  }),
  monthlyIncome: z
    .number()
    .int()
    .min(100, "Please enter an income of at least $1.00")
    .max(10_000_000_00, "Income exceeds allowable limit"),
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
