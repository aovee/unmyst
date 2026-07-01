'use client'

import { createContext, useContext } from 'react'

import { DEFAULT_LOCALE, type Locale } from '@/lib/locale'

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

export function LocaleProvider({
  locale,
  children
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  )
}

// Read the request-negotiated locale inside client components. Matches the
// value server components get from `getLocale()`, so formatting stays stable
// across hydration.
export function useLocale(): Locale {
  return useContext(LocaleContext)
}
