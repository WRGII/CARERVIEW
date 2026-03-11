import { Link } from 'react-router-dom'
import {
  MessageCircle, Lightbulb, Brain, Heart, Users, Compass,
  Sun, Stethoscope, Wrench, BookOpen, type LucideIcon
} from 'lucide-react'
import type { CommunityRoom } from '../../lib/community'

const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle,
  Lightbulb,
  Brain,
  Heart,
  Users,
  Compass,
  Sun,
  Stethoscope,
  Wrench,
  BookOpen,
  Tool: Wrench,
}

interface Props {
  room: CommunityRoom
}

export default function CommunityRoomCard({ room }: Props) {
  const Icon = ICON_MAP[room.icon_name] ?? MessageCircle

  return (
    <Link
      to={`/community/rooms/${room.slug}`}
      className="group block bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: `${room.color}22`, color: room.color }}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-800 group-hover:text-cyan-700 transition-colors leading-snug mb-1">
              {room.name}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
              {room.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
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
      </div>
    </Link>
  )
}
