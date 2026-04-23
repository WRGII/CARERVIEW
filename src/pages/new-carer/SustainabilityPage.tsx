// src/pages/new-carer/SustainabilityPage.tsx
import React from 'react'
import { Battery, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import QuestionPromptList from '../../components/new-carer/QuestionPromptList'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import NewCarerBreadcrumb from '../../components/new-carer/NewCarerBreadcrumb'
import { SUSTAIN_PRESSURES } from '../../content/newCarerContent'

const SUSTAIN_QUESTIONS = [
  'new_carer.sustain_q1',
  'new_carer.sustain_q2',
  'new_carer.sustain_q3',
  'new_carer.sustain_q4',
  'new_carer.sustain_q5',
]

export default function SustainabilityPage() {
  const { t } = useLocale()

  return (
    <>
      <PageSEO
        title={t('new_carer.sustain_page_title')}
        description={t('new_carer.sustain_meta_desc')}
        canonical="/new-carer/sustainability"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <NewCarerBreadcrumb />
          </div>

          <SectionIntro
            eyebrow={t('new_carer.sustain_eyebrow')}
            title={t('new_carer.sustain_title')}
            subtitle={t('new_carer.sustain_subtitle')}
            intro={t('new_carer.sustain_intro')}
            icon={<Battery className="w-6 h-6" />}
            className="mb-8"
          />

          <CalloutPanel variant="emphasis" className="mb-8">
            {t('new_carer.sustain_callout')}
          </CalloutPanel>

          {/* What wears carers down */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              {t('new_carer.sustain_pressures_heading')}
            </h2>
            <ul className="space-y-3">
              {SUSTAIN_PRESSURES.map((p) => (
                <li key={p.id} className="flex gap-2.5 items-start">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed">{t(p.key)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Build sustainability in */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {t('new_carer.sustain_plan_heading')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('new_carer.sustain_plan_body')}
            </p>
          </div>

          {/* Respite */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {t('new_carer.sustain_respite_heading')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('new_carer.sustain_respite_body')}
            </p>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-10">
            <QuestionPromptList
              questionKeys={SUSTAIN_QUESTIONS}
              headingKey="new_carer.sustain_questions_heading"
            />
          </div>

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="sustainability" />
          </div>
        </div>
      </div>
    </>
  )
}
