import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subscription id' })
  }

  const result = await readValidatedBody(event, b =>
    SubscriptionInputSchema.safeParse(b)
  )
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message ?? 'Invalid input'
    })
  }
  try {
    await db
      .update(subscriptions)
      .set({ ...toDbValues(result.data), updatedAt: new Date() })
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))
  } catch (err) {
    console.error('updateSubscription failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not update. Please try again.'
    })
  }

  return { ok: true }
})
