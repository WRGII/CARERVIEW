export type Locale = 'en' | 'es' | 'it' | 'fr' | 'de' | 'sv' | 'fi' | 'ja'

export interface SupportedLocale {
  code: Locale
  label: string
  is_default: boolean
  sort_order: number
}

export interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  isLoading: boolean
  supportedLocales: SupportedLocale[]
}
