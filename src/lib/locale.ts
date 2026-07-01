export const SUPPORTED_LOCALES = ['fr-FR', 'en-US', 'en-GB'] as const
export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0]

export type Locale = (typeof SUPPORTED_LOCALES)[number]
