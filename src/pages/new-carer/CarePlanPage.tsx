// src/pages/new-carer/CarePlanPage.tsx
import React from 'react'
import { ClipboardList } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import PlanningPillarCard from '../../components/new-carer/PlanningPillarCard'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import NewCarerBreadcrumb from '../../components/new-carer/NewCarerBreadcrumb'
import { CARE_PLAN_PILLARS } from '../../content/newCarerContent'

export default function CarePlanPage() {
  const { t } = useLocale()

  return (
    <>
      <PageSEO
        title={t('new_carer.cp_page_title')}
        description={t('new_carer.cp_meta_desc')}
        canonical="/new-carer/care-plan"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <NewCarerBreadcrumb />
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

          <CalloutPanel variant="emphasis" className="mb-10">
            {t('new_carer.cp_callout')}
          </CalloutPanel>

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="care-plan" />
          </div>
        </div>
      </div>
    </>
  )
}
