import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  retry?: () => void
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, retry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-warm-white">
      <div className="bg-warm-white p-8 rounded-lg shadow-sm border border-peach-blush max-w-md text-center">
        <AlertCircle className="w-12 h-12 text-slate-gray mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-gray mb-2">Access Error</h2>
        <p className="text-slate-gray/80 mb-4">{message}</p>
        {retry && (
          <button
            onClick={retry}
            className="bg-cyan-primary text-warm-white px-4 py-2 rounded-lg hover:bg-cyan-hover transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}