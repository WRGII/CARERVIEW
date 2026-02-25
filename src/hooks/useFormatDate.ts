// src/hooks/useFormatDate.ts
import { useCallback } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { formatDate, formatDateTime, localeToIntl } from '../lib/utils'

export function useFormatDate() {
  const { locale } = useLocale()
  const intlLocale = localeToIntl(locale)

  const fmtDate = useCallback(
    (date: string | Date) => formatDate(date, intlLocale),
    [intlLocale]
  )

  const fmtDateTime = useCallback(
    (date: string | Date) => formatDateTime(date, intlLocale),
    [intlLocale]
  )

  return { formatDate: fmtDate, formatDateTime: fmtDateTime }
}
