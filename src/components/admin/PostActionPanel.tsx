import { useState } from 'react'
import { X, ExternalLink, EyeOff, Eye, Trash2, RotateCcw, ShieldOff, Shield, Flag, MessageSquare, Send, TriangleAlert as AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  moderatePost,
  sendMemberNotification,
  banCommunityMember,
  unbanCommunityMember,
  deletePostPermanently,
  type CommunityPost,
  type PostStatus,
} from '../../lib/community'
import { useCommunityProfileByUserId } from '../../hooks/useCommunityProfile'
import CommunityStatusBadge from '../community/CommunityStatusBadge'
import { Button } from '../ui/Button'

const DEFAULT_MESSAGES: Record<string, { subject: string; message: string }> = {
  post_flagged: {
    subject: 'Your post has been flagged for review',
    message: 'Your post has been flagged by a moderator as it may not meet our community guidelines. Please review our community guidelines and consider editing your post if needed. Repeated violations may result in content removal or account restrictions.',
  },
  post_removed: {
    subject: 'Your post has been removed',
    message: 'Your post has been removed by a moderator because it was found to violate our community guidelines. We ask that all members maintain a respectful, supportive environment. If you have questions about this decision, please review our community guidelines.',
  },
  account_banned: {
    subject: 'Your community access has been restricted',
    message: 'Your account has been restricted from posting in the community forum due to repeated or serious violations of our community guidelines. You may still access your account and other features. If you believe this is an error, please contact support.',
  },
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
  post: CommunityPost
  onClose: () => void
  onPostUpdated?: () => void
}

