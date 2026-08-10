<script setup lang="ts">
import { differenceInCalendarDays } from 'date-fns'
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{
  subscriptions: Subscription[]
  windowDays?: number
}>()

const locale = useLocale()
const { logoUrl } = useServiceLogo()

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

const horizon = computed(() => props.windowDays ?? 30)

const renewals = computed(() => {
  const today = new Date()

  return props.subscriptions
    .map((s) => {
      const date = computeNextRenewal(
        new Date(s.anchorDate),
        s.cycle,
        s.intervalCount,
        today
      )
      return { sub: s, date, inDays: differenceInCalendarDays(date, today) }
    })
    .filter(r => r.inDays >= 0 && r.inDays <= horizon.value)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
})

const total = computed(() =>
  renewals.value.reduce((sum, r) => sum + r.sub.amount, 0)
)

function relativeLabel(inDays: number): string {
  if (inDays === 0) return 'Today'
  if (inDays === 1) return 'Tomorrow'
  return `in ${inDays} days`
}
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calendar-clock" class="size-4 text-primary" />
          <h3 class="text-sm font-medium">
            Upcoming renewals
          </h3>
        </div>
        <div class="text-sm text-muted">
          <span class="font-semibold text-default tabular-nums">
            {{ formatCurrency(total, undefined, locale) }}
          </span>
          due in {{ horizon }} days
        </div>
      </div>
    </template>

    <div v-if="renewals.length" class="flex flex-col divide-y divide-default">
      <div
        v-for="r in renewals"
        :key="r.sub.id"
        class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
      >
        <UAvatar
          :src="logoUrl(r.sub.name) ?? undefined"
          :text="initials(r.sub.name)"
          :alt="r.sub.name"
          size="sm"
          class="shrink-0 bg-elevated"
        />
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium">
            {{ r.sub.name }}
          </div>
          <div class="text-xs text-muted">
            {{ formatDate(r.date, locale) }} · {{ relativeLabel(r.inDays) }}
          </div>
        </div>
        <div class="shrink-0 text-sm font-medium tabular-nums">
          {{ formatCurrency(r.sub.amount, r.sub.currency, locale) }}
        </div>
      </div>
    </div>

    <div v-else class="py-6 text-center text-sm text-muted">
      Nothing due in the next {{ horizon }} days.
    </div>
  </UCard>
</template>
