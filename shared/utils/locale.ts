export const SUPPORTED_LOCALES = ['en-GB', 'en-US', 'fr-FR'] as const
export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0]

export type Locale = (typeof SUPPORTED_LOCALES)[number]

// i18n uses short codes ('en', 'fr') for translation files; Intl formatting
// wants a full BCP-47 tag. This maps the active language to the tag we format with.
export const LOCALE_BY_LANGUAGE: Record<string, Locale> = {
  en: 'en-GB',
  fr: 'fr-FR'
}

export function toIntlLocale(language: string): Locale {
  return LOCALE_BY_LANGUAGE[language] ?? DEFAULT_LOCALE
}
