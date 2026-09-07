import { and, eq, isNull } from 'drizzle-orm'
import { subscriptions, subscriptionPriceHistory } from '@nuxthub/db/schema'

/** Today as a UTC date-only value, matching how the dates are stored. */
function todayDate(): Date {
  return new Date(new Date().toISOString().slice(0, 10))
}

/**
 * Cancel a subscription: terminal, but the record is kept for history. Alongside
 * marking it `canceled`, this closes the open price-history period at
 * `canceledAt`, which is exactly what a half-open period means — so
 * `totalPaidToDate` stops counting charges past the cancellation with no changes
 * to the maths. The close date is clamped to the period's own start so a
 * same-day cancel can't create an inverted period.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subscription id' })
  }

  const result = await readValidatedBody(event, b =>
    SubscriptionCancelSchema.safeParse(b)
  )
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message ?? 'Invalid input'
    })
  }

  const canceledAt = result.data.canceledAt ? new Date(result.data.canceledAt) : todayDate()

  // Ensure the row exists and belongs to the user before mutating anything.
  const [current] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))
    .limit(1)
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
  }

  const openRowWhere = and(
    eq(subscriptionPriceHistory.subscriptionId, id),
    isNull(subscriptionPriceHistory.effectiveTo)
  )

  try {
    await db.transaction(async (tx) => {
      const [openRow] = await tx
        .select()
        .from(subscriptionPriceHistory)
        .where(openRowWhere)
        .limit(1)

      if (openRow) {
        // Never close before the period began (a same-day/early cancel).
        const effectiveTo
          = +canceledAt > +new Date(openRow.effectiveFrom)
            ? canceledAt
            : new Date(openRow.effectiveFrom)
        await tx
          .update(subscriptionPriceHistory)
          .set({ effectiveTo })
          .where(openRowWhere)
      }

      await tx
        .update(subscriptions)
        .set({ status: 'canceled', canceledAt, updatedAt: new Date() })
        .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))
    })
  } catch (err) {
    console.error('cancelSubscription failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not cancel. Please try again.'
    })
  }

  return { ok: true }
})
