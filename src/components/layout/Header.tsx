import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUserPlan, hasActivePlan } from '../../hooks/useUserPlan'
import { getProductByPriceId } from '../../stripe-config'
import { useLocale } from '../../i18n/LocaleContext'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import LanguageSwitcher from '../common/LanguageSwitcher'
import AccountMenu from '../caregiver/AccountMenu'
import { supabase } from '../../lib/supabaseClient'
import { PRIMARY_NAV, filterNav, isPathActive } from '../../lib/navigation'

export function Header() {
  const location = useLocation()
  const { user } = useAuth()
  const { data: userPlan } = useUserPlan()
  const { t } = useLocale()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>('/CareView_logo_icon_only.png')
  const drawerRef = useRef<HTMLDivElement>(null)

  useFocusTrap(drawerRef, mobileOpen)

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('logo_url')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (!mounted) return
        if (data?.logo_url) setLogoUrl(data.logo_url)
      } catch {
        // keep fallback
      }
    })()
    return () => { mounted = false }
  }, [])

  const activeProduct = userPlan?.price_id ? getProductByPriceId(userPlan.price_id) : null
  const isActivePlan = hasActivePlan(userPlan)
  const isPaidAuthed = !!user && isActivePlan

  const navLinks = filterNav(PRIMARY_NAV, { authed: !!user, paid: isActivePlan })

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          aria-label={t('nav.home_aria')}
          className="flex items-center gap-2 shrink-0 group"
        >
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            className="h-8 w-8 object-contain"
          />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900 group-hover:text-cyan-primary transition-colors">
            {t('common.app_name')}
          </span>
        </Link>

        {/* Desktop nav — hidden for paid authenticated users */}
        {!isPaidAuthed && (
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ key, to, matchPrefix }) => {
              const active = isPathActive(location.pathname, to, matchPrefix)
              return (
                <Link
                  key={key}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'text-cyan-primary bg-cyan-primary/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t(key)}
                </Link>
              )
            })}
          </nav>
        )}

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
                to="/sign-in"
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
            aria-controls="mobile-nav-drawer"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          ref={drawerRef}
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.toggle_menu')}
          className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {user && (
            <Link
              to="/caregiver"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-cyan-primary bg-cyan-primary/10"
            >
              {t('nav.dashboard')}
            </Link>
          )}
          {!isPaidAuthed && (
            <>
              {navLinks.map(({ key, to, matchPrefix }) => {
                const active = isPathActive(location.pathname, to, matchPrefix)
                return (
                  <Link
                    key={key}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'text-cyan-primary bg-cyan-primary/10'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {t(key)}
                  </Link>
                )
              })}
              <Link
                to="/tutorial"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {t('nav.tutorial_short')}
              </Link>
            </>
          )}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <AccountMenu />
            ) : (
              <Link
                to="/sign-in"
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
