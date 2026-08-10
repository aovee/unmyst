<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{
  subscriptions: Subscription[]
  limit?: number
}>()

const locale = useLocale()
const currency = computed(() => props.subscriptions[0]?.currency ?? 'EUR')
const max = computed(() => props.limit ?? 6)

interface Row {
  name: string
  amount: number // monthly, cents
}

const rows = computed<Row[]>(() =>
  props.subscriptions
    .map(s => ({
      name: s.name,
      amount: monthlyAmount(s.amount, s.cycle, s.intervalCount)
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, max.value)
)

const categories: Record<string, BulletLegendItemInterface> = {
  amount: { name: 'Per month', color: 'var(--color-unmyst-500)' }
}

const valueFormatter = (v: number) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.value,
    maximumFractionDigits: 0
  }).format(v / 100)

// ~44px per bar so the chart height tracks the number of rows.
const height = computed(() => Math.max(160, rows.value.length * 44))
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-trophy" class="size-4 text-primary" />
        <h3 class="text-sm font-medium">
          Top subscriptions
        </h3>
        <span class="text-sm text-muted">Priciest, normalized per month</span>
      </div>
    </template>

    <BarChart
      v-if="rows.length"
      :data="rows"
      :height="height"
      x-axis="name"
      :y-axis="['amount']"
      :categories="categories"
      :orientation="Orientation.Horizontal"
      :x-formatter="valueFormatter"
      :y-formatter="valueFormatter"
      :radius="4"
      hide-legend
    >
      <template #tooltip="{ values }">
        <div class="rounded-md bg-default px-2.5 py-1.5 text-xs shadow-lg ring ring-default">
          <div class="font-medium">
            {{ values?.name }}
          </div>
          <div class="text-muted tabular-nums">
            {{ values ? formatCurrency(values.amount, currency, locale) : '' }} / month
          </div>
        </div>
      </template>

      <template #fallback>
        <div class="w-full animate-pulse rounded-md bg-elevated" :style="{ height: `${height}px` }" />
      </template>
    </BarChart>

    <div v-else class="py-6 text-center text-sm text-muted">
      No subscriptions yet.
    </div>
  </UCard>
</template>
