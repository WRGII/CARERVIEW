import { RefreshCw, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import QuestionPromptList from '../../components/new-carer/QuestionPromptList'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import NewCarerCTA from '../../components/new-carer/NewCarerCTA'
import { REVIEW_TRIGGERS } from '../../content/newCarerContent'
import { SITE_URL } from '../../lib/siteConfig'

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

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'New Carer Guide', item: `${SITE_URL}/new-carer` },
    { '@type': 'ListItem', position: 3, name: 'Review and Update the Care Plan', item: `${SITE_URL}/new-carer/review-plan` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'When should a family care plan be reviewed?',
      acceptedAnswer: { '@type': 'Answer', text: 'A care plan should be reviewed on a scheduled basis — at minimum every six to twelve months. It should also be reviewed immediately after any significant event: a health decline or hospitalisation, a change in living situation, a major change in family circumstances, or when the primary carer\'s capacity changes significantly.' },
    },
    {
      '@type': 'Question',
      name: 'How do I update a care plan when my parent\'s needs change?',
      acceptedAnswer: { '@type': 'Answer', text: 'Start by reassessing the current situation: what has changed, what is no longer working, and what new needs have emerged. Then update the relevant parts of the plan — care tasks, team responsibilities, living arrangements, or health coordination — and communicate the changes to everyone involved in the care.' },
    },
    {
      '@type': 'Question',
      name: 'Who should be part of a care plan review?',
      acceptedAnswer: { '@type': 'Answer', text: 'At minimum, the primary carer and any family members with active responsibilities. For significant reviews, include the person being cared for (where possible), a GP or care coordinator, and any professional carers involved. The goal is shared understanding — not a decision made by one person alone.' },
    },
  ],
}

export default function ReviewPlanPage() {
  const { t } = useLocale()

  return (
    <>
      <PageSEO
        title={t('new_carer.review_page_title')}
        description={t('new_carer.review_meta_desc')}
        canonical="/new-carer/review-plan"
        structuredData={[breadcrumbSchema, faqSchema]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Breadcrumbs homeTo="/new-carer" homeLabel={t('nav.new_carer')} items={[{ label: t('new_carer.review_title') }]} />
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

          <NewCarerCTA
            variant="mid"
            headlineKey="new_carer.cta_mid_review_headline"
            bodyKey="new_carer.cta_mid_review_body"
            source="new-carer-review-mid"
            className="mb-6"
          />

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
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-8">
            <QuestionPromptList
              questionKeys={REVIEW_QUESTIONS}
              headingKey="new_carer.review_questions_heading"
            />
          </div>

          <NewCarerCTA
            variant="end"
            headlineKey="new_carer.cta_end_review_headline"
            bodyKey="new_carer.cta_end_review_body"
            source="new-carer-review-end"
            className="mb-8"
          />

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="review-plan" />
          </div>
        </div>
      </div>
    </>
  )
}
