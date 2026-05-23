import { useState, lazy, Suspense, useEffect } from 'react'
import { setLastModule } from '../../lib/lastModule'
import { Link } from 'react-router-dom'
import { ArrowLeft, ClipboardList, CircleCheck as CheckCircle2, Circle, Clock, ChevronRight, BookOpen, Activity } from 'lucide-react'
import { useActiveTeam } from '../../context/ActiveTeam'
import { useAuth } from '../../hooks/useAuth'
import { useTeamRole, useTeamResident } from '../../hooks/useMemoryBook'
import {
  useCarePlanReadOnly,
  useCarePlanSections,
  SECTION_KEYS,
  SECTION_LABELS,
  SECTION_SUBTITLES,
  getSectionByKey,
  countCompletedSections,
  type SectionKey,
  type CarePlan,
  type CarePlanSection,
} from '../../hooks/useCarePlan'
import { supabase } from '../../lib/supabaseClient'
import PageSEO from '../../components/seo/PageSEO'
import { useLocale } from '../../i18n/LocaleContext'

const SectionFormModal = lazy(() => import('../../components/care-plan/SectionFormModal'))

function SuspenseFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'complete')
    return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
  if (status === 'in_progress')
    return <Clock className="w-5 h-5 text-blue-400 shrink-0" />
  return <Circle className="w-5 h-5 text-slate-300 shrink-0" />
}

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  if (status === 'complete')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
        {t('care_plan.status_complete')}
      </span>
    )
  if (status === 'in_progress')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        {t('care_plan.status_in_progress')}
      </span>
    )
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
      {t('care_plan.status_not_started')}
    </span>
  )
}

function NoTeamState({ t }: { t: (k: string) => string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <ClipboardList className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{t('care_plan.no_team_title')}</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {t('care_plan.no_team_body')}
        </p>
        <Link
          to="/caregiver"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          {t('care_plan.go_to_dashboard')}
        </Link>
      </div>
    </div>
  )
}

function SectionCard({
  sectionKey,
  section,
  index,
  isOwner,
  onOpen,
  t,
}: {
  sectionKey: SectionKey
  section: CarePlanSection | undefined
  index: number
  isOwner: boolean
  onOpen: (key: SectionKey) => void
  t: (k: string) => string
}) {
  const status = section?.completion_status ?? 'not_started'

  return (
    <button
      onClick={() => onOpen(sectionKey)}
      className="w-full text-left bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-200 p-6 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <div className="flex items-start gap-4">
        {/* Number */}
        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors shrink-0 mt-0.5">
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="text-base font-bold text-slate-900">
              {SECTION_LABELS[sectionKey]}
            </h3>
            <StatusBadge status={status} t={t} />
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            {SECTION_SUBTITLES[sectionKey]}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <StatusIcon status={status} />
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </button>
  )
}

