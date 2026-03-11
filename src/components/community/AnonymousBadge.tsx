import { EyeOff } from 'lucide-react'

interface Props {
  size?: 'sm' | 'md'
  isCurrentUser?: boolean
}

export default function AnonymousBadge({ size = 'sm', isCurrentUser = false }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
      title="Posted anonymously — identity hidden from other users"
    >
      <EyeOff className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {isCurrentUser ? 'You (anonymous)' : 'Anonymous'}
    </span>
  )
}
