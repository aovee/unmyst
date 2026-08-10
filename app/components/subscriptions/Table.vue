<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Subscription } from '~~/server/db/schema'

defineProps<{ subscriptions: Subscription[] }>()
const emit = defineEmits<{ refresh: [] }>()

const locale = useLocale()
const toast = useToast()
const { logoUrl } = useServiceLogo()

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

const columns: TableColumn<Subscription>[] = [
  {
    accessorKey: 'name',
    header: 'Service'
  },
  {
    accessorKey: 'anchorDate',
    header: 'Started on'
  },
  {
    id: 'nextRenewal',
    header: 'Next billing'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right'
      }
    }
  },
  {
    id: 'cycle',
    header: 'Cycle'
  },
  {
    id: 'actions',
    header: '',
    meta: {
      class: {
        th: 'w-20',
        td: 'w-20'
      }
    }
  }
]

function displayCycle(s: Subscription): string {
  const unit = s.cycle.replace('ly', '')
  return s.intervalCount > 1 ? `${s.intervalCount} ${unit}s` : unit
}

function nextBilling(s: Subscription): string {
  return formatDate(
    computeNextRenewal(new Date(s.anchorDate), s.cycle, s.intervalCount),
    locale
  )
}

// Edit / delete modal wiring.
const editOpen = ref(false)
const editSub = ref<Subscription | null>(null)
function openEdit(s: Subscription) {
  editSub.value = s
  editOpen.value = true
}

const deleteOpen = ref(false)
const deleteSub = ref<Subscription | null>(null)
const deleting = ref(false)
function openDelete(s: Subscription) {
  deleteSub.value = s
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteSub.value) return
  deleting.value = true
  try {
    await $fetch(`/api/subscriptions/${deleteSub.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Subscription deleted', color: 'success' })
    deleteOpen.value = false
    emit('refresh')
  } catch {
    toast.add({ title: 'Could not delete. Please try again.', color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UCard variant="outline">
    <UTable :data="subscriptions" :columns="columns" :ui="{ tr: 'group' }">
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="logoUrl(row.original.name) ?? undefined"
            :text="initials(row.original.name)"
            :alt="row.original.name"
            size="sm"
            class="shrink-0 bg-elevated"
          />
          <span class="font-medium">{{ row.original.name }}</span>
        </div>
      </template>

      <template #anchorDate-cell="{ row }">
        {{ formatDate(new Date(row.original.anchorDate), locale) }}
      </template>

      <template #nextRenewal-cell="{ row }">
        {{ nextBilling(row.original) }}
      </template>

      <template #amount-cell="{ row }">
        <div class="text-right">
          {{ formatCurrency(row.original.amount, row.original.currency, locale) }}
        </div>
      </template>

      <template #cycle-cell="{ row }">
        / {{ displayCycle(row.original) }}
      </template>

      <template #actions-cell="{ row }">
        <div
          class="flex items-center justify-end gap-1 opacity-100 transition-all duration-300 lg:opacity-0 group-hover:opacity-100"
        >
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            aria-label="Edit"
            @click="openEdit(row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            square
            aria-label="Delete"
            @click="openDelete(row.original)"
          />
        </div>
      </template>

      <template #empty>
        <div class="py-8 text-center text-muted-foreground">
          No results.
        </div>
      </template>
    </UTable>

    <!-- Edit modal (single instance, retargeted per row) -->
    <SubscriptionsEditDialog
      v-if="editSub"
      v-model:open="editOpen"
      :subscription="editSub"
      @saved="emit('refresh')"
    />

    <!-- Delete confirmation -->
    <UModal
      v-model:open="deleteOpen"
      title="Warning"
      description="Are you sure you want to delete this subscription? This action cannot be undone."
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" @click="deleteOpen = false">
            Cancel
          </UButton>
          <UButton color="error" :loading="deleting" @click="confirmDelete">
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template>
