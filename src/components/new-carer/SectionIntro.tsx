// src/components/new-carer/SectionIntro.tsx
import React from 'react'
import clsx from 'clsx'

interface Props {
  eyebrow?: string
  title: string
  subtitle?: string
  intro?: string
  intro2?: string
  icon?: React.ReactNode
  className?: string
}

export default function SectionIntro({
  eyebrow,
  title,
  subtitle,
  intro,
  intro2,
  icon,
  className,
}: Props) {
  return (
    <div className={clsx('max-w-3xl', className)}>
      <div className="flex items-start gap-4 mb-4">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
            <div className="text-teal-700">{icon}</div>
          </div>
        )}
        <div>
          {eyebrow && (
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            {title}
          </h1>
        </div>
      </div>
      {subtitle && (
        <p className="text-xl text-slate-600 font-medium mb-3 leading-snug">{subtitle}</p>
      )}
      {intro && (
        <p className="text-base text-slate-600 leading-relaxed mb-2">{intro}</p>
      )}
      {intro2 && (
        <p className="text-base text-slate-600 leading-relaxed">{intro2}</p>
      )}
    </div>
  )
}
