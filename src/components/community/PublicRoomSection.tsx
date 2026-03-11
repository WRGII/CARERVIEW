import { Link } from 'react-router-dom'
import {
  MessageCircle, Lightbulb, Brain, Heart, Users, Compass,
  Sun, Stethoscope, Wrench, BookOpen, ArrowRight, Clock,
  type LucideIcon
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import type { CommunityRoom, CommunityPost } from '../../lib/community'

const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle, Lightbulb, Brain, Heart, Users, Compass,
  Sun, Stethoscope, Wrench, BookOpen, Tool: Wrench,
}

const HELP_TYPE_COLORS: Record<string, string> = {
  emotional_support: 'bg-rose-50 text-rose-600',
  practical_tips: 'bg-amber-50 text-amber-600',
  similar_experiences: 'bg-cyan-50 text-cyan-600',
  question: 'bg-blue-50 text-blue-600',
  resource: 'bg-green-50 text-green-600',
}

const HELP_TYPE_LABELS: Record<string, string> = {
  emotional_support: 'Emotional Support',
  practical_tips: 'Practical Tips',
  similar_experiences: 'Similar Experiences',
  question: 'Question',
  resource: 'Resource',
}

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
            {post.help_type && HELP_TYPE_LABELS[post.help_type] && (
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mr-2 mb-1 ${HELP_TYPE_COLORS[post.help_type] ?? ''}`}>
                {HELP_TYPE_LABELS[post.help_type]}
              </span>
            )}
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

interface Props {
  room: CommunityRoom
}

export default function PublicRoomSection({ room }: Props) {
  const Icon = ICON_MAP[room.icon_name] ?? MessageCircle

  const signupUrl = `/create-account?plan=free&source=community-hub`

  const { data: posts, isLoading, isError, refetch } = useQuery<CommunityPost[]>({
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
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${room.color}22`, color: room.color }}
          >
            <Icon className="w-[18px] h-[18px]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-snug">{room.name}</h2>
            <p className="text-xs text-slate-400 leading-snug line-clamp-1 max-w-xs">{room.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          {room.post_count > 0 && (
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
              {room.post_count} {room.post_count === 1 ? 'post' : 'posts'}
            </span>
          )}
          <Link
            to={signupUrl}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            Join to post
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div>
        {isLoading ? (
          <PostRowSkeletons />
        ) : isError ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-slate-400">Could not load discussions.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              Try again
            </button>
          </div>
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
