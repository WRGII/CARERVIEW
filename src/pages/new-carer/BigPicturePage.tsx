import { Compass, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import NewCarerBreadcrumb from '../../components/new-carer/NewCarerBreadcrumb'
import NewCarerCTA from '../../components/new-carer/NewCarerCTA'
import { SITE_URL } from '../../lib/siteConfig'

const SCOPE_KEYS = [
  'new_carer.bp_scope_1',
  'new_carer.bp_scope_2',
  'new_carer.bp_scope_3',
  'new_carer.bp_scope_4',
  'new_carer.bp_scope_5',
  'new_carer.bp_scope_6',
  'new_carer.bp_scope_7',
]

const RISK_KEYS = [
  'new_carer.bp_risk_1',
  'new_carer.bp_risk_2',
  'new_carer.bp_risk_3',
  'new_carer.bp_risk_4',
  'new_carer.bp_risk_5',
  'new_carer.bp_risk_6',
  'new_carer.bp_risk_7',
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'New Carer Guide', item: `${SITE_URL}/new-carer` },
    { '@type': 'ListItem', position: 3, name: 'What Does Caregiving Actually Involve?', item: `${SITE_URL}/new-carer/big-picture` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does a family caregiver actually do?',
      acceptedAnswer: { '@type': 'Answer', text: 'Caregiving typically involves coordinating health appointments, managing medications, making decisions on behalf of a loved one, communicating with family, managing finances and legal administration, overseeing housing and safety, and planning for how needs will change over time.' },
    },
    {
      '@type': 'Question',
      name: 'What are the biggest risks when starting out as a new carer?',
      acceptedAnswer: { '@type': 'Answer', text: 'The most common risks include unrecognised needs becoming urgent, unclear decision authority, family members pulling in different directions, scattered health information, unstable living arrangements, administrative overwhelm, and the primary carer burning out before help is arranged.' },
    },
    {
      '@type': 'Question',
      name: 'Where do I start when I suddenly become a family caregiver?',
      acceptedAnswer: { '@type': 'Answer', text: "Start by understanding the full scope of the caring role before getting caught up in day-to-day tasks. Map out what care is needed, who has legal authority to make decisions, what the living arrangements are, and who else can help. CarerView's New Carer guide walks through each of these areas." },
    },
  ],
}

export default function BigPicturePage() {
  const { t } = useLocale()

  return (
    <>
      <PageSEO
        title={t('new_carer.bp_page_title')}
        description={t('new_carer.bp_meta_desc')}
        canonical="/new-carer/big-picture"
        structuredData={[breadcrumbSchema, faqSchema]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <NewCarerBreadcrumb currentLabel={t('new_carer.bp_title')} />
          </div>

          <SectionIntro
            eyebrow={t('new_carer.bp_eyebrow')}
            title={t('new_carer.bp_title')}
            subtitle={t('new_carer.bp_subtitle')}
            intro={t('new_carer.bp_intro')}
            icon={<Compass className="w-6 h-6" />}
            className="mb-10"
          />

          {/* Scope of role */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {t('new_carer.bp_scope_heading')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {t('new_carer.bp_scope_body')}
            </p>
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {SCOPE_KEYS.map((key) => (
                <li key={key} className="flex gap-2.5 items-start">
                  <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed">{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Goal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {t('new_carer.bp_goal_heading')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('new_carer.bp_goal_body')}
            </p>
          </div>

          <NewCarerCTA
            variant="mid"
            headlineKey="new_carer.cta_mid_bp_headline"
            bodyKey="new_carer.cta_mid_bp_body"
            source="new-carer-bp-mid"
            className="mb-6"
          />

          {/* Risks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              {t('new_carer.bp_risks_heading')}
            </h2>
            <ul className="space-y-3">
              {RISK_KEYS.map((key) => (
                <li key={key} className="flex gap-2.5 items-start">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed">{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>

          <CalloutPanel variant="emphasis" className="mb-8">
            {t('new_carer.bp_callout')}
          </CalloutPanel>

          <NewCarerCTA
            variant="end"
            headlineKey="new_carer.cta_end_bp_headline"
            bodyKey="new_carer.cta_end_bp_body"
            source="new-carer-bp-end"
            className="mb-8"
          />

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="big-picture" />
          </div>
        </div>
      </div>
    </>
  )
}
