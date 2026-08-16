import { z } from 'zod'

// Suggested categories seeded into the combobox. Users may enter their own,
// so this is guidance for consistency, not an enforced set.
export const CATEGORY_SUGGESTIONS = [
  'Entertainment',
  'Music',
  'Productivity',
  'Software & Tools',
  'Cloud & Storage',
  'News & Reading',
  'Health & Fitness',
  'Other'
] as const

export const SubscriptionInputSchema = z.object({
  service: z.string().trim().min(1, 'Service is required'),
  description: z.string().trim().nullable().default(null),
  category: z.string().trim().nullable().default(null),
  amount: z.number().positive('Price must be a positive number'), // euros
  // Optional yearly price (euros) for a monthly plan, powering the exact
  // "switch to annual" saving. Null/undefined means unknown.
  annualPrice: z
    .number()
    .positive('Annual price must be a positive number')
    .nullable()
    .default(null),
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

/**
 * Edit payload: the full subscription plus how to treat a price change.
 * `priceChangeIntent` distinguishes "the price actually changed" (opens a new
 * price-history period) from "I typed it wrong" (corrects the current one).
 * `effectiveFrom` (yyyy-mm-dd) is the date a real change took effect; the server
 * defaults it to today. Both are ignored when nothing price-related changed.
 */
export const SubscriptionUpdateSchema = SubscriptionInputSchema.extend({
  priceChangeIntent: z.enum(['change', 'correction']).optional(),
  effectiveFrom: z.string().optional()
})

export type SubscriptionUpdate = z.infer<typeof SubscriptionUpdateSchema>

/** Normalise validated form input into DB column values. */
export function toDbValues(input: SubscriptionInput) {
  return {
    service: input.service,
    // Optional free-text note; blank strings collapse to null so the column
    // stays "unset" rather than storing an empty string.
    description: input.description?.trim() ? input.description.trim() : null,
    // Optional category; blank collapses to null so counts/charts ignore it.
    category: input.category?.trim() ? input.category.trim() : null,
    amount: Math.round(input.amount * 100), // euros → cents
    // Optional; only meaningful for monthly plans, stored in cents like `amount`.
    annualPrice: input.annualPrice != null ? Math.round(input.annualPrice * 100) : null,
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
