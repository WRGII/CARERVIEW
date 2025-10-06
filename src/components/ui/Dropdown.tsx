import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'

interface DropdownItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  disabled?: boolean
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick()
      setIsOpen(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, item: DropdownItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleItemClick(item)
    }
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            !disabled && setIsOpen(!isOpen)
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute mt-1 min-w-[160px] bg-white border border-slate-gray/20 rounded-lg shadow-lg z-50 py-1',
            'animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => handleKeyDown(e, item)}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                item.disabled
                  ? 'text-slate-gray/40 cursor-not-allowed'
                  : 'text-slate-gray hover:bg-peach-blush/20 cursor-pointer'
              )}
              role="menuitem"
              tabIndex={item.disabled ? -1 : 0}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
