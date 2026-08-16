import { and, asc, eq, isNull } from 'drizzle-orm'
import { subscriptions, subscriptionPriceHistory } from '@nuxthub/db/schema'

/** Today as a UTC date-only value, matching how `anchorDate` is stored. */
function todayDate(): Date {
  return new Date(new Date().toISOString().slice(0, 10))
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subscription id' })
  }

  const result = await readValidatedBody(event, b =>
    SubscriptionUpdateSchema.safeParse(b)
  )
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message ?? 'Invalid input'
    })
  }

  const data = result.data
  const values = toDbValues(data)

  // Current state, so we can tell what actually changed and keep price history
  // consistent. Scoped to the user so one can't edit another account's rows.
  const [current] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))
    .limit(1)
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
  }

  const priceChanged
    = values.amount !== current.amount
      || values.cycle !== current.cycle
      || values.currency !== current.currency
  const shareChanged = values.shareCount !== current.shareCount
  const anchorChanged = +values.anchorDate !== +new Date(current.anchorDate)

  const openRowWhere = and(
    eq(subscriptionPriceHistory.subscriptionId, id),
    isNull(subscriptionPriceHistory.effectiveTo)
  )

  try {
    await db.transaction(async (tx) => {
      const subUpdate = () =>
        tx
          .update(subscriptions)
          .set({ ...values, updatedAt: new Date() })
          .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))

      if (priceChanged) {
        const [openRow] = await tx
          .select()
          .from(subscriptionPriceHistory)
          .where(openRowWhere)
          .limit(1)

        const effectiveFrom = data.effectiveFrom
          ? new Date(data.effectiveFrom)
          : todayDate()

        // A genuine price change opens a new period — unless it's flagged as a
        // correction, or the requested start isn't strictly after the current
        // period began (which would overlap). In those cases we rewrite the open
        // period in place instead.
        const canOpenNewPeriod
          = data.priceChangeIntent !== 'correction'
            && openRow != null
            && +effectiveFrom > +new Date(openRow.effectiveFrom)

        if (canOpenNewPeriod) {
          await tx
            .update(subscriptionPriceHistory)
            .set({ effectiveTo: effectiveFrom })
            .where(openRowWhere)
          await tx.insert(subscriptionPriceHistory).values({
            subscriptionId: id,
            amount: values.amount,
            currency: values.currency,
            cycle: values.cycle,
            shareCount: values.shareCount,
            effectiveFrom,
            effectiveTo: null,
            source: 'manual'
          })
        } else {
          await tx
            .update(subscriptionPriceHistory)
            .set({
              amount: values.amount,
              currency: values.currency,
              cycle: values.cycle,
              shareCount: values.shareCount,
              source: 'correction'
            })
            .where(openRowWhere)
        }
      } else if (shareChanged) {
        // Split changed without a price change: keep the current period's share
        // in sync (it's versioned), but don't open a new "price changed" period.
        await tx
          .update(subscriptionPriceHistory)
          .set({ shareCount: values.shareCount })
          .where(openRowWhere)
      } else if (anchorChanged) {
        // Moving the first billing date shifts where the timeline starts.
        const [earliest] = await tx
          .select()
          .from(subscriptionPriceHistory)
          .where(eq(subscriptionPriceHistory.subscriptionId, id))
          .orderBy(asc(subscriptionPriceHistory.effectiveFrom))
          .limit(1)

        if (earliest) {
          await tx
            .update(subscriptionPriceHistory)
            .set({ effectiveFrom: values.anchorDate })
            .where(eq(subscriptionPriceHistory.id, earliest.id))
        }
      }

      await subUpdate()
    })
  } catch (err) {
    console.error('updateSubscription failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not update. Please try again.'
    })
  }

  return { ok: true }
})
