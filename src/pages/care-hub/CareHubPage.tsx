import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList, Activity, ArrowRight } from 'lucide-react'
import { useActiveTeam } from '../../context/ActiveTeam'
import PageSEO from '../../components/seo/PageSEO'

const tools = [
  {
    icon: BookOpen,
    title: 'Memory Book',
    subtitle: 'Know the person',
    description:
      'Build a shared reference for the person being cared for, including preferences, important details, health context, providers, contacts, and practical information caregivers need day to day.',
    cta: 'Open Memory Book',
    href: '/caregiver/memory-schedule',
    accent: 'teal',
  },
  {
    icon: ClipboardList,
    title: 'Care Plan',
    subtitle: 'Coordinate the team',
    description:
      'Create the caregiver team\u2019s big-picture plan: what is happening, who is responsible, what authority exists, what risks need attention, and when the plan should be reviewed.',
    cta: 'Open Care Plan',
    href: '/care-hub/care-plan',
    accent: 'blue',
  },
  {
    icon: Activity,
    title: 'Observations',
    subtitle: 'Track change',
    description:
      'Record functional observations over time so the care team can see what is changing and make better decisions as needs evolve.',
    cta: 'Open Observations',
    href: '/caregiver/observations/new',
    accent: 'amber',
  },
] as const

const accentStyles = {
  teal: {
    icon: 'bg-teal-50 text-teal-600',
    subtitle: 'text-teal-700',
    border: 'hover:border-teal-200',
    cta: 'text-teal-700 hover:text-teal-900',
    dot: 'bg-teal-500',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-600',
    subtitle: 'text-blue-700',
    border: 'hover:border-blue-200',
    cta: 'text-blue-700 hover:text-blue-900',
    dot: 'bg-blue-500',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600',
    subtitle: 'text-amber-700',
    border: 'hover:border-amber-200',
    cta: 'text-amber-700 hover:text-amber-900',
    dot: 'bg-amber-500',
  },
}

export default function CareHubPage() {
  const { teamId } = useActiveTeam()

  const tools_ = tools.map((t) => {
    if (t.title === 'Memory Book' && !teamId) {
      return { ...t, href: '/caregiver/memory-schedule' }
    }
    return t
  })

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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Subscriber tools
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Care Hub
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              Care Hub brings together the three core tools for organising care: Memory Book, Care
              Plan, and Observations. Each tool has a different purpose, so your care team can
              understand the person, coordinate responsibilities, and track change over time.
            </p>
          </div>
        </div>

        {/* ── Three-card grid ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools_.map((tool) => {
              const styles = accentStyles[tool.accent]
              const Icon = tool.icon
              return (
                <div
                  key={tool.title}
                  className={`bg-white rounded-2xl border border-slate-200 ${styles.border} shadow-sm hover:shadow-md transition-all duration-200 p-7 flex flex-col`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${styles.icon} flex items-center justify-center mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-slate-900 mb-1">{tool.title}</h2>
                  <p className={`text-sm font-semibold ${styles.subtitle} mb-4`}>{tool.subtitle}</p>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-6">
                    {tool.description}
                  </p>

                  {/* CTA */}
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

        {/* ── Mental model framing ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-slate-900 rounded-2xl p-8 md:p-10">
            <h2 className="text-base font-semibold text-slate-300 uppercase tracking-wider mb-6">
              How the tools work together
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  label: 'Memory Book',
                  tag: 'Know the person',
                  body: 'Built with and about the resident. A day-to-day reference covering identity, health, preferences, contacts, and practical details.',
                  dot: 'bg-teal-400',
                },
                {
                  label: 'Care Plan',
                  tag: 'Coordinate the team',
                  body: 'Built by the care team. Covers the big-picture operating plan: who does what, what authority exists, living arrangements, and when to review.',
                  dot: 'bg-blue-400',
                },
                {
                  label: 'Observations',
                  tag: 'Track change',
                  body: 'Periodic functional tracking. Helps the team see how the resident is changing over time and make better decisions as needs evolve.',
                  dot: 'bg-amber-400',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                    <span className="text-sm font-bold text-white">{item.label}</span>
                  </div>
                  <p className="text-xs font-semibold mb-2 text-slate-300">
                    {item.tag}
                  </p>
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
