// src/components/new-carer/QuestionPromptList.tsx
import React from 'react'
import { CircleHelp as HelpCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'

interface Props {
  questionKeys: string[]
  headingKey?: string
}

export default function QuestionPromptList({ questionKeys, headingKey }: Props) {
  const { t } = useLocale()
  return (
    <div className="space-y-3">
      {headingKey && (
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {t(headingKey)}
        </h4>
      )}
      <ul className="space-y-2.5">
        {questionKeys.map((key) => (
          <li key={key} className="flex gap-2.5 items-start">
            <HelpCircle className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
            <span className="text-sm text-slate-700 leading-relaxed">{t(key)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
