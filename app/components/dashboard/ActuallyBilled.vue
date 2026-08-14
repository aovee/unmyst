<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscriptions: Subscription[] }>()

const { t } = useI18n()

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
    return {
      title: t(`dashboard.actuallyBilled.billedEach.${cycle}`),
      value: formatCurrency(total),
      caption: count
        ? t(`dashboard.actuallyBilled.plans.${cycle}`, count)
        : t(`dashboard.actuallyBilled.noPlans.${cycle}`),
      hero: cycle === 'monthly'
    }
  })
})
</script>

<template>
  <div>
    <DashboardSectionContainer
      icon="i-lucide-receipt"
      :title="$t('dashboard.actuallyBilled.title')"
      :description="$t('dashboard.actuallyBilled.description')"
    >
      <template #content>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <UCard
            v-for="card in billed"
            :key="card.title"
            :class="card.hero ? 'bg-primary/30 dark:bg-primary-900' : 'bg-transparent'"
          >
            <div class="grid grid-cols-2 sm:grid-cols-1 xl:grid-cols-2 gap-4 items-center justify-between">
              <div class="text-2xl font-semibold md:text-3xl text-highlighted">
                {{ card.value }}
              </div>
              <div class="flex flex-col items-end sm:items-start xl:items-end">
                <div class="text-sm text-muted">
                  {{ card.title }}
                </div>
                <div class="text-sm text-primary text-end">
                  {{ card.caption }}
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </template>
    </DashboardSectionContainer>
  </div>
</template>
