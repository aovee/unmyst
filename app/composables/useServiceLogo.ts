/**
 * Resolves a service logo URL from a subscription's name via Logo.dev's
 * name-lookup API: https://img.logo.dev/name/<brand>?token=…
 *
 * Docs: https://www.logo.dev/docs/logo-images/name
 *
 * Name lookup (rather than domain lookup) means every subscription gets a logo
 * from its always-present `name`, no `url` required. We pass `fallback=404` so a
 * miss returns 404 instead of a generic monogram — that lets the caller's
 * <UAvatar> fall back to the service initials.
 */
export function useServiceLogo() {
  const token = useRuntimeConfig().public.logoDevToken

  function logoUrl(name: string | null | undefined, size = 64): string | null {
    const trimmed = name?.trim()
    if (!trimmed || !token) return null

    const params = new URLSearchParams({
      token,
      size: String(size),
      format: 'webp',
      retina: 'true',
      fallback: '404'
    })
    return `https://img.logo.dev/name/${encodeURIComponent(trimmed)}?${params.toString()}`
  }

  return { logoUrl }
}
