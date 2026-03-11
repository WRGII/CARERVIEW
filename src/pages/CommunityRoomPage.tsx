import { useState, useMemo } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import {
  MessageCircle, Lightbulb, Brain, Heart, Users, Compass,
  ArrowLeft, PenLine, Clock, TrendingUp, type LucideIcon
} from 'lucide-react'
import { useCommunityRoom } from '../hooks/useCommunityRooms'
import { useCommunityPosts } from '../hooks/useCommunityPosts'
import { useMyCommunityProfile } from '../hooks/useCommunityProfile'
import CommunityPostCard from '../components/community/CommunityPostCard'
import CommunityEmptyState from '../components/community/CommunityEmptyState'
import CommunityLoadingState from '../components/community/CommunityLoadingState'
import CommunityGuidelinesBanner from '../components/community/CommunityGuidelinesBanner'
import CommunityWelcomeFlow from '../components/community/CommunityWelcomeFlow'
import { Button } from '../components/ui/Button'
import type { CommunityPost } from '../lib/community'

const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle, Lightbulb, Brain, Heart, Users, Compass,
}

type SortMode = 'activity' | 'newest' | 'most_replies'

const SORT_OPTIONS: { value: SortMode; label: string; icon: LucideIcon }[] = [
  { value: 'activity', label: 'Recent activity', icon: Clock },
  { value: 'newest', label: 'Newest', icon: TrendingUp },
  { value: 'most_replies', label: 'Most replies', icon: MessageCircle },
]

function sortPosts(posts: CommunityPost[], mode: SortMode): CommunityPost[] {
  const copy = [...posts]
  if (mode === 'activity') {
    return copy.sort((a, b) => new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime())
  }
  if (mode === 'newest') {
    return copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  if (mode === 'most_replies') {
    return copy.sort((a, b) => b.reply_count - a.reply_count)
  }
  return copy
}

export default function CommunityRoomPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: room, isLoading: roomLoading, error: roomError } = useCommunityRoom(slug)
  const { data: posts, isLoading: postsLoading } = useCommunityPosts(room?.id)
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile()
  const [showWelcome, setShowWelcome] = useState(false)
  const [sort, setSort] = useState<SortMode>('activity')

  if (roomError) return <Navigate to="/community" replace />

  const Icon = room ? (ICON_MAP[room.icon_name] ?? MessageCircle) : MessageCircle
  const hasProfile = !profileLoading && !!profile
  const isBanned = profile?.is_banned ?? false

  const sortedPosts = useMemo(
    () => (posts ? sortPosts(posts, sort) : []),
    [posts, sort]
  )

  return (
    <>
      {showWelcome && (
        <CommunityWelcomeFlow onComplete={() => setShowWelcome(false)} />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Back link */}
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            All rooms
          </Link>

          {/* Room header */}
          {roomLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
            </div>
          ) : room ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${room.color}22`, color: room.color }}
                  aria-hidden="true"
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-slate-800 mb-1">{room.name}</h1>
                  <p className="text-sm text-slate-500 leading-relaxed">{room.description}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {room.post_count === 0
                        ? 'No posts yet'
                        : `${room.post_count} ${room.post_count === 1 ? 'post' : 'posts'}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Guidelines banner */}
          {hasProfile && <CommunityGuidelinesBanner />}

          {/* Action bar with sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              {SORT_OPTIONS.map(option => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      sort === option.value
                        ? 'bg-slate-800 text-white font-medium'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    aria-pressed={sort === option.value}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {option.label}
                  </button>
                )
              })}
            </div>

            {!profileLoading && (
              isBanned ? null :
              hasProfile ? (
                <Link to={`/community/rooms/${slug}/new-post`}>
                  <Button variant="primary" size="sm">
                    <PenLine className="w-4 h-4 mr-1.5 inline" />
                    New post
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowWelcome(true)}>
                  <PenLine className="w-4 h-4 mr-1.5 inline" />
                  Join to post
                </Button>
              )
            )}
          </div>

          {/* Posts */}
          {postsLoading ? (
            <CommunityLoadingState count={4} />
          ) : sortedPosts.length > 0 ? (
            <div className="space-y-3">
              {sortedPosts.map(post => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <CommunityEmptyState
              title="No posts in this room yet"
              description={
                hasProfile
                  ? "Be the first to start a conversation. Your experience could help someone today."
                  : "Join the community to be the first to start a conversation here."
              }
              action={
                hasProfile && !isBanned
                  ? {
                      label: 'Start the first post',
                      onClick: () => window.location.assign(`/community/rooms/${slug}/new-post`),
                    }
                  : !hasProfile
                  ? { label: 'Join Community', onClick: () => setShowWelcome(true) }
                  : undefined
              }
            />
          )}

        </div>
      </div>
    </>
  )
}
