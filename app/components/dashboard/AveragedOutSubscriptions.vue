<script setup lang="ts">
import {
  differenceInMonths,
  differenceInWeeks,
  differenceInYears
} from 'date-fns'
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscriptions: Subscription[] }>()

const CYCLES_PER_YEAR = { weekly: 52, monthly: 12, yearly: 1 } as const

function annualCost(s: Subscription): number {
  return (personalAmount(s) * CYCLES_PER_YEAR[s.cycle]) / s.intervalCount
}

// "Averaged out": every subscription spread evenly, so the periods are directly
// comparable. An estimate for budgeting — not money that lands on any one date.
const averaged = computed(() => {
  const yearly = props.subscriptions.reduce((sum, s) => sum + annualCost(s), 0)
  return [
    { title: 'Per week', value: formatCurrency(yearly / 52) },
    { title: 'Per month', value: formatCurrency(yearly / 12), hero: false },
    { title: 'Per year', value: formatCurrency(yearly) }
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
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-3">
      <div class="flex flex-col lg:flex-row items-start lg:items-center gap-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-scale" class="size-4 text-primary" />
          <h3 class="text-sm font-medium">
            Averaged out
          </h3>
        </div>
        <span class="text-sm text-muted">Everything spread evenly — an estimate for budgeting</span>
      </div>

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
            class="font-semibold tabular-nums text-muted font-numbers"
            :class="card.hero ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'"
          >
            ≈ {{ card.value }}
          </div>
          <div class="text-sm text-muted">
            {{ card.title }}
            <span class="text-dimmed">· estimate</span>
          </div>
        </UCard>
      </div>
    </section>

    <!-- All-time actual spend, as a quiet footnote -->
    <p v-if="sinceStart.firstSubName" class="text-sm text-muted">
      You've paid
      <span class="font-medium text-default">{{ formatCurrency(sinceStart.total) }}</span>
      in total since {{ formatDate(sinceStart.startDate) }}, starting with
      {{ sinceStart.firstSubName }}.
    </p>
  </div>
</template>
