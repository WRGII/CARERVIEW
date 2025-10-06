import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}, ref) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-cyan-primary text-warm-white hover:bg-cyan-hover focus:ring-cyan-primary',
    secondary: 'bg-slate-gray text-warm-white hover:bg-slate-gray/90 focus:ring-slate-gray',
    outline: 'border border-slate-gray/30 text-slate-gray hover:bg-peach-blush/20 focus:ring-cyan-primary',
    ghost: 'text-slate-gray hover:bg-slate-gray/10 focus:ring-cyan-primary',
    destructive: 'bg-peach-blush text-slate-gray hover:bg-peach-blush/80 focus:ring-peach-blush'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      ref={ref}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'