<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscriptions: Subscription[] }>()

// "Actually billed": real charges that recur on a given cadence — only the
// subscriptions whose cycle IS that cadence contribute.
const billed = computed(() => {
  const forCycle = (cycle: Subscription['cycle']) =>
    props.subscriptions.reduce(
      (acc, s) => {
        if (s.cycle !== cycle) return acc
        // Trials contribute 0 to what's actually billed right now.
        return { total: acc.total + currentAmount(s) / s.intervalCount, count: acc.count + 1 }
      },
      { total: 0, count: 0 }
    )

  return (['weekly', 'monthly', 'yearly'] as const).map((cycle) => {
    const { total, count } = forCycle(cycle)
    const period = cycle.replace('ly', '') // week / month / year
    return {
      title: `Billed each ${period}`,
      value: formatCurrency(total),
      caption: count
        ? `${count} ${cycle} ${count === 1 ? 'plan' : 'plans'}`
        : `No ${cycle} plans`
    }
  })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-receipt" class="size-4 text-primary" />
        <h3 class="text-sm font-medium">
          Actually billed
        </h3>
        <span class="text-sm text-muted">Real charges, grouped by how often they recur</span>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <UCard
          v-for="card in billed"
          :key="card.title"
          class="bg-linear-to-t from-primary/10"
        >
          <div class="text-2xl font-semibold tabular-nums md:text-3xl font-numbers">
            {{ card.value }}
          </div>
          <div class="mt-1 text-sm text-muted">
            {{ card.title }}
          </div>
          <div class="mt-4 text-sm text-muted">
            {{ card.caption }}
          </div>
        </UCard>
      </div>
    </section>
  </div>
</template>
