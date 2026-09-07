import { and, eq, isNull } from 'drizzle-orm'
import { subscriptions, subscriptionPriceHistory } from '@nuxthub/db/schema'

/** Today as a UTC date-only value, matching how the dates are stored. */
function todayDate(): Date {
  return new Date(new Date().toISOString().slice(0, 10))
}

/**
 * Reactivate a canceled subscription: back to `active`, clearing `canceledAt`
 * and opening a fresh price-history period from today at the subscription's
 * current price. The old period stays closed at the cancellation date, so the
 * gap in between is naturally uncounted by `totalPaidToDate`. Only valid for a
 * canceled subscription (use resume for a paused one).
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subscription id' })
  }

  const [current] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))
    .limit(1)
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
  }
  if (current.status !== 'canceled') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only a canceled subscription can be reactivated'
    })
  }

  const from = todayDate()

  try {
    await db.transaction(async (tx) => {
      // A canceled sub has no open period; open a new one at the current price.
      // Guard against a duplicate open row just in case (unique index also does).
      const [openRow] = await tx
        .select({ id: subscriptionPriceHistory.id })
        .from(subscriptionPriceHistory)
        .where(and(
          eq(subscriptionPriceHistory.subscriptionId, id),
          isNull(subscriptionPriceHistory.effectiveTo)
        ))
        .limit(1)

      if (!openRow) {
        await tx.insert(subscriptionPriceHistory).values({
          subscriptionId: id,
          amount: current.amount,
          currency: current.currency,
          cycle: current.cycle,
          shareCount: current.shareCount,
          effectiveFrom: from,
          effectiveTo: null,
          source: 'manual'
        })
      }

      await tx
        .update(subscriptions)
        .set({ status: 'active', canceledAt: null, updatedAt: new Date() })
        .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))
    })
  } catch (err) {
    console.error('reactivateSubscription failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not reactivate. Please try again.'
    })
  }

  return { ok: true }
})
