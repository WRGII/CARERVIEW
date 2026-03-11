import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft, Lock, Flag, MessageCircle, Users
} from 'lucide-react'
import { useCommunityPost } from '../hooks/useCommunityPosts'
import { useCommunityReplies } from '../hooks/useCommunityReplies'
import { useMyCommunityProfile } from '../hooks/useCommunityProfile'
import { maskAuthor } from '../lib/community'
import { useAuth } from '../hooks/useAuth'
import ReactionBar from '../components/community/ReactionBar'
import ReplyComposer from '../components/community/ReplyComposer'
import CommunityReplyList from '../components/community/CommunityReplyList'
import AnonymousBadge from '../components/community/AnonymousBadge'
import ReportModal from '../components/community/ReportModal'
import CommunityWelcomeFlow from '../components/community/CommunityWelcomeFlow'

const HELP_TYPE_LABELS: Record<string, string> = {
  emotional_support: 'Emotional Support',
  practical_tips: 'Practical Tips',
  similar_experiences: 'Similar Experiences',
  question: 'Question',
  resource: 'Resource',
}

const HELP_TYPE_COLORS: Record<string, string> = {
  emotional_support: 'bg-rose-50 text-rose-600 border-rose-100',
  practical_tips: 'bg-amber-50 text-amber-600 border-amber-100',
  similar_experiences: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  question: 'bg-blue-50 text-blue-600 border-blue-100',
  resource: 'bg-green-50 text-green-600 border-green-100',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CommunityPostPage() {
  const { postId } = useParams<{ postId: string }>()
  const { data: post, isLoading: postLoading, error: postError } = useCommunityPost(postId)
  const { data: replies, isLoading: repliesLoading } = useCommunityReplies(post?.id)
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile()
  const { user } = useAuth()

  const [showReport, setShowReport] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  if (postError || (!postLoading && !post)) return <Navigate to="/community" replace />

  const postAuthor = post ? maskAuthor(post, user?.id) : null
  const hasProfile = !!profile && !profileLoading
  const isBanned = profile?.is_banned ?? false
  const roomSlug = post?.room?.slug
  const helpTypeLabel = post?.help_type ? HELP_TYPE_LABELS[post.help_type] : null
  const helpTypeColor = post?.help_type ? HELP_TYPE_COLORS[post.help_type] : null

  const isHiddenOrRemoved =
    post?.post_status === 'hidden' || post?.post_status === 'removed'

  return (
    <>
      {showWelcome && (
        <CommunityWelcomeFlow onComplete={() => setShowWelcome(false)} />
      )}
      {showReport && post && (
        <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-slate-400" aria-label="Breadcrumb">
            <Link to="/community" className="hover:text-slate-600 transition-colors">Community</Link>
            <span>/</span>
            {roomSlug && post?.room?.name ? (
              <Link to={`/community/rooms/${roomSlug}`} className="hover:text-slate-600 transition-colors truncate max-w-[120px]">
                {post.room.name}
              </Link>
            ) : <span>Room</span>}
            <span>/</span>
            <span className="text-slate-500 truncate max-w-[140px]">Post</span>
          </nav>

          {/* Back link */}
          {roomSlug && (
            <Link
              to={`/community/rooms/${roomSlug}`}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to {post?.room?.name ?? 'room'}
            </Link>
          )}

          {/* Post card */}
          {postLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ) : post ? (
            <article className="bg-white rounded-2xl border border-slate-200 p-6">

              {/* Room tag + help type */}
              {(post.room || helpTypeLabel) && (
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {post.room && (
                    <Link
                      to={`/community/rooms/${post.room.slug}`}
                      className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                      style={{ backgroundColor: `${post.room.color}22`, color: post.room.color }}
                    >
                      {post.room.name}
                    </Link>
                  )}
                  {helpTypeLabel && helpTypeColor && (
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${helpTypeColor}`}>
                      {helpTypeLabel}
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="text-xl font-bold text-slate-800 leading-snug mb-4">
                {isHiddenOrRemoved ? (
                  <span className="text-slate-400 italic">[Post removed by moderator]</span>
                ) : post.title}
              </h1>

              {/* Body */}
              {!isHiddenOrRemoved && (
                <div className="prose prose-sm max-w-none mb-6">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base">
                    {post.body}
                  </p>
                </div>
              )}

              {isHiddenOrRemoved && (
                <p className="text-sm text-slate-400 italic mb-6 bg-slate-50 rounded-xl px-4 py-3">
                  This post has been removed and is no longer visible to the community.
                </p>
              )}

              {/* Author row */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: postAuthor?.avatarColor }}
                      aria-hidden="true"
                    >
                      {postAuthor?.isAnonymous
                        ? <Users className="w-4 h-4" />
                        : postAuthor?.displayHandle.charAt(0).toUpperCase()
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-700">
                          {postAuthor?.displayHandle}
                        </p>
                        {postAuthor?.isAnonymous && (
                          <AnonymousBadge size="sm" isCurrentUser={postAuthor.isCurrentUser} />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{timeAgo(post.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 flex-shrink-0">
                    <span className="flex items-center gap-1 text-sm" title={`${post.reply_count} replies`}>
                      <MessageCircle className="w-4 h-4" />
                      {post.reply_count}
                    </span>
                    {post.is_locked && (
                      <span className="flex items-center gap-1 text-sm text-amber-500">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs font-medium">Locked</span>
                      </span>
                    )}
                    {hasProfile && !isHiddenOrRemoved && (
                      <button
                        onClick={() => setShowReport(true)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 rounded"
                        title="Report this post"
                        aria-label="Report this post"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        Report
                      </button>
                    )}
                  </div>
                </div>

                {/* Reaction bar */}
                {!isHiddenOrRemoved && (
                  <div>
                    {!hasProfile && !profileLoading && (
                      <p className="text-xs text-slate-400 mb-2">
                        <button
                          onClick={() => setShowWelcome(true)}
                          className="underline hover:text-slate-600 transition-colors"
                        >
                          Join the community
                        </button>{' '}
                        to react to this post.
                      </p>
                    )}
                    <ReactionBar
                      postId={post.id}
                      hasProfile={hasProfile}
                      onJoinPrompt={() => setShowWelcome(true)}
                    />
                  </div>
                )}
              </div>
            </article>
          ) : null}

          {/* Replies section */}
          {post && (
            <section aria-label="Replies">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-4 h-4 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-700">
                  {replies
                    ? `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`
                    : 'Replies'}
                </h2>
              </div>

              <CommunityReplyList
                replies={replies}
                isLoading={repliesLoading}
                currentUserId={user?.id}
                hasProfile={hasProfile}
              />
            </section>
          )}

          {/* Reply compose or locked/join prompt */}
          {post && !post.is_locked && !isHiddenOrRemoved ? (
            hasProfile ? (
              <ReplyComposer
                postId={post.id}
                profile={profile!}
                isBanned={isBanned}
              />
            ) : !profileLoading ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                <p className="text-sm text-slate-600 mb-3">
                  Join the community to reply to this thread.
                </p>
                <button
                  onClick={() => setShowWelcome(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-primary text-white text-sm font-medium rounded-xl hover:bg-cyan-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  Join Community
                </button>
              </div>
            ) : null
          ) : post?.is_locked ? (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                This post is locked and no longer accepting replies.
              </p>
            </div>
          ) : null}

        </div>
      </div>
    </>
  )
}
