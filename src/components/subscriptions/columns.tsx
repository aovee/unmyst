'use client'

import { ColumnDef } from '@tanstack/react-table'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Subscription } from '@/db/schema'
import { type Locale } from '@/lib/locale'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { Checkbox } from '@/components/ui/checkbox'
import { computeNextRenewal } from './billing'
import { EditSubscriptionDialog } from './edit-dialog'
import { deleteSubscription } from './actions'

function displayCycle({ cycle, intervalCount }: Subscription): string {
  const unit = cycle.replace('ly', '')
  return intervalCount > 1 ? `${intervalCount} ${unit}s` : unit
}

function SubscriptionActionsCell({
  subscription
}: {
  subscription: Subscription
}) {
  const handleDelete = async () => {
    await deleteSubscription(subscription.id)
    toast.success('Subscription deleted')
  }

  return (
    <div className="flex items-center justify-end gap-1 transition-all duration-300 opacity-100 lg:opacity-0 group-hover:opacity-100">
      <EditSubscriptionDialog
        subscription={subscription}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 hover:cursor-pointer"
          >
            <span className="sr-only">Edit</span>
            <PencilIcon />
          </Button>
        }
      />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 hover:cursor-pointer"
          >
            <span className="sr-only">Delete</span>
            <Trash2Icon className="text-destructive" />
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
    </div>
  )
}

export function getColumns(locale: Locale): ColumnDef<Subscription>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'name',
      header: 'Service',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'anchorDate',
      header: 'Started on',
      cell: ({ row }) => formatDate(row.original.anchorDate, locale)
    },
    {
      id: 'nextRenewal',
      header: 'Next billing',
      cell: ({ row }) => {
        const { anchorDate, cycle, intervalCount } = row.original
        return formatDate(
          computeNextRenewal(anchorDate, cycle, intervalCount),
          locale
        )
      }
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.original.amount, undefined, locale)}
        </div>
      )
    },
    {
      id: 'cycle',
      header: 'Cycle',
      cell: ({ row }) => `/ ${displayCycle(row.original)}`
    },
    {
      id: 'actions',
      header: () => <div className="text-right pr-2">Actions</div>,
      meta: {
        class: {
          th: 'max-w-20',
          td: 'max-w-20'
        }
      },
      cell: ({ row }) => <SubscriptionActionsCell subscription={row.original} />
    }
  ]
}