export default function CarePlanBuilderPage() {
  useEffect(() => { setLastModule('care_plan'); }, [])
  const { t } = useLocale()
  const { teamId } = useActiveTeam()
  const { user } = useAuth()
  const { data: teamRole, isLoading: teamRoleLoading } = useTeamRole(teamId, user?.id)
  const isOwner = teamRole === 'owner'
  const { data: resident } = useTeamResident(teamId ?? null)

  const { data: carePlan, isLoading: planLoading, error: planError, refetch: refetchPlan } = useCarePlanReadOnly(teamId)
  const { data: sections = [], isLoading: sectionsLoading } = useCarePlanSections(carePlan?.id)

  const [openSection, setOpenSection] = useState<SectionKey | null>(null)
  const [creating, setCreating] = useState(false)

  async function handleCreatePlan() {
    if (!teamId || !user?.id || !isOwner) return
    setCreating(true)
    try {
      await supabase
        .from('care_plans')
        .insert({ team_id: teamId, created_by: user.id, status: 'draft' })
      await refetchPlan()
    } finally {
      setCreating(false)
    }
  }

  const isLoading = planLoading || sectionsLoading || teamRoleLoading
  const completedCount = countCompletedSections(sections)
  const totalCount = SECTION_KEYS.length

  if (!teamId) return <NoTeamState t={t} />

  return (
    <>
      <PageSEO
        title="Care Plan — Care Hub"
        description="Coordinate your care team with a big-picture strategic plan covering situation, authority, responsibilities, living arrangements, sustainability, and review."
        canonical="/care-hub/care-plan"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
        {/* ── Header ── */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <Link to="/care-hub" className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('care_hub.title')}
              </Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">{t('care_plan.title')}</span>
            </nav>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                  {t('care_plan.title')}
                </h1>
                <p className="text-base text-blue-700 font-semibold mb-3">{t('care_plan.subtitle')}</p>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                  {t('care_plan.description')}
                </p>
              </div>
            </div>

            {/* Resident context strip */}
            {resident && (
              <Link
                to="/caregiver/resident"
                className="mt-5 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:border-slate-300 hover:bg-slate-100 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-slate-600">
                    {resident.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('care_plan.care_plan_for')}</span>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {resident.preferred_name ? `${resident.full_name} ("${resident.preferred_name}")` : resident.full_name}
                    {resident.date_of_birth && (() => {
                      const dob = new Date(resident.date_of_birth)
                      const today = new Date()
                      let age = today.getFullYear() - dob.getFullYear()
                      const m = today.getMonth() - dob.getMonth()
                      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
                      return <span className="font-normal text-slate-500"> · Age {age}</span>
                    })()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
              </Link>
            )}

            {/* How this differs callout */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/caregiver/memory-schedule"
                className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-100 rounded-xl hover:border-teal-200 hover:bg-teal-100 transition-colors group"
              >
                <BookOpen className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-teal-900">{t('care_plan.memory_book_label')}</p>
                  <p className="text-xs text-teal-700">{t('care_plan.memory_book_desc')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/caregiver/observations/new"
                className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl hover:border-amber-200 hover:bg-amber-100 transition-colors group"
              >
                <Activity className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">{t('care_plan.observations_label')}</p>
                  <p className="text-xs text-amber-700">{t('care_plan.observations_desc')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Progress */}
          {!isLoading && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-700">
                  {t('care_plan.progress_label')
                    .replace('{completed}', String(completedCount))
                    .replace('{total}', String(totalCount))}
                </p>
                {completedCount === totalCount && (
                  <Link
                    to="/care-hub/care-plan/summary"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {t('care_plan.view_summary')} →
                  </Link>
                )}
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
              </div>
            </div>
          )}

          {/* Error */}
          {planError && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-800">
              {t('care_plan.load_error')}
            </div>
          )}

          {/* No plan yet */}
          {!isLoading && !carePlan && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
                <ClipboardList className="w-7 h-7 text-blue-600" />
              </div>
              {isOwner ? (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">{t('care_plan.start_title')}</h2>
                  <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                    {t('care_plan.start_body')}
                  </p>
                  <button
                    onClick={handleCreatePlan}
                    disabled={creating}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    {creating ? t('care_plan.creating') : t('care_plan.create_button')}
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">{t('care_plan.no_plan_title')}</h2>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {t('care_plan.no_plan_body')}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Section cards */}
          {!isLoading && carePlan && (
            <div className="space-y-3">
              {SECTION_KEYS.map((key, i) => (
                <SectionCard
                  key={key}
                  sectionKey={key}
                  section={getSectionByKey(sections, key)}
                  index={i}
                  isOwner={isOwner}
                  onOpen={setOpenSection}
                  t={t}
                />
              ))}
            </div>
          )}

          {/* Summary link */}
          {!isLoading && carePlan && completedCount > 0 && (
            <div className="mt-8 flex justify-center">
              <Link
                to="/care-hub/care-plan/summary"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <ClipboardList className="w-4 h-4" />
                {completedCount === totalCount ? t('care_plan.view_summary_full') : t('care_plan.view_summary_partial')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Section form modal */}
      {openSection && carePlan && (
        <Suspense fallback={<SuspenseFallback />}>
          <SectionFormModal
            sectionKey={openSection}
            carePlan={carePlan}
            section={getSectionByKey(sections, openSection)}
            isOwner={isOwner}
            onClose={() => setOpenSection(null)}
            onNavigate={(key) => setOpenSection(key)}
          />
        </Suspense>
      )}
    </>
  )
}