export default function PostActionPanel({ post, onClose, onPostUpdated }: Props) {
  const queryClient = useQueryClient()
  const [showFullBody, setShowFullBody] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const [showFlagConfirm, setShowFlagConfirm] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [showBanConfirm, setShowBanConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMessageComposer, setShowMessageComposer] = useState(false)

  const [msgSubject, setMsgSubject] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [banReason, setBanReason] = useState('')
  const [flagMessage, setFlagMessage] = useState(DEFAULT_MESSAGES.post_flagged.message)
  const [removeMessage, setRemoveMessage] = useState(DEFAULT_MESSAGES.post_removed.message)
  const [banMessage, setBanMessage] = useState(DEFAULT_MESSAGES.account_banned.message)

  const { data: authorProfile, refetch: refetchProfile } = useCommunityProfileByUserId(post.author_user_id)
  const isBanned = authorProfile?.is_banned ?? false

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['community', 'admin', 'posts'] })
    queryClient.invalidateQueries({ queryKey: ['community', 'profile', post.author_user_id] })
    onPostUpdated?.()
  }

  const moderatePostMut = useMutation({
    mutationFn: (status: PostStatus) => moderatePost({ postId: post.id, post_status: status }),
    onSuccess: invalidate,
  })

  const sendNotifMut = useMutation({
    mutationFn: sendMemberNotification,
    onSuccess: () => {},
  })

  const banMut = useMutation({
    mutationFn: banCommunityMember,
    onSuccess: () => { refetchProfile(); invalidate() },
  })

  const unbanMut = useMutation({
    mutationFn: unbanCommunityMember,
    onSuccess: () => { refetchProfile(); invalidate() },
  })

  const deleteMut = useMutation({
    mutationFn: () => deletePostPermanently({ postId: post.id }),
    onSuccess: () => { invalidate(); onClose() },
  })

  const isPending = moderatePostMut.isPending || sendNotifMut.isPending || banMut.isPending || unbanMut.isPending || deleteMut.isPending

  const doAction = async (fn: () => Promise<void>) => {
    setActionError(null)
    try {
      await fn()
    } catch (e: any) {
      setActionError(e?.message ?? 'Action failed. Please try again.')
    }
  }

  const handleFlag = () =>
    doAction(async () => {
      await moderatePostMut.mutateAsync('hidden')
      await sendNotifMut.mutateAsync({
        userId: post.author_user_id,
        type: 'post_flagged',
        subject: DEFAULT_MESSAGES.post_flagged.subject,
        message: flagMessage,
        post_id: post.id,
      })
      setShowFlagConfirm(false)
    })

  const handleRemove = () =>
    doAction(async () => {
      await moderatePostMut.mutateAsync('removed')
      await sendNotifMut.mutateAsync({
        userId: post.author_user_id,
        type: 'post_removed',
        subject: DEFAULT_MESSAGES.post_removed.subject,
        message: removeMessage,
        post_id: post.id,
      })
      setShowRemoveConfirm(false)
    })

  const handleRestore = () =>
    doAction(async () => {
      await moderatePostMut.mutateAsync('active')
    })

  const handleBan = () =>
    doAction(async () => {
      await banMut.mutateAsync({ userId: post.author_user_id, reason: banReason.trim() || undefined })
      await sendNotifMut.mutateAsync({
        userId: post.author_user_id,
        type: 'account_banned',
        subject: DEFAULT_MESSAGES.account_banned.subject,
        message: banMessage,
      })
      setShowBanConfirm(false)
    })

  const handleUnban = () =>
    doAction(async () => {
      await unbanMut.mutateAsync(post.author_user_id)
    })

  const handleDelete = () =>
    doAction(async () => {
      await sendNotifMut.mutateAsync({
        userId: post.author_user_id,
        type: 'post_removed',
        subject: 'Your post has been permanently deleted',
        message: 'Your post has been permanently deleted by a moderator for violating our community guidelines.',
        post_id: post.id,
      })
      await deleteMut.mutateAsync()
    })

  const handleSendMessage = () =>
    doAction(async () => {
      if (!msgSubject.trim() || !msgBody.trim()) {
        setActionError('Subject and message are required.')
        return
      }
      await sendNotifMut.mutateAsync({
        userId: post.author_user_id,
        type: 'advisory',
        subject: msgSubject.trim(),
        message: msgBody.trim(),
        post_id: post.id,
      })
      setShowMessageComposer(false)
      setMsgSubject('')
      setMsgBody('')
    })

  const BODY_PREVIEW = 600
  const currentStatus = post.post_status

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-800">Post actions</h2>
          <CommunityStatusBadge status={currentStatus} />
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Post content */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Post content</p>
            <a
              href={`/community/posts/${post.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-600 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View in community
            </a>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
            {post.room && (
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: post.room.color }}
                />
                <span className="text-xs text-slate-400 font-medium">{post.room.name}</span>
              </div>
            )}
            <p className="text-sm font-semibold text-slate-800 leading-snug">{post.title}</p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {showFullBody || post.body.length <= BODY_PREVIEW
                ? post.body
                : post.body.slice(0, BODY_PREVIEW) + '…'}
            </p>
            {post.body.length > BODY_PREVIEW && (
              <button
                onClick={() => setShowFullBody(v => !v)}
                className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium"
              >
                {showFullBody ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showFullBody ? 'Show less' : 'Show full post'}
              </button>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {timeAgo(post.created_at)} · {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
            </p>
          </div>
        </section>

        {/* Author identity */}
        <section>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Author identity (internal)
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
            {post.is_anonymous && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mr-1">
                <EyeOff className="w-3.5 h-3.5" />
                Anonymous post
              </div>
            )}
            {authorProfile ? (
              <>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: authorProfile.avatar_color }}
                >
                  {authorProfile.handle.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">@{authorProfile.handle}</p>
                  <p className="text-xs text-slate-500">
                    {authorProfile.post_count} posts · {authorProfile.reply_count} replies
                    {isBanned && <span className="ml-1.5 text-red-600 font-semibold">· Banned</span>}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 font-mono">user_id: {post.author_user_id}</p>
            )}
          </div>
        </section>

        {/* Content actions */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Content actions</p>

          {showFlagConfirm ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 font-medium">
                  Flag and hide this post? An advisory notification will be sent to the author.
                </p>
              </div>
              <div>
                <label className="block text-xs text-amber-700 font-medium mb-1">Advisory message to author</label>
                <textarea
                  value={flagMessage}
                  onChange={e => setFlagMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowFlagConfirm(false)}>Cancel</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFlag}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-100"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Confirm flag & notify
                </Button>
              </div>
            </div>
          ) : showRemoveConfirm ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">
                  Remove this post? It will be hidden from all members. A notification will be sent to the author.
                </p>
              </div>
              <div>
                <label className="block text-xs text-red-700 font-medium mb-1">Message to author</label>
                <textarea
                  value={removeMessage}
                  onChange={e => setRemoveMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowRemoveConfirm(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-red-700"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Confirm remove & notify
                </Button>
              </div>
            </div>
          ) : showDeleteConfirm ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">
                  Permanently delete this post and all its replies? This cannot be undone. The author will be notified.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Permanently delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentStatus === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFlagConfirm(true)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Flag & advise
                </Button>
              )}
              {currentStatus !== 'removed' && currentStatus !== 'hidden' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRemoveConfirm(true)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Remove & notify
                </Button>
              )}
              {(currentStatus === 'hidden' || currentStatus === 'removed') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestore}
                  disabled={isPending}
                  className="flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Restore
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
                className="flex items-center gap-1.5 text-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete post
              </Button>
            </div>
          )}
        </section>

        {/* Member actions */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Member actions</p>

          {showMessageComposer ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">Send advisory message to author</p>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Subject</label>
                <input
                  type="text"
                  value={msgSubject}
                  onChange={e => setMsgSubject(e.target.value)}
                  placeholder="e.g. Reminder about community guidelines"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Message</label>
                <textarea
                  value={msgBody}
                  onChange={e => setMsgBody(e.target.value)}
                  rows={4}
                  placeholder="Write your advisory message…"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowMessageComposer(false)}>Cancel</Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={isPending}
                  className="flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send message
                </Button>
              </div>
            </div>
          ) : showBanConfirm ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">
                  Ban this member from the community? They will be notified. Their account remains active.
                </p>
              </div>
              <input
                type="text"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                placeholder="Ban reason (optional — shown to admins only)"
                className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <div>
                <label className="block text-xs text-red-700 font-medium mb-1">Message to member</label>
                <textarea
                  value={banMessage}
                  onChange={e => setBanMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowBanConfirm(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBan}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-red-700"
                >
                  <ShieldOff className="w-3.5 h-3.5" />
                  Confirm ban & notify
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMessageComposer(true)}
                disabled={isPending}
                className="flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Send advisory
              </Button>
              {isBanned ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnban}
                  disabled={isPending}
                  className="flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Unban member
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBanConfirm(true)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <ShieldOff className="w-3.5 h-3.5" />
                  Ban member
                </Button>
              )}
            </div>
          )}
        </section>

        {actionError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {actionError}
          </p>
        )}
      </div>
    </div>
  )
}
