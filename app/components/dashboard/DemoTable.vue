<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import data from '~/assets/dashboard-data.json'

type Row = {
  id: number
  header: string
  type: string
  status: string
  target: string
  limit: string
  reviewer: string
}

const rows = data as Row[]

const columns: TableColumn<Row>[] = [
  { accessorKey: 'header', header: 'Header' },
  { accessorKey: 'type', header: 'Section Type' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'target', header: 'Target' },
  { accessorKey: 'limit', header: 'Limit' },
  { accessorKey: 'reviewer', header: 'Reviewer' }
]
</script>

<template>
  <div class="overflow-hidden rounded-md border border-border">
    <UTable :data="rows" :columns="columns">
      <template #status-cell="{ row }">
        <UBadge
          :color="row.original.status === 'Done' ? 'success' : 'neutral'"
          variant="subtle"
          size="sm"
        >
          {{ row.original.status }}
        </UBadge>
      </template>
    </UTable>
  </div>
</template>
