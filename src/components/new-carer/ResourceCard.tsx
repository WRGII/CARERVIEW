import React from 'react'
import { FileDown, Lock } from 'lucide-react'
import clsx from 'clsx'
import { useLocale } from '../../i18n/LocaleContext'
import type { WorksheetResource } from '../../content/newCarerContent'

const TAG_COLORS: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-800',
  teal: 'bg-teal-100 text-teal-800',
  blue: 'bg-blue-100 text-blue-800',
  slate: 'bg-slate-100 text-slate-700',
  rose: 'bg-rose-100 text-rose-800',
}

interface Props {
  resource: WorksheetResource
}

export default function ResourceCard({ resource }: Props) {
  const { t } = useLocale()
  const tagColor = TAG_COLORS[resource.tagColor] ?? TAG_COLORS.slate

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-800 leading-snug">
          {t(resource.titleKey)}
        </h4>
        <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full shrink-0', tagColor)}>
          {t(resource.tagKey)}
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed flex-1">
        {t(resource.descKey)}
      </p>
      {resource.comingSoon ? (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Lock className="w-3 h-3" />
          {t('new_carer.ws_subscriber_access')}
        </div>
      ) : (
        <button className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors">
          <FileDown className="w-3.5 h-3.5" />
          {t('new_carer.ws_view_worksheet')}
        </button>
      )}
    </div>
  )
}
