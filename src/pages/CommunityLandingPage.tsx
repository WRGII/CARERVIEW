import { useState } from 'react'
import { Users, Heart, Sparkles, ArrowRight, MessageCircle } from 'lucide-react'
import { useCommunityRooms } from '../hooks/useCommunityRooms'
import { useMyCommunityProfile } from '../hooks/useCommunityProfile'
import { useCommunityPosts, useRecentCommunityPosts } from '../hooks/useCommunityPosts'
import CommunityWelcomeFlow from '../components/community/CommunityWelcomeFlow'
import CommunityRoomCard from '../components/community/CommunityRoomCard'
import CommunityGuidelinesBanner from '../components/community/CommunityGuidelinesBanner'
import CommunityPostCard from '../components/community/CommunityPostCard'
import CommunityLoadingState from '../components/community/CommunityLoadingState'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'
import type { CommunityRoom } from '../lib/community'

function RoomDiscussions({
  room,
  hasProfile,
}: {
  room: CommunityRoom | null
  hasProfile: boolean
}) {
  const { data: roomPosts, isLoading: roomPostsLoading } = useCommunityPosts(room?.id, 'activity')
  const { data: recentPosts, isLoading: recentLoading } = useRecentCommunityPosts(6)

  const isLoading = room ? roomPostsLoading : recentLoading
  const posts = room ? roomPosts : recentPosts
  const viewAllHref = room ? `/community/rooms/${room.slug}` : '/community/rooms/general-support'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            {room ? room.name : 'Recent Discussions'}
          </h2>
          {room && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{room.description}</p>
          )}
        </div>
        {room && (
          <Link
            to={`/community/rooms/${room.slug}`}
            className="flex items-center gap-1 text-xs font-medium text-cyan-primary hover:text-cyan-hover transition-colors flex-shrink-0 ml-2"
          >
            Full room
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <CommunityLoadingState count={3} />
      ) : posts && posts.length > 0 ? (
        <div className="space-y-2.5 flex-1">
          {posts.slice(0, 5).map(post => (
            <CommunityPostCard key={post.id} post={post} showRoom={!room} />
          ))}
          <Link
            to={viewAllHref}
            className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-cyan-primary hover:text-cyan-hover transition-colors"
          >
            See all discussions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white/70 rounded-2xl border border-slate-100 p-6 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 bg-cyan-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-5 h-5 text-cyan-primary" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">No discussions yet</p>
          <p className="text-xs text-slate-400">
            {hasProfile
              ? 'Be the first to start one in this room.'
              : 'Join the community to start the first discussion.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default function CommunityLandingPage() {
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile()
  const { data: rooms, isLoading: roomsLoading } = useCommunityRooms()
  const [showWelcome, setShowWelcome] = useState(false)
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)

  const hasProfile = !!profile && !profileLoading
  const needsOnboarding = !profileLoading && !profile

  const activeRoom = rooms?.find(r => r.id === activeRoomId) ?? null

  return (
    <>
      {showWelcome && (
        <CommunityWelcomeFlow
          onComplete={() => setShowWelcome(false)}
          onDismiss={() => setShowWelcome(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">

          {/* Page header — condensed */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Users className="w-5 h-5 text-cyan-primary" />
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                  Caregiver Community
                </h1>
              </div>
              <p className="text-slate-500 text-sm">
                Peer support and practical wisdom from caregivers who understand
              </p>
            </div>

            {hasProfile ? (
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: profile.avatar_color }}
                  >
                    {profile.handle.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-none">{profile.handle}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{profile.post_count} posts · {profile.reply_count} replies</p>
                  </div>
                </div>
              </div>
            ) : needsOnboarding ? (
              <Button variant="primary" size="sm" onClick={() => setShowWelcome(true)}>
                <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
                Join Community
              </Button>
            ) : null}
          </div>

          {/* Guidelines banner */}
          {hasProfile && <CommunityGuidelinesBanner />}

          {/* Not-joined prompt */}
          {needsOnboarding && (
            <div className="bg-gradient-to-br from-peach-blush/30 via-white to-mint-green/20 border border-peach-blush/60 rounded-2xl p-5 sm:p-6 text-center">
              <div className="w-12 h-12 bg-cyan-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-cyan-primary" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1.5">
                You're not in the community yet
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-4">
                Browse the rooms below, or join to start posting and connecting with other caregivers.
                It only takes a minute.
              </p>
              <Button variant="primary" size="md" onClick={() => setShowWelcome(true)}>
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Join Caregiver Community
              </Button>
              <p className="text-xs text-slate-400 mt-2">Free for all registered CarerView users</p>
            </div>
          )}

          {/* Main split panel: rooms nav + discussions */}
          <div className="grid grid-cols-[40%_1fr] sm:grid-cols-[2fr_3fr] gap-4 items-start">

            {/* Left: Room navigation */}
            <div className="bg-warm-white rounded-2xl shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Rooms</h2>
                <span className="text-xs text-slate-400">{rooms?.length ?? 0}</span>
              </div>

              <div className="p-2">
                {/* "All recent" item */}
                <button
                  type="button"
                  onClick={() => setActiveRoomId(null)}
                  className={`w-full group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                    activeRoomId === null
                      ? 'bg-cyan-primary/10 border-l-2 border-cyan-primary pl-2.5'
                      : 'hover:bg-warm-white border-l-2 border-transparent pl-2.5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-cyan-primary/10">
                    <Sparkles className="w-4 h-4 text-cyan-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug truncate transition-colors ${
                      activeRoomId === null ? 'text-cyan-dark' : 'text-slate-700 group-hover:text-slate-800'
                    }`}>
                      All Recent
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Latest activity</p>
                  </div>
                </button>

                {roomsLoading ? (
                  <div className="space-y-1 mt-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-3 bg-slate-100 rounded w-3/4 mb-1.5" />
                          <div className="h-2.5 bg-slate-50 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : rooms && rooms.length > 0 ? (
                  <div className="mt-1 space-y-0.5">
                    {rooms.map(room => (
                      <CommunityRoomCard
                        key={room.id}
                        room={room}
                        variant="nav-item"
                        active={activeRoomId === room.id}
                        onClick={() => setActiveRoomId(room.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 px-3 py-4 text-center">No rooms yet</p>
                )}
              </div>
            </div>

            {/* Right: Discussions panel */}
            <div className="bg-warm-white rounded-2xl shadow-md p-4 min-h-[400px]">
              <RoomDiscussions room={activeRoom} hasProfile={hasProfile} />
            </div>
          </div>

          {/* About this community */}
          <div className="bg-warm-white rounded-2xl shadow-md p-5 sm:p-7">
            <h2 className="text-base font-bold text-slate-800 mb-4">About this community</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-primary/8 to-cyan-primary/3 rounded-2xl border border-cyan-primary/15 flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Real caregivers</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Connect with others navigating the same challenges — family and professional caregivers alike.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-peach-blush/40 to-peach-blush/10 rounded-2xl border border-peach-blush/40 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Peer support only</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    This is not a medical service. Nothing here replaces professional care advice or clinical guidance.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-mint-green/20 to-mint-green/5 rounded-2xl border border-mint-green/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Post anonymously</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    When you need to share something sensitive, you can post without your handle being shown.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
