import { useState, useRef } from 'react'
import { EyeOff, Eye, SendHorizontal as SendHorizonal, CircleAlert as AlertCircle } from 'lucide-react'
import { useCreateReply } from '../../hooks/useCommunityReplies'
import type { CommunityProfile } from '../../lib/community'
import { Button } from '../ui/Button'
import { useLocale } from '../../i18n/LocaleContext'

interface Props {
  postId: string
  profile: CommunityProfile
  isBanned?: boolean
  onSuccess?: () => void
}

export default function ReplyComposer({ postId, profile, isBanned = false, onSuccess }: Props) {
  const { t } = useLocale()
  const [body, setBody] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submittingRef = useRef(false)
  const createReply = useCreateReply()

  const minLen = 2
  const maxLen = 2000
  const canSubmit = body.trim().length >= minLen && body.trim().length <= maxLen && !createReply.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submittingRef.current) return
    submittingRef.current = true
    setError(null)
    try {
      await createReply.mutateAsync({
        post_id: postId,
        body: body.trim(),
        is_anonymous: isAnonymous,
      })
      setBody('')
      setIsAnonymous(false)
      onSuccess?.()
    } catch (err: any) {
      setError(err?.message ?? t('community.reply_error_generic'))
    } finally {
      submittingRef.current = false
    }
  }

  if (isBanned) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">{t('community.reply_banned_title')}</p>
          <p className="text-sm text-red-600 mt-0.5 leading-relaxed">
            {t('community.reply_banned_body')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: profile.avatar_color }}
          aria-hidden="true"
        >
          {profile.handle.charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-medium text-slate-700">
          {t('community.reply_replying_as')}{' '}
          <span className="font-semibold">
            {isAnonymous ? t('community.anonymous_caregiver') : profile.handle}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="reply-body" className="sr-only">{t('community.reply_label')}</label>
          <textarea
            id="reply-body"
            value={body}
            onChange={e => { setBody(e.target.value); setError(null) }}
            placeholder={t('community.reply_placeholder')}
            rows={4}
            maxLength={maxLen}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm resize-none leading-relaxed"
            aria-describedby={error ? 'reply-error' : undefined}
          />
          <div className="flex justify-between items-center mt-1">
            {body.length > 0 && body.trim().length < minLen ? (
              <p className="text-xs text-amber-600">{t('community.reply_min_chars', { n: String(minLen) })}</p>
            ) : <span />}
            <span className={`text-xs ml-auto ${body.length > maxLen * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>
              {body.length}/{maxLen}
            </span>
          </div>
        </div>

        {error && (
          <p id="reply-error" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsAnonymous(prev => !prev)}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              isAnonymous
                ? 'border-slate-300 bg-slate-100 text-slate-600 font-medium'
                : 'border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
            aria-pressed={isAnonymous}
            title={isAnonymous
              ? t('community.reply_anon_active_title')
              : t('community.reply_anon_inactive_title')}
          >
            {isAnonymous ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {isAnonymous ? t('community.anonymous') : t('community.reply_post_anonymously')}
          </button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-1.5"
          >
            <SendHorizonal className="w-4 h-4" />
            {createReply.isPending ? t('community.reply_posting') : t('community.reply_submit')}
          </Button>
        </div>

        {isAnonymous && (
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('community.reply_anon_disclaimer')}
          </p>
        )}
      </form>
    </div>
  )
}
