import React from 'react'
import { validatePassword, type PasswordStrength } from '../../lib/passwordValidation'

interface Props {
  password: string
  tFn: (key: string) => string
}

const SEGMENT_COLORS: Record<PasswordStrength, string[]> = {
  weak:   ['bg-red-400',    'bg-slate-200',   'bg-slate-200'],
  fair:   ['bg-amber-400',  'bg-amber-400',   'bg-slate-200'],
  strong: ['bg-emerald-500','bg-emerald-500',  'bg-emerald-500'],
}

const LABEL_COLORS: Record<PasswordStrength, string> = {
  weak:   'text-red-500',
  fair:   'text-amber-500',
  strong: 'text-emerald-600',
}

export default function PasswordStrengthBar({ password, tFn }: Props) {
  if (!password) return null

  const { strength, unmetRules } = validatePassword(password)
  const segments = SEGMENT_COLORS[strength]

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {segments.map((color, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${color}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${LABEL_COLORS[strength]}`}>
          {tFn(`auth.password_strength_${strength}`)}
        </span>
        {unmetRules.length > 0 && (
          <span className="text-xs text-slate-400">
            {unmetRules.map(r => tFn(`auth.password_rule_${r}`)).join(' · ')}
          </span>
        )}
      </div>
    </div>
  )
}
