import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList, Activity, ArrowRight, ChevronRight, CircleCheck as CheckCircle2, Circle, Clock, TriangleAlert as AlertTriangle } from 'lucide-react'
import { useActiveTeam } from '../../context/ActiveTeam'
import { useOnboarding } from '../../hooks/useOnboarding'
import { useCarePlanReadOnly, useCarePlanSections, SECTION_KEYS, SECTION_LABELS, countCompletedSections, type SectionKey } from '../../hooks/useCarePlan'
import { detectGaps, getTopPriorities, countBySeverity, getNextStep } from '../../lib/carePlanGaps'
import PageSEO from '../../components/seo/PageSEO'

// ── Tool card definitions ─────────────────────────────────────────────────────

const TOOLS = [
  {
    icon: BookOpen,
    title: 'Memory Book',
    subtitle: 'Know the person',
    description:
      'Build a shared reference for the person being cared for — preferences, health context, providers, contacts, and practical information caregivers need day to day.',
    cta: 'Open Memory Book',
    href: '/caregiver/memory-schedule',
    accent: 'teal' as const,
  },
  {
    icon: ClipboardList,
    title: 'Care Plan',
    subtitle: 'Coordinate the team',
    description:
      'Create the care team\u2019s big-picture operating plan: who is responsible for what, what authority exists, what risks need attention, and when to review.',
    cta: 'Open Care Plan',
    href: '/care-hub/care-plan',
    accent: 'blue' as const,
  },
  {
    icon: Activity,
    title: 'Observations',
    subtitle: 'Track change',
    description:
      'Record functional observations over time so the care team can see what is changing and make informed decisions as needs evolve.',
    cta: 'Open Observations',
    href: '/caregiver/observations/new',
    accent: 'amber' as const,
  },
] as const

const ACCENT = {
  teal: {
    icon: 'bg-teal-50 text-teal-600',
    subtitle: 'text-teal-700',
    border: 'hover:border-teal-200',
    cta: 'text-teal-700 hover:text-teal-900',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-600',
    subtitle: 'text-blue-700',
    border: 'hover:border-blue-200',
    cta: 'text-blue-700 hover:text-blue-900',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600',
    subtitle: 'text-amber-700',
    border: 'hover:border-amber-200',
    cta: 'text-amber-700 hover:text-amber-900',
  },
}

// ── Section status icon ───────────────────────────────────────────────────────

function SectionDot({ status }: { status: string }) {
  if (status === 'complete') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  if (status === 'in_progress') return <Clock className="w-4 h-4 text-blue-400" />
  return <Circle className="w-4 h-4 text-slate-300" />
}

// ── Care Plan live panel ──────────────────────────────────────────────────────

