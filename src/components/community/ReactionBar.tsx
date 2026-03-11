import { useMyReactions, useReactionCounts, useToggleReaction } from '../../hooks/useCommunityReactions'
import type { ReactionType } from '../../lib/community'

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'heart', emoji: '❤️', label: 'Heart' },
  { type: 'hug', emoji: '🤗', label: 'Hug' },
  { type: 'helpful', emoji: '💡', label: 'Helpful' },
]

interface Props {
  postId: string
  hasProfile: boolean
  onJoinPrompt?: () => void
}

export default function ReactionBar({ postId, hasProfile, onJoinPrompt }: Props) {
  const { data: myReactions } = useMyReactions(hasProfile ? postId : undefined)
  const { data: counts } = useReactionCounts(postId)
  const toggle = useToggleReaction(postId)

  const isActive = (type: ReactionType) =>
    myReactions?.some(r => r.reaction_type === type) ?? false

  const handleClick = (type: ReactionType) => {
    if (!hasProfile) {
      onJoinPrompt?.()
      return
    }
    if (toggle.isPending) return
    toggle.mutate({ reaction_type: type, isActive: isActive(type) })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTIONS.map(({ type, emoji, label }) => {
        const active = isActive(type)
        const count = counts?.[type] ?? 0
        return (
          <button
            key={type}
            onClick={() => handleClick(type)}
            title={hasProfile ? label : 'Join community to react'}
            aria-label={`${label}${count > 0 ? ` · ${count}` : ''}`}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              active
                ? 'border-cyan-300 bg-cyan-50 text-cyan-700 font-medium'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
            } ${!hasProfile ? 'cursor-pointer' : ''} ${toggle.isPending ? 'opacity-60' : ''}`}
          >
            <span>{emoji}</span>
            {count > 0 && (
              <span className="text-xs tabular-nums">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
