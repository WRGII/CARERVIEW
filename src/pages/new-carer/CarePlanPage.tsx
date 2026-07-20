import { ClipboardList } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import PlanningPillarCard from '../../components/new-carer/PlanningPillarCard'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import NewCarerCTA from '../../components/new-carer/NewCarerCTA'
import { CARE_PLAN_PILLARS } from '../../content/newCarerContent'
import { SITE_URL } from '../../lib/siteConfig'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'New Carer Guide', item: `${SITE_URL}/new-carer` },
    { '@type': 'ListItem', position: 3, name: 'How to Build a Care Plan', item: `${SITE_URL}/new-carer/care-plan` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What should be included in a care plan for an elderly parent?',
      acceptedAnswer: { '@type': 'Answer', text: "A care plan should cover: understanding current and future care needs, clarifying decision-making authority, building the care team, deciding on living arrangements, creating one system for health coordination, stabilising paperwork and finances, protecting the primary carer's sustainability, and scheduling regular reviews." },
    },
    {
      '@type': 'Question',
      name: 'Who should be involved in making a family care plan?',
      acceptedAnswer: { '@type': 'Answer', text: 'The person being cared for should be involved where possible. The primary carer, family members who can contribute, and where relevant a GP or care coordinator. Establishing who has the final say early prevents the most common source of family conflict in caregiving situations.' },
    },
    {
      '@type': 'Question',
      name: 'How often should a care plan be reviewed?',
      acceptedAnswer: { '@type': 'Answer', text: "A care plan should be reviewed on a regular schedule — at minimum every six to twelve months — and immediately when a significant change occurs, such as a health event, hospitalisation, change in living situation, or when the primary carer's capacity changes." },
    },
  ],
}

export default function CarePlanPage() {
  const { t } = useLocale()

  return (
    <>
      <PageSEO
        title={t('new_carer.cp_page_title')}
        description={t('new_carer.cp_meta_desc')}
        canonical="/new-carer/care-plan"
        structuredData={[breadcrumbSchema, faqSchema]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Breadcrumbs homeTo="/new-carer" homeLabel={t('nav.new_carer')} items={[{ label: t('new_carer.cp_title') }]} />
          </div>

          <SectionIntro
            eyebrow={t('new_carer.cp_eyebrow')}
            title={t('new_carer.cp_title')}
            subtitle={t('new_carer.cp_subtitle')}
            intro={t('new_carer.cp_intro')}
            icon={<ClipboardList className="w-6 h-6" />}
            className="mb-8"
          />

          {/* Pillars */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {t('new_carer.cp_pillars_heading')}
            </h2>
            <p className="text-sm text-slate-500">
              Select any pillar to expand the strategic questions.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {CARE_PLAN_PILLARS.map((pillar) => (
              <PlanningPillarCard key={pillar.id} pillar={pillar} />
            ))}
          </div>

          <NewCarerCTA
            variant="mid"
            headlineKey="new_carer.cta_mid_cp_headline"
            bodyKey="new_carer.cta_mid_cp_body"
            source="new-carer-cp-mid"
            className="mb-8"
          />

          <CalloutPanel variant="emphasis" className="mb-8">
            {t('new_carer.cp_callout')}
          </CalloutPanel>

          <NewCarerCTA
            variant="end"
            headlineKey="new_carer.cta_end_cp_headline"
            bodyKey="new_carer.cta_end_cp_body"
            source="new-carer-cp-end"
            className="mb-8"
          />

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="care-plan" />
          </div>
        </div>
      </div>
    </>
  )
}
