import { Users, MessageCircle, Pencil, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCommunityRooms } from '../hooks/useCommunityRooms'
import { useMyCommunityProfile } from '../hooks/useCommunityProfile'
import CommunityGuidelinesModal from '../components/community/CommunityGuidelinesModal'
import CommunityRoomSection from '../components/community/CommunityRoomSection'
import Breadcrumbs from '../components/common/Breadcrumbs'
import { useLocale } from '../i18n/LocaleContext'

const FORUM_URL = '/caregiver-forum'

function PopularTopicsSection() {
  const { t } = useLocale()
  const topics = [
    { titleKey: 'public.community.topic1_title', excerptKey: 'public.community.topic1_excerpt' },
    { titleKey: 'public.community.topic2_title', excerptKey: 'public.community.topic2_excerpt' },
    { titleKey: 'public.community.topic3_title', excerptKey: 'public.community.topic3_excerpt' },
  ]

  return (
    <section aria-labelledby="popular-topics-auth-heading" className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 id="popular-topics-auth-heading" className="text-sm font-bold text-slate-800">
            {t('public.community.popular_topics_heading')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{t('public.community.popular_topics_intro')}</p>
        </div>
        <Link
          to={FORUM_URL}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
        >
          {t('public.community.topics_browse_all')}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {topics.map((topic, i) => (
          <div key={i} className="px-5 py-3.5 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 leading-snug">{t(topic.titleKey)}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t(topic.excerptKey)}</p>
            </div>
            <MessageCircle className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
          </div>
        ))}
      </div>
    </section>
  )
}

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

export default function CommunityLandingPage() {
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile()
  const { data: rooms, isLoading: roomsLoading } = useCommunityRooms()
  const { t } = useLocale()

  const needsGuidelines = !profileLoading && !!profile && !profile.guidelines_accepted_at
  const showHandlePrompt = !profileLoading && !!profile && profile.handle_is_auto_generated

  return (
    <>
      {needsGuidelines && (
        <CommunityGuidelinesModal onAccepted={() => {}} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          <Breadcrumbs items={[{ label: t('nav.caregiver_forum') }]} />

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

            {profile && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to="/community/profile/edit"
                  className="flex items-center gap-1.5 group"
                  aria-label="Edit community profile"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-cyan-200 transition-all"
                    style={{ backgroundColor: profile.avatar_color }}
                  >
                    {profile.handle.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-800 leading-none">{profile.handle}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{profile.post_count} posts</p>
                  </div>
                </Link>
                <Link
                  to={rooms && rooms.length > 0 ? `/community/rooms/${rooms[0].slug}/new-post` : '/community'}
                  className="ml-1 flex items-center gap-1.5 bg-cyan-primary hover:bg-cyan-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Post</span>
                </Link>
              </div>
            )}
          </div>

          {/* Handle personalisation prompt */}
          {showHandlePrompt && (
            <div className="flex items-center justify-between gap-3 bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Pencil className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <p className="text-sm text-cyan-800">
                  <span className="font-semibold">Your handle was auto-generated.</span>{' '}
                  <span className="hidden sm:inline">Want to give yourself a custom name?</span>
                </p>
              </div>
              <Link
                to="/community/profile/edit"
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 bg-white border border-cyan-300 hover:border-cyan-400 rounded-lg px-3 py-1.5 flex-shrink-0 transition-colors"
              >
                Personalise
              </Link>
            </div>
          )}

          {/* Popular Starting Topics */}
          <PopularTopicsSection />

          {/* Room sections */}
          {roomsLoading ? (
            <>
              <RoomSkeleton />
              <RoomSkeleton />
              <RoomSkeleton />
            </>
          ) : rooms && rooms.length > 0 ? (
            rooms.map(room => (
              <CommunityRoomSection
                key={room.id}
                room={room}
                isGuest={false}
                onJoinClick={() => {}}
              />
            ))
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2">
            <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-semibold text-slate-700">Real caregivers</p>
              <p className="text-xs text-slate-400 mt-0.5">Family &amp; professional</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-semibold text-slate-700">Peer support</p>
              <p className="text-xs text-slate-400 mt-0.5">Not medical advice</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-semibold text-slate-700">Post anon</p>
              <p className="text-xs text-slate-400 mt-0.5">Your handle is hidden</p>
            </div>
          </div>

          {/* Cross-links to other CarerView pages */}
          <div className="pt-2 pb-4 text-center text-xs text-slate-500">
            <Link to="/new-carer" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.new_carer')}</Link>
            {' · '}
            <Link to="/resources" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.caregiver_resources')}</Link>
            {' · '}
            <Link to="/pricing" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.pricing')}</Link>
            {' · '}
            <Link to="/why" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.why_carerview')}</Link>
          </div>

        </div>
      </div>
    </>
  )
}
