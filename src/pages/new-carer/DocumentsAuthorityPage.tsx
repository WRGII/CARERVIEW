// src/pages/new-carer/DocumentsAuthorityPage.tsx
import React from 'react'
import { FileText, Stethoscope, Banknote, Scale, MessageSquare, FolderOpen, TriangleAlert as AlertTriangle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import QuestionPromptList from '../../components/new-carer/QuestionPromptList'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import NewCarerBreadcrumb from '../../components/new-carer/NewCarerBreadcrumb'
import ResourceCard from '../../components/new-carer/ResourceCard'
import { DOC_AREAS, WORKSHEET_RESOURCES } from '../../content/newCarerContent'

const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Stethoscope, Banknote, Scale, MessageSquare, FolderOpen, AlertTriangle,
}

const DOCS_QUESTIONS = [
  'new_carer.docs_q1',
  'new_carer.docs_q2',
  'new_carer.docs_q3',
  'new_carer.docs_q4',
  'new_carer.docs_q5',
]

const RELATED_WS_IDS = ['documents']

export default function DocumentsAuthorityPage() {
  const { t } = useLocale()
  const relatedWorksheets = WORKSHEET_RESOURCES.filter((w) => RELATED_WS_IDS.includes(w.id))

  return (
    <>
      <PageSEO
        title={t('new_carer.docs_page_title')}
        description={t('new_carer.docs_meta_desc')}
        canonical="/new-carer/documents-authority"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <NewCarerBreadcrumb />
          </div>

          <SectionIntro
            eyebrow={t('new_carer.docs_eyebrow')}
            title={t('new_carer.docs_title')}
            subtitle={t('new_carer.docs_subtitle')}
            intro={t('new_carer.docs_intro')}
            icon={<FileText className="w-6 h-6" />}
            className="mb-8"
          />

          {/* Authority must be established */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {t('new_carer.docs_authority_heading')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('new_carer.docs_authority_body')}
            </p>
          </div>

          <CalloutPanel variant="emphasis" className="mb-8">
            {t('new_carer.docs_governance_callout')}
          </CalloutPanel>

          {/* Areas */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              {t('new_carer.docs_areas_heading')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {DOC_AREAS.map((area) => {
              const Icon = ICON_MAP[area.icon] ?? FileText
              return (
                <div
                  key={area.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{t(area.titleKey)}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{t(area.bodyKey)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Questions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <QuestionPromptList
              questionKeys={DOCS_QUESTIONS}
              headingKey="new_carer.docs_questions_heading"
            />
          </div>

          {/* Disclaimer */}
          <CalloutPanel variant="warning" className="mb-8">
            {t('new_carer.docs_disclaimer')}
          </CalloutPanel>

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
            <ModuleNavGrid currentModuleId="documents-authority" />
          </div>
        </div>
      </div>
    </>
  )
}
