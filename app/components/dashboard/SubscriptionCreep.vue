<script setup lang="ts">
import { startOfMonth, endOfMonth, addMonths, differenceInCalendarMonths, isAfter } from 'date-fns'
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscriptions: Subscription[] }>()

const locale = useLocale()
const { t } = useI18n()
const currency = computed(() => props.subscriptions[0]?.currency ?? 'EUR')

// Cap the window so a very old first subscription doesn't produce a crowded axis.
const MAX_MONTHS = 24

interface MonthPoint {
  label: string
  amount: number // cents — cumulative monthly run-rate at that month's end
}

// Cumulative committed monthly run-rate: for each month we sum the monthly-
// normalized personal cost of every subscription that had started by then. The
// schema has no cancellation date, so this only ever rises — it's "what you
// signed up for over time", not a net balance.
const points = computed<MonthPoint[]>(() => {
  if (!props.subscriptions.length) return []

  const now = startOfMonth(new Date())
  const earliest = props.subscriptions.reduce((min, s) => {
    const d = startOfMonth(new Date(s.anchorDate))
    return d < min ? d : min
  }, now)

  // Clamp the span to MAX_MONTHS, always ending at the current month.
  const span = Math.min(differenceInCalendarMonths(now, earliest), MAX_MONTHS - 1)
  const start = addMonths(now, -span)
  const multiYear = span >= 12
  const monthLabel = new Intl.DateTimeFormat(
    locale.value,
    multiYear ? { month: 'short', year: '2-digit' } : { month: 'short' }
  )

  return Array.from({ length: span + 1 }, (_, i) => {
    const monthEnd = endOfMonth(addMonths(start, i))
    const amount = props.subscriptions.reduce((sum, s) => {
      if (isAfter(new Date(s.anchorDate), monthEnd)) return sum
      return sum + monthlyAmount(personalAmount(s), s.cycle, s.intervalCount)
    }, 0)
    return {
      label: monthLabel.format(addMonths(start, i)),
      amount
    }
  })
})

const latest = computed(() => points.value.at(-1)?.amount ?? 0)
const first = computed(() => points.value[0]?.amount ?? 0)
const growth = computed(() => latest.value - first.value)

const categories = computed<Record<string, BulletLegendItemInterface>>(() => ({
  amount: { name: t('dashboard.subscriptionCreep.series'), color: 'var(--color-unmyst-500)' }
}))

const axisFormatter = (v: number) =>
  new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currency.value,
    maximumFractionDigits: 0
  }).format(v / 100)

// The x scale is indexed (0..n); map each tick back to its month label.
const monthFormatter = (i: number) => points.value[Math.round(i)]?.label ?? ''
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <DashboardSectionHeader
        icon="i-lucide-trending-up"
        :title="$t('dashboard.subscriptionCreep.title')"
        :description="$t('dashboard.subscriptionCreep.description')"
      />
    </template>

    <div v-if="points.length > 1">
      <AreaChart
        :data="points"
        :height="240"
        :categories="categories"
        :x-formatter="monthFormatter"
        :y-formatter="axisFormatter"
        :x-num-ticks="5"
        :y-num-ticks="4"
        :curve-type="CurveType.MonotoneX"
        hide-legend
      />
      <i18n-t
        v-if="growth > 0"
        keypath="dashboard.subscriptionCreep.growth"
        tag="p"
        class="mt-5 text-sm text-muted"
      >
        <template #amount>
          <span class="font-medium text-default">{{ formatCurrency(growth, currency, locale) }}</span>
        </template>
        <template #since>
          {{ points[0]!.label }}
        </template>
        <template #latest>
          <span class="font-medium text-default">{{ formatCurrency(latest, currency, locale) }}</span>
        </template>
      </i18n-t>
    </div>

    <div v-else class="py-6 text-center text-sm text-muted">
      {{ $t('dashboard.subscriptionCreep.empty') }}
    </div>
  </UCard>
</template>
