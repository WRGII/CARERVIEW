import { createContext, useContext } from 'react'
import type { LocaleContextValue } from './types'

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  isLoading: false,
  supportedLocales: [],
})

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext)
}
