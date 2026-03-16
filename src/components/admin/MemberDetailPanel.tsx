import { useState } from 'react'
import { X, ShieldOff, Shield, Send, Trash2, FileText, TriangleAlert as AlertTriangle, Eye, EyeOff, ExternalLink, MessageSquare } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  banCommunityMember,
  unbanCommunityMember,
  sendMemberNotification,
  listPostsByUser,
  moderatePost,
  type CommunityProfile,
  type AuthMemberRow,
  type PostStatus,
} from '../../lib/community'
import { callAdminDeleteUser } from '../../lib/admin'
import CommunityStatusBadge from '../community/CommunityStatusBadge'
import { Button } from '../ui/Button'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

interface Props {
  profile: CommunityProfile | null
  authMember: AuthMemberRow | null
  onClose: () => void
  onMemberUpdated?: () => void
}

const DEFAULT_BAN_MSG = 'Your account has been restricted from posting in the community forum due to violations of our community guidelines. Your account remains active. If you believe this is an error, please contact support.'

export default function MemberDetailPanel({ profile, authMember, onClose, onMemberUpdated }: Props) {
  const queryClient = useQueryClient()
  const userId = profile?.user_id ?? authMember?.id ?? ''

  const [actionError, setActionError] = useState<string | null>(null)
  const [showBanConfirm, setShowBanConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMessageComposer, setShowMessageComposer] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banMessage, setBanMessage] = useState(DEFAULT_BAN_MSG)
  const [msgSubject, setMsgSubject] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')

  const isBanned = profile?.is_banned ?? false

  const { data: posts = [], refetch: refetchPosts } = useQuery({
    queryKey: ['community', 'admin', 'user-posts', userId],
    queryFn: () => listPostsByUser({ userId, limit: 20 }),
    enabled: !!userId && !!profile,
    staleTime: 30_000,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['community', 'admin', 'members'] })
    queryClient.invalidateQueries({ queryKey: ['community', 'admin', 'auth-members'] })
    queryClient.invalidateQueries({ queryKey: ['community', 'admin', 'user-posts', userId] })
    queryClient.invalidateQueries({ queryKey: ['community', 'profile', userId] })
    onMemberUpdated?.()
  }

  const banMut = useMutation({
    mutationFn: banCommunityMember,
    onSuccess: invalidate,
  })

  const unbanMut = useMutation({
    mutationFn: unbanCommunityMember,
    onSuccess: invalidate,
  })

  const sendNotifMut = useMutation({
    mutationFn: sendMemberNotification,
  })

  const moderatePostMut = useMutation({
    mutationFn: (params: { postId: string; post_status: PostStatus }) => moderatePost(params),
    onSuccess: () => {
      refetchPosts()
      queryClient.invalidateQueries({ queryKey: ['community', 'admin', 'posts'] })
    },
  })

  const isPending = banMut.isPending || unbanMut.isPending || sendNotifMut.isPending || moderatePostMut.isPending

  const doAction = async (fn: () => Promise<void>) => {
    setActionError(null)
    try {
      await fn()
    } catch (e: any) {
      setActionError(e?.message ?? 'Action failed. Please try again.')
    }
  }

  const handleBan = () =>
    doAction(async () => {
      await banMut.mutateAsync({ userId, reason: banReason.trim() || undefined })
      await sendNotifMut.mutateAsync({
        userId,
        type: 'account_banned',
        subject: 'Your community access has been restricted',
        message: banMessage,
      })
      setShowBanConfirm(false)
      setBanReason('')
    })

  const handleUnban = () =>
    doAction(async () => {
      await unbanMut.mutateAsync(userId)
    })

  const handleSendMessage = () =>
    doAction(async () => {
      if (!msgSubject.trim() || !msgBody.trim()) {
        setActionError('Subject and message are required.')
        return
      }
      await sendNotifMut.mutateAsync({
        userId,
        type: 'advisory',
        subject: msgSubject.trim(),
        message: msgBody.trim(),
      })
      setShowMessageComposer(false)
      setMsgSubject('')
      setMsgBody('')
    })

  const handleDeleteUser = () =>
    doAction(async () => {
      if (!authMember?.email) return
      if (deleteConfirmEmail.trim().toLowerCase() !== authMember.email.toLowerCase()) {
        setActionError('Email does not match. Please type the exact email to confirm deletion.')
        return
      }
      await callAdminDeleteUser(authMember.email)
      setShowDeleteConfirm(false)
      invalidate()
      onClose()
    })

  const displayName = profile
    ? `@${profile.handle}`
    : authMember?.display_name || authMember?.email || 'Unknown member'

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {profile && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: profile.avatar_color }}
            >
              {profile.handle.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-slate-800">{displayName}</h2>
            {isBanned && (
              <span className="text-xs text-red-600 font-medium">Banned from community</span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Profile summary */}
        {profile && (
          <section>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Community profile</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                  style={{ backgroundColor: profile.avatar_color }}
                >
                  {profile.handle.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">@{profile.handle}</p>
                  <p className="text-xs text-slate-500">
                    {profile.post_count} posts · {profile.reply_count} replies
                  </p>
                </div>
              </div>
              {profile.bio && (
                <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Joined {timeAgo(profile.created_at)}</span>
                {isBanned && profile.ban_reason && (
                  <span className="text-red-500">Ban: {profile.ban_reason}</span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Auth info */}
        {authMember && (
          <section>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Auth account</p>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">{authMember.email ?? 'No email'}</p>
                {authMember.disabled && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-full px-2 py-0.5">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Role: {authMember.role} · Registered {timeAgo(authMember.created_at)}
              </p>
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Member actions</p>

          {showMessageComposer ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">Send advisory message</p>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Subject</label>
                <input
                  type="text"
                  value={msgSubject}
                  onChange={e => setMsgSubject(e.target.value)}
                  placeholder="e.g. Community guidelines reminder"
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
                  Ban this member? They will receive a notification. Their auth account stays active.
                </p>
              </div>
              <input
                type="text"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                placeholder="Ban reason (shown to admins only)"
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
          ) : showDeleteConfirm ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-semibold">Permanently delete this account?</p>
                  <p className="text-xs text-red-700 mt-0.5">
                    All data including observations, posts, and profile will be permanently removed. This cannot be undone.
                  </p>
                </div>
              </div>
              {authMember?.email && (
                <div>
                  <label className="block text-xs text-red-700 font-medium mb-1">
                    Type <strong>{authMember.email}</strong> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmEmail}
                    onChange={e => setDeleteConfirmEmail(e.target.value)}
                    placeholder={authMember.email}
                    className="w-full px-3 py-2 rounded-lg border border-red-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmEmail('') }}>Cancel</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteUser}
                  disabled={isPending || !authMember?.email}
                  className="flex items-center gap-1.5 text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete account
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMessageComposer(true)}
                className="flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Send advisory
              </Button>
              {profile && (
                isBanned ? (
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
                    className="flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <ShieldOff className="w-3.5 h-3.5" />
                    Ban from community
                  </Button>
                )
              )}
              {authMember && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-red-700 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete account
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Post history */}
        {profile && posts.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Post history ({posts.length})
            </p>
            <div className="space-y-2">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-700 flex-1 leading-snug">{post.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {post.post_status !== 'active' && (
                        <CommunityStatusBadge status={post.post_status} size="sm" />
                      )}
                      <a
                        href={`/community/posts/${post.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title="View post"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 line-clamp-1">{post.body}</p>
                  <div className="flex items-center gap-2">
                    {post.post_status === 'active' && (
                      <button
                        onClick={() => moderatePostMut.mutate({ postId: post.id, post_status: 'removed' })}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                      >
                        <EyeOff className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                    {(post.post_status === 'hidden' || post.post_status === 'removed') && (
                      <button
                        onClick={() => moderatePostMut.mutate({ postId: post.id, post_status: 'active' })}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors disabled:opacity-50"
                      >
                        <Eye className="w-3 h-3" />
                        Restore
                      </button>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">{timeAgo(post.created_at)}</span>
                  </div>
                </div>
              ))}
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
