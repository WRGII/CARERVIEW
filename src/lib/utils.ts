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
  }
  return map[locale] ?? 'en-US'
}