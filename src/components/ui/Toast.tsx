import React, { useEffect } from 'react'
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
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onDismiss(toast.id)
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg border min-w-[320px] max-w-md animate-slide-in',
        toast.type === 'success' && 'bg-green-50 border-green-200',
        toast.type === 'error' && 'bg-red-50 border-red-200'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">
        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
      </div>
      <div className="flex-1 pt-0.5">
        <p
          className={cn(
            'text-sm font-medium',
            toast.type === 'success' && 'text-green-800',
            toast.type === 'error' && 'text-red-800'
          )}
        >
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className={cn(
          'flex-shrink-0 rounded-md p-1 hover:bg-white/50 transition-colors',
          toast.type === 'success' && 'text-green-600',
          toast.type === 'error' && 'text-red-600'
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
