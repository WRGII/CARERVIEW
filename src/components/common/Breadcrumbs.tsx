import { Link } from 'react-router-dom';
import { ChevronRight, Chrome as Home } from 'lucide-react';

type Crumb = {
  label: string;
  to?: string;
};

type BreadcrumbsProps = {
  items: Crumb[];
  /**
   * Root crumb target. Defaults to "/" (site root) for public pages.
   * Pass "/caregiver" for authenticated dashboard sections.
   */
  homeTo?: string;
  homeLabel?: string;
};

export default function Breadcrumbs({
  items,
  homeTo = '/',
  homeLabel = 'Home',
}: BreadcrumbsProps) {
  const allCrumbs: Crumb[] = [{ label: homeLabel, to: homeTo }, ...items];
  const lastIdx = allCrumbs.length - 1;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allCrumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.to && i < lastIdx ? { item: `https://carerview.com${c.to}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex items-center gap-1.5 flex-wrap" itemProp="breadcrumb">
        {allCrumbs.map((item, i) => {
          const isLast = i === lastIdx;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i === 0 ? (
                <Link
                  to={item.to ?? homeTo}
                  aria-label={homeLabel}
                  className="text-slate-500 hover:text-cyan-600 transition-colors inline-flex items-center"
                >
                  <Home className="w-4 h-4" />
                </Link>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              )}
              {isLast || !item.to ? (
                <span
                  className={i === 0 ? 'sr-only' : 'text-slate-800 font-medium'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : i === 0 ? null : (
                <Link
                  to={item.to}
                  className="text-slate-500 hover:text-cyan-600 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
