import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const formatDate = (date: string | Date, locale = 'en-US'): string => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatDateTime = (date: string | Date, locale = 'en-US'): string => {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function localeToIntl(locale: string): string {
  const map: Record<string, string> = {
    es: 'es-MX',
    it: 'it-IT',
    fr: 'fr-FR',
    de: 'de-DE',
    sv: 'sv-SE',
    fi: 'fi-FI',
  }
  return map[locale] ?? 'en-US'
}