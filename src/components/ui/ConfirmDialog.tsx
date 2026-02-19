import React, { useEffect, useRef } from 'react'
import { TriangleAlert as AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../lib/utils'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  variant?: 'danger' | 'warning'
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger'
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus()

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) {
          onCancel()
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = dialogRef.current?.querySelectorAll(
            'button:not([disabled])'
          )
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, onCancel, isLoading])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
      >
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-gray/60 hover:text-slate-gray transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
              variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
            )}
          >
            <AlertTriangle
              className={cn(
                'w-6 h-6',
                variant === 'danger' ? 'text-red-600' : 'text-yellow-600'
              )}
            />
          </div>
          <div className="flex-1 pt-1">
            <h2
              id="dialog-title"
              className="text-lg font-semibold text-slate-700 mb-2"
            >
              {title}
            </h2>
            <p
              id="dialog-description"
              className="text-sm text-slate-gray"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            ref={cancelButtonRef}
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
