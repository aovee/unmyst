'use client'

import { useMemo } from 'react'

import { Subscription } from '@/db/schema'
import { DataTable } from '@/components/data-table'
import { useLocale } from '@/components/locale-provider'
import { getColumns } from './columns'

interface SubscriptionsTableProps {
  subscriptions: Array<Subscription>
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const locale = useLocale()
  const columns = useMemo(() => getColumns(locale), [locale])

  return <DataTable columns={columns} data={subscriptions} />
}