function CarePlanLivePanel({ carePlanId }: { carePlanId: string }) {
  const { data: sections = [], isLoading } = useCarePlanSections(carePlanId)

  if (isLoading) return (
    <div className="flex gap-1.5 py-4 px-6">
      <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" />
    </div>
  )

  const completedCount = countCompletedSections(sections)
  const total = SECTION_KEYS.length
  const progressPct = Math.round((completedCount / total) * 100)
  const gaps = detectGaps(sections)
  const topGaps = getTopPriorities(gaps, 3)
  const counts = countBySeverity(gaps)
  const nextStep = getNextStep(gaps)
  const allDone = completedCount === total && gaps.length === 0

  const sectionMap = new Map(sections.map((s) => [s.section_key, s]))

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">
            {completedCount} of {total} sections complete
          </p>
          {completedCount > 0 && (
            <Link to="/care-hub/care-plan/summary" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              View summary →
            </Link>
          )}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Section list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SECTION_KEYS.map((key: SectionKey) => {
          const section = sectionMap.get(key)
          const status = section?.completion_status ?? 'not_started'
          return (
            <div key={key} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <SectionDot status={status} />
              <span className="text-xs font-medium text-slate-700 truncate">{SECTION_LABELS[key]}</span>
            </div>
          )
        })}
      </div>

      {/* All done */}
      {allDone && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-900">All sections complete — no gaps identified.</p>
        </div>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">{gaps.length} gap{gaps.length !== 1 ? 's' : ''} identified</span>
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
                {counts.monitor} to monitor
              </span>
            )}
          </div>

          {/* Top gaps */}
          <div className="space-y-2">
            {topGaps.map((gap, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                gap.severity === 'critical' ? 'bg-red-50 border-red-100' : gap.severity === 'important' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  gap.severity === 'critical' ? 'bg-red-500' : gap.severity === 'important' ? 'bg-amber-500' : 'bg-slate-400'
                }`} />
                <div>
                  <p className={`text-xs font-semibold ${gap.severity === 'critical' ? 'text-red-900' : 'text-amber-900'}`}>{gap.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{gap.action}</p>
                </div>
              </div>
            ))}
            {gaps.length > 3 && (
              <p className="text-xs text-slate-400 pl-1">+{gaps.length - 3} more gaps — <Link to="/care-hub/care-plan/summary" className="text-blue-600 hover:underline">view all</Link></p>
            )}
          </div>

          {/* Next step highlight */}
          {nextStep && counts.critical > 0 && (
            <div className="flex items-start gap-2.5 bg-white border border-slate-200 rounded-xl p-4">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 mb-0.5">Most urgent next step</p>
                <p className="text-xs text-slate-600 leading-relaxed">{nextStep}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Link
        to="/care-hub/care-plan"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      >
        <ClipboardList className="w-4 h-4" />
        {completedCount === 0 ? 'Start Care Plan' : completedCount === total ? 'Review Care Plan' : 'Continue Care Plan'}
      </Link>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CareHubPage() {
  const { teamId } = useActiveTeam()
  const { markCareHubVisited, careHubVisited } = useOnboarding()
  const { data: carePlan, isLoading: planLoading } = useCarePlanReadOnly(teamId)

  // Mark visited on mount — idempotent (only fires the upsert if not already set)
  useEffect(() => {
    if (!careHubVisited) {
      markCareHubVisited()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasPlan = !planLoading && !!carePlan
  const isFirstVisit = !careHubVisited

  return (
    <>
      <PageSEO
        title="Care Hub — CarerView"
        description="Care Hub brings together Memory Book, Care Plan, and Observations — the three core tools for organising care."
        canonical="/care-hub"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* ── Header ── */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Subscriber tools</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Care Hub</h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              {isFirstVisit
                ? 'Welcome to Care Hub. Your subscriber toolkit has three parts — each with a different purpose. Start with Care Plan to coordinate your care team.'
                : 'Your subscriber toolkit — Memory Book, Care Plan, and Observations.'}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

          {/* ── Care Plan Decision Engine panel (when plan exists) ── */}
          {hasPlan && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Care Plan</h2>
                  <p className="text-xs text-blue-700 font-semibold">Coordinate the team</p>
                </div>
              </div>
              <div className="p-6">
                <CarePlanLivePanel carePlanId={carePlan!.id} />
              </div>
            </div>
          )}

          {/* ── No plan yet: Care Plan CTA ── */}
          {!planLoading && !hasPlan && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-900 mb-1">Start your Care Plan</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A Care Plan helps your team coordinate who does what, what authority is in place, and when to review. It takes about 20 minutes to build a first draft.
                </p>
              </div>
              <Link
                to="/care-hub/care-plan"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
              >
                Start building
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* ── Three tool cards ── */}
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">All tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TOOLS.map((tool) => {
                const styles = ACCENT[tool.accent]
                const Icon = tool.icon
                return (
                  <div
                    key={tool.title}
                    className={`bg-white rounded-2xl border border-slate-200 ${styles.border} shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${styles.icon} flex items-center justify-center mb-4`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-0.5">{tool.title}</h3>
                    <p className={`text-xs font-semibold ${styles.subtitle} mb-3`}>{tool.subtitle}</p>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-5">{tool.description}</p>
                    <Link
                      to={tool.href}
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${styles.cta} group transition-colors`}
                    >
                      {tool.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Mental model framing (always shown, more compact when plan active) ── */}
          <div className="bg-slate-900 rounded-2xl p-7 md:p-9">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">How the tools work together</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  label: 'Memory Book',
                  tag: 'Know the person',
                  body: 'Built with and about the resident. A reference covering identity, health, preferences, contacts, and practical details.',
                  dot: 'bg-teal-400',
                },
                {
                  label: 'Care Plan',
                  tag: 'Coordinate the team',
                  body: 'Built by the care team. Covers the big-picture operating plan: who does what, authority, risks, living arrangements, and when to review.',
                  dot: 'bg-blue-400',
                },
                {
                  label: 'Observations',
                  tag: 'Track change',
                  body: 'Periodic functional tracking. Helps the team see how the resident is changing and make better decisions as needs evolve.',
                  dot: 'bg-amber-400',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                    <span className="text-sm font-bold text-white">{item.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">{item.tag}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
