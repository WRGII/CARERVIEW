import { useCallback } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  localeToIntl,
  localeToCurrency,
} from '../lib/utils'

export function useFormat() {
  const { locale } = useLocale()
  const intlLocale = localeToIntl(locale)
  const currency = localeToCurrency(locale)

  const fmtDate = useCallback(
    (date: string | Date) => formatDate(date, intlLocale),
    [intlLocale],
  )

  const fmtDateTime = useCallback(
    (date: string | Date) => formatDateTime(date, intlLocale),
    [intlLocale],
  )

  const fmtRelativeTime = useCallback(
    (date: string | Date) => formatRelativeTime(date, intlLocale),
    [intlLocale],
  )

  const fmtNumber = useCallback(
    (n: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(n, intlLocale, options),
    [intlLocale],
  )

  const fmtCurrency = useCallback(
    (amount: number, options?: Intl.NumberFormatOptions) =>
      formatCurrency(amount, intlLocale, currency, options),
    [intlLocale, currency],
  )

  return {
    formatDate: fmtDate,
    formatDateTime: fmtDateTime,
    formatRelativeTime: fmtRelativeTime,
    formatNumber: fmtNumber,
    formatCurrency: fmtCurrency,
  }
}

export default useFormat
