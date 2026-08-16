import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  startOfDay,
  isBefore,
  differenceInCalendarDays,
  differenceInCalendarMonths
} from 'date-fns'

export type Cycle = 'weekly' | 'monthly' | 'yearly'

export const CYCLES_PER_YEAR: Record<Cycle, number> = {
  weekly: 52,
  monthly: 12,
  yearly: 1
}

export interface PeriodFilter {
  label: string
  value: Cycle | 'all'
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

/**
 * Assumed annual discount when a plan's real yearly price is unknown. Most
 * services shave 15–20% off for paying yearly; 17% is a deliberately middle,
 * conservative guess used only for the *estimated* saving, never shown as fact.
 */
export const ANNUAL_DISCOUNT_ESTIMATE = 0.17

/** How long a monthly plan must have run before an annual switch is worth flagging. */
export const ANNUAL_CANDIDATE_MIN_MONTHS = 12

export interface AnnualCandidate extends Splittable, Trialable {
  cycle: Cycle
  intervalCount: number
  annualPrice?: number | null
  suggestionDismissedAt?: Date | string | null
  suggestionDismissedAmount?: number | null
}

/**
 * Whether a plan is worth flagging as "cheaper billed annually": a plain monthly
 * plan (every month, not "every N months") that has run at least a year, isn't
 * still on trial, and hasn't been dismissed at its current price. A dismissal is
 * honoured only while the price is unchanged — a later price change re-surfaces
 * the suggestion, since the earlier decision was made against a different number.
 */
export function isAnnualPlanCandidate(
  s: AnnualCandidate,
  now: Date = new Date()
): boolean {
  if (s.cycle !== 'monthly' || s.intervalCount !== 1) return false
  if (isInTrial(s, now)) return false

  const monthsRunning = differenceInCalendarMonths(startOfDay(now), startOfDay(new Date(s.anchorDate)))
  if (monthsRunning < ANNUAL_CANDIDATE_MIN_MONTHS) return false

  const dismissed
    = s.suggestionDismissedAt != null && s.suggestionDismissedAmount === s.amount
  return !dismissed
}

/**
 * The user's yearly saving (in the same unit as `amount`, e.g. cents) from
 * switching this plan to annual, computed on their personal post-split share.
 * When a real `annualPrice` is known the figure is exact; otherwise it's an
 * estimate from {@link ANNUAL_DISCOUNT_ESTIMATE}. `isEstimate` lets the UI label
 * it honestly. Does not itself check eligibility — pair with
 * {@link isAnnualPlanCandidate} — but the estimate branch is always positive.
 */
export function annualPlanSaving(
  s: AnnualCandidate
): { saving: number, isEstimate: boolean } {
  const personalYearIfMonthly = personalAmount(s) * 12

  if (s.annualPrice != null) {
    const personalAnnual = personalAmount({ amount: s.annualPrice, shareCount: s.shareCount })
    return { saving: personalYearIfMonthly - personalAnnual, isEstimate: false }
  }

  return {
    saving: Math.round(personalYearIfMonthly * ANNUAL_DISCOUNT_ESTIMATE),
    isEstimate: true
  }
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
