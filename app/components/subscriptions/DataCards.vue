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

const cards = computed(() => {
  const subs = props.subscriptions

  const cycleTotal = (cycle: Subscription['cycle']) =>
    subs.reduce(
      (sum, s) => (s.cycle === cycle ? sum + s.amount / s.intervalCount : sum),
      0
    )
  const weeklyTotal = cycleTotal('weekly')
  const monthlyTotal = cycleTotal('monthly')
  const yearlyTotal = cycleTotal('yearly')

  const perYearTotal = subs.reduce((sum, s) => sum + annualCost(s), 0)
  const perMonthTotal = perYearTotal / 12
  const perWeekTotal = perYearTotal / 52

  const { total, startDate, firstStartedSubName } = subs.reduce(
    (acc, s) => {
      const { amount, anchorDate, cycle, intervalCount } = s
      const now = new Date()
      const anchor = new Date(anchorDate)

      const isAnchorDateOlder = anchor < acc.startDate
      const nextStartDate = isAnchorDateOlder ? anchor : acc.startDate
      const nextFirstStartedSubName = isAnchorDateOlder
        ? s.name
        : acc.firstStartedSubName

      let diff = 1
      if (cycle === 'yearly') {
        diff += differenceInYears(now, anchor)
      } else if (cycle === 'monthly') {
        diff += differenceInMonths(now, anchor)
      } else {
        diff += differenceInWeeks(now, anchor)
      }

      diff /= intervalCount
      diff = Math.floor(diff)

      return {
        startDate: nextStartDate,
        total: acc.total + diff * amount,
        firstStartedSubName: nextFirstStartedSubName
      }
    },
    { total: 0, startDate: new Date(), firstStartedSubName: '' }
  )

  return [
    {
      title: 'Billed each week',
      value: formatCurrency(weeklyTotal),
      footerLead: 'Equivalent to:',
      footerValue: formatCurrency(perWeekTotal),
      footerLabel: 'Weekly run-rate'
    },
    {
      title: 'Billed each month',
      value: formatCurrency(monthlyTotal),
      footerLead: 'Equivalent to:',
      footerValue: formatCurrency(perMonthTotal),
      footerLabel: 'Monthly run-rate'
    },
    {
      title: 'Billed each year',
      value: formatCurrency(yearlyTotal),
      footerLead: 'Equivalent to:',
      footerValue: formatCurrency(perYearTotal),
      footerLabel: 'Yearly run-rate'
    },
    {
      title: 'Total since start',
      value: formatCurrency(total),
      footerLead: 'Started on:',
      footerValue: formatDate(startDate),
      footerLabel: `with ${firstStartedSubName}`
    }
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
    <UCard
      v-for="card in cards"
      :key="card.title"
      class="@container/card bg-linear-to-t from-primary/5 to-card"
    >
      <div class="text-sm text-muted-foreground">{{ card.title }}</div>
      <div class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {{ card.value }}
      </div>
      <div class="mt-3 flex flex-col items-start gap-1.5 text-sm">
        <div class="line-clamp-1 flex gap-2 font-medium">
          {{ card.footerLead }}
          <span class="text-primary">{{ card.footerValue }}</span>
        </div>
        <div class="text-muted-foreground">{{ card.footerLabel }}</div>
      </div>
    </UCard>
  </div>
</template>
