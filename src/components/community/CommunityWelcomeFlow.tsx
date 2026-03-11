import { useState } from 'react'
import { Heart, Users, ShieldCheck, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, ChevronRight, Sparkles, CircleUser as UserCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { useCreateCommunityProfile } from '../../hooks/useCommunityProfile'
import { AVATAR_COLORS, generateAvatarColor } from '../../lib/community'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  onComplete: () => void
}

type Step = 'welcome' | 'guidelines' | 'profile'

const CAREGIVER_TYPES = [
  { value: 'family', label: 'Family caregiver', description: 'Caring for a loved one' },
  { value: 'professional', label: 'Professional caregiver', description: 'Working in care' },
  { value: 'both', label: 'Both', description: 'Family & professional' },
]

const TOPIC_INTERESTS = [
  { value: 'dementia', label: 'Dementia & Memory' },
  { value: 'burnout', label: 'Burnout & Stress' },
  { value: 'family', label: 'Family Dynamics' },
  { value: 'tips', label: 'Tips & Tactics' },
  { value: 'new', label: 'New to Caregiving' },
  { value: 'general', label: 'General Support' },
]

export default function CommunityWelcomeFlow({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('welcome')
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false)
  const [handle, setHandle] = useState('')
  const [handleError, setHandleError] = useState('')
  const [caregiverType, setCaregiverType] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0])
  const { user } = useAuth()
  const createProfile = useCreateCommunityProfile()

  const suggestedHandle = (() => {
    const email = user?.email ?? ''
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 20)
    return base || 'Caregiver'
  })()

  const handleInputChange = (v: string) => {
    setHandle(v)
    setHandleError('')
    const clean = v.trim()
    if (clean.length > 0 && clean.length < 3) {
      setHandleError('Handle must be at least 3 characters')
    } else if (clean.length > 30) {
      setHandleError('Handle must be 30 characters or fewer')
    } else if (clean.length > 0 && !/^[a-zA-Z0-9_-]+$/.test(clean)) {
      setHandleError('Only letters, numbers, underscores and hyphens allowed')
    }
  }

  const toggleTopic = (v: string) => {
    setSelectedTopics(prev =>
      prev.includes(v) ? prev.filter(t => t !== v) : [...prev, v]
    )
  }

  const handleFinish = async () => {
    const finalHandle = (handle.trim() || suggestedHandle)
    setHandleError('')
    try {
      await createProfile.mutateAsync({
        handle: finalHandle,
        bio: caregiverType ? `Caregiver type: ${caregiverType}` : '',
        avatar_color: avatarColor,
      })
      onComplete()
    } catch (err: any) {
      if (err?.message?.includes('duplicate') || err?.code === '23505') {
        setHandleError('That handle is already taken. Please choose another.')
      } else {
        setHandleError(err?.message ?? 'Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scale-in_0.2s_ease-out]">

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full bg-cyan-primary transition-all duration-500 ease-out"
            style={{ width: step === 'welcome' ? '33%' : step === 'guidelines' ? '66%' : '100%' }}
          />
        </div>

        {/* ── Step 1: Welcome ── */}
        {step === 'welcome' && (
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-3">
              Welcome to Caregiver Community
            </h2>
            <p className="text-slate-600 text-center leading-relaxed mb-6">
              A safe space for caregivers to share experiences, find practical support,
              and connect with others who truly understand.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <Users className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Peer support</p>
                  <p className="text-sm text-slate-500">Real caregivers sharing real experiences</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Moderated and safe</p>
                  <p className="text-sm text-slate-500">Our team reviews reported content to keep this space respectful</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Not medical advice</p>
                  <p className="text-sm text-slate-500">Nothing here replaces professional medical or care guidance</p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setStep('guidelines')}
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-1 inline" />
            </Button>
          </div>
        )}

        {/* ── Step 2: Guidelines ── */}
        {step === 'guidelines' && (
          <div className="p-8">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-cyan-50 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-cyan-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
              Community Guidelines
            </h2>
            <p className="text-slate-500 text-sm text-center mb-6">
              Please read and accept before joining
            </p>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
              {[
                {
                  icon: <Heart className="w-4 h-4 text-cyan-600" />,
                  title: 'Be kind and supportive',
                  body: 'Treat others with compassion. We are all navigating difficult circumstances.',
                },
                {
                  icon: <ShieldCheck className="w-4 h-4 text-cyan-600" />,
                  title: 'Protect privacy — yours and your care recipient\'s',
                  body: 'Do not share identifying details about the person you care for, such as their full name, location, or diagnosis specifics.',
                },
                {
                  icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
                  title: 'No medical or clinical advice',
                  body: 'Share experiences and coping strategies, but do not advise on specific medications, treatments, or clinical decisions.',
                },
                {
                  icon: <Users className="w-4 h-4 text-cyan-600" />,
                  title: 'No harassment or discrimination',
                  body: 'Hateful, offensive, or personally attacking content is not permitted and will be removed.',
                },
                {
                  icon: <Sparkles className="w-4 h-4 text-cyan-600" />,
                  title: 'No spam or self-promotion',
                  body: 'This is a support space, not an advertising channel. Promotional posts will be removed.',
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
                checked={guidelinesAccepted}
                onChange={e => setGuidelinesAccepted(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-primary flex-shrink-0"
              />
              <span className="text-sm text-slate-700 leading-relaxed">
                I have read and agree to follow the community guidelines, and I understand
                this is peer support — not professional medical advice.
              </span>
            </label>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => setStep('welcome')}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                disabled={!guidelinesAccepted}
                onClick={() => setStep('profile')}
              >
                Accept & Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Profile setup ── */}
        {step === 'profile' && (
          <div className="p-8">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-cyan-50 rounded-full flex items-center justify-center">
                <UserCircle className="w-7 h-7 text-cyan-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 text-center mb-1">
              Set up your community profile
            </h2>
            <p className="text-slate-500 text-sm text-center mb-6">
              Your profile helps others recognise you. You can post anonymously any time.
            </p>

            {/* Handle */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Community handle <span className="text-slate-400 font-normal">(visible to others)</span>
              </label>
              <input
                type="text"
                value={handle}
                onChange={e => handleInputChange(e.target.value)}
                placeholder={suggestedHandle}
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-primary focus:border-transparent text-base"
              />
              {handleError && (
                <p className="text-sm text-red-600 mt-1.5">{handleError}</p>
              )}
              <p className="text-xs text-slate-400 mt-1.5">
                Letters, numbers, underscores, hyphens. 3–30 characters.
              </p>
            </div>

            {/* Avatar colour */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Avatar colour
              </label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    className={`w-9 h-9 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-primary ${
                      avatarColor === color ? 'ring-2 ring-offset-2 ring-cyan-primary scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select colour ${color}`}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: avatarColor }}
                >
                  {(handle.trim() || suggestedHandle).charAt(0).toUpperCase()}
                </div>
                <p className="text-sm text-slate-500">Preview of your avatar</p>
              </div>
            </div>

            {/* Caregiver type (optional) */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What kind of caregiver are you? <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {CAREGIVER_TYPES.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCaregiverType(prev => prev === opt.value ? '' : opt.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                      caregiverType === opt.value
                        ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {caregiverType === opt.value
                      ? <CheckCircle2 className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      : <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                    }
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic interests (optional) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Topics you care about <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_INTERESTS.map(topic => (
                  <button
                    key={topic.value}
                    type="button"
                    onClick={() => toggleTopic(topic.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      selectedTopics.includes(topic.value)
                        ? 'bg-cyan-primary text-white border-cyan-primary'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-300 hover:text-cyan-700'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {createProfile.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {(createProfile.error as any)?.message ?? 'Something went wrong. Please try again.'}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => setStep('guidelines')}
                disabled={createProfile.isPending}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={handleFinish}
                disabled={createProfile.isPending || !!handleError}
              >
                {createProfile.isPending ? 'Setting up…' : 'Join Community'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
