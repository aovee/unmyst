'use client'

import { PencilIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'

import { Subscription } from '@/db/schema'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { computeNextRenewal } from './billing'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useLocale } from '@/components/locale-provider'
import { deleteSubscription } from './actions'

interface SubscriptionRowProps {
  subscription: Subscription
}

function SubscriptionDeleteDialog({
  subscriptionId
}: {
  subscriptionId: string
}) {
  const handleDelete = async () => {
    await deleteSubscription(subscriptionId)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button asChild variant="ghost" size="icon" className="size-8">
          <div className="hover:cursor-pointer">
            <span className="sr-only">Edit</span>
            <Trash2Icon className="text-destructive" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Warning</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this subscription? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleDelete} variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SubscriptionRow({ subscription }: SubscriptionRowProps) {
  const locale = useLocale()
  const { cycle, intervalCount } = subscription

  const nextRenewalDate = computeNextRenewal(
    subscription.anchorDate,
    cycle,
    intervalCount
  )

  const strCycle = subscription.cycle.replace('ly', '')
  const displayCycle =
    subscription.intervalCount > 1
      ? `${subscription.intervalCount} ${strCycle}s`
      : strCycle

  return (
    <TableRow className="group">
      <TableCell className="font-medium">{subscription.name}</TableCell>
      <TableCell>{formatDate(subscription.anchorDate, locale)}</TableCell>
      <TableCell>{formatDate(nextRenewalDate, locale)}</TableCell>
      <TableCell className="text-right">
        {formatCurrency(subscription.amount, undefined, locale)}
      </TableCell>
      <TableCell className="text-left">/ {displayCycle}</TableCell>
      <TableCell className="text-right max-w-20">
        <div className="flex items-center justify-end gap-1 transition-all duration-300 opacity-100 sm:opacity-0 group-hover:opacity-100">
          <Button asChild variant="ghost" size="icon" className="size-8">
            <Link href={`/subscriptions/${subscription.id}/edit`}>
              <span className="sr-only">Edit</span>
              <PencilIcon />
            </Link>
          </Button>
          <SubscriptionDeleteDialog subscriptionId={subscription.id} />
        </div>
      </TableCell>
    </TableRow>
  )
}
