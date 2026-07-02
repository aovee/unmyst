import { redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'

import { auth } from '@/auth'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { SubscriptionsTable } from '@/components/subscriptions/table'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AddSubscriptionDialog } from '@/components/subscriptions/add-dialog'
import { SubscriptionDataCards } from '@/components/subscriptions/data-cards'

export default async function SubscriptionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const subs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .orderBy(desc(subscriptions.anchorDate))

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My subscriptions</h1>
        <AddSubscriptionDialog />
      </div>

      <SubscriptionDataCards subscriptions={subs} />

      <SubscriptionsTable subscriptions={subs} />
    </DashboardLayout>
  )
}
