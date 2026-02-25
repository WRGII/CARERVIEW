import React, { useRef, useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import type { Locale } from '../../i18n/types'

interface Props {
  className?: string
}

export default function LanguageSwitcher({ className = '' }: Props) {
  const { locale, setLocale, t, supportedLocales } = useLocale()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const currentLabel = supportedLocales.find((l) => l.code === locale)?.label ?? locale.toUpperCase()

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('lang.switch_aria')}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1"
      >
        <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>{currentLabel}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('lang.current')}
          className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden"
        >
          {supportedLocales.map((loc) => (
            <button
              key={loc.code}
              role="option"
              aria-selected={locale === loc.code}
              type="button"
              onClick={() => {
                setLocale(loc.code as Locale)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-100 ${
                locale === loc.code
                  ? 'bg-cyan-50 text-cyan-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
