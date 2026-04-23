// src/components/new-carer/ModuleNavGrid.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, ClipboardList, Users, Chrome as Home, FileText, HeartPulse, Battery, RefreshCw, ArrowRight } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import { NEW_CARER_MODULES } from '../../content/newCarerContent'

const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Compass,
  ClipboardList,
  Users,
  Home,
  FileText,
  HeartPulse,
  Battery,
  RefreshCw,
}

interface Props {
  currentModuleId?: string
}

export default function ModuleNavGrid({ currentModuleId }: Props) {
  const { t } = useLocale()

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        {t('new_carer.modules_heading')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {NEW_CARER_MODULES.map((mod) => {
          const Icon = ICON_MAP[mod.icon] ?? Compass
          const isCurrent = mod.id === currentModuleId
          return (
            <Link
              key={mod.id}
              to={mod.route}
              className={
                isCurrent
                  ? 'flex flex-col gap-2 rounded-xl border-2 border-teal-500 bg-teal-50 p-4 cursor-default pointer-events-none'
                  : 'group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-300 hover:shadow-md transition-all duration-200'
              }
            >
              <div className="flex items-center justify-between">
                <div
                  className={
                    isCurrent
                      ? 'w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center'
                      : 'w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors'
                  }
                >
                  <Icon
                    className={
                      isCurrent
                        ? 'w-4 h-4 text-teal-700'
                        : 'w-4 h-4 text-slate-500 group-hover:text-teal-700 transition-colors'
                    }
                  />
                </div>
                <span
                  className={
                    isCurrent
                      ? 'text-xs font-semibold text-teal-700'
                      : 'text-xs font-medium text-slate-400'
                  }
                >
                  {mod.number}
                </span>
              </div>
              <p
                className={
                  isCurrent
                    ? 'text-sm font-semibold text-teal-800'
                    : 'text-sm font-semibold text-slate-700 group-hover:text-slate-900'
                }
              >
                {t(mod.titleKey)}
              </p>
              {!isCurrent && (
                <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-teal-600 transition-colors mt-auto">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
