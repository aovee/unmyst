import { and, asc, eq } from 'drizzle-orm'
import { subscriptions, subscriptionPriceHistory } from '@nuxthub/db/schema'

/**
 * One subscription plus its full price history (oldest period first), scoped to
 * the signed-in user. Powers the subscription detail page.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subscription id' })
  }

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))
    .limit(1)
  if (!subscription) {
    throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
  }

  const history = await db
    .select()
    .from(subscriptionPriceHistory)
    .where(eq(subscriptionPriceHistory.subscriptionId, id))
    .orderBy(asc(subscriptionPriceHistory.effectiveFrom))

  return { subscription, history }
})
