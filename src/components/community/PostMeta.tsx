import { Clock, MessageCircle, Heart, Lock } from 'lucide-react'
import AnonymousBadge from './AnonymousBadge'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

interface AuthorInfo {
  displayHandle: string
  avatarColor: string
  isAnonymous: boolean
  isCurrentUser: boolean
}

interface Props {
  author: AuthorInfo
  createdAt: string
  replyCount?: number
  reactionCount?: number
  isLocked?: boolean
  compact?: boolean
}

export default function PostMeta({
  author,
  createdAt,
  replyCount,
  reactionCount,
  isLocked,
  compact = false,
}: Props) {
  return (
    <div className={`flex items-center justify-between flex-wrap gap-2 ${compact ? '' : 'pt-4 border-t border-slate-100'}`}>
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${compact ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'}`}
          style={{ backgroundColor: author.avatarColor }}
          aria-hidden="true"
        >
          {author.displayHandle.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-semibold text-slate-700 truncate ${compact ? 'text-sm' : 'text-sm'}`}>
              {author.displayHandle}
            </span>
            {author.isAnonymous && (
              <AnonymousBadge size="sm" isCurrentUser={author.isCurrentUser} />
            )}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            {timeAgo(createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-slate-400 text-sm flex-shrink-0">
        {replyCount !== undefined && (
          <span className="flex items-center gap-1 text-xs" title={`${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}>
            <MessageCircle className="w-3.5 h-3.5" />
            {replyCount}
          </span>
        )}
        {reactionCount !== undefined && (
          <span className="flex items-center gap-1 text-xs" title={`${reactionCount} ${reactionCount === 1 ? 'reaction' : 'reactions'}`}>
            <Heart className="w-3.5 h-3.5" />
            {reactionCount}
          </span>
        )}
        {isLocked && (
          <span className="flex items-center gap-1 text-xs text-amber-500" title="Locked — no new replies">
            <Lock className="w-3.5 h-3.5" />
            Locked
          </span>
        )}
      </div>
    </div>
  )
}
