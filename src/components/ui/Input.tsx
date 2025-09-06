import React from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          'block w-full rounded-lg border border-slate-gray/30 px-3 py-2 text-base placeholder-slate-gray/50 shadow-sm focus:border-cyan-primary focus:outline-none focus:ring-1 focus:ring-cyan-primary bg-warm-white text-slate-gray',
          error && 'border-peach-blush focus:border-peach-blush focus:ring-peach-blush',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-slate-gray">{error}</p>
      )}
    </div>
  )
}