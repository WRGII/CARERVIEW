import { Link, useLocation } from 'react-router-dom'
import { BookOpen, ClipboardList, Activity, GraduationCap, LayoutDashboard, CircleUser as UserCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import { useUserPlan, hasActivePlan } from '../../hooks/useUserPlan'
import { useAuth } from '../../hooks/useAuth'
import { useOnboarding } from '../../hooks/useOnboarding'

type NavItem = {
  to: string
  matchPrefix?: string
  icon: React.ElementType
  label: string
  iconColor: string
  activeIconColor: string
  activeBg: string
  paidOnly?: boolean
}

function SideNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
        isActive
          ? `${item.activeBg} ${item.activeIconColor} font-semibold`
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        isActive ? 'bg-white/70 shadow-sm' : 'group-hover:bg-white/50'
      }`}>
        <Icon className={`w-4 h-4 ${isActive ? item.activeIconColor : item.iconColor + ' group-hover:' + item.activeIconColor}`} />
      </div>
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

export default function CareHubSideNav() {
  const location = useLocation()
  const { t } = useLocale()
  const { profile } = useAuth()
  const { data: plan } = useUserPlan()
  const isPaidCarer = profile?.role === 'caregiver' && plan?.plan_id !== 'free' && hasActivePlan(plan)
  const { restartTutorial } = useOnboarding()

  const navItems: NavItem[] = [
    {
      to: '/caregiver',
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
      iconColor: 'text-slate-500',
      activeIconColor: 'text-slate-700',
      activeBg: 'bg-slate-100 text-slate-900',
    },
    ...(isPaidCarer ? [
      {
        to: '/caregiver/resident',
        matchPrefix: '/caregiver/resident',
        icon: UserCircle,
        label: t('nav.resident'),
        iconColor: 'text-slate-500',
        activeIconColor: 'text-slate-700',
        activeBg: 'bg-slate-100 text-slate-900',
        paidOnly: true,
      },
      {
        to: '/caregiver/memory-schedule',
        matchPrefix: '/caregiver/memory-schedule',
        icon: BookOpen,
        label: t('nav.memory_book_short'),
        iconColor: 'text-teal-500',
        activeIconColor: 'text-teal-700',
        activeBg: 'bg-teal-50 text-teal-900',
        paidOnly: true,
      },
      {
        to: '/care-hub/care-plan',
        matchPrefix: '/care-hub/care-plan',
        icon: ClipboardList,
        label: t('nav.care_plan'),
        iconColor: 'text-blue-500',
        activeIconColor: 'text-blue-700',
        activeBg: 'bg-blue-50 text-blue-900',
        paidOnly: true,
      },
      {
        to: '/caregiver/observations/new',
        matchPrefix: '/caregiver/observations',
        icon: Activity,
        label: t('nav.observations'),
        iconColor: 'text-amber-500',
        activeIconColor: 'text-amber-700',
        activeBg: 'bg-amber-50 text-amber-900',
        paidOnly: true,
      },
      {
        to: '/new-carer',
        matchPrefix: '/new-carer',
        icon: GraduationCap,
        label: t('nav.new_carer'),
        iconColor: 'text-slate-400',
        activeIconColor: 'text-slate-700',
        activeBg: 'bg-slate-100 text-slate-900',
        paidOnly: true,
      },
    ] as NavItem[] : []),
  ]

  function isActive(item: NavItem): boolean {
    const prefix = item.matchPrefix ?? item.to
    if (prefix === '/caregiver') return location.pathname === '/caregiver'
    return location.pathname.startsWith(prefix)
  }

  return (
    <>
      {/* Mobile horizontal tab bar */}
      <nav
        className="lg:hidden flex overflow-x-auto border-b border-slate-200 bg-white px-2 py-1.5 gap-1 -mx-px scrollbar-none sticky top-16 z-20"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 min-h-[40px] ${
                active
                  ? `${item.activeBg} ${item.activeIconColor} font-semibold`
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? item.activeIconColor : item.iconColor}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop sidebar */}
      <nav
        className="hidden lg:flex flex-col w-56 shrink-0 border-r border-slate-200 bg-white"
        style={{ minHeight: 'calc(100vh - 64px)', position: 'sticky', top: '64px', alignSelf: 'flex-start', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}
        aria-label="Main navigation"
      >
        <div className="px-3 py-4 space-y-1 flex flex-col" style={{ minHeight: 'calc(100vh - 64px - 2rem)' }}>
          <div className="space-y-1">
            {navItems.map((item) => (
              <SideNavItem key={item.to} item={item} isActive={isActive(item)} />
            ))}
          </div>
          <div className="mt-auto pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                restartTutorial();
                window.location.assign('/caregiver');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-150 group"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/50">
                <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </div>
              <span className="truncate">{t('account_menu.restart_tutorial')}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
