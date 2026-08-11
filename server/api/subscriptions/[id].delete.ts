import { and, eq } from 'drizzle-orm'
import { subscriptions } from '@nuxthub/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing subscription id' })
  }

  await db
    .delete(subscriptions)
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))

  return { ok: true }
})
