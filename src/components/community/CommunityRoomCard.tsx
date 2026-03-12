import { Link } from 'react-router-dom'
import { MessageCircle, ChevronRight } from 'lucide-react'
import type { CommunityRoom } from '../../lib/community'

interface Props {
  room: CommunityRoom
  variant?: 'card' | 'nav-item'
  active?: boolean
  onClick?: () => void
}

export default function CommunityRoomCard({ room, variant = 'card', active = false, onClick }: Props) {
  if (variant === 'nav-item') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
          active
            ? 'border-l-2 border-cyan-primary pl-2.5'
            : 'hover:bg-warm-white border-l-2 border-transparent pl-2.5'
        }`}
        style={active ? { backgroundColor: `${room.color}1A` } : undefined}
      >
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: room.color }}
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug truncate transition-colors ${
            active ? 'text-slate-800' : 'text-slate-700 group-hover:text-slate-800'
          }`}>
            {room.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {room.post_count > 0 && (
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full transition-colors ${
              active
                ? 'bg-cyan-primary/15 text-cyan-dark'
                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
            }`}>
              {room.post_count}
            </span>
          )}
          <ChevronRight className={`w-3.5 h-3.5 transition-colors ${
            active ? 'text-cyan-primary' : 'text-slate-300 group-hover:text-slate-400'
          }`} />
        </div>
      </button>
    )
  }

  return (
    <Link
      to={`/community/rooms/${room.slug}`}
      className="group block bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
    >
      <div
        className="px-5 pt-4 pb-3 border-b"
        style={{ backgroundColor: `${room.color}1A`, borderBottomColor: `${room.color}33` }}
      >
        <h3 className="text-base font-semibold leading-snug" style={{ color: room.color }}>
          {room.name}
        </h3>
        <p className="text-sm leading-relaxed line-clamp-2 mt-0.5" style={{ color: `${room.color}CC` }}>
          {room.description}
        </p>
      </div>

      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">
            {room.post_count === 0
              ? 'No posts yet'
              : `${room.post_count} ${room.post_count === 1 ? 'post' : 'posts'}`}
          </span>
        </div>
        <span className="text-sm font-medium text-cyan-600 group-hover:text-cyan-700 transition-colors">
          View room →
        </span>
      </div>
    </Link>
  )
}
