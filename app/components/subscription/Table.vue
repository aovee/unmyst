<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Subscription } from '~~/server/db/schema'

defineProps<{ subscriptions: Subscription[] }>()
const emit = defineEmits<{ refresh: [] }>()

const locale = useLocale()
const toast = useToast()
const { t } = useI18n()
const { logoUrl } = useServiceLogo()

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

const columns = computed<TableColumn<Subscription>[]>(() => [
  {
    accessorKey: 'service',
    header: t('subscription.table.service'),
    meta: {
      class: {
        th: 'title-upper min-w-lg'
      }
    }
  },
  {
    accessorKey: 'renews',
    header: t('subscription.table.renews'),
    meta: {
      class: {
        th: 'title-upper'
      }
    }
  },
  {
    accessorKey: 'billed',
    header: t('subscription.table.billed'),
    meta: {
      class: {
        th: 'text-right title-upper',
        td: 'text-right'
      }
    }
  },
  {
    accessorKey: 'per-month',
    header: t('subscription.table.perMonth'),
    meta: {
      class: {
        th: 'text-right title-upper',
        td: 'text-right'
      }
    }
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
])

// Annual-plan saving to badge on the row, or null when the plan isn't a
// candidate (or switching wouldn't actually save). Shared logic with the
// dashboard "Savings" section via `useAnnualPlanSuggestions`.
function annualSuggestion(s: Subscription): { saving: number, isEstimate: boolean } | null {
  if (!isAnnualPlanCandidate(s)) return null
  const result = annualPlanSaving(s)
  return result.saving > 0 ? result : null
}

function nextRenewalDate(s: Subscription): Date {
  return computeNextRenewal(new Date(s.anchorDate), s.cycle, s.intervalCount)
}

function nextBilling(s: Subscription): string {
  return formatRelativeDate(nextRenewalDate(s), locale.value)
}

function getAmountByCycle(s: Subscription): number {
  return ((s.amount * CYCLES_PER_YEAR[s.cycle]) / s.intervalCount) / CYCLES_PER_YEAR['monthly']
}

// "Trial — 6 days left" display state. Warning-coloured when the trial will
// convert on its own, neutral otherwise (a manual trial is harmless).
function trialLabel(s: Subscription): string {
  const left = trialDaysLeft(s)
  if (left === null) return ''
  if (left === 0) return t('subscription.trial.endsToday')
  return t('subscription.trial.daysLeft', left)
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
    toast.add({ title: t('subscription.delete.success'), color: 'success' })
    deleteOpen.value = false
    emit('refresh')
  } catch {
    toast.add({ title: t('subscription.delete.error'), color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <UTable
      :data="subscriptions"
      :columns="columns"
      class="flex-1"
      :ui="{ tr: 'group' }"
    >
      <template #service-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="logoUrl(row.original.service) ?? undefined"
            :text="initials(row.original.service)"
            :alt="row.original.service"
            size="sm"
            class="shrink-0 bg-elevated"
          />
          <div class="flex flex-col">
            <span class="truncate text-sm font-semibold">
              <ULink
                :to="`/subscriptions/${row.original.id}`"
                class="text-highlighted hover:text-primary"
              >{{ row.original.service }}</ULink>
              <span v-if="row.original.description" class="text-xs text-muted">
                - {{ row.original.description }}
              </span>
            </span>
            <span v-if="row.original.category" class="text-xs text-dimmed">
              {{ row.original.category }}
            </span>
            <UBadge
              v-if="annualSuggestion(row.original)"
              color="success"
              variant="subtle"
              size="sm"
              icon="i-lucide-piggy-bank"
              class="mt-1 w-fit"
              :title="annualSuggestion(row.original)!.isEstimate
                ? $t('subscription.annualSuggestion.tooltipEstimate')
                : $t('subscription.annualSuggestion.tooltipExact')"
            >
              {{ $t('subscription.annualSuggestion.badge', {
                amount: formatCurrency(annualSuggestion(row.original)!.saving, row.original.currency, locale)
              }) }}
            </UBadge>
          </div>
        </div>
      </template>

      <template #renews-cell="{ row }">
        <div class="flex flex-col">
          <div class="text-highlighted font-semibold">
            <UBadge
              v-if="isInTrial(row.original)"
              :color="row.original.automaticConversion ? 'warning' : 'neutral'"
              :variant="row.original.automaticConversion ? 'subtle' : 'outline'"
              :icon="row.original.automaticConversion ? 'i-lucide-alert-triangle' : 'i-lucide-hourglass'"
              :title="$t('subscription.trial.endsOn', { date: formatDate(trialEndDate(row.original)!, locale) })"
            >
              {{ trialLabel(row.original) }}
            </UBadge>
            <span v-else :title="formatDate(nextRenewalDate(row.original), locale)">
              {{ nextBilling(row.original) }}
            </span>
          </div>
          <div class="text-dimmed">
            {{ formatDate(nextRenewalDate(row.original), locale) }}
          </div>
        </div>
      </template>

      <template #billed-cell="{ row }">
        <div class="flex flex-col">
          <div class="text-right text-default">
            {{ formatCurrency(row.original.amount, row.original.currency, locale) }}
            <div v-if="isInTrial(row.original)" class="text-xs text-muted">
              {{ $t('subscription.card.afterTrial') }}
            </div>
          </div>
          <div class="text-xs text-dimmed">
            {{ $t(`cycle.${row.original.cycle}`) }}
          </div>
        </div>
      </template>

      <template #per-month-cell="{ row }">
        <div class="flex flex-col">
          <div class="text-lg font-semibold text-highlighted">
            {{ formatCurrency(getAmountByCycle(row.original), row.original.currency, locale) }}
          </div>
          <div v-if="isShared(row.original)" class="text-xs text-primary">
            {{ $t('subscription.card.yourShare') }}
            {{ formatCurrency(personalAmount(row.original), row.original.currency, locale) }}
          </div>
        </div>
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
            :aria-label="$t('common.edit')"
            @click="openEdit(row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            square
            :aria-label="$t('common.delete')"
            @click="openDelete(row.original)"
          />
        </div>
      </template>

      <template #empty>
        <div class="py-8 text-center text-muted-foreground">
          {{ $t('subscription.table.empty') }}
        </div>
      </template>
    </UTable>

    <!-- Edit modal (single instance, retargeted per row) -->
    <SubscriptionEditDialog
      v-if="editSub"
      v-model:open="editOpen"
      :subscription="editSub"
      @saved="emit('refresh')"
    />

    <!-- Delete confirmation -->
    <UModal
      v-model:open="deleteOpen"
      :title="$t('subscription.delete.title')"
      :description="$t('subscription.delete.description')"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" @click="deleteOpen = false">
            {{ $t('common.cancel') }}
          </UButton>
          <UButton color="error" :loading="deleting" @click="confirmDelete">
            {{ $t('common.delete') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
