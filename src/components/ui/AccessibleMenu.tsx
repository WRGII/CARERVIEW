import React, { useState, useRef, useEffect, useId } from 'react'
import { cn } from '../../lib/utils'

interface MenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

interface AccessibleMenuProps {
  triggerLabel: string
  triggerIcon?: React.ReactNode
  triggerClassName?: string
  items: MenuItem[]
  align?: 'left' | 'right'
  disabled?: boolean
}

export const AccessibleMenu: React.FC<AccessibleMenuProps> = ({
  triggerLabel,
  triggerIcon,
  triggerClassName,
  items,
  align = 'right',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    const handleArrowKeys = (e: KeyboardEvent) => {
      const els = Array.from(
        containerRef.current?.querySelectorAll<HTMLButtonElement>(
          '[role="menuitem"]:not([disabled])'
        ) ?? []
      )
      if (els.length === 0) return
      const idx = els.findIndex(el => el === document.activeElement)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        els[(idx + 1) % els.length].focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        els[(idx - 1 + els.length) % els.length].focus()
      } else if (e.key === 'Home') {
        e.preventDefault()
        els[0].focus()
      } else if (e.key === 'End') {
        e.preventDefault()
        els[els.length - 1].focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleArrowKeys)
    requestAnimationFrame(() => {
      containerRef.current
        ?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])')
        ?.focus()
    })

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleArrowKeys)
      previouslyFocused?.focus()
    }
  }, [isOpen])

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-primary disabled:opacity-50 disabled:cursor-not-allowed',
          triggerClassName
        )}
      >
        {triggerIcon && <span className="flex-shrink-0" aria-hidden="true">{triggerIcon}</span>}
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          aria-label={triggerLabel}
          className={cn(
            'absolute mt-1 min-w-[180px] bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick()
                  setIsOpen(false)
                }
              }}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                item.disabled
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-peach-blush/20 focus:bg-peach-blush/20 focus:outline-none'
              )}
            >
              {item.icon && <span className="flex-shrink-0" aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AccessibleMenu
