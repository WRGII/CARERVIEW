import { Link } from 'react-router-dom'
import { MessageCircle, Heart, Users, Clock } from 'lucide-react'
import type { CommunityPost } from '../../lib/community'
import { maskAuthor } from '../../lib/community'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  post: CommunityPost
  showRoom?: boolean
}

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

export default function CommunityPostCard({ post, showRoom = false }: Props) {
  const { user } = useAuth()
  const author = maskAuthor(post, user?.id)

  return (
    <Link
      to={`/community/posts/${post.id}`}
      className="group block bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-5"
    >
      {showRoom && post.room && (
        <div className="mb-2">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${post.room.color}22`, color: post.room.color }}
          >
            {post.room.name}
          </span>
        </div>
      )}

      <h3 className="text-base font-semibold text-slate-800 group-hover:text-cyan-700 transition-colors leading-snug mb-2 line-clamp-2">
        {post.title}
      </h3>

      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
        {post.body}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: author.avatarColor }}
          >
            {author.isAnonymous ? <Users className="w-3.5 h-3.5" /> : author.displayHandle.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-slate-600 font-medium">
            {author.displayHandle}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 text-xs">
            <Clock className="w-3.5 h-3.5" />
            {timeAgo(post.last_activity_at)}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <MessageCircle className="w-3.5 h-3.5" />
            {post.reply_count}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Heart className="w-3.5 h-3.5" />
            {post.reaction_count}
          </span>
        </div>
      </div>
    </Link>
  )
}
