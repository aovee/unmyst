export const SUPPORTED_LOCALES = ['en-US', 'en-GB', 'fr-FR'] as const
export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0]

export type Locale = (typeof SUPPORTED_LOCALES)[number]
