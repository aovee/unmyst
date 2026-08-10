<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscriptions: Subscription[] }>()

const locale = useLocale()
const currency = computed(() => props.subscriptions[0]?.currency ?? 'EUR')

// Monthly-normalized spend grouped by category, high → low.
const slices = computed(() => {
  const map = new Map<string, number>()
  for (const s of props.subscriptions) {
    const key = s.category?.trim() || 'Uncategorized'
    map.set(
      key,
      (map.get(key) ?? 0) + monthlyAmount(s.amount, s.cycle, s.intervalCount)
    )
  }

  const entries = [...map.entries()].sort((a, b) => b[1] - a[1])
  const total = entries.reduce((sum, [, v]) => sum + v, 0)

  return entries.map(([label, monthly], i) => ({
    label,
    monthly,
    share: total > 0 ? monthly / total : 0,
    color: CHART_COLORS[i % CHART_COLORS.length]!
  }))
})

const totalMonthly = computed(() =>
  slices.value.reduce((sum, s) => sum + s.monthly, 0)
)

const chartData = computed(() => slices.value.map(s => s.monthly))
const chartCategories = computed<Record<string, BulletLegendItemInterface>>(() =>
  Object.fromEntries(
    slices.value.map(s => [s.label, { name: s.label, color: s.color }])
  )
)
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-chart-pie" class="size-4 text-primary" />
        <h3 class="text-sm font-medium">
          Where it goes
        </h3>
        <span class="text-sm text-muted">Monthly spend by category</span>
      </div>
    </template>

    <div v-if="slices.length" class="flex flex-col items-center gap-6 sm:flex-row">
      <DonutChart
        :data="chartData"
        :categories="chartCategories"
        :height="200"
        :radius="90"
        :arc-width="18"
        hide-legend
      >
        <template #default>
          <div class="text-center">
            <div class="text-xs text-muted">
              per month
            </div>
            <div class="text-lg font-semibold tabular-nums">
              {{ formatCurrency(totalMonthly, currency, locale) }}
            </div>
          </div>
        </template>

        <template #fallback>
          <div class="size-[200px] animate-pulse rounded-full bg-elevated" />
        </template>
      </DonutChart>

      <div class="flex w-full flex-1 flex-col gap-2.5">
        <div
          v-for="s in slices"
          :key="s.label"
          class="flex items-center gap-3 text-sm"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: s.color }"
          />
          <span class="truncate">{{ s.label }}</span>
          <span class="ml-auto tabular-nums text-muted">
            {{ Math.round(s.share * 100) }}%
          </span>
          <span class="w-20 text-right font-medium tabular-nums">
            {{ formatCurrency(s.monthly, currency, locale) }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="py-6 text-center text-sm text-muted">
      Add a subscription to see the breakdown.
    </div>
  </UCard>
</template>
