import { Link } from 'react-router-dom'
import {
  MessageCircle, Heart, Users, ArrowRight, Clock,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import type { CommunityRoom, CommunityPost } from '../../lib/community'

const POST_SELECT = `
  id, room_id, author_user_id, is_anonymous, title, body,
  post_status, help_type, reply_count, reaction_count,
  last_activity_at, created_at
`

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

function PostRowSkeleton() {
  return (
    <div className="px-4 py-3.5 border-b border-slate-100 last:border-0 animate-pulse">
      <div className="h-3.5 bg-slate-200 rounded w-2/3 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-full mb-1.5" />
      <div className="h-3 bg-slate-100 rounded w-3/4 mb-2.5" />
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-slate-200" />
        <div className="h-2.5 bg-slate-200 rounded w-16" />
        <div className="h-2.5 bg-slate-100 rounded w-10" />
      </div>
    </div>
  )
}

function PostRowSkeletons() {
  return (
    <>
      <PostRowSkeleton />
      <PostRowSkeleton />
      <PostRowSkeleton />
    </>
  )
}

function PublicPostRow({
  post,
  signupUrl,
}: {
  post: CommunityPost
  signupUrl: string
}) {
  const preview = post.body.length > 180 ? post.body.slice(0, 180).trimEnd() + '…' : post.body

  return (
    <Link
      to={signupUrl}
      className="block border-b border-slate-100 last:border-0"
    >
      <div className="group px-4 py-3.5 hover:bg-slate-50 transition-colors duration-150 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-cyan-700 transition-colors leading-snug mb-1">
              {post.title}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {preview}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 text-slate-400">
          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
            {post.is_anonymous
              ? <Users className="w-2.5 h-2.5 text-slate-400" />
              : <span className="text-[10px] font-bold text-slate-500">C</span>
            }
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {post.is_anonymous ? 'Anonymous' : 'Caregiver'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            {timeAgo(post.last_activity_at)}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <MessageCircle className="w-3 h-3" />
            {post.reply_count}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Heart className="w-3 h-3" />
            {post.reaction_count}
          </span>
        </div>
      </div>
    </Link>
  )
}

interface ExampleRow {
  id: string
  title: string
  help_type: string | null
  sort_order: number
}

function ExamplePostRow({
  example,
  signupUrl,
}: {
  example: ExampleRow
  signupUrl: string
}) {
  return (
    <Link
      to={signupUrl}
      className="block border-b border-slate-100 last:border-0"
    >
      <div className="group px-4 py-3.5 hover:bg-slate-50 transition-colors duration-150 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wide">
                Example
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-700 group-hover:text-cyan-700 transition-colors leading-snug">
              {example.title}
            </p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-500 transition-colors flex-shrink-0 mt-0.5" />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          Join free to read the full discussion and reply
        </p>
      </div>
    </Link>
  )
}

interface Props {
  room: CommunityRoom
  useExamples?: boolean
}

export default function PublicRoomSection({ room, useExamples = false }: Props) {
  const signupUrl = `/create-account?plan=free&source=caregiver-forum`

  const { data: posts, isLoading: postsLoading } = useQuery<CommunityPost[]>({
    queryKey: ['public-room-posts', room.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(POST_SELECT)
        .eq('room_id', room.id)
        .eq('post_status', 'active')
        .order('last_activity_at', { ascending: false })
        .limit(3)
      if (error) throw error
      return (data ?? []) as CommunityPost[]
    },
    staleTime: 30_000,
    retry: 2,
    enabled: !useExamples,
  })

  const { data: examples, isLoading: examplesLoading } = useQuery<ExampleRow[]>({
    queryKey: ['public-room-examples', room.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_public_examples')
        .select('id, title, help_type, sort_order')
        .eq('room_id', room.id)
        .eq('locale', 'en')
        .order('sort_order', { ascending: true })
        .limit(3)
      if (error) throw error
      return data ?? []
    },
    staleTime: 300_000,
    enabled: useExamples,
  })

  const isLoading = useExamples ? examplesLoading : postsLoading

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3.5 border-b"
        style={{ backgroundColor: `${room.color}1A`, borderBottomColor: `${room.color}33` }}
      >
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold leading-snug" style={{ color: room.color }}>{room.name}</h2>
          <p className="text-xs leading-snug line-clamp-1 max-w-xs mt-0.5" style={{ color: `${room.color}CC` }}>{room.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          {!useExamples && room.post_count > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${room.color}22`, color: `${room.color}CC` }}>
              {room.post_count} {room.post_count === 1 ? 'post' : 'posts'}
            </span>
          )}
          <Link
            to={signupUrl}
            className="flex items-center gap-1 text-xs font-semibold transition-colors"
            style={{ color: room.color }}
          >
            Join to post
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div>
        {isLoading ? (
          <PostRowSkeletons />
        ) : useExamples ? (
          examples && examples.length > 0 ? (
            examples.map(ex => (
              <ExamplePostRow
                key={ex.id}
                example={ex}
                signupUrl={signupUrl}
              />
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-400">Be the first to start a discussion here.</p>
              <Link
                to={signupUrl}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                Join free to post
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )
        ) : posts && posts.length > 0 ? (
          posts.map(post => (
            <PublicPostRow
              key={post.id}
              post={post}
              signupUrl={signupUrl}
            />
          ))
        ) : (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-slate-400">No discussions yet — be the first to post.</p>
            <Link
              to={signupUrl}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              Join free to start the conversation
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
