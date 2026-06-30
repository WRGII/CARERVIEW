import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastContainer, Toast, ToastType } from './Toast'

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const noopToast: ToastContextType = {
  showToast: () => {},
  dismissToast: () => {},
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    console.warn('[CarerView] useToast called outside ToastProvider — returning no-op')
    return noopToast
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = { id, message, type, duration }

    setToasts((prev) => [...prev, newToast])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}
