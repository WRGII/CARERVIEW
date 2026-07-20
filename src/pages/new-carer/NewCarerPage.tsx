import { CircleCheck as CheckCircle, ArrowRight, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import ResourceCard from '../../components/new-carer/ResourceCard'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import NewCarerCTA from '../../components/new-carer/NewCarerCTA'
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
          <div className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-3xl px-6 sm:px-12 py-10 sm:py-14 text-center">
            <p className="text-xs font-semibold text-cyan-primary uppercase tracking-widest mb-4">
              {t('new_carer.hero_eyebrow')}
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-warm-white mb-4 leading-tight max-w-4xl mx-auto">
              {t('new_carer.hero_title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-cyan-primary mb-6 leading-snug max-w-3xl mx-auto">
              {t('new_carer.hero_subtitle')}
            </p>
            <div className="max-w-3xl mx-auto space-y-3">
              <p className="text-lg text-slate-100 leading-relaxed">
                {t('new_carer.hero_intro')}
              </p>
              <p className="text-lg text-slate-100 leading-relaxed">
                {t('new_carer.hero_intro_2')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Breadcrumb (below hero) ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          <Breadcrumbs homeTo="/new-carer" homeLabel={t('nav.new_carer')} items={[]} />
        </div>

        {/* ── Summary blocks ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid sm:grid-cols-2 gap-6">
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

        {/* ── Mid CTA ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <NewCarerCTA
            variant="mid"
            headlineKey="new_carer.cta_mid_hub_headline"
            bodyKey="new_carer.cta_mid_hub_body"
            source="new-carer-hub-mid"
          />
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

          <NewCarerCTA
            variant="end"
            headlineKey="new_carer.cta_end_hub_headline"
            bodyKey="new_carer.cta_end_hub_body"
            source="new-carer-hub-end"
            className="mt-8"
          />

          {/* Tutorial Callout */}
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-cyan-primary flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{t('tutorial.callout_heading')}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{t('tutorial.callout_body')}</p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/tutorial"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-hover transition-all duration-200 whitespace-nowrap shadow-sm"
              >
                {t('nav.tutorial')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Cross-links to other CarerView pages */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
            <Link to="/pricing" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.pricing')}</Link>
            {' · '}
            <Link to="/why" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.why_carerview')}</Link>
            {' · '}
            <Link to="/resources" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.caregiver_resources')}</Link>
            {' · '}
            <Link to="/community" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.caregiver_forum')}</Link>
            {' · '}
            <Link to="/memory-book" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.memory_book')}</Link>
          </div>
        </section>
      </div>
    </>
  )
}
