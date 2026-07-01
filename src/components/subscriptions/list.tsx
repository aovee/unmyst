import { Subscription } from '@/db/schema'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { SubscriptionRow } from './row'

interface SubscriptionListProps {
  subscriptions: Array<Subscription>
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Started on</TableHead>
            <TableHead>Next billing</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-left">Cycle</TableHead>
            <TableHead className="text-right max-w-3.5" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <SubscriptionRow
              key={subscription.id}
              subscription={subscription}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
