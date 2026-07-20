import { Link } from 'react-router-dom'
import { ChevronRight, Chrome as Home } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'

type Crumb = {
  label: string
  to?: string
}

type BreadcrumbsProps = {
  items: Crumb[]
  /**
   * Root crumb target. Defaults to "/" (site root) for public pages.
   * Pass "/caregiver" for authenticated dashboard sections.
   */
  homeTo?: string
  homeLabel?: string
  /** When true, the home icon is replaced by a text label (for non-root contexts). */
  homeIcon?: boolean
}

export default function Breadcrumbs({
  items,
  homeTo = '/',
  homeLabel,
  homeIcon = false,
}: BreadcrumbsProps) {
  const { t } = useLocale()
  const resolvedHomeLabel = homeLabel ?? t('nav.home')
  const allCrumbs: Crumb[] = [{ label: resolvedHomeLabel, to: homeTo }, ...items]
  const lastIdx = allCrumbs.length - 1

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allCrumbs.map((c, i) => ({
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
      <ol className="flex items-center gap-1.5 flex-wrap" itemProp="breadcrumb">
        {allCrumbs.map((item, i) => {
          const isLast = i === lastIdx
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i === 0 && homeIcon ? (
                <Link
                  to={item.to ?? homeTo}
                  aria-label={resolvedHomeLabel}
                  className="text-slate-500 hover:text-cyan-600 transition-colors inline-flex items-center"
                >
                  <Home className="w-4 h-4" />
                </Link>
              ) : i > 0 ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              ) : null}
              {isLast || !item.to ? (
                <span
                  className={i === 0 && homeIcon ? 'sr-only' : 'text-slate-800 font-medium'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : i === 0 && homeIcon ? null : (
                <Link
                  to={item.to}
                  className="text-slate-500 hover:text-cyan-600 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
