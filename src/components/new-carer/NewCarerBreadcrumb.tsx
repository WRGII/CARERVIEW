import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'

interface Props {
  /** Label for the current (deepest) breadcrumb level. If omitted renders only the hub link. */
  currentLabel?: string
}

export default function NewCarerBreadcrumb({ currentLabel }: Props) {
  const { t } = useLocale()

  const crumbs = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.new_carer'), to: currentLabel ? '/new-carer' : undefined },
    ...(currentLabel ? [{ label: currentLabel }] : []),
  ]
  const lastIdx = crumbs.length - 1
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.to && i < lastIdx ? { item: `https://carerview.com${c.to}` } : {}),
    })),
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex items-center gap-1 text-sm text-slate-500" itemProp="breadcrumb">
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
            <span className="text-slate-700 font-medium" aria-current="page">{t('nav.new_carer')}</span>
          )}
        </li>
        {currentLabel && (
          <>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </li>
            <li>
              <span className="text-slate-700 font-medium" aria-current="page">{currentLabel}</span>
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}
