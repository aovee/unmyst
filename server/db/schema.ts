import {
  pgTable,
  pgEnum,
  primaryKey,
  uniqueIndex,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const cycleEnum = pgEnum('cycle', ['weekly', 'monthly', 'yearly'])

export const priceHistorySourceEnum = pgEnum('price_history_source', [
  'manual',
  'import',
  'correction'
])

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  service: text('service').notNull(),
  description: text('description'),
  amount: integer('amount').notNull(), // in cents (integer)
  currency: text('currency').notNull().default('EUR'),
  cycle: cycleEnum('cycle').notNull(),
  intervalCount: integer('interval_count').notNull().default(1),
  // Number of people the cost is split equally between (including the owner).
  // 1 = not shared. The user's own share is `amount / shareCount`.
  shareCount: integer('share_count').notNull().default(1),
  anchorDate: date('anchor_date', { mode: 'date' }).notNull(), // 1st billing date, source of truth
  // Free-trial tracking. `trialDurationDays` null = no trial; the trial end date
  // is derived (`anchorDate + trialDurationDays`), never stored, so it can't drift
  // when the anchor is edited. `automaticConversion` = a payment method is attached
  // and the trial will convert on its own. `trialEndNotifiedAt` dedupes the
  // (deferred) "trial ending" alert so it can't fire twice.
  trialDurationDays: integer('trial_duration_days'),
  automaticConversion: boolean('automatic_conversion').notNull().default(false),
  trialEndNotifiedAt: timestamp('trial_end_notified_at'),
  // Optional yearly price for this plan (in cents), for the "switch to annual"
  // suggestion on long-running monthly plans. Null = unknown; the suggestion
  // then falls back to an estimated discount. Stored pre-split, like `amount`.
  annualPrice: integer('annual_price'),
  // When the user dismissed the annual-plan suggestion, and the monthly `amount`
  // at that moment. The suggestion re-surfaces only if the price later changes,
  // so a dismissal for a decision already made stays dismissed.
  suggestionDismissedAt: timestamp('suggestion_dismissed_at'),
  suggestionDismissedAmount: integer('suggestion_dismissed_amount'),
  category: text('category'),
  url: text('url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
})

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert

// Temporal price history: one row per period a subscription held a given price.
// `subscriptions.amount/currency/cycle/shareCount` stay the denormalised current
// values (mirrored by the open row) so existing reads are untouched; this table
// records what changed and when. Periods are half-open [effectiveFrom, effectiveTo);
// the single open period has effectiveTo = null. `shareCount` is versioned here so
// historical "your share" totals stay correct across split changes.
export const subscriptionPriceHistory = pgTable(
  'subscription_price_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subscriptionId: uuid('subscription_id')
      .notNull()
      .references(() => subscriptions.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(), // in cents
    currency: text('currency').notNull().default('EUR'),
    cycle: cycleEnum('cycle').notNull(),
    shareCount: integer('share_count').notNull().default(1),
    effectiveFrom: date('effective_from', { mode: 'date' }).notNull(),
    effectiveTo: date('effective_to', { mode: 'date' }), // null = current period
    source: priceHistorySourceEnum('source').notNull().default('manual'),
    createdAt: timestamp('created_at').notNull().defaultNow()
  },
  t => [
    // Enforce the "exactly one open period per subscription" invariant in the DB.
    uniqueIndex('price_history_one_open_per_sub')
      .on(t.subscriptionId)
      .where(sql`${t.effectiveTo} is null`)
  ]
)

export type PriceHistory = typeof subscriptionPriceHistory.$inferSelect
export type NewPriceHistory = typeof subscriptionPriceHistory.$inferInsert

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image')
})

// Backs the magic-link flow: a row is created when a link is sent and consumed
// (deleted) on verify.
export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull()
  },
  vt => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

// Fixed-window counters for throttling abuse-prone endpoints (e.g. the magic
// link action). `key` encodes both the endpoint and the dimension being limited,
// e.g. "magic-link:email:foo@bar.com" or "magic-link:ip:1.2.3.4". A row lives
// only as long as its window; expired rows are reset in place on the next hit.
export const rateLimits = pgTable('rate_limit', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull()
})
