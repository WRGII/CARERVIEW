import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'

interface Props {
  /** Label for the current (deepest) breadcrumb level. If omitted renders only the hub link. */
  currentLabel?: string
}

export default function NewCarerBreadcrumb({ currentLabel }: Props) {
  const { t } = useLocale()

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm text-slate-500">
        <li>
          <Link to="/" className="hover:text-teal-700 transition-colors">
            {t('nav.home')}
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        </li>
        <li>
          {currentLabel ? (
            <Link to="/new-carer" className="hover:text-teal-700 transition-colors">
              {t('nav.new_carer')}
            </Link>
          ) : (
            <span className="text-slate-700 font-medium">{t('nav.new_carer')}</span>
          )}
        </li>
        {currentLabel && (
          <>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </li>
            <li>
              <span className="text-slate-700 font-medium">{currentLabel}</span>
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}
