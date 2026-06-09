// src/pages/GuestObservationPage.tsx
//
// Public, unauthenticated page for Guest Carers to complete a one-time observation.
// Reached via /guest-observation?t={token}. No account required.
//
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ScorePicker from '../components/ui/ScorePicker'
import { useCategoryQuestions } from '../hooks/useCategoryQuestions'
import { useLegend } from '../hooks/useLegend'

// ─── Types ─────────────────────────────────────────────────────────────────────

type TokenInfo = {
  valid: true
  token_id: string
  team_id: string
  resident_name: string
  form_type: 'ADL' | 'IADL' | 'COMPREHENSIVE'
  guest_name: string | null
  guest_email: string | null
  expires_at: string
}

type TokenError = {
  valid: false
  reason: 'not_found' | 'consumed' | 'expired'
  resident_name?: string
  form_type?: string
}

type PageState = 'loading' | 'error' | 'invalid' | 'intake' | 'form' | 'submitting' | 'done'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Category = {
  id: string
  name: string
  type: 'ADL' | 'IADL'
  order: number
  questions: { id: string; text: string; order: number }[]
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function GuestObservationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t') ?? ''

  const [pageState, setPageState] = useState<PageState>('loading')
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [tokenError, setTokenError] = useState<TokenError | null>(null)

  // Intake fields
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [intakeError, setIntakeError] = useState<string | null>(null)

  // Observation fields
  const [obsDate, setObsDate] = useState<string>(() => {
    const now = new Date()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    return `${mm}/${dd}/${now.getFullYear()}`
  })
  const [mode, setMode] = useState<'In Person' | 'Voice Call' | 'Video Call'>('In Person')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})
  const [categoryNotes, setCategoryNotes] = useState<Record<string, string>>({})
  const [dateError, setDateError] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Peek the token on mount
  useEffect(() => {
    if (!token) { setPageState('invalid'); return }
    ;(async () => {
      try {
        const { data, error } = await supabase.rpc('cv_peek_guest_token', { p_token: token })
        if (error) throw error
        const result = data as TokenInfo | TokenError
        if (result.valid) {
          setTokenInfo(result as TokenInfo)
          setGuestName(result.guest_name ?? '')
          setGuestEmail(result.guest_email ?? '')
          setPageState('intake')
        } else {
          setTokenError(result as TokenError)
          setPageState('invalid')
        }
      } catch {
        setPageState('error')
      }
    })()
  }, [token])

  // Load questions once tokenInfo is available
  const formType = tokenInfo?.form_type ?? 'ADL'
  const { data: rawQuestions, isLoading: questionsLoading } = useCategoryQuestions(formType)
  const { data: legendRows } = useLegend()

  const legendMap: Record<number, string> = useMemo(() => {
    const m: Record<number, string> = {}
    ;(legendRows ?? []).forEach(r => { if (typeof r.score === 'number') m[r.score] = r.description })
    return m
  }, [legendRows])

  const categories: Category[] = useMemo(() => {
    if (!rawQuestions) return []
    const map = new Map<string, Category>()
    rawQuestions.forEach(item => {
      if (!map.has(item.category_id)) {
        map.set(item.category_id, {
          id: item.category_id,
          name: item.category_name,
          type: item.type,
          order: item.category_order,
          questions: [],
        })
      }
      map.get(item.category_id)!.questions.push({
        id: item.question_id,
        text: item.question_text,
        order: item.question_order,
      })
    })
    const result = Array.from(map.values())
    result.sort((a, b) => (a.type === 'ADL' ? 0 : 1) - (b.type === 'ADL' ? 0 : 1) || a.order - b.order)
    result.forEach(cat => cat.questions.sort((a, b) => a.order - b.order))
    return result
  }, [rawQuestions])

  const totalQuestions = categories.reduce((s, c) => s + c.questions.length, 0)
  const scoredCount = Object.values(answers).filter(v => typeof v === 'number').length

  // Date helpers
  const validateDate = (d: string) => {
    const re = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/
    if (!re.test(d)) return false
    const [m, dy, y] = d.split('/').map(Number)
    const dt = new Date(y, m - 1, dy)
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === dy
  }

  const toDBDate = (d: string) => {
    const [m, dy, y] = d.split('/').map(Number)
    return `${y}-${String(m).padStart(2, '0')}-${String(dy).padStart(2, '0')}`
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIntakeError(null)
    if (!guestName.trim()) { setIntakeError('Please enter your name.'); return }
    if (!emailRegex.test(guestEmail.trim())) { setIntakeError('Please enter a valid email address.'); return }
    setPageState('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateDate(obsDate)) { setDateError('Please enter a valid date (MM/DD/YYYY).'); return }
    if (scoredCount === 0) { setSubmitError('Please rate at least one activity before submitting.'); return }

    setPageState('submitting')

    // Build answers payload — combine answers + category notes into the jsonb param
    const answersPayload: Record<string, number> = {}
    Object.entries(answers).forEach(([qid, score]) => {
      if (typeof score === 'number') answersPayload[qid] = score
    })

    try {
      const { error } = await supabase.rpc('cv_submit_guest_observation', {
        p_token: token,
        p_guest_name: guestName.trim(),
        p_guest_email: guestEmail.trim().toLowerCase(),
        p_observation_date: toDBDate(obsDate),
        p_mode: mode,
        p_notes: notes.trim() || null,
        p_answers: answersPayload,
      })

      if (error) throw error

      // Fire-and-forget: notify the team owner that a guest observation was submitted
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-guest-submitted`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          token,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim().toLowerCase(),
          observation_date: toDBDate(obsDate),
        }),
      }).catch(() => {})

      setPageState('done')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setSubmitError(msg)
      setPageState('form')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
          </div>
          <p className="text-slate-500 text-sm">Loading your observation form...</p>
        </div>
      </Shell>
    )
  }

  if (pageState === 'error') {
    return (
      <Shell>
        <StatusCard
          variant="error"
          title="Something went wrong"
          body="We couldn't load this observation form. Please check your link and try again, or contact the person who sent it."
        />
      </Shell>
    )
  }

  if (pageState === 'invalid') {
    const reason = tokenError?.reason
    const title =
      reason === 'consumed' ? 'Observation already submitted'
      : reason === 'expired' ? 'This link has expired'
      : 'Invalid link'
    const body =
      reason === 'consumed'
        ? 'This observation link has already been used. Each link can only be used once. If you need to submit another observation, please ask for a new invitation.'
        : reason === 'expired'
        ? 'This invitation link has expired (links are valid for 72 hours). Please ask the caregiver to send you a new one.'
        : 'This link is not valid. Please check the link in your email or ask for a new invitation.'
    return (
      <Shell>
        <StatusCard variant={reason === 'consumed' ? 'info' : 'warning'} title={title} body={body} />
      </Shell>
    )
  }

  if (pageState === 'done') {
    const formLabel =
      formType === 'COMPREHENSIVE' ? 'ADL + IADL'
      : formType === 'ADL' ? 'ADL'
      : 'IADL'
    return (
      <Shell>
        <div className="max-w-lg mx-auto text-center py-12 px-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Thank you!</h1>
          <p className="text-slate-600 leading-relaxed mb-2">
            Your <strong>{formLabel}</strong> observation for <strong>{tokenInfo?.resident_name}</strong> has been saved.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            The primary caregiver will be able to review your responses. You can safely close this page.
          </p>
        </div>
      </Shell>
    )
  }

  if (pageState === 'intake') {
    return (
      <Shell>
        <div className="max-w-md mx-auto">
          {/* Welcome card */}
          <div className="bg-cyan-700 rounded-2xl px-6 py-5 mb-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200 mb-1">Guest Observation</p>
            <h1 className="text-xl font-bold mb-1">
              Observation for <span className="text-cyan-100">{tokenInfo?.resident_name}</span>
            </h1>
            <p className="text-sm text-cyan-200">
              {tokenInfo?.form_type === 'COMPREHENSIVE' ? 'ADL + IADL (Comprehensive)'
               : tokenInfo?.form_type === 'ADL' ? 'Activities of Daily Living (ADL)'
               : 'Instrumental Activities of Daily Living (IADL)'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Before you begin</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Please confirm your name and email so the caregiver knows who completed this observation.
                No account is needed.
              </p>
            </div>

            <form onSubmit={handleIntakeSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 text-slate-800 text-sm placeholder:text-slate-400"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 text-slate-800 text-sm placeholder:text-slate-400"
                  required
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Your email is only used to identify who completed this observation. We will not contact you.
                </p>
              </div>

              {intakeError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {intakeError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-700 text-white font-bold text-sm hover:bg-cyan-800 transition-colors shadow-sm"
              >
                Continue to Observation Form
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
            This is a one-time observation form. Your responses will be shared with the caregiver team.
            <br />
            <a href="/privacy-policy" className="underline hover:text-slate-600">Privacy Policy</a>
          </p>
        </div>
      </Shell>
    )
  }

  // pageState === 'form' or 'submitting'
  const isSubmitting = pageState === 'submitting'

  return (
    <Shell>
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-3 py-1 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Guest Observation
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Observation for <span className="text-cyan-700">{tokenInfo?.resident_name}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Completing as <strong className="text-slate-700">{guestName}</strong>
            {' · '}
            {formType === 'COMPREHENSIVE' ? 'ADL + IADL' : formType}
            {totalQuestions > 0 && (
              <span className="ml-2 text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 font-medium">
                {scoredCount} / {totalQuestions} rated
              </span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Guidance */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-5 py-4">
            <p className="text-slate-700 text-sm leading-relaxed">
              <span className="font-semibold text-slate-800">Rating guide: </span>
              Rate each activity from 1 (needs full help) to 5 (fully independent).
              Be honest — there are no right or wrong answers. Your observations help the care team.
            </p>
          </div>

          {/* Observation details */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Observation details</h2>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of observation</label>
                <input
                  type="text"
                  value={obsDate}
                  onChange={e => {
                    setObsDate(e.target.value)
                    setDateError(e.target.value && !validateDate(e.target.value) ? 'Please enter a valid date (MM/DD/YYYY).' : '')
                  }}
                  placeholder="MM/DD/YYYY"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors ${
                    dateError
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-slate-200 focus:border-cyan-600'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-100 bg-white text-slate-800 placeholder:text-slate-400`}
                />
                {dateError && <p className="text-red-500 text-xs mt-1.5">{dateError}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">How did you interact?</label>
                <select
                  value={mode}
                  onChange={e => setMode(e.target.value as typeof mode)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 bg-white text-slate-800 text-sm"
                >
                  <option value="In Person">In Person</option>
                  <option value="Voice Call">Voice Call</option>
                  <option value="Video Call">Video Call</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  General notes <span className="text-slate-400 font-normal text-xs">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any general observations about this visit..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 bg-white text-slate-800 text-sm resize-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Score reference */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Score reference</p>
            </div>
            <div className="grid grid-cols-5 divide-x divide-slate-100">
              {[
                { score: 1, label: 'Total help', bg: 'bg-mint-green' },
                { score: 2, label: 'Major help', bg: 'bg-mint-green/60' },
                { score: 3, label: 'Some help', bg: 'bg-cyan-primary/25' },
                { score: 4, label: 'Minor help', bg: 'bg-peach-blush/60' },
                { score: 5, label: 'Independent', bg: 'bg-peach-blush' },
              ].map(({ score, label, bg }) => (
                <div key={score} className={`${bg} py-3 px-1 text-center`}>
                  <div className="text-xl font-bold text-slate-700">{score}</div>
                  <div className="text-[10px] font-medium text-slate-600 leading-tight mt-0.5 hidden sm:block">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category sections */}
          {questionsLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-sm">Loading questions...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {categories.map(category => {
                const catScored = category.questions.filter(q => typeof answers[q.id] === 'number').length
                return (
                  <div key={category.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-base">{category.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {category.type}
                          {' · '}
                          <span className={catScored > 0 ? 'text-cyan-700 font-medium' : ''}>
                            {catScored} / {category.questions.length} rated
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                      {category.questions.map(question => {
                        const scored = typeof answers[question.id] === 'number'
                        return (
                          <div key={question.id} className={`px-5 py-4 transition-colors ${scored ? 'bg-slate-50/60' : 'bg-white'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <p className="flex-1 text-slate-700 text-sm leading-snug">{question.text}</p>
                              <div className="shrink-0">
                                <ScorePicker
                                  value={answers[question.id]}
                                  onChange={val => setAnswers(prev => ({ ...prev, [question.id]: val }))}
                                  descriptions={legendMap}
                                  ariaLabel={`Score for: ${question.text}`}
                                  disabled={isSubmitting}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Category notes */}
                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/40">
                      <label className="block text-sm font-semibold text-slate-600 mb-2">
                        Notes for {category.name} <span className="text-slate-400 font-normal text-xs">(optional)</span>
                      </label>
                      <textarea
                        value={categoryNotes[category.id] || ''}
                        onChange={e => setCategoryNotes(prev => ({ ...prev, [category.id]: e.target.value }))}
                        rows={2}
                        placeholder={`Any observations about ${category.name}...`}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 bg-white text-slate-700 text-sm resize-none placeholder:text-slate-400 disabled:opacity-60"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Error */}
          {submitError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Submit bar */}
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-sm">
            <div className="flex-1 text-sm text-slate-500">
              {scoredCount > 0
                ? <span className="text-teal-700 font-medium">{scoredCount} of {totalQuestions} activities rated</span>
                : <span>Rate at least one activity to submit</span>
              }
            </div>
            <button
              type="submit"
              disabled={isSubmitting || scoredCount === 0}
              className="px-6 py-3 rounded-xl bg-cyan-700 text-white font-bold text-sm hover:bg-cyan-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:-0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:-0.1s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" />
                  </span>
                  Submitting...
                </>
              ) : 'Submit Observation'}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  )
}

// ─── Shell layout ─────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src="/CareView_logo_primary_full.png" alt="CarerView" className="h-7 w-auto" />
          <span className="text-xs text-slate-400 border-l border-slate-200 pl-3">Guest Observation</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="text-center py-8 text-xs text-slate-400">
        <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
        {' · '}
        <a href="/" className="hover:underline">CarerView</a>
      </footer>
    </div>
  )
}

// ─── Status card ──────────────────────────────────────────────────────────────

function StatusCard({ variant, title, body }: { variant: 'error' | 'warning' | 'info'; title: string; body: string }) {
  const colors = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  return (
    <div className="max-w-md mx-auto py-16 text-center px-4">
      <div className={`rounded-2xl border p-8 ${colors[variant]}`}>
        <h2 className="text-lg font-bold mb-3">{title}</h2>
        <p className="text-sm leading-relaxed opacity-90">{body}</p>
      </div>
      <p className="mt-6 text-xs text-slate-400">
        Need help? Contact the caregiver who sent you this link.
      </p>
    </div>
  )
}
