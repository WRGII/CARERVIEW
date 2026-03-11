import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Heart, Sparkles, ArrowRight, MessageCircle, ShieldCheck,
  Lightbulb, Brain, Compass, BookOpen, Sun, Stethoscope, Wrench,
  type LucideIcon
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { CommunityRoom, CommunityPost } from '../lib/community'
import JoinFreeCTA from '../components/community/JoinFreeCTA'

const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle, Lightbulb, Brain, Heart, Users, Compass,
  Sun, Stethoscope, Wrench, BookOpen, Tool: Wrench,
}

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

const POST_PREVIEW_CHARS = 180

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const POST_LIST_SELECT = `
  id, room_id, is_anonymous, title, body,
  post_status, help_type, reply_count, reaction_count,
  last_activity_at, created_at,
  room:community_rooms ( id, slug, name, color, icon_name )
`

export default function CommunityTopicHubPage() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null)

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

  const { data: recentPosts, isLoading: postsLoading } = useQuery<CommunityPost[]>({
    queryKey: ['public-community', 'posts', activeRoom],
    queryFn: async () => {
      let query = supabase
        .from('community_posts')
        .select(POST_LIST_SELECT)
        .eq('post_status', 'active')
        .order('last_activity_at', { ascending: false })
        .limit(9)
      if (activeRoom) query = query.eq('room_id', activeRoom)
      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as CommunityPost[]
    },
    staleTime: 60_000,
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

  const selectedRoom = rooms?.find(r => r.id === activeRoom)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-white/90 mb-6">
              <Users className="w-4 h-4" />
              {memberCount ? `${memberCount.toLocaleString()} caregivers` : 'Caregiver community'} — free to join
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
              You shouldn't have to figure this out alone
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              A free peer support community for family and professional caregivers.
              Share experiences, ask questions, and find practical wisdom from people who understand.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/create-account"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 text-base"
              >
                <Sparkles className="w-5 h-5" />
                Join free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/#get-started"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                Already have an account? Sign in
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Moderated and safe
            </span>
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Anonymous posting available
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-500" />
              Peer support, not medical advice
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Free for all caregivers
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        {/* Discussion rooms */}
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Discussion rooms</h2>
              <p className="text-slate-500 text-sm">Choose a topic that's relevant to you</p>
            </div>
          </div>

          {roomsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => {
                const Icon = ICON_MAP[room.icon_name] ?? MessageCircle
                const isSelected = activeRoom === room.id
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(prev => prev === room.id ? null : room.id)}
                    className={`group text-left bg-white rounded-2xl border transition-all duration-200 p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isSelected
                        ? 'border-slate-700 shadow-md -translate-y-0.5'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                        style={{ backgroundColor: `${room.color}22`, color: room.color }}
                        aria-hidden="true"
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-semibold leading-snug mb-1 transition-colors ${
                          isSelected ? 'text-slate-900' : 'text-slate-800 group-hover:text-cyan-700'
                        }`}>
                          {room.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {room.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {room.post_count === 0 ? 'No posts yet' : `${room.post_count} ${room.post_count === 1 ? 'post' : 'posts'}`}
                      </div>
                      <span className={`text-xs font-medium transition-colors ${
                        isSelected ? 'text-slate-700' : 'text-cyan-600 group-hover:text-cyan-700'
                      }`}>
                        {isSelected ? 'Showing posts' : 'Browse →'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : null}
        </section>

        {/* Discussion preview section */}
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                {selectedRoom ? `Discussions in ${selectedRoom.name}` : 'Recent discussions'}
              </h2>
              <p className="text-slate-500 text-sm">
                {selectedRoom
                  ? `Browse what caregivers are discussing in ${selectedRoom.name}`
                  : 'What caregivers are talking about right now'}
              </p>
            </div>
            {activeRoom && (
              <button
                onClick={() => setActiveRoom(null)}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : recentPosts && recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map(post => {
                const helpLabel = post.help_type ? HELP_TYPE_LABELS[post.help_type] : null
                const helpColor = post.help_type ? HELP_TYPE_COLORS[post.help_type] : null
                const bodyPreview = post.body.length > POST_PREVIEW_CHARS
                  ? post.body.slice(0, POST_PREVIEW_CHARS).trimEnd() + '…'
                  : post.body

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {post.room && (
                            <span
                              className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${post.room.color}22`, color: post.room.color }}
                            >
                              {post.room.name}
                            </span>
                          )}
                          {helpLabel && helpColor && (
                            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${helpColor}`}>
                              {helpLabel}
                            </span>
                          )}
                          {post.is_anonymous && (
                            <span className="text-xs text-slate-400">Anonymous</span>
                          )}
                        </div>

                        <h3 className="text-base font-semibold text-slate-800 leading-snug mb-2">
                          {post.title}
                        </h3>

                        <p className="text-sm text-slate-500 leading-relaxed mb-3">
                          {bodyPreview}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
                            </span>
                            <span>{timeAgo(post.last_activity_at)}</span>
                          </div>

                          <Link
                            to="/create-account"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors group"
                          >
                            Join to read full discussion
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* CTA after posts */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Want to read the full discussions and reply?</p>
                  <p className="text-xs text-slate-500 mt-0.5">Create a free account to join the community.</p>
                </div>
                <Link
                  to="/create-account"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  Join free
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">No discussions yet in this room</p>
              <p className="text-xs text-slate-400">
                Join the community and start the first one.
              </p>
            </div>
          )}
        </section>

        {/* Full-width Join CTA */}
        <section>
          <JoinFreeCTA
            variant="banner"
            context="Read full discussions, share your experience, post anonymously when you need to. Free for all caregivers."
          />
        </section>

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

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
