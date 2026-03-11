import { useState } from 'react'
import { Users, Heart, Sparkles, ArrowRight } from 'lucide-react'
import { useCommunityRooms } from '../hooks/useCommunityRooms'
import { useMyCommunityProfile } from '../hooks/useCommunityProfile'
import { useRecentCommunityPosts } from '../hooks/useCommunityPosts'
import CommunityWelcomeFlow from '../components/community/CommunityWelcomeFlow'
import CommunityRoomCard from '../components/community/CommunityRoomCard'
import CommunityGuidelinesBanner from '../components/community/CommunityGuidelinesBanner'
import CommunityPostCard from '../components/community/CommunityPostCard'
import CommunityLoadingState from '../components/community/CommunityLoadingState'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'

export default function CommunityLandingPage() {
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile()
  const { data: rooms, isLoading: roomsLoading } = useCommunityRooms()
  const { data: recentPosts, isLoading: postsLoading } = useRecentCommunityPosts(5)
  const [showWelcome, setShowWelcome] = useState(false)

  const hasProfile = !!profile && !profileLoading
  const needsOnboarding = !profileLoading && !profile

  const handleJoinClick = () => {
    setShowWelcome(true)
  }

  const handleWelcomeComplete = () => {
    setShowWelcome(false)
  }

  return (
    <>
      {showWelcome && (
        <CommunityWelcomeFlow onComplete={handleWelcomeComplete} onDismiss={() => setShowWelcome(false)} />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-6 h-6 text-cyan-600" />
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Caregiver Community
                </h1>
              </div>
              <p className="text-slate-500 text-sm sm:text-base">
                Peer support and practical wisdom from caregivers who understand
              </p>
            </div>

            {hasProfile ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: profile.avatar_color }}
                  >
                    {profile.handle.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{profile.handle}</p>
                    <p className="text-xs text-slate-500">{profile.post_count} posts · {profile.reply_count} replies</p>
                  </div>
                </div>
              </div>
            ) : needsOnboarding ? (
              <Button variant="primary" size="md" onClick={handleJoinClick}>
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Join Community
              </Button>
            ) : null}
          </div>

          {/* Guidelines banner */}
          {hasProfile && <CommunityGuidelinesBanner />}

          {/* Not-joined prompt */}
          {needsOnboarding && (
            <div className="bg-gradient-to-br from-cyan-50 via-white to-slate-50 border border-cyan-100 rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-cyan-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                You're not in the community yet
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                Browse the rooms below, or join to start posting and connecting with other caregivers.
                It only takes a minute.
              </p>
              <Button variant="primary" size="lg" onClick={handleJoinClick}>
                <Sparkles className="w-5 h-5 mr-2 inline" />
                Join Caregiver Community
              </Button>
              <p className="text-xs text-slate-400 mt-3">Free for all registered CarerView users</p>
            </div>
          )}

          {/* Main grid: rooms + recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Rooms - takes up 2/3 on desktop */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Discussion Rooms</h2>
                <span className="text-xs text-slate-400">
                  {rooms?.length ?? 0} rooms
                </span>
              </div>

              {roomsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                      <div className="flex gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                          <div className="h-3 bg-slate-100 rounded w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : rooms && rooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rooms.map(room => (
                    <CommunityRoomCard key={room.id} room={room} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-400 text-sm">No rooms available yet</p>
                </div>
              )}
            </div>

            {/* Recent activity sidebar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Recent Discussions</h2>
              </div>

              {postsLoading ? (
                <CommunityLoadingState count={3} />
              ) : recentPosts && recentPosts.length > 0 ? (
                <div className="space-y-3">
                  {recentPosts.map(post => (
                    <CommunityPostCard key={post.id} post={post} showRoom />
                  ))}
                  <Link
                    to="/community/rooms/general-support"
                    className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
                  >
                    See all discussions
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">No discussions yet</p>
                  <p className="text-xs text-slate-400">
                    {hasProfile
                      ? 'Be the first to start one in a room above.'
                      : 'Join the community to start the first discussion.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* What this community is section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-5">About this community</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Real caregivers</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Connect with others who are navigating the same challenges — family and professional caregivers alike.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Peer support only</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    This is not a medical service. Nothing here replaces professional care advice or clinical guidance.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 bg-mint-green rounded-xl flex items-center justify-center">
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
