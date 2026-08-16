import { subscriptions, subscriptionPriceHistory } from '@nuxthub/db/schema'

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

  const values = toDbValues(result.data)
  // Generate the id up front so the subscription and its opening price-history
  // period are written together in one transaction.
  const id = crypto.randomUUID()

  try {
    await db.transaction(async (tx) => {
      await tx.insert(subscriptions).values({ ...values, id, userId: user.id })
      await tx.insert(subscriptionPriceHistory).values({
        subscriptionId: id,
        amount: values.amount,
        currency: values.currency,
        cycle: values.cycle,
        shareCount: values.shareCount,
        effectiveFrom: values.anchorDate,
        effectiveTo: null,
        source: 'manual'
      })
    })
  } catch (err) {
    console.error('createSubscription failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not save. Please try again.'
    })
  }

  return { ok: true }
})
