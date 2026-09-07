/**
 * Pause / resume / cancel actions for a subscription, with success/error toasts.
 * Shared by the subscriptions table and the detail page so the wiring lives in
 * one place. Each call resolves to `true` on success, `false` on failure, so the
 * caller can close its dialog and refresh only when it worked.
 */
export function useSubscriptionLifecycle() {
  const toast = useToast()
  const { t } = useI18n()

  async function pause(id: string, resumeAt: string | null): Promise<boolean> {
    try {
      await $fetch(`/api/subscriptions/${id}/pause`, {
        method: 'POST',
        body: { resumeAt }
      })
      toast.add({ title: t('subscription.pause.success'), color: 'success' })
      return true
    } catch {
      toast.add({ title: t('subscription.pause.error'), color: 'error' })
      return false
    }
  }

  async function resume(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/subscriptions/${id}/resume`, { method: 'POST' })
      toast.add({ title: t('subscription.resume.success'), color: 'success' })
      return true
    } catch {
      toast.add({ title: t('subscription.resume.error'), color: 'error' })
      return false
    }
  }

  async function cancel(id: string, canceledAt: string | null): Promise<boolean> {
    try {
      await $fetch(`/api/subscriptions/${id}/cancel`, {
        method: 'POST',
        body: { canceledAt }
      })
      toast.add({ title: t('subscription.cancel.success'), color: 'success' })
      return true
    } catch {
      toast.add({ title: t('subscription.cancel.error'), color: 'error' })
      return false
    }
  }

  async function reactivate(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/subscriptions/${id}/reactivate`, { method: 'POST' })
      toast.add({ title: t('subscription.reactivate.success'), color: 'success' })
      return true
    } catch {
      toast.add({ title: t('subscription.reactivate.error'), color: 'error' })
      return false
    }
  }

  return { pause, resume, cancel, reactivate }
}
