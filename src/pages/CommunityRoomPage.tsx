import { useState } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import {
  MessageCircle, PenLine, Clock, TrendingUp, ShieldOff, type LucideIcon
} from 'lucide-react'
import { useCommunityRoom } from '../hooks/useCommunityRooms'
import { useCommunityPosts } from '../hooks/useCommunityPosts'
import { useMyCommunityProfile } from '../hooks/useCommunityProfile'
import CommunityPostCard from '../components/community/CommunityPostCard'
import CommunityEmptyState from '../components/community/CommunityEmptyState'
import CommunityLoadingState from '../components/community/CommunityLoadingState'
import Breadcrumbs from '../components/common/Breadcrumbs'
import { useLocale } from '../i18n/LocaleContext'
import { Button } from '../components/ui/Button'
import type { PostSortMode } from '../lib/community'

const SORT_OPTIONS: { value: PostSortMode; label: string; icon: LucideIcon }[] = [
  { value: 'activity', label: 'Recent activity', icon: Clock },
  { value: 'newest', label: 'Newest', icon: TrendingUp },
  { value: 'most_replies', label: 'Most replies', icon: MessageCircle },
]

export default function CommunityRoomPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t } = useLocale()
  const { data: room, isLoading: roomLoading, error: roomError } = useCommunityRoom(slug)
  const [sort, setSort] = useState<PostSortMode>('activity')
  const { data: posts, isLoading: postsLoading, isError: postsError } = useCommunityPosts(room?.id, sort)
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile()

  if (roomError) return <Navigate to="/community" replace />

  const hasProfile = !profileLoading && !!profile
  const isBanned = profile?.is_banned ?? false

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Breadcrumbs items={[{ label: t('nav.caregiver_forum'), to: '/community' }, { label: room?.name ?? '' }]} />

          {/* Room header */}
          {roomLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="p-5 border-b border-slate-100">
                <div className="h-5 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
              <div className="px-5 py-3">
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
          ) : room ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div
                className="px-5 pt-4 pb-3 border-b"
                style={{ backgroundColor: `${room.color}1A`, borderBottomColor: `${room.color}33` }}
              >
                <h1 className="text-xl font-bold mb-1" style={{ color: room.color }}>{room.name}</h1>
                <p className="text-sm leading-relaxed" style={{ color: `${room.color}CC` }}>{room.description}</p>
              </div>
              <div className="px-5 py-3 flex items-center gap-1.5 text-slate-400">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">
                  {room.post_count === 0
                    ? 'No posts yet'
                    : `${room.post_count} ${room.post_count === 1 ? 'post' : 'posts'}`}
                </span>
              </div>
            </div>
          ) : null}

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
              isBanned ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium">
                  <ShieldOff className="w-3.5 h-3.5 flex-shrink-0" />
                  Posting restricted
                </div>
              ) : (
                <Link to={`/community/rooms/${slug}/new-post`}>
                  <Button variant="primary" size="sm">
                    <PenLine className="w-4 h-4 mr-1.5 inline" />
                    New post
                  </Button>
                </Link>
              )
            )}
          </div>

          {/* Posts */}
          {postsLoading ? (
            <CommunityLoadingState count={4} />
          ) : postsError ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-slate-500 text-sm">Could not load posts. Please refresh the page to try again.</p>
            </div>
          ) : (posts ?? []).length > 0 ? (
            <div className="space-y-3">
              {(posts ?? []).map(post => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <CommunityEmptyState
              title="No posts in this room yet"
              description="Be the first to start a conversation. Your experience could help someone today."
              action={
                hasProfile && !isBanned
                  ? {
                      label: 'Start the first post',
                      onClick: () => navigate(`/community/rooms/${slug}/new-post`),
                    }
                  : undefined
              }
            />
          )}

        </div>
      </div>
    </>
  )
}
