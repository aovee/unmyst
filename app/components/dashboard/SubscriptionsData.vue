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
  return (s.amount * CYCLES_PER_YEAR[s.cycle]) / s.intervalCount
}

// "Actually billed": real charges that recur on a given cadence — only the
// subscriptions whose cycle IS that cadence contribute.
const billed = computed(() => {
  const forCycle = (cycle: Subscription['cycle']) =>
    props.subscriptions.reduce(
      (acc, s) => {
        if (s.cycle !== cycle) return acc
        return { total: acc.total + s.amount / s.intervalCount, count: acc.count + 1 }
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
        : `no ${cycle} plans`
    }
  })
})

// "Averaged out": every subscription spread evenly, so the periods are directly
// comparable. An estimate for budgeting — not money that lands on any one date.
const averaged = computed(() => {
  const yearly = props.subscriptions.reduce((sum, s) => sum + annualCost(s), 0)
  return [
    { title: 'Per week', value: formatCurrency(yearly / 52) },
    { title: 'Per month', value: formatCurrency(yearly / 12), hero: true },
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
        firstSubName: isOlder ? s.name : acc.firstSubName,
        total: acc.total + cycles * s.amount
      }
    },
    { total: 0, startDate: new Date(), firstSubName: '' }
  )
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
          <div class="text-2xl font-semibold tabular-nums md:text-3xl">
            {{ card.value }}
          </div>
          <div class="text-sm text-muted">
            {{ card.title }}
          </div>
          <div class="mt-2 text-sm text-muted">
            {{ card.caption }}
          </div>
        </UCard>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-scale" class="size-4 text-primary" />
        <h3 class="text-sm font-medium">
          Averaged out
        </h3>
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
            class="font-semibold tabular-nums text-muted"
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
