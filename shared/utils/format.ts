import { DEFAULT_LOCALE } from './locale'

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
  return Intl.DateTimeFormat(locale).format(new Date(date))
}

export function formatRelativeDate(
  date: Date,
  locale: string = DEFAULT_LOCALE,
  now: Date = new Date()
): string {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const msPerDay = 86_400_000
  const days = Math.round(
    (startOfDay(new Date(date)).getTime() - startOfDay(now).getTime()) / msPerDay
  )

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (Math.abs(days) < 7) return rtf.format(days, 'day')
  if (Math.abs(days) < 56) return rtf.format(Math.round(days / 7), 'week')
  return rtf.format(Math.round(days / 30), 'month')
}
