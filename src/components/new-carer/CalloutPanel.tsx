// src/components/new-carer/CalloutPanel.tsx
import React from 'react'
import { CircleAlert as AlertCircle, Info, Lightbulb } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  children: React.ReactNode
  variant?: 'info' | 'emphasis' | 'warning'
  icon?: boolean
  className?: string
}

const VARIANTS = {
  info: {
    wrapper: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    icon: <Info className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />,
  },
  emphasis: {
    wrapper: 'bg-slate-800 border-slate-700 text-white',
    icon: <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />,
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />,
  },
}

export default function CalloutPanel({
  children,
  variant = 'info',
  icon = true,
  className,
}: Props) {
  const config = VARIANTS[variant]
  return (
    <div
      className={clsx(
        'rounded-xl border px-5 py-4 flex gap-3 items-start leading-relaxed text-sm font-medium',
        config.wrapper,
        className
      )}
    >
      {icon && config.icon}
      <div>{children}</div>
    </div>
  )
}
