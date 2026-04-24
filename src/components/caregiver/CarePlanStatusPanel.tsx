import { Link } from 'react-router-dom'
import { ClipboardList, ChevronRight, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from 'lucide-react'
import { useActiveTeam } from '../../context/ActiveTeam'
import { useCarePlanReadOnly, useCarePlanSections, SECTION_KEYS, countCompletedSections } from '../../hooks/useCarePlan'
import { detectGaps, getTopPriorities, countBySeverity } from '../../lib/carePlanGaps'

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  important: 'bg-amber-500',
  monitor: 'bg-slate-400',
}

const SEVERITY_TEXT: Record<string, string> = {
  critical: 'text-red-800',
  important: 'text-amber-900',
  monitor: 'text-slate-700',
}

export default function CarePlanStatusPanel() {
  const { teamId } = useActiveTeam()
  const { data: carePlan, isLoading: planLoading } = useCarePlanReadOnly(teamId)
  const { data: sections = [], isLoading: sectionsLoading } = useCarePlanSections(carePlan?.id)

  // Don't render anything while loading or if no plan exists yet
  if (planLoading || sectionsLoading) return null
  if (!carePlan) return null

  const completedCount = countCompletedSections(sections)
  const total = SECTION_KEYS.length
  const progressPct = Math.round((completedCount / total) * 100)
  const gaps = detectGaps(sections)
  const topGaps = getTopPriorities(gaps, 3)
  const counts = countBySeverity(gaps)
  const allDone = completedCount === total && gaps.length === 0

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Care Plan</p>
            <p className="text-xs text-slate-500">{completedCount} of {total} sections complete</p>
          </div>
        </div>
        <Link
          to="/care-hub/care-plan"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {completedCount > 0 ? 'Open' : 'Start'}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-4 pb-3">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Content */}
      {allDone ? (
        <div className="px-5 pb-4 flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">All sections complete — no gaps identified.</span>
          <Link to="/care-hub/care-plan/summary" className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap">
            View summary →
          </Link>
        </div>
      ) : completedCount === 0 ? (
        <div className="px-5 pb-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Your care team doesn&apos;t have a Care Plan yet. Building one helps coordinate responsibilities, authority, and sustainability.
          </p>
          <Link
            to="/care-hub/care-plan"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Start building
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="px-5 pb-4">
          {/* Gap summary pill row */}
          {gaps.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-600">{gaps.length} gap{gaps.length !== 1 ? 's' : ''}</span>
              {counts.critical > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-xs font-medium text-red-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {counts.critical} critical
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
                  {counts.monitor} monitor
                </span>
              )}
            </div>
          )}

          {/* Top gaps */}
          {topGaps.length > 0 && (
            <div className="space-y-1.5">
              {topGaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${SEVERITY_DOT[gap.severity]}`} />
                  <p className={`text-xs leading-relaxed ${SEVERITY_TEXT[gap.severity]}`}>{gap.label}</p>
                </div>
              ))}
              {gaps.length > 3 && (
                <p className="text-xs text-slate-400 pl-3.5">+{gaps.length - 3} more</p>
              )}
            </div>
          )}

          {/* No gaps but incomplete */}
          {gaps.length === 0 && completedCount < total && (
            <p className="text-xs text-slate-500">
              No gaps in completed sections. {total - completedCount} section{total - completedCount !== 1 ? 's' : ''} still to complete.
            </p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <Link
              to="/care-hub/care-plan"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Continue building →
            </Link>
            {completedCount > 0 && (
              <Link
                to="/care-hub/care-plan/summary"
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                View summary
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Alert strip for critical gaps */}
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
