import { AlertTriangle, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'

const STORAGE_KEY = 'cv_community_guidelines_dismissed'

export default function CommunityGuidelinesBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === '1'
  )

  if (dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800 mb-0.5">Peer support only — not medical advice</p>
        <p className="text-sm text-amber-700 leading-relaxed">
          This community is for sharing experiences and support. Please do not share identifying details about
          those in your care, and do not rely on this community for clinical decisions.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-amber-600">Content is moderated. Report anything concerning.</span>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label="Dismiss guidelines reminder"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
