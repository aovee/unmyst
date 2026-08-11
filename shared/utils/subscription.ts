import { z } from 'zod'

export const SubscriptionInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  amount: z.number().positive('Price must be a positive number'), // euros
  currency: z.string().trim().min(1).default('EUR'),
  cycle: z.enum(['weekly', 'monthly', 'yearly']),
  intervalCount: z.number().int().min(1).default(1),
  shareCount: z.number().int().min(1, 'Split must be at least 1').default(1),
  // Free trial: null/undefined means no trial. When set, it's the trial length
  // in days; the trial end date is derived from anchorDate at read time.
  trialDurationDays: z
    .number()
    .int()
    .min(1, 'Trial length must be at least 1 day')
    .nullable()
    .default(null),
  automaticConversion: z.boolean().default(false),
  anchorDate: z.string().min(1, 'First billing date is required') // yyyy-mm-dd
})

export type SubscriptionInput = z.infer<typeof SubscriptionInputSchema>

/** Normalise validated form input into DB column values. */
export function toDbValues(input: SubscriptionInput) {
  return {
    name: input.name,
    amount: Math.round(input.amount * 100), // euros → cents
    currency: input.currency,
    cycle: input.cycle,
    intervalCount: input.intervalCount,
    shareCount: input.shareCount,
    trialDurationDays: input.trialDurationDays,
    // A trial can only auto-convert if there actually is a trial.
    automaticConversion: input.trialDurationDays ? input.automaticConversion : false,
    anchorDate: new Date(input.anchorDate)
  }
}
