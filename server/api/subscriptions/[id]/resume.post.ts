import { and, eq } from 'drizzle-orm'
import { subscriptions } from '@nuxthub/db/schema'

/**
 * Resume a paused subscription: back to `active`, clearing the pause markers.
 * The anchor date is untouched, so the next renewal is computed as usual from
 * the original billing cycle.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subscription id' })
  }

  let updated
  try {
    updated = await db
      .update(subscriptions)
      .set({
        status: 'active',
        pausedAt: null,
        resumeAt: null,
        updatedAt: new Date()
      })
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))
      .returning({ id: subscriptions.id })
  } catch (err) {
    console.error('resumeSubscription failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not resume. Please try again.'
    })
  }

  if (updated.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
  }

  return { ok: true }
})
