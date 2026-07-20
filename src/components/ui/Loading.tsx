import React from 'react'
import { Loader as Loader2 } from 'lucide-react'

interface LoadingProps {
  message?: string
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center min-h-screen bg-warm-white"
    >
      <Loader2 className="w-8 h-8 animate-spin text-cyan-primary mb-4" aria-hidden="true" />
      <p className="text-slate-600 text-lg">{message}
        <span className="sr-only">Please wait.</span>
      </p>
    </div>
  )
}
