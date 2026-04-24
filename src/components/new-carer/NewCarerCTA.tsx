import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import clsx from 'clsx'

interface Props {
  /** 'mid' = subtle inline strip; 'end' = soft card above module nav */
  variant: 'mid' | 'end'
  /** i18n key for the headline/title */
  headlineKey: string
  /** i18n key for the supporting body line */
  bodyKey: string
  /** utm-style source tag appended to /create-account */
  source: string
  className?: string
}

const SIGNUP_BASE = '/create-account?plan=free&source='

export default function NewCarerCTA({ variant, headlineKey, bodyKey, source, className }: Props) {
  const { t } = useLocale()
  const href = `${SIGNUP_BASE}${source}`

  if (variant === 'mid') {
    return (
      <div
        className={clsx(
          'bg-teal-50 border border-teal-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4',
          className
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-snug">{t(headlineKey)}</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t(bodyKey)}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors group"
          >
            {t('new_carer.cta_try_free')}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    )
  }

  // end variant — slightly more present, still restrained
  return (
    <div
      className={clsx(
        'bg-white border border-slate-200 rounded-2xl p-7 shadow-sm',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-slate-900 mb-1 leading-snug">{t(headlineKey)}</p>
          <p className="text-sm text-slate-500 leading-relaxed">{t(bodyKey)}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
          <Link
            to={href}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <Sparkles className="w-4 h-4" />
            {t('new_carer.cta_get_started')}
          </Link>
          <Link
            to="/#get-started"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {t('new_carer.cta_sign_in')}
          </Link>
        </div>
      </div>
    </div>
  )
}
