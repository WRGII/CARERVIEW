import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList, ChevronRight, Lightbulb, ListChecks, Zap } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'

export default function DashboardCareBookPanel() {
  const { t } = useLocale()

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="px-6 pt-6 pb-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-4.5 h-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Your Care Book</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              The complete record your whole care team can rely on
            </p>
          </div>
        </div>

        {/* Three pillars */}
        <div className="space-y-4">
          {/* Why */}
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 mb-1">Why it matters</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Caregiving involves many people across many moments. A shared record prevents gaps, duplicated effort, and decisions made without the full picture.
              </p>
            </div>
          </div>

          {/* What */}
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <ListChecks className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 mb-1">What it contains</p>
              <ul className="text-xs text-slate-400 leading-relaxed space-y-0.5">
                <li className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <span><span className="font-semibold text-slate-300">Memory Book</span> — identity, contacts, medical history, daily routines and preferences</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span><span className="font-semibold text-slate-300">Care Plan</span> — living situation, authority, roles, responsibilities and sustainability</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How */}
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 mb-1">How to build it</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fill each section as you learn details — no need to complete it in one sitting. Start with what you know today.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action strip */}
      <div className="border-t border-white/10 grid grid-cols-2 divide-x divide-white/10">
        <Link
          to="/caregiver/memory-schedule"
          className="flex items-center justify-between gap-2 px-5 py-3.5 hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">Memory Book</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
        </Link>
        <Link
          to="/care-hub/care-plan"
          className="flex items-center justify-between gap-2 px-5 py-3.5 hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">Care Plan</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  )
}
