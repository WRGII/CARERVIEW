import type { PostStatus, ReplyStatus, ReportStatus } from '../../lib/community'

type Status = PostStatus | ReplyStatus | ReportStatus

const CONFIG: Record<Status, { label: string; classes: string }> = {
  active: { label: 'Active', classes: 'bg-green-50 text-green-700 border-green-100' },
  hidden: { label: 'Hidden', classes: 'bg-amber-50 text-amber-700 border-amber-100' },
  removed: { label: 'Removed', classes: 'bg-red-50 text-red-700 border-red-100' },
  pending_review: { label: 'Pending review', classes: 'bg-blue-50 text-blue-700 border-blue-100' },
  pending: { label: 'Pending', classes: 'bg-blue-50 text-blue-700 border-blue-100' },
  reviewed: { label: 'Reviewed', classes: 'bg-green-50 text-green-700 border-green-100' },
  dismissed: { label: 'Dismissed', classes: 'bg-slate-50 text-slate-500 border-slate-200' },
}

interface Props {
  status: Status
  size?: 'sm' | 'md'
}

export default function CommunityStatusBadge({ status, size = 'sm' }: Props) {
  const cfg = CONFIG[status] ?? { label: status, classes: 'bg-slate-50 text-slate-500 border-slate-200' }
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${cfg.classes} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
    >
      {cfg.label}
    </span>
  )
}
