import { useState, useEffect, useRef } from 'react'
import { Flag, X, CircleCheck as CheckCircle } from 'lucide-react'
import { useSubmitReport } from '../../hooks/useCommunityReports'
import type { ReportReason } from '../../lib/community'
import { Button } from '../ui/Button'
import { useLocale } from '../../i18n/LocaleContext'
import { supabase } from '../../lib/supabaseClient'
import { useFocusTrap } from '../../hooks/useFocusTrap'

function fireAdminReportAlert(contentType: 'post' | 'reply', reason: string, details: string): void {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session?.access_token) return;
    const excerpt = details.trim() ? details.trim().slice(0, 120) : reason;
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ contentType, contentExcerpt: excerpt, reason }),
    }).catch(() => {/* fire-and-forget */});
  });
}

interface Props {
  postId?: string
  replyId?: string
  onClose: () => void
}

export default function ReportModal({ postId, replyId, onClose }: Props) {
  const { t } = useLocale()
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submit = useSubmitReport()
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)

  const REASONS: { value: ReportReason; label: string; description: string }[] = [
    { value: 'harassment', label: t('community.report.reason.harassment'), description: t('community.report.reason.harassment_desc') },
    { value: 'unsafe_advice', label: t('community.report.reason.unsafe_advice'), description: t('community.report.reason.unsafe_advice_desc') },
    { value: 'privacy_violation', label: t('community.report.reason.privacy_violation'), description: t('community.report.reason.privacy_violation_desc') },
    { value: 'spam', label: t('community.report.reason.spam'), description: t('community.report.reason.spam_desc') },
    { value: 'inappropriate_content', label: t('community.report.reason.inappropriate_content'), description: t('community.report.reason.inappropriate_content_desc') },
    { value: 'other', label: t('community.report.reason.other'), description: t('community.report.reason.other_desc') },
  ]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return
    await submit.mutateAsync({
      post_id: postId,
      reply_id: replyId,
      reason,
      details: details.trim() || undefined,
    })
    fireAdminReportAlert(replyId ? 'reply' : 'post', reason, details)
    setSubmitted(true)
  }

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            <h2 id="report-modal-title" className="text-base font-semibold text-slate-800">
              {replyId ? t('community.report.title_reply') : t('community.report.title_post')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-8 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">{t('community.report.submitted_title')}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('community.report.submitted_body')}
            </p>
            <Button variant="outline" size="sm" className="mt-5" onClick={onClose}>
              {t('community.action.close')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              Please select the reason that best describes the issue.
            </p>

            <div className="space-y-2" role="radiogroup" aria-label="Report reason">
              {REASONS.map(r => (
                <label
                  key={r.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    reason === r.value
                      ? 'border-slate-300 bg-slate-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="mt-0.5 accent-slate-600 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {(reason === 'other' || reason === 'unsafe_advice' || reason === 'harassment') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Additional details{reason !== 'other' ? ' (optional)' : ''}
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Please describe the issue..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{details.length}/500</p>
              </div>
            )}

            {submit.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                Something went wrong. Please try again.
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <Button variant="outline" size="md" type="button" className="flex-1" onClick={onClose}>
                {t('community.action.cancel')}
              </Button>
              <Button
                variant="destructive"
                size="md"
                type="submit"
                className="flex-1"
                disabled={!reason || submit.isPending}
              >
                {submit.isPending ? t('community.report.submitting') : t('community.report.submit')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
