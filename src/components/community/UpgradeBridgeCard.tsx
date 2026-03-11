import { Link } from 'react-router-dom'
import { ClipboardList, TrendingUp, Users, ChevronRight } from 'lucide-react'

type BridgeVariant =
  | 'track_observation'
  | 'coordinate_team'
  | 'see_changes'
  | 'general'

interface BridgeConfig {
  icon: React.ElementType
  heading: string
  body: string
  cta: string
  href: string
}

const CONFIGS: Record<BridgeVariant, BridgeConfig> = {
  track_observation: {
    icon: ClipboardList,
    heading: 'Track this in your care log',
    body: 'Turn what you\'re describing here into a structured observation. CarerView lets you record daily care notes and track changes over time.',
    cta: 'Start tracking',
    href: '/caregiver',
  },
  coordinate_team: {
    icon: Users,
    heading: 'Coordinate with your care team',
    body: 'Share this context with family or professional carers. CarerView\'s team features keep everyone on the same page.',
    cta: 'Set up a care team',
    href: '/caregiver',
  },
  see_changes: {
    icon: TrendingUp,
    heading: 'See how things change over time',
    body: 'Patterns are easier to spot when you track consistently. CarerView\'s observation logs let you see trends across days and weeks.',
    cta: 'Start logging',
    href: '/caregiver',
  },
  general: {
    icon: ClipboardList,
    heading: 'Need more than peer support?',
    body: 'CarerView\'s structured care tools help you track daily observations, coordinate your care team, and monitor changes over time.',
    cta: 'Explore CarerView',
    href: '/why',
  },
}

interface Props {
  variant?: BridgeVariant
  className?: string
}

export default function UpgradeBridgeCard({ variant = 'general', className = '' }: Props) {
  const config = CONFIGS[variant]
  const Icon = config.icon

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-800 mb-1 leading-snug">
            {config.heading}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            {config.body}
          </p>
          <Link
            to={config.href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors group"
          >
            {config.cta}
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
