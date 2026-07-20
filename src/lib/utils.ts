import { type ClassValue, clsx } from "clsx"
import type { Locale } from '../i18n/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

function toValidDate(date: string | Date): Date | null {
  const d = date instanceof Date ? date : new Date(date)
  return isNaN(d.getTime()) ? null : d
}

export const formatDate = (date: string | Date, locale = 'en-US'): string => {
  const d = toValidDate(date)
  if (!d) return ''
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatDateTime = (date: string | Date, locale = 'en-US'): string => {
  const d = toValidDate(date)
  if (!d) return ''
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function localeToIntl(locale: Locale | string): string {
  const map: Record<string, string> = {
    en: 'en-US',
    es: 'es-MX',
    it: 'it-IT',
    fr: 'fr-FR',
    de: 'de-DE',
    sv: 'sv-SE',
    fi: 'fi-FI',
    ja: 'ja-JP',
  }
  return map[locale] ?? 'en-US'
}

export function localeToCurrency(locale: Locale | string): string {
  const map: Record<string, string> = {
    en: 'USD',
    es: 'USD',
    it: 'EUR',
    fr: 'EUR',
    de: 'EUR',
    sv: 'SEK',
    fi: 'EUR',
    ja: 'JPY',
  }
  return map[locale] ?? 'USD'
}

export function formatNumber(
  value: number,
  locale = 'en-US',
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

export function formatCurrency(
  amount: number,
  locale = 'en-US',
  currency = 'USD',
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(amount)
}

export function isRTL(locale: Locale | string): boolean {
  return ['ar', 'he', 'fa', 'ur'].includes(locale)
}

export function formatRelativeTime(date: string | Date, locale = 'en-US'): string {
  const d = toValidDate(date)
  if (!d) return ''
  const diffMs = d.getTime() - Date.now()
  const diffSec = Math.round(diffMs / 1000)
  const absSec = Math.abs(diffSec)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (absSec < 60) return rtf.format(Math.round(diffSec), 'second')
  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  const diffHr = Math.round(diffMin / 60)
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, 'hour')
  const diffDay = Math.round(diffHr / 24)
  if (Math.abs(diffDay) < 7) return rtf.format(diffDay, 'day')
  const diffWeek = Math.round(diffDay / 7)
  if (Math.abs(diffWeek) < 5) return rtf.format(diffWeek, 'week')
  const diffMonth = Math.round(diffDay / 30)
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, 'month')
  const diffYear = Math.round(diffDay / 365)
  return rtf.format(diffYear, 'year')
}

export function safeExternalRedirect(url: string): void {
  if (!url.startsWith('https://')) return;
  window.location.assign(url);
}