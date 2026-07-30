import { DEFAULT_LOCALE, type Locale } from '#shared/utils/locale'

// The app currently serves a single default locale (mirrors the old
// LocaleProvider, which always supplied DEFAULT_LOCALE). Kept as a composable so
// request-negotiated locales can be wired in later without touching call sites.
export function useLocale(): Locale {
  return DEFAULT_LOCALE
}
