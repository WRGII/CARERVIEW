// src/pages/new-carer/HealthCoordinationPage.tsx
import React from 'react'
import { HeartPulse, ClipboardList, Pill, CalendarDays, Users, RefreshCw, FileText, TriangleAlert as AlertTriangle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import QuestionPromptList from '../../components/new-carer/QuestionPromptList'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import NewCarerBreadcrumb from '../../components/new-carer/NewCarerBreadcrumb'
import ResourceCard from '../../components/new-carer/ResourceCard'
import { HEALTH_SYSTEMS, WORKSHEET_RESOURCES } from '../../content/newCarerContent'

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

export default function HealthCoordinationPage() {
  const { t } = useLocale()
  const relatedWorksheets = WORKSHEET_RESOURCES.filter((w) => RELATED_WS_IDS.includes(w.id))

  return (
    <>
      <PageSEO
        title={t('new_carer.health_page_title')}
        description={t('new_carer.health_meta_desc')}
        canonical="/new-carer/health-coordination"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <NewCarerBreadcrumb />
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

          {/* Questions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-8">
            <QuestionPromptList
              questionKeys={HEALTH_QUESTIONS}
              headingKey="new_carer.health_questions_heading"
            />
          </div>

          {/* Related worksheets */}
          {relatedWorksheets.length > 0 && (
            <div className="mb-10">
              <h2 className="text-base font-bold text-slate-800 mb-3">
                {t('new_carer.worksheets_heading')}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedWorksheets.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            </div>
          )}

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="health-coordination" />
          </div>
        </div>
      </div>
    </>
  )
}
