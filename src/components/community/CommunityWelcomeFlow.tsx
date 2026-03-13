import { useState, useEffect } from 'react'
import { Heart, Users, ShieldCheck, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, ChevronRight, Sparkles, CircleUser as UserCircle, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { useCreateCommunityProfile } from '../../hooks/useCommunityProfile'
import { AVATAR_COLORS, generateAvatarColor } from '../../lib/community'
import { useAuth } from '../../hooks/useAuth'
import { useLocale } from '../../i18n/LocaleContext'

interface Props {
  onComplete: () => void
  onDismiss?: () => void
}

type Step = 'welcome' | 'guidelines' | 'profile'


export default function CommunityWelcomeFlow({ onComplete, onDismiss }: Props) {
  const { t } = useLocale()
  const [step, setStep] = useState<Step>('welcome')
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false)
  const [handle, setHandle] = useState('')
  const [handleError, setHandleError] = useState('')
  const [caregiverType, setCaregiverType] = useState('')
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0])
  const { user } = useAuth()
  const createProfile = useCreateCommunityProfile()

  const CAREGIVER_TYPES = [
    { value: 'family', label: t('community.caregiver_type.family'), description: t('community.caregiver_type.family_desc') },
    { value: 'professional', label: t('community.caregiver_type.professional'), description: t('community.caregiver_type.professional_desc') },
    { value: 'both', label: t('community.caregiver_type.both'), description: t('community.caregiver_type.both_desc') },
  ]

  const canDismiss = !!onDismiss && !createProfile.isPending

  useEffect(() => {
    if (!canDismiss) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [canDismiss, onDismiss])

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
      setHandleError(t('community.profile.handle_too_short'))
    } else if (clean.length > 30) {
      setHandleError(t('community.profile.handle_too_long'))
    } else if (clean.length > 0 && !/^[a-zA-Z0-9_-]+$/.test(clean)) {
      setHandleError(t('community.profile.handle_invalid'))
    }
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
        setHandleError(t('community.profile.handle_taken'))
      } else {
        setHandleError(err?.message ?? 'Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={canDismiss ? (e) => { if (e.target === e.currentTarget) onDismiss!() } : undefined}
    >
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
            {canDismiss && (
              <div className="flex justify-end -mt-2 -mr-2 mb-2">
                <button
                  onClick={onDismiss}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-3">
              {t('community.welcome.title')}
            </h2>
            <p className="text-slate-600 text-center leading-relaxed mb-6">
              {t('community.welcome.subtitle')}
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <Users className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{t('community.welcome.peer_support_title')}</p>
                  <p className="text-sm text-slate-500">{t('community.welcome.peer_support_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{t('community.welcome.moderated_title')}</p>
                  <p className="text-sm text-slate-500">{t('community.welcome.moderated_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{t('community.welcome.not_medical_title')}</p>
                  <p className="text-sm text-slate-500">{t('community.welcome.not_medical_desc')}</p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setStep('guidelines')}
            >
              {t('community.welcome.continue')}
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
              {t('community.guidelines.title')}
            </h2>
            <p className="text-slate-500 text-sm text-center mb-6">
              {t('community.guidelines.subtitle')}
            </p>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
              {[
                {
                  icon: <Heart className="w-4 h-4 text-cyan-600" />,
                  title: t('community.guidelines.be_kind_title'),
                  body: t('community.guidelines.be_kind_body'),
                },
                {
                  icon: <ShieldCheck className="w-4 h-4 text-cyan-600" />,
                  title: t('community.guidelines.protect_privacy_title'),
                  body: t('community.guidelines.protect_privacy_body'),
                },
                {
                  icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
                  title: t('community.guidelines.no_medical_title'),
                  body: t('community.guidelines.no_medical_body'),
                },
                {
                  icon: <Users className="w-4 h-4 text-cyan-600" />,
                  title: t('community.guidelines.no_harassment_title'),
                  body: t('community.guidelines.no_harassment_body'),
                },
                {
                  icon: <Sparkles className="w-4 h-4 text-cyan-600" />,
                  title: t('community.guidelines.no_spam_title'),
                  body: t('community.guidelines.no_spam_body'),
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
                {t('community.guidelines.accept_checkbox')}
              </span>
            </label>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => setStep('welcome')}
              >
                {t('community.action.back')}
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                disabled={!guidelinesAccepted}
                onClick={() => setStep('profile')}
              >
                {t('community.guidelines.accept_button')}
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
              {t('community.profile.title')}
            </h2>
            <p className="text-slate-500 text-sm text-center mb-6">
              {t('community.profile.subtitle')}
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
                {t('community.profile.avatar_color_label')}
              </label>
              <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label={t('community.profile.avatar_color_label')}>
                {AVATAR_COLORS.map((color, idx) => {
                  const colorNames = ['Teal', 'Green-Teal', 'Green', 'Orange', 'Red', 'Purple', 'Blue', 'Brown']
                  return (
                    <button
                      key={color}
                      type="button"
                      role="radio"
                      aria-checked={avatarColor === color}
                      onClick={() => setAvatarColor(color)}
                      className={`w-9 h-9 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-primary ${
                        avatarColor === color ? 'ring-2 ring-offset-2 ring-cyan-primary scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={colorNames[idx] ?? color}
                    />
                  )
                })}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: avatarColor }}
                  aria-hidden="true"
                >
                  {(handle.trim() || suggestedHandle).charAt(0).toUpperCase()}
                </div>
                <p className="text-sm text-slate-500">{t('community.profile.avatar_preview')}</p>
              </div>
            </div>

            {/* Caregiver type (optional) */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t('community.profile.caregiver_type_label')}{' '}
                <span className="text-slate-400 font-normal">{t('community.profile.caregiver_type_optional')}</span>
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

            {createProfile.error && !handleError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 mb-2">
                  {(createProfile.error as any)?.message ?? 'Something went wrong. Please try again.'}
                </p>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={createProfile.isPending}
                  className="text-sm font-medium text-red-700 underline hover:no-underline disabled:opacity-60"
                >
                  Try again
                </button>
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
                {t('community.action.back')}
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={handleFinish}
                disabled={createProfile.isPending || !!handleError}
              >
                {createProfile.isPending ? t('community.profile.joining') : t('community.profile.join_button')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
