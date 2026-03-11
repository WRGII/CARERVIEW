import { useState } from 'react'
import { Users, Sparkles, Heart, MessageCircle } from 'lucide-react'
import { useCommunityRooms } from '../hooks/useCommunityRooms'
import { useMyCommunityProfile } from '../hooks/useCommunityProfile'
import CommunityWelcomeFlow from '../components/community/CommunityWelcomeFlow'
import CommunityGuidelinesBanner from '../components/community/CommunityGuidelinesBanner'
import CommunityRoomSection from '../components/community/CommunityRoomSection'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'

function RoomSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0" />
          <div>
            <div className="h-3.5 bg-slate-200 rounded w-32 mb-1.5" />
            <div className="h-2.5 bg-slate-100 rounded w-48" />
          </div>
        </div>
        <div className="h-3 bg-slate-100 rounded w-12" />
      </div>
      <div className="px-4 py-3.5 border-b border-slate-100">
        <div className="h-3.5 bg-slate-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-full mb-1" />
        <div className="h-3 bg-slate-100 rounded w-3/4" />
      </div>
      <div className="px-4 py-3.5 border-b border-slate-100">
        <div className="h-3.5 bg-slate-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-full mb-1" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
      </div>
      <div className="px-4 py-3.5">
        <div className="h-3.5 bg-slate-200 rounded w-3/5 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-full mb-1" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
    </div>
  )
}

interface CtaBannerProps {
  gradient: string
  headline: string
  sub: string
  btnLabel: string
  btnVariant?: 'primary' | 'outline'
  onJoinClick: () => void
}

function CtaBanner({ gradient, headline, sub, btnLabel, btnVariant = 'primary', onJoinClick }: CtaBannerProps) {
  return (
    <div className={`rounded-2xl px-5 py-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-4 ${gradient}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 leading-snug">{headline}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{sub}</p>
      </div>
      <Button variant={btnVariant} size="sm" onClick={onJoinClick} className="flex-shrink-0 self-start sm:self-auto">
        <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
        {btnLabel}
      </Button>
    </div>
  )
}

export default function CommunityLandingPage() {
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile()
  const { data: rooms, isLoading: roomsLoading } = useCommunityRooms()
  const [showWelcome, setShowWelcome] = useState(false)

  const hasProfile = !!profile && !profileLoading
  const isGuest = !profileLoading && !profile

  return (
    <>
      {showWelcome && (
        <CommunityWelcomeFlow
          onComplete={() => setShowWelcome(false)}
          onDismiss={() => setShowWelcome(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">

          {/* Slim hero banner */}
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-4 sm:px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-cyan-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-cyan-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                  Caregiver Community
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block truncate">
                  Peer support and practical wisdom from caregivers who understand
                </p>
              </div>
            </div>

            {hasProfile ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: profile.avatar_color }}
                >
                  {profile.handle.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 leading-none">{profile.handle}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{profile.post_count} posts</p>
                </div>
                <Link
                  to="/community/new-post"
                  className="ml-1 flex items-center gap-1.5 bg-cyan-primary hover:bg-cyan-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Post</span>
                </Link>
              </div>
            ) : isGuest ? (
              <Button variant="primary" size="sm" onClick={() => setShowWelcome(true)} className="flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
                Join Free
              </Button>
            ) : null}
          </div>

          {/* Guidelines banner for members */}
          {hasProfile && <CommunityGuidelinesBanner />}

          {/* Room sections + interspersed CTAs */}
          {roomsLoading ? (
            <>
              <RoomSkeleton />
              <RoomSkeleton />
              <RoomSkeleton />
            </>
          ) : rooms && rooms.length > 0 ? (
            <>
              {rooms.map((room, index) => (
                <div key={room.id}>
                  <CommunityRoomSection
                    room={room}
                    isGuest={isGuest}
                    onJoinClick={() => setShowWelcome(true)}
                  />

                  {/* CTA after 2nd room (index 1) */}
                  {isGuest && index === 1 && (
                    <div className="mt-4">
                      <CtaBanner
                        gradient="bg-gradient-to-r from-peach-blush/40 via-white to-warm-white border border-peach-blush/50"
                        headline="Real support from caregivers who get it"
                        sub="Join free to reply, share what's working, and connect with others navigating the same challenges."
                        btnLabel="Join Free"
                        onJoinClick={() => setShowWelcome(true)}
                      />
                    </div>
                  )}

                  {/* CTA after 4th room (index 3) */}
                  {isGuest && index === 3 && (
                    <div className="mt-4">
                      <CtaBanner
                        gradient="bg-gradient-to-r from-mint-green/30 via-white to-cyan-primary/10 border border-mint-green/40"
                        headline="Ask a question, share what's working, find your people"
                        sub="Post anonymously when you need to — your privacy is protected."
                        btnLabel="Create free account"
                        btnVariant="outline"
                        onJoinClick={() => setShowWelcome(true)}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* End-of-page CTA for guests */}
              {isGuest && (
                <div className="bg-gradient-to-br from-peach-blush/30 via-white to-mint-green/20 border border-peach-blush/60 rounded-2xl p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 bg-cyan-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-cyan-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 mb-1.5">
                    Ready to connect with other caregivers?
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-4">
                    Join free to reply, post your own questions, and be part of a community that truly understands.
                  </p>
                  <Button variant="primary" size="md" onClick={() => setShowWelcome(true)}>
                    <Sparkles className="w-4 h-4 mr-2 inline" />
                    Join Caregiver Community — Free
                  </Button>
                  <p className="text-xs text-slate-400 mt-2">Free for all registered CarerView users</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <div className="w-12 h-12 bg-cyan-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-cyan-primary" />
              </div>
              <p className="text-base font-semibold text-slate-700 mb-1">No rooms yet</p>
              <p className="text-sm text-slate-400">Community rooms are coming soon.</p>
            </div>
          )}

          {/* Community info strip */}
          <div className="grid grid-cols-3 gap-3 pb-2">
            <div className="bg-white border border-slate-100 rounded-xl px-3 py-3 text-center">
              <p className="text-xs font-semibold text-slate-700">Real caregivers</p>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Family &amp; professional</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl px-3 py-3 text-center">
              <p className="text-xs font-semibold text-slate-700">Peer support</p>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Not medical advice</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl px-3 py-3 text-center">
              <p className="text-xs font-semibold text-slate-700">Post anon</p>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Your handle is hidden</p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
