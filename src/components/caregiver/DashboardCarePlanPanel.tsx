import { Link } from 'react-router-dom'
import {
  ClipboardList,
  ChevronRight,
  CircleCheck as CheckCircle2,
  Circle,
  Clock,
  TriangleAlert as AlertTriangle,
} from 'lucide-react'
import { useActiveTeam } from '../../context/ActiveTeam'
import {
  useCarePlanReadOnly,
  useCarePlanSections,
  SECTION_KEYS,
  SECTION_LABELS,
  countCompletedSections,
  type SectionKey,
} from '../../hooks/useCarePlan'
import { detectGaps, countBySeverity } from '../../lib/carePlanGaps'
import { useLocale } from '../../i18n/LocaleContext'

function SectionDot({ status }: { status: string }) {
  if (status === 'complete') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
  if (status === 'in_progress') return <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
  return <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
}

export default function DashboardCarePlanPanel() {
  const { t } = useLocale()
  const { teamId } = useActiveTeam()
  const { data: carePlan, isLoading: planLoading } = useCarePlanReadOnly(teamId)
  const { data: sections = [], isLoading: sectionsLoading } = useCarePlanSections(carePlan?.id)

  if (!teamId || planLoading || sectionsLoading) return null

  const completedCount = countCompletedSections(sections)
  const total = SECTION_KEYS.length
  const progressPct = Math.round((completedCount / total) * 100)
  const sectionMap = new Map(sections.map((s) => [s.section_key, s]))
  const gaps = carePlan ? detectGaps(sections, t) : []
  const counts = countBySeverity(gaps)
  const allDone = completedCount === total && gaps.length === 0
  const hasStarted = !!carePlan && completedCount > 0

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Care Plan</p>
            <p className="text-xs font-semibold text-blue-700">Coordinate the team</p>
          </div>
        </div>
        <Link
          to="/care-hub/care-plan"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {hasStarted ? (allDone ? 'Review' : 'Continue') : 'Start'}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{completedCount}</span> of {total} sections complete
            </p>
            {hasStarted && (
              <Link
                to="/care-hub/care-plan/summary"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                View summary →
              </Link>
            )}
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Section rows */}
        <div className="grid grid-cols-2 gap-1.5">
          {SECTION_KEYS.map((key: SectionKey) => {
            const section = sectionMap.get(key)
            const status = section?.completion_status ?? 'not_started'
            return (
              <div key={key} className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50">
                <SectionDot status={status} />
                <span className="text-xs font-medium text-slate-700 truncate">{SECTION_LABELS[key]}</span>
              </div>
            )
          })}
        </div>

        {/* All done */}
        {allDone && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <p className="text-xs font-semibold text-emerald-900">All sections complete</p>
          </div>
        )}

        {/* Gap badges */}
        {gaps.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {counts.critical > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-xs font-medium text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {counts.critical} critical gap{counts.critical !== 1 ? 's' : ''}
              </span>
            )}
            {counts.important > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-xs font-medium text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {counts.important} important
              </span>
            )}
            {counts.monitor > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                {counts.monitor} to monitor
              </span>
            )}
          </div>
        )}
      </div>

      {/* Critical alert strip */}
      {counts.critical > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border-t border-red-100 px-5 py-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <p className="text-xs text-red-800 font-medium">
            {counts.critical} critical gap{counts.critical !== 1 ? 's' : ''} need attention
          </p>
        </div>
      )}
    </div>
  )
}
