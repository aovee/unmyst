import {
  differenceInMonths,
  differenceInWeeks,
  differenceInYears
} from 'date-fns'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Subscription } from '@/db/schema'

interface SubscriptionDataCardsProps {
  subscriptions: Array<Subscription>
}

interface SubscriptionDataFooterProps {
  normalizedTotal: number
  label: string
}

function SubscriptionDataFooter({
  normalizedTotal,
  label
}: SubscriptionDataFooterProps) {
  return (
    <>
      <div className="line-clamp-1 flex gap-2 font-medium">
        Equivalent to:{' '}
        <span className="text-primary">{formatCurrency(normalizedTotal)}</span>
      </div>
      <div className="text-muted-foreground">{label}</div>
    </>
  )
}

const CYCLES_PER_YEAR = { weekly: 52, monthly: 12, yearly: 1 } as const

function annualCost(s: Subscription): number {
  return (s.amount * CYCLES_PER_YEAR[s.cycle]) / s.intervalCount
}

export function SubscriptionDataCards({
  subscriptions
}: SubscriptionDataCardsProps) {
  const cycleTotal = (cycle: Subscription['cycle']) =>
    subscriptions.reduce(
      (sum, s) => (s.cycle === cycle ? sum + s.amount / s.intervalCount : sum),
      0
    )
  const weeklyTotal = cycleTotal('weekly')
  const monthlyTotal = cycleTotal('monthly')
  const yearlyTotal = cycleTotal('yearly')

  const perYearTotal = subscriptions.reduce((sum, s) => sum + annualCost(s), 0)
  const perMonthTotal = perYearTotal / 12
  const perWeekTotal = perYearTotal / 52

  const { total, startDate, firstStartedSubName } = subscriptions.reduce(
    (acc, s) => {
      const { amount, anchorDate, cycle, intervalCount } = s
      const now = new Date()

      const isAnchorDateOlder = anchorDate < acc.startDate
      const nextStartDate = isAnchorDateOlder ? anchorDate : acc.startDate
      const nextFirstStartedSubName = isAnchorDateOlder
        ? s.name
        : acc.firstStartedSubName

      let diff = 1
      if (cycle === 'yearly') {
        diff += differenceInYears(now, anchorDate)
      } else if (cycle === 'monthly') {
        diff += differenceInMonths(now, anchorDate)
      } else {
        diff += differenceInWeeks(now, anchorDate)
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

  const cards = [
    {
      title: 'Billed each week',
      value: formatCurrency(weeklyTotal),
      footer: () =>
        SubscriptionDataFooter({
          normalizedTotal: perWeekTotal,
          label: 'Weekly run-rate'
        })
    },
    {
      title: 'Billed each month',
      value: formatCurrency(monthlyTotal),
      footer: () =>
        SubscriptionDataFooter({
          normalizedTotal: perMonthTotal,
          label: 'Monthly run-rate'
        })
    },
    {
      title: 'Billed each year',
      value: formatCurrency(yearlyTotal),
      footer: () =>
        SubscriptionDataFooter({
          normalizedTotal: perYearTotal,
          label: 'Yearly run-rate'
        })
    },
    {
      title: 'Total since start',
      value: formatCurrency(total),
      footer: () => {
        return (
          <>
            <div className="line-clamp-1 flex gap-2 font-medium">
              Started on:{' '}
              <span className="text-primary">{formatDate(startDate)}</span>
            </div>
            <div className="text-muted-foreground">
              with {firstStartedSubName}
            </div>
          </>
        )
      }
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.title} className="@container/card">
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <card.footer />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
