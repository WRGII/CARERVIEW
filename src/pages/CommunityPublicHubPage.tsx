import { Link } from 'react-router-dom'
import {
  Users, Heart, ArrowRight, MessageCircle, ShieldCheck,
  BookOpen, TrendingUp,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { CommunityRoom } from '../lib/community'
import PublicRoomSection from '../components/community/PublicRoomSection'

const SIGNUP_URL = '/create-account?plan=free&source=community-hub'

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
      {[1, 2, 3].map(i => (
        <div key={i} className="px-4 py-3.5 border-b border-slate-100 last:border-0">
          <div className="h-3.5 bg-slate-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-full mb-1" />
          <div className="h-3 bg-slate-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}

interface InlineCTAProps {
  tone: 'peach' | 'mint'
  headline: string
  sub: string
}

function InlineCTA({ tone, headline, sub }: InlineCTAProps) {
  const bg = tone === 'peach'
    ? 'bg-rose-50 border-rose-100'
    : 'bg-teal-50 border-teal-100'
  const btnClass = tone === 'peach'
    ? 'bg-slate-800 hover:bg-slate-700 text-white'
    : 'bg-teal-600 hover:bg-teal-700 text-white'

  return (
    <div className={`rounded-2xl border px-5 py-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-4 ${bg}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 leading-snug">{headline}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{sub}</p>
      </div>
      <Link
        to={SIGNUP_URL}
        className={`inline-flex flex-col items-center px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex-shrink-0 self-start sm:self-auto leading-tight ${btnClass}`}
      >
        <span>Share &amp; Learn</span>
        <span className="text-xs font-normal opacity-90">always free</span>
      </Link>
    </div>
  )
}

export default function CommunityTopicHubPage() {
  const { data: rooms, isLoading: roomsLoading } = useQuery<CommunityRoom[]>({
    queryKey: ['public-community', 'rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_rooms')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: 120_000,
  })

  const { data: memberCount } = useQuery<number>({
    queryKey: ['public-community', 'member-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('community_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_banned', false)
      return count ?? 0
    },
    staleTime: 120_000,
  })

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Slim hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">Family Caregiver</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">Ageing Parents</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">Carer Support</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-2">
                You shouldn't have to figure this out alone
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                A free peer support community for family and professional caregivers. Share experiences, ask questions, find practical wisdom.
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link
                to={SIGNUP_URL}
                className="inline-flex flex-col items-center justify-center px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 leading-tight"
              >
                <span className="text-sm">Share &amp; Learn</span>
                <span className="text-xs font-normal opacity-90">always free</span>
              </Link>
              <Link
                to="/#get-started"
                className="inline-flex items-center justify-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                Already have an account? Sign in
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              Moderated and safe
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Anonymous posting available
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-500" />
              Peer support, not medical advice
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Free for all caregivers
            </span>
          </div>
        </div>
      </section>

      {/* Forum feed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">

        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Discussion rooms</h2>
            <p className="text-xs text-slate-400 mt-0.5">Browse what caregivers are talking about</p>
          </div>
        </div>

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
                <PublicRoomSection room={room} useExamples />

                {index === 1 && (
                  <div className="mt-4">
                    <InlineCTA
                      tone="peach"
                      headline="Real support from caregivers who get it"
                      sub="Join free to reply, share what's working, and connect with others navigating the same challenges."
                    />
                  </div>
                )}

                {index === 4 && (
                  <div className="mt-4">
                    <InlineCTA
                      tone="mint"
                      headline="Ask anonymously, find your people"
                      sub="Post without sharing your name when you need to — your privacy is protected."
                    />
                  </div>
                )}

                {index === 7 && (
                  <div className="mt-4">
                    <InlineCTA
                      tone="peach"
                      headline="You don't have to figure this out alone"
                      sub="Thousands of caregivers share practical wisdom and emotional support here every day. Join them — free."
                    />
                  </div>
                )}
              </div>
            ))}

            {/* End of page CTA */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center mt-2">
              <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-cyan-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1.5">
                Ready to connect with other caregivers?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-4">
                Join free to reply, post your own questions, and be part of a community that truly understands.
              </p>
              <Link
                to={SIGNUP_URL}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Join Caregiver Community — Free
              </Link>
              <p className="text-xs text-slate-400 mt-2">Free for all registered CarerView users</p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No rooms yet</p>
            <p className="text-xs text-slate-400">Community rooms are coming soon.</p>
          </div>
        )}

        {/* Why CarerView bridge section */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Need more than peer support?
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
              Community is great for connection and shared wisdom. When you need structured care tracking — for yourself, your care recipient, or your team — CarerView's observation tools go deeper.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              {
                icon: BookOpen,
                title: 'Observation logs',
                body: 'Record daily care notes with structured categories and track how things change week to week.',
              },
              {
                icon: TrendingUp,
                title: 'Track changes over time',
                body: 'See patterns across days and weeks. Share reports with healthcare providers when needed.',
              },
              {
                icon: Users,
                title: 'Coordinate your care team',
                body: 'Invite family members or professional carers to a shared care view. Everyone stays aligned.',
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="px-6 py-6 flex flex-col gap-3">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="px-6 sm:px-8 py-5 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Community is always free. Observation and team features are part of paid CarerView plans.
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors group"
              >
                See plans
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/why"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors group"
              >
                Learn more
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
