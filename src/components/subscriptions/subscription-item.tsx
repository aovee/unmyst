import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { computeNextRenewal } from './billing'
import { Subscription } from '@/db/schema'
import { deleteSubscription } from './actions'

export function SubscriptionItem({
  subscription
}: {
  subscription: Subscription
}) {
  const nextRenewalDate = computeNextRenewal(
    subscription.anchorDate,
    subscription.cycle,
    subscription.intervalCount
  )

  return (
    <li>
      <Card>
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="font-medium">{subscription.name}</p>
            <p className="text-sm text-muted-foreground">
              {(subscription.amount / 100).toFixed(2)} {subscription.currency} /{' '}
              {subscription.cycle} · next{' '}
              {nextRenewalDate.toLocaleDateString('en-GB')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline-primary" size="sm">
              <Link href={`/subscriptions/${subscription.id}/edit`}>Edit</Link>
            </Button>
            <form action={deleteSubscription.bind(null, subscription.id)}>
              <Button variant="destructive" size="sm" type="submit">
                Delete
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}
