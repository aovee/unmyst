import { notFound, redirect } from 'next/navigation'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function EditSubscriptionPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await auth()
  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent(`/subscriptions/${id}/edit`)
    redirect(`/login?callbackUrl=${callbackUrl}`)
  }

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(
      and(eq(subscriptions.id, id), eq(subscriptions.userId, session.user.id))
    )

  if (!subscription) notFound()

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Edit subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionForm subscription={subscription} />
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
