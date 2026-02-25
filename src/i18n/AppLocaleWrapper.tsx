import React from 'react'
import { useAuth } from '../hooks/useAuth'
import LocaleProvider from './LocaleProvider'

interface Props {
  children: React.ReactNode
}

export default function AppLocaleWrapper({ children }: Props) {
  const { user, profile } = useAuth()
  const preferredLocale = (profile as any)?.preferred_locale ?? null

  return (
    <LocaleProvider userId={user?.id} preferredLocale={preferredLocale}>
      {children}
    </LocaleProvider>
  )
}
