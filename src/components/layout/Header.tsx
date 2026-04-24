// src/components/layout/Header.tsx
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useUserPlan, hasActivePlan } from "../../hooks/useUserPlan";
import { useActiveTeam } from "../../context/ActiveTeam";
import AccountMenu from "../caregiver/AccountMenu";
import { Menu, X, BookOpen, ClipboardList, Activity, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useLocale } from "../../i18n/LocaleContext";

const FALLBACK_LOGO = "/CareView_logo_icon_only.png";

const CARE_HUB_ITEMS = [
  {
    to: "/caregiver/memory-schedule",
    icon: BookOpen,
    label: "Memory Book",
    sub: "Know the person",
    color: "text-teal-600",
    bg: "hover:bg-teal-50",
  },
  {
    to: "/care-hub/care-plan",
    icon: ClipboardList,
    label: "Care Plan",
    sub: "Coordinate the team",
    color: "text-blue-600",
    bg: "hover:bg-blue-50",
  },
  {
    to: "/caregiver/observations/new",
    icon: Activity,
    label: "Observations",
    sub: "Track change",
    color: "text-amber-600",
    bg: "hover:bg-amber-50",
  },
] as const;

function CareHubDropdown({ isActive }: { isActive: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border min-h-[44px] transition-colors ${
          isActive || open
            ? "text-slate-900 bg-slate-50 border-slate-400"
            : "text-slate-700 bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Care Hub
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          <div className="px-4 pt-3 pb-2">
            <Link
              to="/care-hub"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Care Hub overview →
            </Link>
          </div>
          <div className="pb-2">
            {CARE_HUB_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 ${item.bg} transition-colors group`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.sub}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function useBrandingLogo() {
  return useQuery({
    queryKey: ["branding", "logo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("app")
        .from("site_settings")
        .select("logo_url, updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return FALLBACK_LOGO;

      const raw = data?.logo_url ?? "";
      if (!raw) return FALLBACK_LOGO;
      if (!/^https?:\/\//i.test(raw)) {
        const base = import.meta.env.BASE_URL ?? "/";
        return `${base}${raw.replace(/^\/+/, "")}`;
      }
      return raw;
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });
}

export default function Header() {
  const { data: logoSrc, isLoading: logoLoading } = useBrandingLogo();
  const { user, profile, loading: authLoading } = useAuth();
  const { data: plan } = useUserPlan();
  const { teamId } = useActiveTeam();
  const { t } = useLocale();
  const location = useLocation();
  const canUseTeam = plan?.plan_id === "family_qtr";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [careHubMobileOpen, setCareHubMobileOpen] = useState(false);

  const isAuthed = !!user && !profile?.disabled;
  const dashPath = profile?.role === "admin" ? "/admin" : "/caregiver";
  const isPaidCarer =
    profile?.role === "caregiver" &&
    plan?.plan_id !== "free" &&
    hasActivePlan(plan);

  const isCareHubActive = location.pathname.startsWith("/care-hub") ||
    location.pathname.startsWith("/caregiver/memory-schedule") ||
    location.pathname.startsWith("/caregiver/observations");

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setCareHubMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Brand */}
          <div className="flex items-center">
            <Link to="/" aria-label={t('nav.home_aria')} className="flex items-center hover:opacity-80 transition-opacity">
              {logoLoading ? (
                <div className="w-10 h-10 md:w-12 md:h-12 mr-3 rounded-md bg-slate-200 animate-pulse" />
              ) : (
                <img
                  src={logoSrc || FALLBACK_LOGO}
                  alt={t('nav.logo_aria')}
                  className="w-10 h-10 md:w-12 md:h-12 object-contain mr-3 rounded-md"
                  loading="eager"
                  decoding="async"
                />
              )}
              <div className="flex items-center">
                <span className="text-xl font-bold text-slate-800 mr-3">{t('common.app_name')}</span>
                {isAuthed && profile?.role === "caregiver" && (
                  <span className="text-sm text-slate-600 font-medium">
                    {t('nav.welcome')} {profile?.display_name || profile?.email || user?.email || 'Caregiver'}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Right: Nav */}
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="w-[108px] h-9 rounded-lg bg-slate-200 animate-pulse" aria-hidden />
            ) : isAuthed ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to={dashPath}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border min-h-[44px] transition-colors ${
                      location.pathname === "/caregiver" || location.pathname === "/admin"
                        ? "text-slate-900 bg-slate-50 border-slate-400"
                        : "text-slate-700 bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                    }`}
                  >
                    {t('nav.dashboard')}
                  </Link>

                  {isPaidCarer && (
                    <CareHubDropdown isActive={isCareHubActive} />
                  )}

                  {isPaidCarer && (
                    <Link
                      to="/new-carer"
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border min-h-[44px] transition-colors ${
                        location.pathname.startsWith("/new-carer")
                          ? "text-slate-900 bg-slate-50 border-slate-400"
                          : "text-slate-700 bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                      }`}
                    >
                      {t('nav.new_carer')}
                    </Link>
                  )}

                  {canUseTeam && (
                    <Link
                      to="/team"
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border min-h-[44px] transition-colors ${
                        location.pathname === "/team"
                          ? "text-slate-900 bg-slate-50 border-slate-400"
                          : "text-slate-700 bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                      }`}
                    >
                      {t('nav.family_circle')}
                    </Link>
                  )}

                  <LanguageSwitcher />
                  <AccountMenu />
                </div>

                <div className="md:hidden flex items-center gap-2">
                  <LanguageSwitcher />
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 min-h-[44px] min-w-[44px]"
                    aria-expanded={mobileMenuOpen}
                    aria-label={t('nav.toggle_menu')}
                  >
                    {mobileMenuOpen ? (
                      <X className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="h-6 w-6" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Desktop Navigation - hidden on mobile */}
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/why"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t('nav.why_carerview')}
                  </Link>
                  <Link
                    to="/memory-book"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t('nav.memory_book')}
                  </Link>
                  <Link
                    to="/new-carer"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t('nav.new_carer')}
                  </Link>
                  <Link
                    to="/caregiver-resources"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t('nav.caregiver_resources')}
                  </Link>
                  <Link
                    to="/caregiver-forum"
                    className="inline-flex items-center px-4 py-2 text-sm font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 hover:text-cyan-800 hover:border-cyan-300 transition-colors"
                  >
                    {t('nav.caregiver_forum')}
                  </Link>
                  <LanguageSwitcher />
                  <Link
                    to={{ pathname: "/", hash: "#get-started" }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-lg hover:bg-cyan-700"
                  >
                    {t('nav.sign_in')}
                  </Link>
                </div>

                {/* Mobile: language switcher + hamburger always visible */}
                <div className="md:hidden flex items-center gap-2">
                  <LanguageSwitcher />
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                    aria-expanded={mobileMenuOpen}
                    aria-label={t('nav.toggle_menu')}
                  >
                    {mobileMenuOpen ? (
                      <X className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="h-6 w-6" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          <div className="fixed top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50 md:hidden">
            <nav className="px-4 py-3 space-y-1">
              {isAuthed ? (
                <>
                  <Link
                    to={dashPath}
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    {t('nav.dashboard')}
                  </Link>

                  {isPaidCarer && (
                    <div>
                      {/* Care Hub parent row */}
                      <button
                        onClick={() => setCareHubMobileOpen((v) => !v)}
                        className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                        aria-expanded={careHubMobileOpen}
                      >
                        Care Hub
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${careHubMobileOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Sub-items */}
                      {careHubMobileOpen && (
                        <div className="ml-4 border-l-2 border-slate-100 pl-3 space-y-0.5 mb-1">
                          <Link
                            to="/care-hub"
                            onClick={closeMobileMenu}
                            className="block px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            Overview
                          </Link>
                          {CARE_HUB_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.to}
                                to={item.to}
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                                  <p className="text-xs text-slate-400">{item.sub}</p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {isPaidCarer && (
                    <Link
                      to="/new-carer"
                      onClick={closeMobileMenu}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                    >
                      {t('nav.new_carer')}
                    </Link>
                  )}
                  {canUseTeam && (
                    <Link
                      to="/team"
                      onClick={closeMobileMenu}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                    >
                      {t('nav.family_circle')}
                    </Link>
                  )}
                  <Link
                    to="/choose-plan?manage=true"
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    {t('nav.manage_billing')}
                  </Link>
                  <button
                    onClick={async () => {
                      closeMobileMenu();
                      await supabase.auth.signOut();
                      window.location.assign("/");
                    }}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    {t('nav.sign_out')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/why"
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    {t('nav.why_carerview')}
                  </Link>
                  <Link
                    to="/memory-book"
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    {t('nav.memory_book')}
                  </Link>
                  <Link
                    to="/new-carer"
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    {t('nav.new_carer')}
                  </Link>
                  <Link
                    to="/caregiver-resources"
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    {t('nav.caregiver_resources')}
                  </Link>
                  <Link
                    to="/caregiver-forum"
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg transition-colors min-h-[44px] hover:bg-cyan-100 hover:text-cyan-800 hover:border-cyan-300"
                  >
                    {t('nav.caregiver_forum')}
                  </Link>
                  <Link
                    to={{ pathname: "/", hash: "#get-started" }}
                    onClick={closeMobileMenu}
                    className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors mt-2 min-h-[44px]"
                  >
                    {t('nav.sign_in')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
