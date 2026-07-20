import { Link, useLocation } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import { useUserPlan, hasActivePlan } from '../../hooks/useUserPlan'
import { useAuth } from '../../hooks/useAuth'
import { AUTHED_NAV, filterNav, isPathActive, type NavEntry } from '../../lib/navigation'

function SideNavItem({ item, isActive }: { item: NavEntry; isActive: boolean }) {
  const { t } = useLocale()
  const Icon = item.icon!
  return (
    <Link
      to={item.to}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
        isActive
          ? 'bg-slate-100 text-slate-900 font-semibold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        isActive ? 'bg-white/70 shadow-sm' : 'group-hover:bg-white/50'
      }`}>
        <Icon className={`w-4 h-4 ${isActive ? 'text-slate-700' : 'text-slate-500 group-hover:text-slate-700'}`} />
      </div>
      <span className="truncate">{t(item.key)}</span>
    </Link>
  )
}

export default function CareHubSideNav() {
  const location = useLocation()
  const { t } = useLocale()
  const { profile } = useAuth()
  const { data: plan } = useUserPlan()
  const isPaidCarer = profile?.role === 'caregiver' && plan?.plan_id !== 'free' && hasActivePlan(plan)

  const navItems = filterNav(AUTHED_NAV, { authed: !!profile, paid: isPaidCarer })

  return (
    <>
      {/* Mobile horizontal tab bar */}
      <nav
        className="lg:hidden flex overflow-x-auto border-b border-slate-200 bg-white px-2 py-1.5 gap-1 scrollbar-none sticky top-16 z-20"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon!
          const active = isPathActive(location.pathname, item.to, item.matchPrefix)
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 min-h-[40px] ${
                active
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-slate-700' : 'text-slate-500'}`} />
              <span>{t(item.key)}</span>
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
              <SideNavItem
                key={item.to}
                item={item}
                isActive={isPathActive(location.pathname, item.to, item.matchPrefix)}
              />
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
