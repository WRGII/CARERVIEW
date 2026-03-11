import { Flag, EyeOff, MessageCircle, FileText } from 'lucide-react'
import type { ModerationReportRow } from '../../lib/community'
import CommunityStatusBadge from '../community/CommunityStatusBadge'

const REASON_LABELS: Record<string, string> = {
  harassment: 'Harassment',
  unsafe_advice: 'Unsafe advice',
  privacy_violation: 'Privacy violation',
  spam: 'Spam',
  inappropriate_content: 'Inappropriate content',
  other: 'Other',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface Props {
  reports: ModerationReportRow[]
  selectedId: string | null
  onSelect: (report: ModerationReportRow) => void
}

export default function ModerationQueueList({ reports, selectedId, onSelect }: Props) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
          <Flag className="w-6 h-6 text-green-500" />
        </div>
        <p className="text-sm font-semibold text-slate-600">All clear</p>
        <p className="text-xs text-slate-400 mt-1">No reports in this queue.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100">
      {reports.map(report => {
        const isPost = !!report.post_id
        const isSelected = selectedId === report.id
        const contentTitle = isPost ? report.post?.title : undefined
        const contentBody = isPost ? report.post?.body : report.reply?.body
        const isAnonymous = isPost ? report.post?.is_anonymous : report.reply?.is_anonymous
        const contentStatus = isPost
          ? (report.post as any)?.post_status
          : (report.reply as any)?.reply_status

        return (
          <button
            key={report.id}
            onClick={() => onSelect(report)}
            className={`w-full text-left px-4 py-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 ${
              isSelected
                ? 'bg-slate-50 border-l-2 border-l-slate-700'
                : 'hover:bg-slate-50/60 border-l-2 border-l-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isPost ? 'bg-blue-50' : 'bg-slate-100'
              }`}>
                {isPost
                  ? <FileText className="w-4 h-4 text-blue-500" />
                  : <MessageCircle className="w-4 h-4 text-slate-400" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-semibold text-slate-700">
                    {REASON_LABELS[report.reason] ?? report.reason}
                  </span>
                  {isAnonymous && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
                      <EyeOff className="w-3 h-3" />
                      Anon
                    </span>
                  )}
                  {contentStatus && contentStatus !== 'active' && (
                    <CommunityStatusBadge status={contentStatus} size="sm" />
                  )}
                </div>

                {contentTitle && (
                  <p className="text-xs font-medium text-slate-600 truncate mb-0.5">
                    {contentTitle}
                  </p>
                )}

                {contentBody && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {contentBody}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                  <span>
                    by{' '}
                    <span className="text-slate-500 font-medium">
                      {report.reporter_profile?.handle ?? 'unknown'}
                    </span>
                  </span>
                  <span>·</span>
                  <span>{timeAgo(report.created_at)}</span>
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
