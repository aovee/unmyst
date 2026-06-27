import { describe, it, expect } from 'vitest'
import { computeNextRenewal, addCycles } from './billing'

describe('addCycles', () => {
  it('rabote la fin de mois (31 jan + 1 mois = 28 fév)', () => {
    expect(addCycles(new Date(2026, 0, 31), 'monthly', 1)).toEqual(
      new Date(2026, 1, 28)
    )
  })

  it('ajoute des semaines', () => {
    expect(addCycles(new Date(2026, 0, 1), 'weekly', 2)).toEqual(
      new Date(2026, 0, 15)
    )
  })
})

describe('computeNextRenewal', () => {
  it("renvoie la prochaine échéance mensuelle après aujourd'hui", () => {
    const anchor = new Date(2026, 0, 15) // 15 jan
    const now = new Date(2026, 2, 20) // 20 mars
    expect(computeNextRenewal(anchor, 'monthly', 1, now)).toEqual(
      new Date(2026, 3, 15) // 15 avril
    )
  })

  it("renvoie aujourd'hui si l'échéance tombe pile aujourd'hui", () => {
    const anchor = new Date(2026, 0, 15)
    const now = new Date(2026, 2, 15) // 15 mars pile
    expect(computeNextRenewal(anchor, 'monthly', 1, now)).toEqual(
      new Date(2026, 2, 15)
    )
  })

  it("renvoie l'ancre si elle est encore dans le futur", () => {
    const anchor = new Date(2026, 11, 1) // 1er déc
    const now = new Date(2026, 0, 1) // 1er jan
    expect(computeNextRenewal(anchor, 'monthly', 1, now)).toEqual(
      new Date(2026, 11, 1)
    )
  })

  it('ne dérive PAS : un abo du 31 redonne le 31 les mois à 31 jours', () => {
    const anchor = new Date(2026, 0, 31) // 31 jan
    // En février : rabote au 28
    expect(
      computeNextRenewal(anchor, 'monthly', 1, new Date(2026, 1, 15))
    ).toEqual(new Date(2026, 1, 28))
    // En mars : redonne bien le 31 (pas le 28)
    expect(
      computeNextRenewal(anchor, 'monthly', 1, new Date(2026, 2, 1))
    ).toEqual(new Date(2026, 2, 31))
  })

  it('gère le 29 février annuel sur les bissextiles', () => {
    const anchor = new Date(2024, 1, 29) // 29 fév 2024 (bissextile)
    // 2025 non bissextile -> 28 fév
    expect(
      computeNextRenewal(anchor, 'yearly', 1, new Date(2025, 0, 1))
    ).toEqual(new Date(2025, 1, 28))
    // 2028 bissextile -> on retrouve le 29 (parce qu'on calcule depuis l'ancre)
    expect(
      computeNextRenewal(anchor, 'yearly', 1, new Date(2027, 6, 1))
    ).toEqual(new Date(2028, 1, 29))
  })

  it('gère le trimestriel (intervalCount = 3)', () => {
    const anchor = new Date(2026, 0, 15)
    const now = new Date(2026, 3, 20) // 20 avril
    expect(computeNextRenewal(anchor, 'monthly', 3, now)).toEqual(
      new Date(2026, 6, 15) // 15 juillet
    )
  })

  it('rejette un intervalCount invalide', () => {
    expect(() => computeNextRenewal(new Date(), 'monthly', 0)).toThrow()
  })
})
