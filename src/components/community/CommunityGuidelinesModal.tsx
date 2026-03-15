import { useState } from 'react'
import { Heart, ShieldCheck, Users, Sparkles, TriangleAlert as AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button'
import { useUpdateCommunityProfile } from '../../hooks/useCommunityProfile'

interface Props {
  onAccepted: () => void
}

export default function CommunityGuidelinesModal({ onAccepted }: Props) {
  const [accepted, setAccepted] = useState(false)
  const updateProfile = useUpdateCommunityProfile()

  const handleAgree = async () => {
    if (!accepted) return
    await updateProfile.mutateAsync({
      guidelines_accepted_at: new Date().toISOString(),
    })
    onAccepted()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="h-1.5 bg-slate-100">
          <div className="h-full bg-cyan-primary w-full" />
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 bg-cyan-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-cyan-600" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 text-center mb-1">
            Community Guidelines
          </h2>
          <p className="text-slate-500 text-sm text-center mb-6">
            Before you join the conversation, please take a moment to read our community guidelines.
          </p>

          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
            {[
              {
                icon: <Heart className="w-4 h-4 text-cyan-600" />,
                title: 'Be kind and supportive',
                body: 'Treat everyone with empathy. We are all navigating difficult situations.',
              },
              {
                icon: <ShieldCheck className="w-4 h-4 text-cyan-600" />,
                title: 'Protect privacy',
                body: 'Do not share identifying details about your loved ones or other caregivers.',
              },
              {
                icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
                title: 'No medical advice',
                body: 'Share your experiences, but never recommend treatments or diagnoses. Always consult a professional.',
              },
              {
                icon: <Users className="w-4 h-4 text-cyan-600" />,
                title: 'No harassment or hate',
                body: 'Bullying, discrimination, and personal attacks will result in an immediate ban.',
              },
              {
                icon: <Sparkles className="w-4 h-4 text-cyan-600" />,
                title: 'No spam or self-promotion',
                body: 'Keep posts relevant to caregiving. Commercial promotion is not allowed.',
              },
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="mt-0.5 flex-shrink-0">{rule.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{rule.title}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{rule.body}</p>
                </div>
              </div>
            ))}
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-6 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-primary flex-shrink-0"
            />
            <span className="text-sm text-slate-700 leading-relaxed">
              I have read and agree to follow the community guidelines
            </span>
          </label>

          {updateProfile.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">
                {(updateProfile.error as Error)?.message ?? 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!accepted || updateProfile.isPending}
            onClick={handleAgree}
          >
            {updateProfile.isPending ? 'Saving…' : 'Enter Community'}
          </Button>
        </div>
      </div>
    </div>
  )
}
