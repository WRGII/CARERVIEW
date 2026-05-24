// src/components/caregiver/GuestInviteModal.tsx
import React, { useState } from 'react'
import { X, UserPlus, Copy, CheckCheck, Mail, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { useActiveTeam } from '../../context/ActiveTeam'
import { useLocale } from '../../i18n/LocaleContext'
import type { ResidentOption } from '../../hooks/useMemoryBook'

interface GuestInviteModalProps {
  residentOptions: ResidentOption[]
  onClose: () => void
}

type Step = 'form' | 'sent'

const FORM_TYPES = ['ADL', 'IADL', 'COMPREHENSIVE'] as const
type FormType = typeof FORM_TYPES[number]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function GuestInviteModal({ residentOptions, onClose }: GuestInviteModalProps) {
  const { t } = useLocale()
  const { user, profile } = useAuth()
  const { teamId } = useActiveTeam()

  const defaultResident = residentOptions[0] ?? null

  const [step, setStep] = useState<Step>('form')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [formType, setFormType] = useState<FormType>('ADL')
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    defaultResident?.teamId ?? teamId ?? ''
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guestLink, setGuestLink] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const selectedResident = residentOptions.find(r => r.teamId === selectedTeamId) ?? defaultResident
  const residentName = selectedResident?.residentName ?? ''

  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!guestEmail.trim() || !emailRegex.test(guestEmail.trim())) {
      setError(t('guest_invite.err_email'))
      return
    }
    if (!selectedTeamId) {
      setError(t('guest_invite.err_no_team'))
      return
    }
    if (!residentName) {
      setError(t('guest_invite.err_no_resident'))
      return
    }

    setBusy(true)
    try {
      // 1. Create the token via RPC
      const { data: token, error: rpcErr } = await supabase.rpc('cv_create_guest_token', {
        p_team: selectedTeamId,
        p_resident_name: residentName,
        p_form_type: formType,
        p_guest_email: guestEmail.trim().toLowerCase(),
        p_guest_name: guestName.trim() || null,
      })

      if (rpcErr) throw rpcErr

      const link = `${siteUrl}/guest-observation?t=${token}`
      setGuestLink(link)

      // 2. Send the email via Edge Function
      const inviterName =
        profile?.display_name?.trim() || profile?.email?.trim() || user?.email?.trim() || 'Your care team'

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-guest-invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            guest_email: guestEmail.trim().toLowerCase(),
            guest_name: guestName.trim() || null,
            guest_link: link,
            inviter_name: inviterName,
            resident_name: residentName,
            form_type: formType,
          }),
        }
      )

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}))
        throw new Error(errBody?.error || t('guest_invite.err_generic'))
      }

      const result = await resp.json()
      setEmailSent(result.sent === true)
      setStep('sent')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('guest_invite.err_generic'))
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = async () => {
    if (!guestLink) return
    try {
      await navigator.clipboard.writeText(guestLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback: select the text
    }
  }

  const formTypeLabel = (ft: FormType) =>
    ft === 'COMPREHENSIVE' ? t('guest_invite.form_comprehensive')
    : ft === 'ADL' ? t('guest_invite.form_adl')
    : t('guest_invite.form_iadl')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center">
              <UserPlus className="w-4.5 h-4.5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('guest_invite.title')}</h2>
              <p className="text-xs text-slate-500">{t('guest_invite.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

            {/* Resident selector (multi-team) or display (single team) */}
            {residentOptions.length > 1 ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t('guest_invite.resident_label')}
                </label>
                <div className="relative">
                  <select
                    value={selectedTeamId}
                    onChange={e => setSelectedTeamId(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 bg-white text-slate-800 text-sm appearance-none"
                  >
                    {residentOptions.map(opt => (
                      <option key={opt.teamId} value={opt.teamId}>
                        {opt.preferredName ? `${opt.residentName} ("${opt.preferredName}")` : opt.residentName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">{t('guest_invite.resident_label')}</p>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedResident?.preferredName
                    ? `${residentName} ("${selectedResident.preferredName}")`
                    : residentName || t('guest_invite.no_resident')}
                </p>
              </div>
            )}

            {/* Form type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {t('guest_invite.form_type_label')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FORM_TYPES.map(ft => (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => setFormType(ft)}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      formType === ft
                        ? 'border-cyan-600 bg-cyan-600 text-white shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-cyan-50'
                    }`}
                  >
                    {formTypeLabel(ft)}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {t('guest_invite.guest_name_label')}{' '}
                <span className="text-slate-400 font-normal text-xs">{t('common.optional_parens')}</span>
              </label>
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder={t('guest_invite.guest_name_placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 text-slate-800 text-sm placeholder:text-slate-400"
              />
            </div>

            {/* Guest email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {t('guest_invite.guest_email_label')}
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={e => setGuestEmail(e.target.value)}
                placeholder={t('guest_invite.guest_email_placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 text-slate-800 text-sm placeholder:text-slate-400"
                required
              />
              <p className="mt-1.5 text-xs text-slate-400">{t('guest_invite.email_hint')}</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={busy || !guestEmail.trim()}
                className="flex-1 py-3 rounded-xl bg-cyan-600 text-white font-semibold text-sm hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {busy ? (
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:-0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:-0.1s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" />
                  </span>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    {t('guest_invite.send_btn')}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Sent confirmation */
          <div className="px-6 py-6 space-y-5">
            <div className={`rounded-xl px-4 py-4 border ${emailSent ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`text-sm font-semibold mb-1 ${emailSent ? 'text-teal-800' : 'text-amber-800'}`}>
                {emailSent ? t('guest_invite.sent_title') : t('guest_invite.sent_fallback_title')}
              </p>
              <p className={`text-xs leading-relaxed ${emailSent ? 'text-teal-700' : 'text-amber-700'}`}>
                {emailSent
                  ? t('guest_invite.sent_body', { email: guestEmail })
                  : t('guest_invite.sent_fallback_body')}
              </p>
            </div>

            {/* Copyable link */}
            {guestLink && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">{t('guest_invite.copy_link_label')}</p>
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-slate-600 truncate font-mono">{guestLink}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`shrink-0 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      copied
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {copied ? (
                      <><CheckCheck className="w-3.5 h-3.5" />{t('guest_invite.copied')}</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" />{t('guest_invite.copy_btn')}</>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-400">{t('guest_invite.link_expires_hint')}</p>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
            >
              {t('common.done')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
