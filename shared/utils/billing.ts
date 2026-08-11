import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  startOfDay,
  isBefore,
  differenceInCalendarDays
} from 'date-fns'

export type Cycle = 'weekly' | 'monthly' | 'yearly'

export const CYCLES_PER_YEAR: Record<Cycle, number> = {
  weekly: 52,
  monthly: 12,
  yearly: 1
}

export interface Splittable {
  amount: number
  shareCount?: number | null
}

/**
 * The portion of `amount` this user actually pays, once the cost is split
 * equally between `shareCount` people. `shareCount` of 1 (or unset) means the
 * subscription is not shared and the full amount is returned.
 */
export function personalAmount(s: Splittable): number {
  const shares = s.shareCount && s.shareCount > 0 ? s.shareCount : 1
  return Math.round(s.amount / shares)
}

/** Whether the subscription cost is split between more than one person. */
export function isShared(s: Splittable): boolean {
  return (s.shareCount ?? 1) > 1
}

export interface Trialable {
  anchorDate: Date | string
  trialDurationDays?: number | null
}

/**
 * Derived trial end date (`anchorDate + trialDurationDays`), or null when the
 * subscription has no trial. Never stored, so it can't drift when the anchor is
 * edited.
 */
export function trialEndDate(s: Trialable): Date | null {
  if (!s.trialDurationDays || s.trialDurationDays <= 0) return null
  return addDays(startOfDay(new Date(s.anchorDate)), s.trialDurationDays)
}

/** Whether the subscription is currently within its free trial. */
export function isInTrial(s: Trialable, now: Date = new Date()): boolean {
  const end = trialEndDate(s)
  return end !== null && isBefore(startOfDay(now), end)
}

/** Whole days left in the trial (0 on the last day), or null when not on trial. */
export function trialDaysLeft(s: Trialable, now: Date = new Date()): number | null {
  const end = trialEndDate(s)
  if (end === null) return null
  return Math.max(0, differenceInCalendarDays(end, startOfDay(now)))
}

/**
 * What the subscription contributes to *current* spend right now: nothing while
 * a free trial is running, its per-person amount otherwise. Run-rate/projection
 * figures deliberately use `personalAmount` instead, so a trial still shows up in
 * the forward-looking numbers and the projection doesn't jump on conversion.
 */
export function currentAmount(
  s: Splittable & Trialable,
  now: Date = new Date()
): number {
  return isInTrial(s, now) ? 0 : personalAmount(s)
}

/**
 * What is actually charged on a specific date: 0 when that date falls inside the
 * trial window, the per-person amount once the trial has ended.
 */
export function amountDueOn(s: Splittable & Trialable, date: Date): number {
  const end = trialEndDate(s)
  if (end !== null && isBefore(startOfDay(date), end)) return 0
  return personalAmount(s)
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
