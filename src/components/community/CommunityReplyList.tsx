import { useState } from 'react'
import { Flag, MessageCircle } from 'lucide-react'
import { maskAuthor } from '../../lib/community'
import type { CommunityReply } from '../../lib/community'
import AnonymousBadge from './AnonymousBadge'
import ReportModal from './ReportModal'
import CommunityLoadingState from './CommunityLoadingState'

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

interface Props {
  replies: CommunityReply[] | undefined
  isLoading: boolean
  currentUserId: string | undefined
  hasProfile: boolean
}

export default function CommunityReplyList({ replies, isLoading, currentUserId, hasProfile }: Props) {
  const [reportingReplyId, setReportingReplyId] = useState<string | null>(null)

  if (isLoading) return <CommunityLoadingState count={2} />

  if (!replies || replies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <MessageCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-500">No replies yet</p>
        {hasProfile && (
          <p className="text-xs text-slate-400 mt-0.5">Be the first to respond.</p>
        )}
      </div>
    )
  }

  return (
    <>
      {reportingReplyId && (
        <ReportModal
          replyId={reportingReplyId}
          onClose={() => setReportingReplyId(null)}
        />
      )}

      <div className="space-y-3">
        {replies.map((reply, index) => {
          const author = maskAuthor(
            { ...reply, author_profile: reply.author_profile ?? null },
            currentUserId
          )
          const isRemoved = reply.reply_status === 'removed' || reply.reply_status === 'hidden'

          return (
            <div
              key={reply.id}
              className={`bg-white rounded-2xl border p-5 ${isRemoved ? 'border-slate-100 opacity-60' : 'border-slate-200'}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: author.avatarColor }}
                  aria-hidden="true"
                >
                  {author.displayHandle.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">
                      {author.displayHandle}
                    </span>
                    {author.isAnonymous && (
                      <AnonymousBadge size="sm" isCurrentUser={author.isCurrentUser} />
                    )}
                    <span className="text-xs text-slate-400">
                      {timeAgo(reply.created_at)}
                    </span>
                    {index === 0 && !isRemoved && (
                      <span className="text-xs text-slate-300 font-medium">First reply</span>
                    )}
                  </div>

                  {isRemoved ? (
                    <p className="text-sm text-slate-400 italic">
                      This reply has been removed by a moderator.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {reply.body}
                    </p>
                  )}
                </div>

                {hasProfile && !isRemoved && (
                  <button
                    onClick={() => setReportingReplyId(reply.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5 rounded p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    title="Report this reply"
                    aria-label="Report this reply"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
