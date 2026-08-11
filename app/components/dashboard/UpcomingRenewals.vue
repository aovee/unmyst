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

interface Renewal {
  sub: Subscription
  date: Date
  inDays: number
  amount: number
  isTrialEnd: boolean
}

const renewals = computed<Renewal[]>(() => {
  const today = new Date()
  const items: Renewal[] = []

  for (const s of props.subscriptions) {
    if (isInTrial(s)) {
      // While on trial there's no charge — the next real event is the trial
      // ending (the first paid charge), so surface that instead.
      const end = trialEndDate(s)!
      items.push({
        sub: s,
        date: end,
        inDays: differenceInCalendarDays(end, today),
        amount: personalAmount(s),
        isTrialEnd: true
      })
      continue
    }

    const date = computeNextRenewal(new Date(s.anchorDate), s.cycle, s.intervalCount, today)
    items.push({
      sub: s,
      date,
      inDays: differenceInCalendarDays(date, today),
      amount: personalAmount(s),
      isTrialEnd: false
    })
  }

  return items
    .filter(r => r.inDays >= 0 && r.inDays <= horizon.value)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
})

const total = computed(() =>
  renewals.value.reduce((sum, r) => sum + r.amount, 0)
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
          <div class="flex items-center gap-1.5">
            <span class="truncate text-sm font-medium">{{ r.sub.name }}</span>
            <UIcon
              v-if="r.isTrialEnd && r.sub.automaticConversion"
              name="i-lucide-alert-triangle"
              class="size-3.5 shrink-0 text-warning"
              :title="'Trial converts to paid automatically'"
            />
          </div>
          <div class="text-xs" :class="r.isTrialEnd ? 'text-warning' : 'text-muted'">
            <span v-if="r.isTrialEnd">Trial ends · </span>
            {{ formatDate(r.date, locale) }} · {{ relativeLabel(r.inDays) }}
          </div>
        </div>
        <div class="shrink-0 text-right text-sm font-medium tabular-nums">
          {{ formatCurrency(r.amount, r.sub.currency, locale) }}
          <div v-if="r.isTrialEnd" class="text-xs font-normal text-muted">
            first charge
          </div>
          <div v-else-if="isShared(r.sub)" class="text-xs font-normal text-muted">
            of
            {{ formatCurrency(r.sub.amount, r.sub.currency, locale) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-6 text-center text-sm text-muted">
      Nothing due in the next {{ horizon }} days.
    </div>
  </UCard>
</template>
