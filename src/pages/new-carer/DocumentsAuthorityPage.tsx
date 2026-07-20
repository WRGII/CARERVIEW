import React from 'react'
import { FileText, Stethoscope, Banknote, Scale, MessageSquare, FolderOpen, TriangleAlert as AlertTriangle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import QuestionPromptList from '../../components/new-carer/QuestionPromptList'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import ResourceCard from '../../components/new-carer/ResourceCard'
import NewCarerCTA from '../../components/new-carer/NewCarerCTA'
import { DOC_AREAS, WORKSHEET_RESOURCES } from '../../content/newCarerContent'
import { SITE_URL } from '../../lib/siteConfig'

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

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'New Carer Guide', item: `${SITE_URL}/new-carer` },
    { '@type': 'ListItem', position: 3, name: 'Documents and Authority', item: `${SITE_URL}/new-carer/documents-authority` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What legal documents does a family caregiver need?',
      acceptedAnswer: { '@type': 'Answer', text: 'Key documents typically include: a power of attorney for financial decisions, a lasting or enduring power of attorney for health and welfare decisions, an advance care directive or living will expressing the person\'s wishes, and organised access to financial accounts, insurance policies, and identification documents. Requirements vary by country.' },
    },
    {
      '@type': 'Question',
      name: 'Does being next of kin give me legal authority over my parent\'s care?',
      acceptedAnswer: { '@type': 'Answer', text: 'Not automatically. In most countries, being next of kin does not give you legal authority to access medical records, make treatment decisions, or manage finances if the person has lost capacity. Formal legal documents — such as power of attorney — must be put in place while the person still has the capacity to grant them.' },
    },
    {
      '@type': 'Question',
      name: 'What happens if we don\'t get power of attorney in time?',
      acceptedAnswer: { '@type': 'Answer', text: "If a person loses mental capacity before a power of attorney is in place, the process becomes significantly more complex and expensive. In most jurisdictions you would need to apply to a court for a deputyship or guardianship order. Acting early — while the person still has capacity — is strongly recommended." },
    },
  ],
}

export default function DocumentsAuthorityPage() {
  const { t } = useLocale()
  const relatedWorksheets = WORKSHEET_RESOURCES.filter((w) => RELATED_WS_IDS.includes(w.id))

  return (
    <>
      <PageSEO
        title={t('new_carer.docs_page_title')}
        description={t('new_carer.docs_meta_desc')}
        canonical="/new-carer/documents-authority"
        structuredData={[breadcrumbSchema, faqSchema]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Breadcrumbs homeTo="/new-carer" homeLabel={t('nav.new_carer')} items={[{ label: t('new_carer.docs_title') }]} />
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

          <NewCarerCTA
            variant="mid"
            headlineKey="new_carer.cta_mid_docs_headline"
            bodyKey="new_carer.cta_mid_docs_body"
            source="new-carer-docs-mid"
            className="mb-8"
          />

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
            headlineKey="new_carer.cta_end_docs_headline"
            bodyKey="new_carer.cta_end_docs_body"
            source="new-carer-docs-end"
            className="mb-8"
          />

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="documents-authority" />
          </div>
        </div>
      </div>
    </>
  )
}
