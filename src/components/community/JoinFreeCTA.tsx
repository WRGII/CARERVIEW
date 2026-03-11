import { Link } from 'react-router-dom'
import { Heart, Users, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'

const BENEFITS = [
  {
    icon: Users,
    text: 'Connect with caregivers who truly understand',
  },
  {
    icon: Heart,
    text: 'Share experiences and get peer support',
  },
  {
    icon: ShieldCheck,
    text: 'Post anonymously when you need privacy',
  },
]

interface Props {
  variant?: 'banner' | 'card' | 'inline'
  context?: string
  className?: string
}

export default function JoinFreeCTA({ variant = 'banner', context, className = '' }: Props) {
  if (variant === 'inline') {
    return (
      <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
        <p className="text-slate-600 text-sm">
          {context ?? 'Join the community to post and connect with other caregivers.'}
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/create-account?plan=free&source=community"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Sparkles className="w-4 h-4" />
            Join free
          </Link>
          <Link
            to="/#get-started"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border border-slate-200 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-cyan-50 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-cyan-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Join the Community</h3>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
          {context ?? 'Free for all caregivers. No subscription required.'}
        </p>
        <ul className="space-y-2 mb-5">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon
            return (
              <li key={i} className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span className="text-sm text-slate-600">{b.text}</span>
              </li>
            )
          })}
        </ul>
        <Link
          to="/create-account?plan=free&source=community"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Sparkles className="w-4 h-4" />
          Create free account
        </Link>
        <p className="text-center text-xs text-slate-400 mt-2">
          Already registered?{' '}
          <Link to="/#get-started" className="text-cyan-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-cyan-50 via-white to-slate-50 border border-cyan-100 rounded-2xl p-8 sm:p-10 ${className}`}>
      <div className="max-w-xl mx-auto text-center">
        <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Users className="w-7 h-7 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Join the Caregiver Community — free
        </h2>
        <p className="text-slate-500 leading-relaxed mb-6 text-base">
          {context ?? 'Read discussions, share your experience, and connect with caregivers who understand what you\'re going through. No subscription needed.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-8 text-sm text-slate-600">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon
            return (
              <span key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5">
                <Icon className="w-3.5 h-3.5 text-cyan-600" />
                {b.text}
              </span>
            )
          })}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/create-account?plan=free&source=community"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 text-base"
          >
            <Sparkles className="w-5 h-5" />
            Create free account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/#get-started"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-base"
          >
            Already registered? Sign in
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Community is free. Structured care tracking features are part of paid plans.
        </p>
      </div>
    </div>
  )
}
