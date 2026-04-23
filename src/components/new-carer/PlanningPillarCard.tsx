// src/components/new-carer/PlanningPillarCard.tsx
import React, { useState } from 'react'
import { ChevronDown, ChevronUp, CircleHelp as HelpCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import type { CarePlanPillar } from '../../content/newCarerContent'

interface Props {
  pillar: CarePlanPillar
}

export default function PlanningPillarCard({ pillar }: Props) {
  const { t } = useLocale()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-5 text-left group"
        aria-expanded={expanded}
      >
        <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm font-bold shrink-0 group-hover:bg-teal-700 transition-colors">
          {pillar.number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 mb-1 leading-snug">
            {t(pillar.titleKey)}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">{t(pillar.bodyKey)}</p>
        </div>
        <div className="shrink-0 mt-0.5 text-slate-400 group-hover:text-slate-600 transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4 mb-3">
            {t('new_carer.cp_questions_label')}
          </p>
          <ul className="space-y-2.5">
            {pillar.questionKeys.map((key) => (
              <li key={key} className="flex gap-2.5 items-start">
                <HelpCircle className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 leading-relaxed">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
