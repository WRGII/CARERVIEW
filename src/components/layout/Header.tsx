import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUserPlan, hasActivePlan } from '../../hooks/useUserPlan'
import { getProductByPriceId } from '../../stripe-config'
import { useLocale } from '../../i18n/LocaleContext'
import LanguageSwitcher from '../common/LanguageSwitcher'
import AccountMenu from '../caregiver/AccountMenu'

const PUBLIC_NAV_LINKS = [
  { key: 'nav.about', to: '/about' },
  { key: 'nav.memory_book_short', to: '/caregiver/memory-book' },
  { key: 'nav.new_carer', to: '/new-carer' },
  { key: 'nav.caregiver_resources', to: '/caregiver/resources' },
] as const

export function Header() {
  const location = useLocation()
  const { user } = useAuth()
  const { data: userPlan } = useUserPlan()
  const { t } = useLocale()
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeProduct = userPlan?.price_id ? getProductByPriceId(userPlan.price_id) : null
  const isActivePlan = hasActivePlan(userPlan)

  function isCurrentPath(to: string) {
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          aria-label={t('nav.home_aria')}
          className="flex items-center gap-2 shrink-0 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-primary transition-colors group-hover:bg-cyan-hover">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900 group-hover:text-cyan-primary transition-colors">
            {t('common.app_name')}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {PUBLIC_NAV_LINKS.map(({ key, to }) => (
            <Link
              key={key}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isCurrentPath(to)
                  ? 'text-cyan-primary bg-cyan-primary/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              {isActivePlan && activeProduct && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />
                  {activeProduct.shortName}
                </span>
              )}
              <div className="hidden md:block">
                <AccountMenu />
              </div>
            </>
          ) : (
            <>
              <Link
                to="/tutorial"
                className="hidden md:inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors duration-150"
              >
                {t('nav.tutorial_short')}
              </Link>
              <Link
                to="/create-account"
                className="inline-flex items-center px-4 py-1.5 rounded-lg bg-cyan-primary text-sm font-semibold text-white hover:bg-cyan-hover transition-colors duration-150 shadow-sm"
              >
                {t('nav.sign_in')}
              </Link>
            </>
          )}
          <LanguageSwitcher className="hidden md:block" />

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={t('nav.toggle_menu')}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {PUBLIC_NAV_LINKS.map(({ key, to }) => (
            <Link
              key={key}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isCurrentPath(to)
                  ? 'text-cyan-primary bg-cyan-primary/10'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t(key)}
            </Link>
          ))}
          <Link
            to="/tutorial"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t('nav.tutorial_short')}
          </Link>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <AccountMenu />
            ) : (
              <Link
                to="/create-account"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-cyan-primary text-sm font-semibold text-white hover:bg-cyan-hover transition-colors"
              >
                {t('nav.sign_in')}
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
