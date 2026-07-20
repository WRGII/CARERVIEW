import React, { useId } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const autoId = useId()
  const inputId = id || autoId
  const errorId = `${inputId}-error`

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'block w-full rounded-lg border px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-1 bg-warm-white text-slate-700',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-slate-gray/30 focus:border-cyan-primary focus:ring-cyan-primary',
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
