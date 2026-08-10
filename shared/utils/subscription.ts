import { z } from 'zod'

export const SubscriptionInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  amount: z.number().positive('Price must be a positive number'), // euros
  currency: z.string().trim().min(1).default('EUR'),
  cycle: z.enum(['weekly', 'monthly', 'yearly']),
  intervalCount: z.number().int().min(1).default(1),
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
    anchorDate: new Date(input.anchorDate)
  }
}
