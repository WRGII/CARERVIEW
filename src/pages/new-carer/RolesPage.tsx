import React from 'react'
import { Users, Chrome as Home, HeartHandshake, Heart, Stethoscope, CalendarDays, Briefcase, RotateCcw } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import QuestionPromptList from '../../components/new-carer/QuestionPromptList'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import NewCarerCTA from '../../components/new-carer/NewCarerCTA'
import { ROLE_AREAS } from '../../content/newCarerContent'
import { SITE_URL } from '../../lib/siteConfig'

const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Home, HeartHandshake, Heart, Stethoscope, CalendarDays, Briefcase, RotateCcw,
}

const ROLE_QUESTIONS = [
  'new_carer.roles_q1',
  'new_carer.roles_q2',
  'new_carer.roles_q3',
  'new_carer.roles_q4',
  'new_carer.roles_q5',
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'New Carer Guide', item: `${SITE_URL}/new-carer` },
    { '@type': 'ListItem', position: 3, name: 'Caregiver Roles and Responsibilities', item: `${SITE_URL}/new-carer/roles` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are the main responsibilities of a family caregiver?',
      acceptedAnswer: { '@type': 'Answer', text: 'Family caregiver responsibilities typically include: household management and daily tasks, personal care and hygiene support, emotional support and companionship, health care coordination and appointments, scheduling and administration, financial and legal administration, and arranging respite or backup care.' },
    },
    {
      '@type': 'Question',
      name: 'Is it normal for one person to take on all caregiving responsibilities?',
      acceptedAnswer: { '@type': 'Answer', text: "It is very common but rarely sustainable. One person often ends up as the default primary carer, which leads to burnout. Understanding the full scope of the role early — and actively distributing tasks — is one of the most important things a new carer can do." },
    },
    {
      '@type': 'Question',
      name: 'How do I share caregiving responsibilities with siblings?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sharing caregiving with siblings works best when responsibilities are explicitly assigned rather than assumed. Map out all the tasks involved, then assign based on each person\'s capacity and proximity. Being specific about what each person will do — rather than asking generally for help — makes the biggest difference.' },
    },
  ],
}

export default function RolesPage() {
  const { t } = useLocale()

  return (
    <>
      <PageSEO
        title={t('new_carer.roles_page_title')}
        description={t('new_carer.roles_meta_desc')}
        canonical="/new-carer/roles"
        structuredData={[breadcrumbSchema, faqSchema]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Breadcrumbs homeTo="/new-carer" homeLabel={t('nav.new_carer')} items={[{ label: t('new_carer.roles_title') }]} />
          </div>

          <SectionIntro
            eyebrow={t('new_carer.roles_eyebrow')}
            title={t('new_carer.roles_title')}
            subtitle={t('new_carer.roles_subtitle')}
            intro={t('new_carer.roles_intro')}
            icon={<Users className="w-6 h-6" />}
            className="mb-8"
          />

          {/* One person body */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {t('new_carer.roles_one_person_heading')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('new_carer.roles_one_person_body')}
            </p>
          </div>

          <CalloutPanel variant="emphasis" className="mb-8">
            {t('new_carer.roles_callout')}
          </CalloutPanel>

          {/* Responsibility areas */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              {t('new_carer.roles_areas_heading')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {ROLE_AREAS.map((area) => {
              const Icon = ICON_MAP[area.icon] ?? Users
              return (
                <div
                  key={area.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      {t(area.titleKey)}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{t(area.bodyKey)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <NewCarerCTA
            variant="mid"
            headlineKey="new_carer.cta_mid_roles_headline"
            bodyKey="new_carer.cta_mid_roles_body"
            source="new-carer-roles-mid"
            className="mb-8"
          />

          {/* Questions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm mb-8">
            <QuestionPromptList
              questionKeys={ROLE_QUESTIONS}
              headingKey="new_carer.roles_questions_heading"
            />
          </div>

          <NewCarerCTA
            variant="end"
            headlineKey="new_carer.cta_end_roles_headline"
            bodyKey="new_carer.cta_end_roles_body"
            source="new-carer-roles-end"
            className="mb-8"
          />

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="roles" />
          </div>
        </div>
      </div>
    </>
  )
}
