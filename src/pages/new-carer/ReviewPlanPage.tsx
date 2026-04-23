// src/pages/new-carer/ReviewPlanPage.tsx
import React from 'react'
import { RefreshCw, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import QuestionPromptList from '../../components/new-carer/QuestionPromptList'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import NewCarerBreadcrumb from '../../components/new-carer/NewCarerBreadcrumb'
import { REVIEW_TRIGGERS } from '../../content/newCarerContent'

const REVIEW_WHY_KEYS = [
  'new_carer.review_why_1',
  'new_carer.review_why_2',
  'new_carer.review_why_3',
  'new_carer.review_why_4',
  'new_carer.review_why_5',
  'new_carer.review_why_6',
]

const FRAMEWORK_QUESTIONS = [
  'new_carer.review_fw_q1',
  'new_carer.review_fw_q2',
  'new_carer.review_fw_q3',
  'new_carer.review_fw_q4',
]

const REVIEW_QUESTIONS = [
  'new_carer.review_q1',
  'new_carer.review_q2',
  'new_carer.review_q3',
  'new_carer.review_q4',
]

export default function ReviewPlanPage() {
  const { t } = useLocale()

  return (
    <>
      <PageSEO
        title={t('new_carer.review_page_title')}
        description={t('new_carer.review_meta_desc')}
        canonical="/new-carer/review-plan"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <NewCarerBreadcrumb />
          </div>

          <SectionIntro
            eyebrow={t('new_carer.review_eyebrow')}
            title={t('new_carer.review_title')}
            subtitle={t('new_carer.review_subtitle')}
            intro={t('new_carer.review_intro')}
            icon={<RefreshCw className="w-6 h-6" />}
            className="mb-8"
          />

          {/* Why plans need review */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              {t('new_carer.review_why_heading')}
            </h2>
            <ul className="space-y-3">
              {REVIEW_WHY_KEYS.map((key) => (
                <li key={key} className="flex gap-2.5 items-start">
                  <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed">{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Review framework */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {t('new_carer.review_framework_heading')}
            </h2>
            <p className="text-sm text-slate-500 mb-5">{t('new_carer.review_framework_intro')}</p>
            <ol className="space-y-3">
              {FRAMEWORK_QUESTIONS.map((key, i) => (
                <li key={key} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed">{t(key)}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Unscheduled triggers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              {t('new_carer.review_triggers_heading')}
            </h2>
            <ul className="space-y-3">
              {REVIEW_TRIGGERS.map((trigger) => (
                <li key={trigger.id} className="flex gap-2.5 items-start">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed">{t(trigger.key)}</span>
                </li>
              ))}
            </ul>
          </div>

          <CalloutPanel variant="emphasis" className="mb-8">
            {t('new_carer.review_callout')}
          </CalloutPanel>

          {/* Questions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-10">
            <QuestionPromptList
              questionKeys={REVIEW_QUESTIONS}
              headingKey="new_carer.review_questions_heading"
            />
          </div>

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="review-plan" />
          </div>
        </div>
      </div>
    </>
  )
}
