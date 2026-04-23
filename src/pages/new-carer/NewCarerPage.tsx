import { CircleCheck as CheckCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import ResourceCard from '../../components/new-carer/ResourceCard'
import NewCarerBreadcrumb from '../../components/new-carer/NewCarerBreadcrumb'
import { WORKSHEET_RESOURCES } from '../../content/newCarerContent'
import { SITE_URL } from '../../lib/siteConfig'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'New Carer Guide', item: `${SITE_URL}/new-carer` },
  ],
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'New to Caregiving? Where to Start',
  url: `${SITE_URL}/new-carer`,
  description: 'A practical guide for first-time family carers covering care planning, roles, living arrangements, legal documents, health coordination, and carer sustainability.',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'New Carer Guide', item: `${SITE_URL}/new-carer` },
    ],
  },
}

export default function NewCarerPage() {
  const { t } = useLocale()

  const helpsItems = [
    'new_carer.helps_1',
    'new_carer.helps_2',
    'new_carer.helps_3',
  ]

  const useWhenItems = [
    'new_carer.use_when_1',
    'new_carer.use_when_2',
    'new_carer.use_when_3',
    'new_carer.use_when_4',
  ]

  return (
    <>
      <PageSEO
        title={t('new_carer.page_title')}
        description={t('new_carer.meta_desc')}
        canonical="/new-carer"
        structuredData={[breadcrumbSchema, webPageSchema]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        {/* ── Hero ── */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-3">
              {t('new_carer.hero_eyebrow')}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
              {t('new_carer.hero_title')}
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-teal-300 mb-6 leading-snug">
              {t('new_carer.hero_subtitle')}
            </p>
            <div className="max-w-3xl space-y-3">
              <p className="text-lg text-slate-300 leading-relaxed">
                {t('new_carer.hero_intro')}
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                {t('new_carer.hero_intro_2')}
              </p>
            </div>
          </div>
        </section>

        {/* ── Breadcrumb (below hero) ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          <NewCarerBreadcrumb />
        </div>

        {/* ── Summary blocks ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Helps you */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                </span>
                {t('new_carer.helps_title')}
              </h2>
              <ul className="space-y-3">
                {helpsItems.map((key) => (
                  <li key={key} className="flex gap-2.5 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                    <span className="text-sm text-slate-700 leading-relaxed">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Use when */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                </span>
                {t('new_carer.use_when_title')}
              </h2>
              <ul className="space-y-3">
                {useWhenItems.map((key) => (
                  <li key={key} className="flex gap-2.5 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <span className="text-sm text-slate-700 leading-relaxed">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Module nav ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {t('new_carer.modules_intro')}
            </p>
            <ModuleNavGrid />
          </div>
        </section>

        {/* ── Supporting worksheets ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {t('new_carer.ws_all_heading')}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('new_carer.ws_all_intro')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKSHEET_RESOURCES.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
