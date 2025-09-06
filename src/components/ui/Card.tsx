import React from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('bg-warm-white rounded-lg shadow-sm border border-slate-gray/20', className)}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-gray/20', className)}>
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-4 border-t border-slate-gray/20', className)}>
      {children}
    </div>
  )
}