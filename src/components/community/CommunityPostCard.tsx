import { memo } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Heart, Users, EyeOff } from 'lucide-react'
import type { CommunityPost } from '../../lib/community'
import { maskAuthor } from '../../lib/community'
import { useAuth } from '../../hooks/useAuth'
import { useFormat } from '../../hooks/useFormat'

interface Props {
  post: CommunityPost
  showRoom?: boolean
}

function CommunityPostCard({ post, showRoom = false }: Props) {
  const { user } = useAuth()
  const { formatRelativeTime } = useFormat()
  const author = maskAuthor(post, user?.id)
  const isOwnPost = post.author_user_id === user?.id
  const isHidden = post.post_status === 'hidden'
  const isRemoved = post.post_status === 'removed'
  const isModerated = isHidden || isRemoved

  return (
    <Link
      to={`/community/posts/${post.id}`}
      className={`group block bg-white rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 p-5 ${
        isModerated && isOwnPost
          ? 'border-amber-200 hover:border-amber-300 hover:shadow-md opacity-75'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {isModerated && isOwnPost && (
        <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
          <EyeOff className="w-3.5 h-3.5 flex-shrink-0" />
          {isRemoved ? 'This post has been removed by a moderator' : 'This post is hidden and not visible to others'}
        </div>
      )}
      {showRoom && post.room && (
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
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
          <time dateTime={post.last_activity_at} title={new Date(post.last_activity_at).toLocaleString()}>
            {formatRelativeTime(post.last_activity_at)}
          </time>
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

export default memo(CommunityPostCard)
