// src/pages/new-carer/BigPicturePage.tsx
import React from 'react'
import { Compass, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import PageSEO from '../../components/seo/PageSEO'
import SectionIntro from '../../components/new-carer/SectionIntro'
import CalloutPanel from '../../components/new-carer/CalloutPanel'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import NewCarerBreadcrumb from '../../components/new-carer/NewCarerBreadcrumb'

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

export default function BigPicturePage() {
  const { t } = useLocale()

  return (
    <>
      <PageSEO
        title={t('new_carer.bp_page_title')}
        description={t('new_carer.bp_meta_desc')}
        canonical="/new-carer/big-picture"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <NewCarerBreadcrumb />
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

          <CalloutPanel variant="emphasis" className="mb-10">
            {t('new_carer.bp_callout')}
          </CalloutPanel>

          {/* Module nav */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <ModuleNavGrid currentModuleId="big-picture" />
          </div>
        </div>
      </div>
    </>
  )
}
