import React from 'react'
import { Chrome as Home, Users, HeartHandshake, Building2, CircleCheck as CheckCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import QuestionPromptList from '../../components/new-carer/QuestionPromptList'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import ResourceCard from '../../components/new-carer/ResourceCard'
import NewCarerCTA from '../../components/new-carer/NewCarerCTA'
import { LIVING_OPTIONS, LIVING_DIMENSIONS, WORKSHEET_RESOURCES } from '../../content/newCarerContent'
import { SITE_URL } from '../../lib/siteConfig'

const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Home, Users, HeartHandshake, Building2,
}

const LIVING_QUESTIONS = [
  'new_carer.living_q1',
  'new_carer.living_q2',
  'new_carer.living_q3',
  'new_carer.living_q4',
  'new_carer.living_q5',
]

const RELATED_WS_IDS = ['home-safety', 'moving-in']

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'New Carer Guide', item: `${SITE_URL}/new-carer` },
    { '@type': 'ListItem', position: 3, name: 'Living Arrangements', item: `${SITE_URL}/new-carer/living-arrangements` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are the options for elderly parent living arrangements?',
      acceptedAnswer: { '@type': 'Answer', text: 'The main options are: staying in their current home (with or without in-home support), moving into a family member\'s home, receiving professional in-home care, or moving to a residential care facility. The right choice depends on safety needs, supervision requirements, financial sustainability, and the wishes of the person being cared for.' },
    },
    {
      '@type': 'Question',
      name: 'How do I know if my parent is safe living at home?',
      acceptedAnswer: { '@type': 'Answer', text: 'Key factors to assess include: whether the home can be made physically safe, whether supervision needs can be met, whether medications can be managed reliably, whether transport to appointments is possible, and whether the person can manage emergencies. A formal home safety assessment can help identify risks.' },
    },
    {
      '@type': 'Question',
      name: 'Should I move my elderly parent into my home?',
      acceptedAnswer: { '@type': 'Answer', text: 'Moving a parent into your home can work well when care needs are moderate, the physical space is suitable, and the impact on your family and work is sustainable. It requires honest planning around daily routines, safety modifications, supervision needs, and what happens if care needs increase over time.' },
    },
  ],
}

export default function LivingArrangementsPage() {
  const { t } = useLocale()
  const relatedWorksheets = WORKSHEET_RESOURCES.filter((w) => RELATED_WS_IDS.includes(w.id))

  return (
    <>
      <PageSEO
        title={t('new_carer.living_page_title')}
        description={t('new_carer.living_meta_desc')}
        canonical="/new-carer/living-arrangements"
        structuredData={[breadcrumbSchema, faqSchema]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Breadcrumbs homeTo="/new-carer" homeLabel={t('nav.new_carer')} items={[{ label: t('new_carer.living_title') }]} />
          </div>

          <SectionIntro
            eyebrow={t('new_carer.living_eyebrow')}
            title={t('new_carer.living_title')}
            subtitle={t('new_carer.living_subtitle')}
            intro={t('new_carer.living_intro')}
            icon={<Home className="w-6 h-6" />}
            className="mb-8"
          />

          {/* Options */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              {t('new_carer.living_options_heading')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {LIVING_OPTIONS.map((opt) => {
              const Icon = ICON_MAP[opt.icon] ?? Home
              return (
                <div
                  key={opt.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{t(opt.titleKey)}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{t(opt.bodyKey)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Planning dimensions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              {t('new_carer.living_dimensions_heading')}
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {LIVING_DIMENSIONS.map((dim) => (
                <li key={dim.id} className="flex gap-2.5 items-start">
                  <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed">{t(dim.key)}</span>
                </li>
              ))}
            </ul>
          </div>

          <NewCarerCTA
            variant="mid"
            headlineKey="new_carer.cta_mid_living_headline"
            bodyKey="new_carer.cta_mid_living_body"
            source="new-carer-living-mid"
            className="mb-8"
          />

          {/* Moving in callout */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              {t('new_carer.living_moving_in_heading')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('new_carer.living_moving_in_body')}
            </p>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-8">
            <QuestionPromptList
              questionKeys={LIVING_QUESTIONS}
              headingKey="new_carer.living_questions_heading"
            />
          </div>

          {/* Related worksheets */}
          {relatedWorksheets.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-slate-800 mb-1">
                {t('new_carer.worksheets_heading')}
              </h2>
              <p className="text-xs text-slate-400 mb-3">{t('new_carer.ws_subscriber_note')}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedWorksheets.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            </div>
          )}

          <NewCarerCTA
            variant="end"
            headlineKey="new_carer.cta_end_living_headline"
            bodyKey="new_carer.cta_end_living_body"
            source="new-carer-living-end"
            className="mb-8"
          />

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="living-arrangements" />
          </div>
        </div>
      </div>
    </>
  )
}
