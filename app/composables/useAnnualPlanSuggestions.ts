import type { MaybeRefOrGetter } from 'vue'
import type { Subscription } from '~~/server/db/schema'

export interface AnnualPlanSuggestion {
  sub: Subscription
  /** Yearly saving on the user's personal share, in cents. Always > 0. */
  saving: number
  /** True when `saving` is an estimate (no real annual price on file). */
  isEstimate: boolean
}

/**
 * The subscriptions worth nudging toward an annual plan: long-running monthly
 * plans where switching would actually save money. Centralises the eligibility
 * and savings maths (`isAnnualPlanCandidate` / `annualPlanSaving` from
 * `shared/utils/billing`) shared by the dashboard "Savings" section and the
 * per-row badge on the subscriptions table. Sorted biggest-saving-first.
 *
 * @param subscriptions reactive list of subscriptions
 */
export function useAnnualPlanSuggestions(
  subscriptions: MaybeRefOrGetter<Subscription[]>
) {
  const suggestions = computed<AnnualPlanSuggestion[]>(() => {
    const now = new Date()
    return toValue(subscriptions)
      .filter(sub => isAnnualPlanCandidate(sub, now))
      .map((sub) => {
        const { saving, isEstimate } = annualPlanSaving(sub)
        return { sub, saving, isEstimate }
      })
      .filter(s => s.saving > 0)
      .sort((a, b) => b.saving - a.saving)
  })

  /** Number of candidates worth showing. */
  const count = computed(() => suggestions.value.length)
  /** Combined yearly saving across all candidates, in cents. */
  const totalSaving = computed(() =>
    suggestions.value.reduce((sum, s) => sum + s.saving, 0)
  )

  return { suggestions, count, totalSaving }
}
