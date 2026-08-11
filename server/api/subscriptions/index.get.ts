import { desc, eq } from 'drizzle-orm'
import { subscriptions } from '@nuxthub/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  return db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.anchorDate))
})
