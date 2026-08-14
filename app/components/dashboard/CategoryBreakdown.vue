<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscriptions: Subscription[] }>()

const locale = useLocale()
const { t } = useI18n()
const currency = computed(() => props.subscriptions[0]?.currency ?? 'EUR')

// Sentinel used as the map key for subscriptions without a category; the
// display label is translated at render time.
const UNCATEGORIZED = 'uncategorized'

// Monthly-normalized spend per category (personal share, levelled to a month).
const slices = computed(() => {
  const totals = new Map<string, number>()
  for (const s of props.subscriptions) {
    const key = s.category?.trim() || UNCATEGORIZED
    const amount = monthlyAmount(personalAmount(s), s.cycle, s.intervalCount)
    totals.set(key, (totals.get(key) ?? 0) + amount)
  }

  const total = [...totals.values()].reduce((sum, v) => sum + v, 0)
  if (total <= 0) return []

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], i) => ({
      key: name,
      name: name === UNCATEGORIZED ? t('dashboard.categoryBreakdown.uncategorized') : name,
      isUncategorized: name === UNCATEGORIZED,
      amount,
      share: amount / total,
      // Cycle the palette if categories outnumber the colors.
      color: CHART_COLORS[i % CHART_COLORS.length]!
    }))
})

const total = computed(() => slices.value.reduce((sum, s) => sum + s.amount, 0))

// Donut geometry: build each arc from the running offset around the circle.
const RADIUS = 60
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const arcs = computed(() => {
  let offset = 0
  return slices.value.map((slice) => {
    const length = slice.share * CIRCUMFERENCE
    const arc = {
      ...slice,
      length,
      // Gap after the drawn length keeps segments visually separated.
      dashArray: `${Math.max(0, length - 2)} ${CIRCUMFERENCE - Math.max(0, length - 2)}`,
      dashOffset: -offset
    }
    offset += length
    return arc
  })
})
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <DashboardSectionHeader
        icon="i-lucide-chart-pie"
        :title="$t('dashboard.categoryBreakdown.title')"
        :description="$t('dashboard.categoryBreakdown.description')"
      />
    </template>

    <div v-if="arcs.length" class="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      <div class="relative shrink-0">
        <svg
          :viewBox="`0 0 ${RADIUS * 2 + 20} ${RADIUS * 2 + 20}`"
          class="size-40 -rotate-90"
        >
          <circle
            v-for="arc in arcs"
            :key="arc.key"
            :cx="RADIUS + 10"
            :cy="RADIUS + 10"
            :r="RADIUS"
            fill="none"
            :stroke="arc.color"
            stroke-width="16"
            :stroke-dasharray="arc.dashArray"
            :stroke-dashoffset="arc.dashOffset"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-lg font-semibold tabular-nums text-highlighted">
            {{ formatCurrency(total, currency, locale) }}
          </span>
          <span class="text-xs text-muted">{{ $t('dashboard.categoryBreakdown.perMonth') }}</span>
        </div>
      </div>

      <ul class="flex min-w-0 flex-1 flex-col gap-2.5">
        <li
          v-for="slice in slices"
          :key="slice.key"
          class="flex items-center gap-2.5 text-sm"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: slice.color }"
          />
          <span class="truncate" :class="slice.isUncategorized ? 'text-muted' : ''">
            {{ slice.name }}
          </span>
          <span class="ml-auto shrink-0 tabular-nums font-medium">
            {{ formatCurrency(slice.amount, currency, locale) }}
          </span>
          <span class="w-10 shrink-0 text-right tabular-nums text-xs text-muted">
            {{ Math.round(slice.share * 100) }}%
          </span>
        </li>
      </ul>
    </div>

    <div v-else class="py-6 text-center text-sm text-muted">
      {{ $t('dashboard.categoryBreakdown.empty') }}
    </div>
  </UCard>
</template>
