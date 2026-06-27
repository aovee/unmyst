import { describe, it, expect } from 'vitest'
import { computeNextRenewal, addCycles } from './billing'

describe('addCycles', () => {
  it('truncates end-of-month (Jan 31 + 1 month = Feb 28)', () => {
    const start = new Date(2026, 0, 31) // Jan 31
    // + 1 month
    expect(addCycles(start, 'monthly', 1)).toEqual(
      new Date(2026, 1, 28) // Feb 28
    )
  })

  it('adds weeks', () => {
    const start = new Date(2026, 0, 1) // Jan 1
    // + 2 weeks
    expect(addCycles(start, 'weekly', 2)).toEqual(new Date(2026, 0, 15)) // Jan 15
  })
})

describe('computeNextRenewal', () => {
  it('returns the next monthly renewal after today', () => {
    const anchor = new Date(2026, 0, 15) // Jan 15
    const now = new Date(2026, 2, 20) // Mar 20
    expect(computeNextRenewal(anchor, 'monthly', 1, now)).toEqual(
      new Date(2026, 3, 15) // Apr 15
    )
  })

  it('returns today if the renewal is exactly today', () => {
    const anchor = new Date(2026, 0, 15) // Jan 15
    const now = new Date(2026, 2, 15) // Mar 15
    expect(computeNextRenewal(anchor, 'monthly', 1, now)).toEqual(
      new Date(2026, 2, 15) // Mar 15
    )
  })

  it("returns the anchor if it's still in the future", () => {
    const anchor = new Date(2026, 11, 1) // Dec 1
    const now = new Date(2026, 0, 1) // Jan 1
    expect(computeNextRenewal(anchor, 'monthly', 1, now)).toEqual(
      new Date(2026, 11, 1)
    )
  })

  it('does NOT drift: a Jan 31 subscription returns the 31st for 31-day months', () => {
    const anchor = new Date(2026, 0, 31) // Jan 31
    // In February: truncate to 28
    expect(
      computeNextRenewal(anchor, 'monthly', 1, new Date(2026, 1, 15))
    ).toEqual(new Date(2026, 1, 28))
    // In March: returns 31 (not 28)
    expect(
      computeNextRenewal(anchor, 'monthly', 1, new Date(2026, 2, 1))
    ).toEqual(new Date(2026, 2, 31))
  })

  it('handles annual Feb 29 on leap years', () => {
    const anchor = new Date(2024, 1, 29) // Feb 29 2024 (leap year)
    // 2025 non-leap year -> Feb 28
    expect(
      computeNextRenewal(anchor, 'yearly', 1, new Date(2025, 0, 1))
    ).toEqual(new Date(2025, 1, 28))
    // 2028 leap year -> returns 29 again (because we calculate from the anchor)
    expect(
      computeNextRenewal(anchor, 'yearly', 1, new Date(2027, 6, 1))
    ).toEqual(new Date(2028, 1, 29))
  })

  it('handles quarterly interval (intervalCount = 3)', () => {
    const anchor = new Date(2026, 0, 15)
    const now = new Date(2026, 3, 20) // Apr 20
    expect(computeNextRenewal(anchor, 'monthly', 3, now)).toEqual(
      new Date(2026, 6, 15) // Jul 15
    )
  })

  it('rejects an invalid intervalCount', () => {
    expect(() => computeNextRenewal(new Date(), 'monthly', 0)).toThrow()
  })
})
