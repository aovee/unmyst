<script setup lang="ts">
import {
  differenceInMonths,
  differenceInWeeks,
  differenceInYears
} from 'date-fns'
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscriptions: Subscription[] }>()

const { t } = useI18n()

function annualCost(s: Subscription): number {
  return (personalAmount(s) * CYCLES_PER_YEAR[s.cycle]) / s.intervalCount
}

// "Averaged out": every subscription spread evenly, so the periods are directly
// comparable. An estimate for budgeting — not money that lands on any one date.
const averaged = computed(() => {
  const yearly = props.subscriptions.reduce((sum, s) => sum + annualCost(s), 0)
  return [
    { title: t('dashboard.averaged.perWeek'), value: formatCurrency(yearly / 52) },
    { title: t('dashboard.averaged.perMonth'), value: formatCurrency(yearly / 12), hero: false },
    { title: t('dashboard.averaged.perYear'), value: formatCurrency(yearly) }
  ]
})

const sinceStart = computed(() => {
  return props.subscriptions.reduce(
    (acc, s) => {
      const now = new Date()
      const anchor = new Date(s.anchorDate)
      const isOlder = anchor < acc.startDate

      let cycles = 1
      if (s.cycle === 'yearly') {
        cycles += differenceInYears(now, anchor)
      } else if (s.cycle === 'monthly') {
        cycles += differenceInMonths(now, anchor)
      } else {
        cycles += differenceInWeeks(now, anchor)
      }
      cycles = Math.floor(cycles / s.intervalCount)

      return {
        startDate: isOlder ? anchor : acc.startDate,
        firstSubName: isOlder ? s.service : acc.firstSubName,
        // Still in a free trial → nothing paid yet, so it adds 0 to the total.
        total: acc.total + cycles * currentAmount(s)
      }
    },
    { total: 0, startDate: new Date(), firstSubName: '' }
  )
})
</script>

<template>
  <div>
    <DashboardSectionContainer
      icon="i-lucide-scale"
      :title="$t('dashboard.averaged.title')"
      :description="$t('dashboard.averaged.description')"
    >
      <template #content>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <UCard
            v-for="card in averaged"
            :key="card.title"
            :class="[
              'border border-dashed border-default bg-transparent',
              card.hero ? 'border-primary/40' : ''
            ]"
          >
            <div
              class="font-semibold text-highlighted"
              :class="card.hero ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'"
            >
              <span class="text-muted text-xl">≈</span> {{ card.value }}
            </div>
            <div class="text-sm text-muted">
              {{ card.title }}
              <span class="text-dimmed">· {{ $t('dashboard.averaged.estimate') }}</span>
            </div>
          </UCard>
        </div>
      </template>

      <template #trailing>
        <!-- All-time actual spend, as a quiet footnote -->
        <i18n-t
          v-if="sinceStart.firstSubName"
          keypath="dashboard.averaged.sinceStart"
          tag="p"
          class="text-sm text-muted"
        >
          <template #total>
            <span class="font-medium text-default">{{ formatCurrency(sinceStart.total) }}</span>
          </template>
          <template #date>
            {{ formatDate(sinceStart.startDate) }}
          </template>
          <template #service>
            {{ sinceStart.firstSubName }}
          </template>
        </i18n-t>
      </template>
    </DashboardSectionContainer>
  </div>
</template>
