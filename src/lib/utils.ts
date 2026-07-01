import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { DEFAULT_LOCALE } from '@/lib/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatCurrency(
  amountInCents: number,
  currency: string = 'EUR',
  locale: string = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amountInCents / 100)
}

export function formatDate(date: Date, locale: string = DEFAULT_LOCALE): string {
  return Intl.DateTimeFormat(locale).format(date)
}
