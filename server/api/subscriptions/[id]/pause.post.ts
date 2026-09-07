import { and, eq } from 'drizzle-orm'
import { subscriptions } from '@nuxthub/db/schema'

/** Today as a UTC date-only value, matching how `pausedAt` is stored. */
function todayDate(): Date {
  return new Date(new Date().toISOString().slice(0, 10))
}

/**
 * Pause a subscription: a reversible break. It stops contributing to current
 * spend and upcoming renewals (see `isBillingActive`), but its price history is
 * left untouched so resuming needs no reconstruction. An optional `resumeAt`
 * records when it should bill again.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subscription id' })
  }

  const result = await readValidatedBody(event, b =>
    SubscriptionPauseSchema.safeParse(b)
  )
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message ?? 'Invalid input'
    })
  }

  let updated
  try {
    updated = await db
      .update(subscriptions)
      .set({
        status: 'paused',
        pausedAt: todayDate(),
        resumeAt: result.data.resumeAt ? new Date(result.data.resumeAt) : null,
        updatedAt: new Date()
      })
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))
      .returning({ id: subscriptions.id })
  } catch (err) {
    console.error('pauseSubscription failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not pause. Please try again.'
    })
  }

  if (updated.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
  }

  return { ok: true }
})
