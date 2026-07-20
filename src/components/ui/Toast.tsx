import React, { useEffect, useState } from 'react'
import { X, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ToastType = 'success' | 'error'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!toast.duration || paused) return
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss, paused])

  const isError = toast.type === 'error'

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg border min-w-[320px] max-w-md animate-slide-in',
        isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
      )}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
        {isError ? (
          <AlertCircle className="w-5 h-5 text-red-600" />
        ) : (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
      </div>
      <div className="flex-1 pt-0.5">
        <p
          className={cn(
            'text-sm font-medium',
            isError ? 'text-red-800' : 'text-green-800'
          )}
        >
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className={cn(
          'flex-shrink-0 rounded-md p-1 hover:bg-white/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          isError ? 'text-red-600 focus-visible:ring-red-400' : 'text-green-600 focus-visible:ring-green-400'
        )}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
