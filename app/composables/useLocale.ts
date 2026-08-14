import { toIntlLocale, type Locale } from '#shared/utils/locale'

/**
 * The BCP-47 locale to format numbers, currency and dates with, derived
 * reactively from the active i18n language. Returns a computed ref so that
 * switching language re-formats existing values without a reload.
 */
export function useLocale(): ComputedRef<Locale> {
  const { locale } = useI18n()
  return computed(() => toIntlLocale(locale.value))
}
