import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { SubscriptionItem } from '@/components/subscriptions/subscription-item'
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function SubscriptionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const subs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))

  const monthlyTotal = subs.reduce((sum, s) => {
    const perMonth =
      s.cycle === 'monthly'
        ? s.amount / s.intervalCount
        : s.cycle === 'yearly'
          ? s.amount / (12 * s.intervalCount)
          : (s.amount * 52) / 12 / s.intervalCount // weekly
    return sum + perMonth
  }, 0)

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold">My subscriptions</h1>
        <p className="text-muted-foreground">
          Monthly total: {(monthlyTotal / 100).toFixed(2)} €
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionForm />
        </CardContent>
      </Card>

      <ul className="space-y-3">
        {subs.map((sub) => {
          return <SubscriptionItem key={sub.id} subscription={sub} />
        })}
      </ul>
    </DashboardLayout>
  )
}
