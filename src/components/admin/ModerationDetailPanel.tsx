import { useState, useEffect } from 'react'
import { X, ExternalLink, User, EyeOff, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Trash2, RotateCcw, ShieldOff, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import {
  useResolveReport,
  useModeratePost,
  useModerateReply,
  useBanCommunityMember,
  useUnbanCommunityMember,
} from '../../hooks/useCommunityReports'
import { useCommunityProfileByUserId } from '../../hooks/useCommunityProfile'
import type { ModerationReportRow } from '../../lib/community'
import CommunityStatusBadge from '../community/CommunityStatusBadge'
import { Button } from '../ui/Button'

const REASON_LABELS: Record<string, string> = {
  harassment: 'Harassment or bullying',
  unsafe_advice: 'Unsafe health advice',
  privacy_violation: 'Privacy violation',
  spam: 'Spam or self-promotion',
  inappropriate_content: 'Inappropriate content',
  other: 'Other',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface Props {
  report: ModerationReportRow
  onClose: () => void
}

export default function ModerationDetailPanel({ report, onClose }: Props) {
  const [modNote, setModNote] = useState('')
  const [showFullBody, setShowFullBody] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [showBanConfirm, setShowBanConfirm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!showBanConfirm) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowBanConfirm(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showBanConfirm])

  const resolveReport = useResolveReport()
  const moderatePost = useModeratePost()
  const moderateReply = useModerateReply()
  const banMember = useBanCommunityMember()
  const unbanMember = useUnbanCommunityMember()

  const isPost = !!report.post_id && !!report.post
  const contentAuthorId = isPost
    ? report.post?.author_user_id
    : report.reply?.author_user_id

  const { data: authorProfile } = useCommunityProfileByUserId(contentAuthorId)
  const isBanned = authorProfile?.is_banned ?? false

  const contentBody = isPost ? report.post?.body : report.reply?.body
  const contentTitle = isPost ? report.post?.title : undefined
  const isContentAnonymous = isPost ? report.post?.is_anonymous : report.reply?.is_anonymous
  const contentStatus = isPost
    ? (report.post as any)?.post_status
    : (report.reply as any)?.reply_status

  const isActionable = report.report_status === 'pending'
  const isPending = resolveReport.isPending || moderatePost.isPending || moderateReply.isPending || banMember.isPending || unbanMember.isPending

  const doAction = async (fn: () => Promise<void>) => {
    setActionError(null)
    try {
      await fn()
    } catch (e: any) {
      setActionError(e?.message ?? 'Action failed. Please try again.')
    }
  }

  const handleHide = () =>
    doAction(async () => {
      if (isPost && report.post_id) {
        await moderatePost.mutateAsync({ postId: report.post_id, post_status: 'hidden' })
      } else if (report.reply_id) {
        await moderateReply.mutateAsync({ replyId: report.reply_id, reply_status: 'hidden' })
      }
    })

  const handleRemove = () =>
    doAction(async () => {
      if (isPost && report.post_id) {
        await moderatePost.mutateAsync({ postId: report.post_id, post_status: 'removed' })
      } else if (report.reply_id) {
        await moderateReply.mutateAsync({ replyId: report.reply_id, reply_status: 'removed' })
      }
    })

  const handleRestore = () =>
    doAction(async () => {
      if (isPost && report.post_id) {
        await moderatePost.mutateAsync({ postId: report.post_id, post_status: 'active' })
      } else if (report.reply_id) {
        await moderateReply.mutateAsync({ replyId: report.reply_id, reply_status: 'active' })
      }
    })

  const handleMarkReviewed = () =>
    doAction(async () => {
      await resolveReport.mutateAsync({
        reportId: report.id,
        action: 'reviewed',
        mod_note: modNote.trim() || undefined,
      })
    })

  const handleDismiss = () =>
    doAction(async () => {
      await resolveReport.mutateAsync({
        reportId: report.id,
        action: 'dismissed',
        mod_note: modNote.trim() || undefined,
      })
    })

  const handleBan = () =>
    doAction(async () => {
      if (!contentAuthorId) return
      await banMember.mutateAsync({ userId: contentAuthorId, reason: banReason.trim() || undefined })
      setShowBanConfirm(false)
    })

  const handleUnban = () =>
    doAction(async () => {
      if (!contentAuthorId) return
      await unbanMember.mutateAsync(contentAuthorId)
    })

  const BODY_PREVIEW_CHARS = 500

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <h2 className="text-base font-semibold text-slate-800">Report detail</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Report summary */}
        <section>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {isPost ? 'Post' : 'Reply'} report
                </span>
                <CommunityStatusBadge status={report.report_status} />
              </div>
              <p className="text-sm text-slate-700 font-medium">
                {REASON_LABELS[report.reason] ?? report.reason}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Reported by{' '}
                <span className="font-medium text-slate-600">
                  {report.reporter_profile?.handle ?? 'unknown'}
                </span>{' '}
                · {timeAgo(report.created_at)}
              </p>
            </div>
          </div>

          {report.details && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-1">Reporter notes</p>
              <p className="text-sm text-slate-600 leading-relaxed">{report.details}</p>
            </div>
          )}
        </section>

        {/* Reported content */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Reported {isPost ? 'post' : 'reply'}
            </p>
            {contentStatus && <CommunityStatusBadge status={contentStatus} />}
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
            {contentTitle && (
              <p className="text-sm font-semibold text-slate-800 leading-snug">{contentTitle}</p>
            )}
            {contentBody && (
              <>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {showFullBody || contentBody.length <= BODY_PREVIEW_CHARS
                    ? contentBody
                    : contentBody.slice(0, BODY_PREVIEW_CHARS) + '…'}
                </p>
                {contentBody.length > BODY_PREVIEW_CHARS && (
                  <button
                    onClick={() => setShowFullBody(v => !v)}
                    className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    {showFullBody ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {showFullBody ? 'Show less' : 'Show full content'}
                  </button>
                )}
              </>
            )}
            {isPost && report.post_id && (
              <a
                href={`/community/posts/${report.post_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View post in community
              </a>
            )}
            {!isPost && report.reply?.post_id && (
              <a
                href={`/community/posts/${report.reply.post_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View parent post
              </a>
            )}
          </div>
        </section>

        {/* Internal author identity (admin only) */}
        <section>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Author identity (internal — not shown to users)
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              {isContentAnonymous ? (
                <>
                  <EyeOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-amber-700">
                    Posted anonymously (public view shows "Anonymous Caregiver")
                  </span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-xs text-slate-600">Posted with handle visible</span>
                </>
              )}
            </div>
            {authorProfile ? (
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: authorProfile.avatar_color }}
                  aria-hidden="true"
                >
                  {authorProfile.handle.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">@{authorProfile.handle}</p>
                  <p className="text-xs text-slate-500">
                    {authorProfile.post_count} posts · {authorProfile.reply_count} replies
                    {isBanned && <span className="ml-1.5 text-red-600 font-medium">· Banned</span>}
                  </p>
                </div>
              </div>
            ) : contentAuthorId ? (
              <p className="text-xs text-slate-500 font-mono">user_id: {contentAuthorId}</p>
            ) : (
              <p className="text-xs text-slate-400 italic">Author information unavailable</p>
            )}
          </div>
        </section>

        {/* Content moderation actions */}
        {isActionable && (
          <section className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Content actions</p>
            <div className="flex flex-wrap gap-2">
              {contentStatus !== 'hidden' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHide}
                  disabled={isPending}
                  className="flex items-center gap-1.5"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Hide content
                </Button>
              )}
              {(contentStatus === 'hidden' || contentStatus === 'removed') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestore}
                  disabled={isPending}
                  className="flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </Button>
              )}
              {contentStatus !== 'removed' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              )}
            </div>
          </section>
        )}

        {/* Not-actionable restore */}
        {!isActionable && (contentStatus === 'hidden' || contentStatus === 'removed') && (
          <section className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Content status</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestore}
              disabled={isPending}
              className="flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore content
            </Button>
          </section>
        )}

        {/* Member actions */}
        {contentAuthorId && (
          <section className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Member actions</p>
            {isBanned ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <ShieldOff className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">User is currently banned from the community</span>
                </div>
                {authorProfile?.ban_reason && (
                  <p className="text-xs text-slate-500 italic">Reason: {authorProfile.ban_reason}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnban}
                  disabled={isPending}
                  className="flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Unban from community
                </Button>
              </div>
            ) : showBanConfirm ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">
                    Banning removes posting and replying rights in the community.
                    Their account remains active.
                  </p>
                </div>
                <input
                  type="text"
                  value={banReason}
                  onChange={e => setBanReason(e.target.value)}
                  placeholder="Ban reason (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowBanConfirm(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBan}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-red-700"
                  >
                    <ShieldOff className="w-3.5 h-3.5" />
                    Confirm ban
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBanConfirm(true)}
                className="flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              >
                <ShieldOff className="w-3.5 h-3.5" />
                Ban from community
              </Button>
            )}
          </section>
        )}

        {/* Resolve report */}
        {isActionable && (
          <section className="space-y-3 pb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Close report</p>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" htmlFor="mod-note">
                Moderator note (optional)
              </label>
              <textarea
                id="mod-note"
                value={modNote}
                onChange={e => setModNote(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Internal note about this decision…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkReviewed}
                disabled={isPending}
                className="flex items-center gap-1.5 flex-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark reviewed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                disabled={isPending}
                className="flex items-center gap-1.5 flex-1"
              >
                Dismiss
              </Button>
            </div>
          </section>
        )}

        {/* Mod note display when already resolved */}
        {!isActionable && report.mod_note && (
          <section>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Moderator note</p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <p className="text-sm text-slate-600 leading-relaxed">{report.mod_note}</p>
            </div>
          </section>
        )}

        {actionError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {actionError}
          </p>
        )}
      </div>
    </div>
  )
}
