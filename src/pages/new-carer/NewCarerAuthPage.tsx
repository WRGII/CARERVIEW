import { CircleCheck as CheckCircle, ArrowRight, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import ModuleNavGrid from '../../components/new-carer/ModuleNavGrid'
import ResourceCard from '../../components/new-carer/ResourceCard'
import NewCarerCTA from '../../components/new-carer/NewCarerCTA'
import { WORKSHEET_RESOURCES } from '../../content/newCarerContent'

const HELPS_KEYS = ['new_carer.helps_1', 'new_carer.helps_2', 'new_carer.helps_3']
const USE_WHEN_KEYS = ['new_carer.use_when_1', 'new_carer.use_when_2', 'new_carer.use_when_3', 'new_carer.use_when_4']

export default function NewCarerAuthPage() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Section A: Header ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-7 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-3">
                {t('new_carer.hero_eyebrow')}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-3">
                {t('new_carer.hero_title')}
              </h1>
              <p className="text-base font-semibold text-teal-700 leading-snug">
                {t('new_carer.hero_subtitle')}
              </p>
            </div>
            <div className="p-7 sm:p-8 flex flex-col justify-center">
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {t('new_carer.hero_intro')}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('new_carer.hero_intro_2')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Section B: Summary cards ── */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-teal-600" />
              </span>
              {t('new_carer.helps_title')}
            </h2>
            <ul className="space-y-3">
              {HELPS_KEYS.map((key) => (
                <li key={key} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed">{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-amber-600" />
              </span>
              {t('new_carer.use_when_title')}
            </h2>
            <ul className="space-y-3">
              {USE_WHEN_KEYS.map((key) => (
                <li key={key} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed">{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Section C: Module navigator ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {t('new_carer.modules_intro')}
          </p>
          <ModuleNavGrid />
          <div className="mt-6">
            <NewCarerCTA
              variant="mid"
              headlineKey="new_carer.cta_mid_hub_headline"
              bodyKey="new_carer.cta_mid_hub_body"
              source="new-carer-hub-mid"
            />
          </div>
        </div>

        {/* ── Section D: Worksheets + Tutorial ── */}
        <div>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {t('new_carer.ws_all_heading')}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('new_carer.ws_all_intro')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {WORKSHEET_RESOURCES.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>

          {/* Tutorial callout */}
          <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-cyan-primary flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{t('tutorial.callout_heading')}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{t('tutorial.callout_body')}</p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/tutorial"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-hover transition-all duration-200 whitespace-nowrap shadow-sm"
              >
                {t('nav.tutorial')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
