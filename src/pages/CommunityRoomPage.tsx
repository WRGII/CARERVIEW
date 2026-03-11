import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import {
  MessageCircle, Lightbulb, Brain, Heart, Users, Compass,
  ArrowLeft, PenLine, type LucideIcon
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

const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle, Lightbulb, Brain, Heart, Users, Compass,
}

export default function CommunityRoomPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: room, isLoading: roomLoading, error: roomError } = useCommunityRoom(slug)
  const { data: posts, isLoading: postsLoading } = useCommunityPosts(room?.id)
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile()
  const [showWelcome, setShowWelcome] = useState(false)

  if (roomError) return <Navigate to="/community" replace />

  const Icon = room ? (ICON_MAP[room.icon_name] ?? MessageCircle) : MessageCircle
  const hasProfile = !profileLoading && !!profile

  return (
    <>
      {showWelcome && (
        <CommunityWelcomeFlow onComplete={() => setShowWelcome(false)} />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Breadcrumb back */}
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

          {/* Action bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-700">Discussions</h2>
            {hasProfile ? (
              <Link to={`/community/rooms/${slug}/new-post`}>
                <Button variant="primary" size="sm">
                  <PenLine className="w-4 h-4 mr-1.5 inline" />
                  New post
                </Button>
              </Link>
            ) : !profileLoading ? (
              <Button variant="outline" size="sm" onClick={() => setShowWelcome(true)}>
                <PenLine className="w-4 h-4 mr-1.5 inline" />
                Join to post
              </Button>
            ) : null}
          </div>

          {/* Posts */}
          {postsLoading ? (
            <CommunityLoadingState count={4} />
          ) : posts && posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map(post => (
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
                hasProfile
                  ? { label: 'Start first post', onClick: () => {} }
                  : { label: 'Join Community', onClick: () => setShowWelcome(true) }
              }
            />
          )}

        </div>
      </div>
    </>
  )
}
