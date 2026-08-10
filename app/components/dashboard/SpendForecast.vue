<script setup lang="ts">
import { startOfMonth, addMonths, startOfDay, isBefore, format } from 'date-fns'
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscriptions: Subscription[] }>()

const locale = useLocale()

// Charts assume a single currency; fall back to the first subscription's.
const currency = computed(() => props.subscriptions[0]?.currency ?? 'EUR')

interface MonthBucket {
  label: string
  amount: number // cents
}

// Real expected spend per month: we walk each subscription's actual renewal
// dates across the next 12 months, so yearly plans spike only in their renewal
// month and weekly plans contribute their true 4–5 hits.
const forecast = computed<MonthBucket[]>(() => {
  const start = startOfMonth(new Date())
  const horizonEnd = addMonths(start, 12) // exclusive upper bound
  const buckets: MonthBucket[] = Array.from({ length: 12 }, (_, i) => ({
    label: format(addMonths(start, i), 'MMM'),
    amount: 0
  }))

  for (const s of props.subscriptions) {
    const base = startOfDay(new Date(s.anchorDate))
    let k = 0
    let date = base
    // Advance to the first renewal within the horizon.
    while (isBefore(date, start)) {
      k += s.intervalCount
      date = addCycles(base, s.cycle, k)
    }
    // Accumulate every renewal that lands before the horizon ends.
    while (isBefore(date, horizonEnd)) {
      const idx
        = (date.getFullYear() - start.getFullYear()) * 12
          + (date.getMonth() - start.getMonth())
      if (idx >= 0 && idx < 12) buckets[idx]!.amount += s.amount
      k += s.intervalCount
      date = addCycles(base, s.cycle, k)
    }
  }

  return buckets
})

const categories: Record<string, BulletLegendItemInterface> = {
  amount: { name: 'Spend', color: 'var(--color-unmyst-500)' }
}

const axisFormatter = (v: number) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.value,
    maximumFractionDigits: 0
  }).format(v / 100)
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-chart-column" class="size-4 text-primary" />
        <h3 class="text-sm font-medium">
          Next 12 months
        </h3>
        <span class="text-sm text-muted">What you'll actually be billed each month</span>
      </div>
    </template>

    <BarChart
      :data="forecast"
      :height="260"
      x-axis="label"
      :y-axis="['amount']"
      :categories="categories"
      :y-formatter="axisFormatter"
      :y-num-ticks="4"
      :radius="4"
      hide-legend
    >
      <template #tooltip="{ values }">
        <div class="rounded-md bg-default px-2.5 py-1.5 text-xs shadow-lg ring ring-default">
          <div class="font-medium">
            {{ values?.label }}
          </div>
          <div class="text-muted tabular-nums">
            {{ values ? formatCurrency(values.amount, currency, locale) : '' }}
          </div>
        </div>
      </template>

      <template #fallback>
        <div class="h-[260px] w-full animate-pulse rounded-md bg-elevated" />
      </template>
    </BarChart>
  </UCard>
</template>
