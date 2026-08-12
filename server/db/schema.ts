import {
  pgTable,
  pgEnum,
  primaryKey,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp
} from 'drizzle-orm/pg-core'

export const cycleEnum = pgEnum('cycle', ['weekly', 'monthly', 'yearly'])

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
