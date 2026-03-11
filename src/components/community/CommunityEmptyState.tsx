import { MessageCircle, PenLine } from 'lucide-react'
import { Button } from '../ui/Button'

interface Props {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function CommunityEmptyState({
  title = 'No posts yet',
  description = 'Be the first to start a conversation in this room.',
  action,
}: Props) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageCircle className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto mb-6">
        {description}
      </p>
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          <PenLine className="w-4 h-4 mr-2 inline" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
