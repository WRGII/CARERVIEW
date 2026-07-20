import {
  LayoutDashboard,
  Activity,
  CircleUser,
  BookOpen,
  ClipboardList,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'

export type NavEntry = {
  key: string
  to: string
  matchPrefix?: string
  icon?: LucideIcon
  authOnly?: boolean
  publicOnly?: boolean
  paidOnly?: boolean
}

export type NavContext = {
  authed: boolean
  paid: boolean
}

export const PRIMARY_NAV: NavEntry[] = [
  { key: 'nav.about', to: '/about' },
  { key: 'nav.why_carerview', to: '/why' },
  { key: 'nav.memory_book_short', to: '/memory-book' },
  { key: 'nav.new_carer', to: '/new-carer' },
  { key: 'nav.caregiver_resources', to: '/resources' },
  { key: 'nav.pricing', to: '/pricing' },
]

export const AUTHED_NAV: NavEntry[] = [
  { key: 'nav.dashboard', to: '/caregiver', icon: LayoutDashboard },
  { key: 'nav.observations', to: '/caregiver/observations/new', matchPrefix: '/caregiver/observations', icon: Activity, paidOnly: true },
  { key: 'nav.resident', to: '/caregiver/resident', matchPrefix: '/caregiver/resident', icon: CircleUser, paidOnly: true },
  { key: 'nav.memory_schedule', to: '/caregiver/memory-schedule', matchPrefix: '/caregiver/memory-schedule', icon: BookOpen, paidOnly: true },
  { key: 'nav.care_plan', to: '/care-hub/care-plan', matchPrefix: '/care-hub/care-plan', icon: ClipboardList, paidOnly: true },
  { key: 'nav.new_carer', to: '/new-carer', matchPrefix: '/new-carer', icon: GraduationCap, paidOnly: true },
]

export function filterNav(entries: NavEntry[], ctx: NavContext): NavEntry[] {
  return entries.filter(
    (e) =>
      (e.authOnly ? ctx.authed : true) &&
      (e.publicOnly ? !ctx.authed : true) &&
      (e.paidOnly ? ctx.paid : true),
  )
}

export function isPathActive(pathname: string, to: string, matchPrefix?: string): boolean {
  const prefix = matchPrefix ?? to
  if (prefix === '/caregiver') return pathname === '/caregiver'
  return pathname === to || pathname.startsWith(prefix + '/')
}
