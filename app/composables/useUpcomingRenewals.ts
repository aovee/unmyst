import { differenceInCalendarDays } from 'date-fns'
import type { MaybeRefOrGetter } from 'vue'
import type { Subscription } from '~~/server/db/schema'

export interface UpcomingRenewal {
  sub: Subscription
  /** The date of the next charge. */
  date: Date
  /** Whole calendar days from today until `date` (0 = today). */
  inDays: number
  /** Per-person amount charged on `date`, in cents. */
  amount: number
  /** True when this event is a trial ending (i.e. the first paid charge). */
  isTrialEnd: boolean
}

/**
 * The details of every upcoming charge, optionally constrained to a window of
 * the next `windowDays` days. Centralises the renewal maths shared by the
 * dashboard's "Upcoming renewals" card and the subscriptions summary bar.
 *
 * For a sub on trial the next event is the trial ending (its first paid
 * charge); otherwise it's the next renewal. Past events are dropped and the
 * list is sorted soonest-first.
 *
 * @param subscriptions reactive list of subscriptions
 * @param options.windowDays inclusive horizon in days; omit for no limit
 */
export function useUpcomingRenewals(
  subscriptions: MaybeRefOrGetter<Subscription[]>,
  options: { windowDays?: MaybeRefOrGetter<number | undefined> } = {}
) {
  // Next real charge for every sub, soonest-first, past events removed.
  const all = computed<UpcomingRenewal[]>(() => {
    const today = new Date()
    return toValue(subscriptions)
      .map((sub) => {
        const trialEnd = isInTrial(sub) ? trialEndDate(sub)! : null
        const date
          = trialEnd
            ?? computeNextRenewal(new Date(sub.anchorDate), sub.cycle, sub.intervalCount, today)
        return {
          sub,
          date,
          inDays: differenceInCalendarDays(date, today),
          amount: personalAmount(sub),
          isTrialEnd: trialEnd !== null
        }
      })
      .filter(r => r.inDays >= 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  })

  // Constrained to the window when one is provided.
  const renewals = computed<UpcomingRenewal[]>(() => {
    const window = toValue(options.windowDays)
    if (window == null) return all.value
    return all.value.filter(r => r.inDays <= window)
  })

  /** The very next charge across all subs, ignoring any window. */
  const nextCharge = computed<UpcomingRenewal | null>(() => all.value[0] ?? null)
  /** Sum of the windowed renewals' amounts, in cents. */
  const total = computed(() => renewals.value.reduce((sum, r) => sum + r.amount, 0))
  /** Number of charges within the window. */
  const count = computed(() => renewals.value.length)

  return { all, renewals, nextCharge, total, count }
}
