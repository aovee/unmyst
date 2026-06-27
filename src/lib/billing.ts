import { addMonths, addWeeks, addYears, startOfDay, isBefore } from 'date-fns'

export type Cycle = 'weekly' | 'monthly' | 'yearly'

export function addCycles(anchor: Date, cycle: Cycle, count: number): Date {
  switch (cycle) {
    case 'weekly':
      return addWeeks(anchor, count)
    case 'monthly':
      return addMonths(anchor, count)
    case 'yearly':
      return addYears(anchor, count)
  }
}

export function computeNextRenewal(
  anchor: Date,
  cycle: Cycle,
  intervalCount: number,
  now: Date = new Date()
): Date {
  if (intervalCount < 1) {
    throw new Error('intervalCount doit être >= 1')
  }

  const today = startOfDay(now)
  const base = startOfDay(anchor)

  let k = 0
  let candidate = base

  while (isBefore(candidate, today)) {
    k += intervalCount
    candidate = addCycles(base, cycle, k) // always computed from 'base'
  }

  return candidate
}
