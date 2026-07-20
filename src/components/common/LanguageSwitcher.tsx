import React, { useRef, useState, useEffect } from 'react'
import { Loader as Loader2, Globe } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import type { Locale } from '../../i18n/types'

interface Props {
  className?: string
}

export default function LanguageSwitcher({ className = '' }: Props) {
  const { locale, setLocale, t, supportedLocales, isLoading } = useLocale()
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading) {
      setSwitching(false)
    }
  }, [isLoading])

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
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      const items = Array.from(
        containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]:not([disabled])') ?? []
      )
      if (items.length === 0) return
      const currentIndex = items.findIndex(el => el === document.activeElement)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        items[(currentIndex + 1) % items.length].focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        items[(currentIndex - 1 + items.length) % items.length].focus()
      } else if (e.key === 'Home') {
        e.preventDefault()
        items[0].focus()
      } else if (e.key === 'End') {
        e.preventDefault()
        items[items.length - 1].focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    requestAnimationFrame(() => {
      const current = containerRef.current?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]')
      current?.focus()
    })
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const currentLabel = supportedLocales.find((l) => l.code === locale)?.label ?? locale.toUpperCase()

  function handleSelect(code: Locale) {
    if (code === locale) {
      setOpen(false)
      return
    }
    setSwitching(true)
    setOpen(false)
    Promise.resolve(setLocale(code)).catch(() => {
      setSwitching(false)
    })
  }

  const showSpinner = switching && isLoading

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('lang.switch_aria')}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={showSpinner}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-wait"
      >
        {showSpinner ? (
          <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        )}
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
              onClick={() => handleSelect(loc.code as Locale)}
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
