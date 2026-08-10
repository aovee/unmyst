import { addMonths, addWeeks, addYears, startOfDay, isBefore } from 'date-fns'

export type Cycle = 'weekly' | 'monthly' | 'yearly'

export const CYCLES_PER_YEAR: Record<Cycle, number> = {
  weekly: 52,
  monthly: 12,
  yearly: 1
}

/** Yearly-normalized amount (same unit as `amount`, e.g. cents). */
export function annualAmount(
  amount: number,
  cycle: Cycle,
  intervalCount: number
): number {
  return (amount * CYCLES_PER_YEAR[cycle]) / intervalCount
}

/** Monthly-normalized amount (same unit as `amount`, e.g. cents). */
export function monthlyAmount(
  amount: number,
  cycle: Cycle,
  intervalCount: number
): number {
  return annualAmount(amount, cycle, intervalCount) / 12
}

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
