// Route guard for authenticated pages. Redirects to /login (carrying the
// original path as callbackUrl) when there is no session — replaces the
// per-page `await auth()` + `redirect('/login')` from the old server components.
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo(
      `/login?callbackUrl=${encodeURIComponent(to.fullPath)}`,
      { replace: true }
    )
  }
})
