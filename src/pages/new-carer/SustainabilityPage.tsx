import { Battery, CircleAlert as AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import QuestionPromptList from '../../components/new-carer/QuestionPromptList'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import NewCarerBreadcrumb from '../../components/new-carer/NewCarerBreadcrumb'
import NewCarerCTA from '../../components/new-carer/NewCarerCTA'
import { SUSTAIN_PRESSURES } from '../../content/newCarerContent'
import { SITE_URL } from '../../lib/siteConfig'

const SUSTAIN_QUESTIONS = [
  'new_carer.sustain_q1',
  'new_carer.sustain_q2',
  'new_carer.sustain_q3',
  'new_carer.sustain_q4',
  'new_carer.sustain_q5',
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'New Carer Guide', item: `${SITE_URL}/new-carer` },
    { '@type': 'ListItem', position: 3, name: 'Carer Sustainability', item: `${SITE_URL}/new-carer/sustainability` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I prevent caregiver burnout?',
      acceptedAnswer: { '@type': 'Answer', text: 'Preventing caregiver burnout requires building sustainability into your plan from the start — not waiting until you are exhausted. Key steps include: distributing care tasks rather than doing everything yourself, arranging regular respite before you need it urgently, being honest about your limits, connecting with other carers who understand what you are going through, and asking for help as a strategy rather than a last resort.' },
    },
    {
      '@type': 'Question',
      name: 'What is respite care and how do I arrange it?',
      acceptedAnswer: { '@type': 'Answer', text: 'Respite care is temporary relief for primary carers — provided by another family member, a paid carer, or a short-term care facility. It can be regular (a few hours per week) or longer (a week while the carer has a break). Contact your local authority, a GP, or a carer support organisation to explore what is available and funded in your area.' },
    },
    {
      '@type': 'Question',
      name: 'Is it normal to feel guilty about needing a break from caregiving?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, carer guilt is extremely common. But needing rest is not a sign of failure — it is a sign that you are human. A carer who burns out cannot help anyone. Planning breaks and accepting help is not selfish; it is one of the most important things you can do for the person you are caring for.' },
    },
  ],
}

export default function SustainabilityPage() {
  const { t } = useLocale()

  return (
    <>
      <PageSEO
        title={t('new_carer.sustain_page_title')}
        description={t('new_carer.sustain_meta_desc')}
        canonical="/new-carer/sustainability"
        structuredData={[breadcrumbSchema, faqSchema]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <NewCarerBreadcrumb currentLabel={t('new_carer.sustain_title')} />
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

          <NewCarerCTA
            variant="mid"
            headlineKey="new_carer.cta_mid_sustain_headline"
            bodyKey="new_carer.cta_mid_sustain_body"
            source="new-carer-sustain-mid"
            className="mb-8"
          />

          {/* Questions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-8">
            <QuestionPromptList
              questionKeys={SUSTAIN_QUESTIONS}
              headingKey="new_carer.sustain_questions_heading"
            />
          </div>

          {/* Cross-link to caregiver community */}
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800 leading-snug">Connect with carers who understand</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                CarerView's free community forum is for family carers navigating exactly this. Share how you are coping, ask questions, and find practical wisdom from people who have been through it.
              </p>
            </div>
            <Link
              to="/caregiver-forum"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 hover:text-rose-900 transition-colors flex-shrink-0 group"
            >
              Join the community
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <NewCarerCTA
            variant="end"
            headlineKey="new_carer.cta_end_sustain_headline"
            bodyKey="new_carer.cta_end_sustain_body"
            source="new-carer-sustain-end"
            className="mb-8"
          />

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="sustainability" />
          </div>
        </div>
      </div>
    </>
  )
}
