<script setup lang="ts">
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  eachDayOfInterval,
  isBefore,
  isAfter,
  isSameMonth,
  isSameDay,
  format
} from 'date-fns'
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscriptions: Subscription[] }>()

const locale = useLocale()
const currency = computed(() => props.subscriptions[0]?.currency ?? 'EUR')

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface DayCell {
  date: Date
  inMonth: boolean
  isToday: boolean
  amount: number // cents
  items: { name: string, amount: number }[]
}

const calendar = computed(() => {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // Collect every renewal that falls within the visible month.
  const byDay = new Map<string, { name: string, amount: number }[]>()
  for (const s of props.subscriptions) {
    const base = startOfDay(new Date(s.anchorDate))
    let k = 0
    let d = base
    while (isBefore(d, monthStart)) {
      k += s.intervalCount
      d = addCycles(base, s.cycle, k)
    }
    while (!isAfter(d, monthEnd)) {
      // A renewal that lands inside the free-trial window costs 0 — don't plot it.
      const due = amountDueOn(s, d)
      if (due > 0) {
        const key = format(d, 'yyyy-MM-dd')
        const list = byDay.get(key) ?? []
        list.push({ name: s.service, amount: due })
        byDay.set(key, list)
      }
      k += s.intervalCount
      d = addCycles(base, s.cycle, k)
    }
  }

  const days: DayCell[] = eachDayOfInterval({ start: gridStart, end: gridEnd }).map(
    (date) => {
      const items = byDay.get(format(date, 'yyyy-MM-dd')) ?? []
      return {
        date,
        inMonth: isSameMonth(date, today),
        isToday: isSameDay(date, today),
        amount: items.reduce((sum, i) => sum + i.amount, 0),
        items
      }
    }
  )

  const maxAmount = Math.max(0, ...days.map(d => d.amount))
  const monthTotal = days.reduce((sum, d) => (d.inMonth ? sum + d.amount : sum), 0)

  return { days, maxAmount, monthTotal, label: format(today, 'MMMM yyyy') }
})

// Subtle primary tint scaled by the day's share of the busiest day (capped so
// text stays readable in both themes).
function tint(cell: DayCell): string {
  if (!cell.amount || calendar.value.maxAmount === 0) return 'transparent'
  const ratio = cell.amount / calendar.value.maxAmount
  const pct = Math.round(8 + ratio * 30)
  return `color-mix(in oklab, var(--color-unmyst-500) ${pct}%, transparent)`
}

const compact = (cents: number) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.value,
    maximumFractionDigits: 0
  }).format(cents / 100)
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex flex-col lg:flex-row items-start lg:items-center gap-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calendar-days" class="size-4 text-primary" />
          <h3 class="text-sm font-medium">
            Renewal calendar
          </h3>
          <span class="text-sm text-muted">- {{ calendar.label }}</span>
        </div>
        <div class="text-sm text-muted">
          <span class="font-semibold text-default tabular-nums">
            {{ formatCurrency(calendar.monthTotal, currency, locale) }}
          </span>
          this month
        </div>
      </div>
    </template>

    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="wd in WEEKDAYS"
        :key="wd"
        class="pb-1 text-center text-xs font-medium text-muted"
      >
        {{ wd }}
      </div>

      <UTooltip
        v-for="cell in calendar.days"
        :key="cell.date.toISOString()"
        :disabled="!cell.items.length"
        :delay-duration="0"
        :ui="{
          content: 'h-auto'
        }"
      >
        <div
          class="flex aspect-square flex-col rounded-md p-1.5 ring-inset transition-colors"
          :class="[
            cell.inMonth ? '' : 'opacity-40',
            cell.isToday ? 'ring-1 ring-primary' : '',
            cell.items.length ? 'ring-1 ring-default' : ''
          ]"
          :style="{ backgroundColor: tint(cell) }"
        >
          <span
            class="text-xs tabular-nums"
            :class="cell.items.length ? 'font-medium text-default' : 'text-muted'"
          >
            {{ cell.date.getDate() }}
          </span>
          <span
            v-if="cell.amount"
            class="mt-auto truncate text-[10px] font-medium tabular-nums text-primary"
          >
            {{ compact(cell.amount) }}
          </span>
        </div>

        <template #content>
          <div class="flex flex-col gap-1">
            <div
              v-for="item in cell.items"
              :key="item.name"
              class="flex items-center justify-between gap-2 text-sm"
            >
              <span class="truncate">{{ item.name }}</span>
              <span class="font-semibold tabular-nums">
                {{ formatCurrency(item.amount, currency, locale) }}
              </span>
            </div>
          </div>
        </template>
      </UTooltip>
    </div>
  </UCard>
</template>
