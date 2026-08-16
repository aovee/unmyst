// Global guard for the authenticated area. Everything under `/dashboard` requires
// a session; unauthenticated visitors are bounced to /login with the original
// path as callbackUrl. Public routes (marketing home, auth pages) fall through.
export default defineNuxtRouteMiddleware((to) => {
  const inDashboard = to.path === '/dashboard' || to.path.startsWith('/dashboard/')
  if (!inDashboard) return

  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo(
      `/login?callbackUrl=${encodeURIComponent(to.fullPath)}`,
      { replace: true }
    )
  }
})
