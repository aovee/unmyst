import type { Subscription } from '~~/server/db/schema'

/**
 * Single source of truth for the current user's subscriptions.
 *
 * Every caller (dashboard, subscriptions page, dialogs) hits this instead of
 * writing its own `useFetch`. Sharing the `'subscriptions'` key means Nuxt
 * dedupes the request and backs every caller with the same cached data, so a
 * `refresh()` from anywhere (e.g. after adding or deleting a sub) updates all
 * consumers at once. SSR-safe: state lives in Nuxt's per-request payload, not
 * in a module-level singleton.
 *
 * Awaited internally so it stays blocking for SSR while returning a plain,
 * friendlier object (`subscriptions` rather than `data`).
 */
export async function useSubscriptions() {
  const { data: subscriptions, refresh, status, error } = await useFetch<Subscription[]>(
    '/api/subscriptions',
    {
      key: 'subscriptions',
      default: () => []
    }
  )

  return { subscriptions, refresh, status, error }
}
