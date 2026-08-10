export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

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
      .insert(subscriptions)
      .values({ ...toDbValues(result.data), userId: user.id })
  } catch (err) {
    console.error('createSubscription failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not save. Please try again.'
    })
  }

  return { ok: true }
})
