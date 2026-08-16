import type { H3Event } from 'h3'

/**
 * Post-auth landing path, honouring the visitor's saved locale so a French user
 * lands on `/fr/dashboard`. Falls back to the default (unprefixed) locale.
 */
export function dashboardPath(event: H3Event): string {
  return getCookie(event, 'unmyst-locale') === 'fr' ? '/fr/dashboard' : '/dashboard'
}

/**
 * A validated internal redirect target (must be a root-relative path, not a
 * protocol-relative `//host`), or the locale-aware dashboard when absent/invalid.
 */
export function safeRedirect(event: H3Event, target: string | null | undefined): string {
  if (target && target.startsWith('/') && !target.startsWith('//')) return target
  return dashboardPath(event)
}
