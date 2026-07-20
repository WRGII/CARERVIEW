import React from 'react'
import { HeartPulse, ClipboardList, Pill, CalendarDays, Users, RefreshCw, FileText, TriangleAlert as AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import QuestionPromptList from '../../components/new-carer/QuestionPromptList'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import ResourceCard from '../../components/new-carer/ResourceCard'
import NewCarerCTA from '../../components/new-carer/NewCarerCTA'
import { HEALTH_SYSTEMS, WORKSHEET_RESOURCES } from '../../content/newCarerContent'
import { SITE_URL } from '../../lib/siteConfig'

const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  ClipboardList, Pill, CalendarDays, Users, RefreshCw, FileText, AlertTriangle,
}

const HEALTH_QUESTIONS = [
  'new_carer.health_q1',
  'new_carer.health_q2',
  'new_carer.health_q3',
  'new_carer.health_q4',
  'new_carer.health_q5',
]

const RELATED_WS_IDS = ['medications']

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'New Carer Guide', item: `${SITE_URL}/new-carer` },
    { '@type': 'ListItem', position: 3, name: 'Health Coordination', item: `${SITE_URL}/new-carer/health-coordination` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I manage medications for an elderly parent?',
      acceptedAnswer: { '@type': 'Answer', text: 'Start by creating a single, up-to-date medication list including dosages, prescribing doctors, and timing. Use a pill organiser or dispensing system for daily management. Keep the list accessible to all carers and bring it to every medical appointment. Review it regularly with the GP, particularly after any hospital admission.' },
    },
    {
      '@type': 'Question',
      name: 'How do I coordinate between multiple doctors for my parent?',
      acceptedAnswer: { '@type': 'Answer', text: 'Designate one GP as the primary coordinator and ensure all specialists copy them on correspondence. Keep a single record of all providers, diagnoses, and medications. Bring this record to every appointment. Ask each specialist to communicate changes back to the GP so nothing falls through the gaps between providers.' },
    },
    {
      '@type': 'Question',
      name: 'What health information should a family caregiver keep on record?',
      acceptedAnswer: { '@type': 'Answer', text: 'Essential records include: all current diagnoses and conditions, full medication list with dosages, all treating providers and their contact details, upcoming and recurring appointments, recent test results and hospital discharge summaries, emergency contacts, and any advance care directives or treatment preferences.' },
    },
  ],
}

export default function HealthCoordinationPage() {
  const { t } = useLocale()
  const relatedWorksheets = WORKSHEET_RESOURCES.filter((w) => RELATED_WS_IDS.includes(w.id))

  return (
    <>
      <PageSEO
        title={t('new_carer.health_page_title')}
        description={t('new_carer.health_meta_desc')}
        canonical="/new-carer/health-coordination"
        structuredData={[breadcrumbSchema, faqSchema]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Breadcrumbs homeTo="/new-carer" homeLabel={t('nav.new_carer')} items={[{ label: t('new_carer.health_title') }]} />
          </div>

          <SectionIntro
            eyebrow={t('new_carer.health_eyebrow')}
            title={t('new_carer.health_title')}
            subtitle={t('new_carer.health_subtitle')}
            intro={t('new_carer.health_intro')}
            icon={<HeartPulse className="w-6 h-6" />}
            className="mb-8"
          />

          <CalloutPanel variant="warning" className="mb-8">
            {t('new_carer.health_risk_callout')}
          </CalloutPanel>

          {/* System components */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              {t('new_carer.health_system_heading')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {HEALTH_SYSTEMS.map((sys) => {
              const Icon = ICON_MAP[sys.icon] ?? ClipboardList
              return (
                <div
                  key={sys.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{t(sys.titleKey)}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{t(sys.bodyKey)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Continuity note */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {t('new_carer.health_continuity_heading')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('new_carer.health_continuity_body')}
            </p>
          </div>

          <NewCarerCTA
            variant="mid"
            headlineKey="new_carer.cta_mid_health_headline"
            bodyKey="new_carer.cta_mid_health_body"
            source="new-carer-health-mid"
            className="mb-8"
          />

          {/* Questions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-8">
            <QuestionPromptList
              questionKeys={HEALTH_QUESTIONS}
              headingKey="new_carer.health_questions_heading"
            />
          </div>

          {/* Cross-link to CarerView product tour */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800 leading-snug">Keep a dated health record with CarerView</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                CarerView's observation tools let you log health changes over time using the same ADL/IADL framework healthcare professionals use — making doctor visits and assessments faster and more accurate.
              </p>
            </div>
            <Link
              to="/why"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors flex-shrink-0 group"
            >
              See how it works
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
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
            headlineKey="new_carer.cta_end_health_headline"
            bodyKey="new_carer.cta_end_health_body"
            source="new-carer-health-end"
            className="mb-8"
          />

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="health-coordination" />
          </div>
        </div>
      </div>
    </>
  )
}
