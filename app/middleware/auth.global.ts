// Global guard for the authenticated area. Every `/dashboard*` route requires a
// session; unauthenticated visitors are bounced to the (localized) login with
// the original path as callbackUrl. Public routes fall through.
//
// Matching is by route *name* rather than path so it's locale-agnostic: with
// `prefix_except_default`, localized routes are named `<base>___<locale>` (e.g.
// `dashboard___en`, `dashboard-subscriptions-id___fr`), all starting with
// `dashboard`, while the path would be `/fr/dashboard` for non-default locales.
export default defineNuxtRouteMiddleware((to) => {
  if (!String(to.name ?? '').startsWith('dashboard')) return

  const { loggedIn } = useUserSession()
  if (loggedIn.value) return

  const localePath = useLocalePath()
  return navigateTo(
    { path: localePath('/login'), query: { callbackUrl: to.fullPath } },
    { replace: true }
  )
})
