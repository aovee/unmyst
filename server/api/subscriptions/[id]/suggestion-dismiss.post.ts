import { and, eq, sql } from 'drizzle-orm'
import { subscriptions } from '@nuxthub/db/schema'

/**
 * Dismiss the annual-plan suggestion for one subscription. Records when it was
 * dismissed and the monthly `amount` at that moment (copied from the column
 * itself so it stays atomic), so `isAnnualPlanCandidate` keeps it hidden only
 * while the price is unchanged.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subscription id' })
  }

  try {
    await db
      .update(subscriptions)
      .set({
        suggestionDismissedAt: new Date(),
        suggestionDismissedAmount: sql`${subscriptions.amount}`
      })
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))
  } catch (err) {
    console.error('dismissSuggestion failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not dismiss. Please try again.'
    })
  }

  return { ok: true }
})
