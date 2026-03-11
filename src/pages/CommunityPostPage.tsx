import { useParams, Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft, MessageCircle, Heart, Users, Clock,
  Lock, Flag, Smile
} from 'lucide-react'
import { useCommunityPost } from '../hooks/useCommunityPosts'
import { useCommunityReplies } from '../hooks/useCommunityReplies'
import { useMyCommunityProfile } from '../hooks/useCommunityProfile'
import { maskAuthor } from '../lib/community'
import { useAuth } from '../hooks/useAuth'
import CommunityLoadingState from '../components/community/CommunityLoadingState'

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
  const { data: profile } = useMyCommunityProfile()
  const { user } = useAuth()

  if (postError || (!postLoading && !post)) return <Navigate to="/community" replace />

  const postAuthor = post ? maskAuthor(post, user?.id) : null
  const hasProfile = !!profile
  const roomSlug = post?.room?.slug

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/community" className="hover:text-slate-700 transition-colors">Community</Link>
          <span>/</span>
          {roomSlug && post?.room?.name ? (
            <Link to={`/community/rooms/${roomSlug}`} className="hover:text-slate-700 transition-colors">
              {post.room.name}
            </Link>
          ) : <span>Room</span>}
          <span>/</span>
          <span className="text-slate-400 truncate max-w-xs">Post</span>
        </div>

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
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            {post.room && (
              <div className="mb-3">
                <span
                  className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${post.room.color}22`, color: post.room.color }}
                >
                  {post.room.name}
                </span>
              </div>
            )}

            <h1 className="text-xl font-bold text-slate-800 mb-3 leading-snug">
              {post.title}
            </h1>

            <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap mb-6">
              {post.body}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: postAuthor?.avatarColor }}
                >
                  {postAuthor?.isAnonymous
                    ? <Users className="w-4 h-4" />
                    : postAuthor?.displayHandle.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{postAuthor?.displayHandle}</p>
                  <p className="text-xs text-slate-400">{timeAgo(post.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400 text-sm">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {post.reply_count}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {post.reaction_count}
                </span>
                {post.is_locked && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs">Locked</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick reactions placeholder */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">React:</span>
              {(['❤️', '🤗', '💡'] as const).map((emoji, i) => (
                <button
                  key={i}
                  disabled={!hasProfile}
                  title={!hasProfile ? 'Join community to react' : undefined}
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-sm hover:border-cyan-300 hover:bg-cyan-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emoji}
                </button>
              ))}
              <div className="ml-auto">
                <button
                  disabled={!hasProfile}
                  title={!hasProfile ? 'Join community to report' : 'Report post'}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Report
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Replies section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-slate-400" />
              {replies ? `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}` : 'Replies'}
            </h2>
          </div>

          {repliesLoading ? (
            <CommunityLoadingState count={2} />
          ) : replies && replies.length > 0 ? (
            replies.map(reply => {
              const replyAuthor = maskAuthor(
                { ...reply, author_profile: reply.author_profile ?? null },
                user?.id
              )
              return (
                <div key={reply.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: replyAuthor.avatarColor }}
                    >
                      {replyAuthor.isAnonymous
                        ? <Users className="w-4 h-4" />
                        : replyAuthor.displayHandle.charAt(0).toUpperCase()
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-700">
                          {replyAuthor.displayHandle}
                        </span>
                        <span className="text-xs text-slate-400">{timeAgo(reply.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {reply.body}
                      </p>
                    </div>
                    <button
                      disabled={!hasProfile}
                      title={!hasProfile ? 'Join community to report' : 'Report reply'}
                      className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          ) : post && !post.is_locked ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-slate-200">
              <Smile className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No replies yet.</p>
              {hasProfile && (
                <p className="text-sm text-slate-400 mt-0.5">Be the first to respond.</p>
              )}
            </div>
          ) : null}
        </div>

        {/* Reply compose area placeholder */}
        {post && !post.is_locked ? (
          hasProfile ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: profile?.avatar_color }}
                >
                  {profile?.handle.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-medium text-slate-700">Reply as {profile?.handle}</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-slate-400 text-center">
                Reply functionality coming in Phase 4
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
              <p className="text-sm text-slate-600 mb-3">Join the community to reply</p>
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-primary text-white text-sm font-medium rounded-lg hover:bg-cyan-hover transition-colors"
              >
                Join Community
              </Link>
            </div>
          )
        ) : post?.is_locked ? (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">This post has been locked and is no longer accepting replies.</p>
          </div>
        ) : null}

      </div>
    </div>
  )
}
