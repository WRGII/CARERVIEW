import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { ChevronDown, LogOut, CreditCard, GraduationCap, Users, TrendingUp } from "lucide-react";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useLocale } from '../../i18n/LocaleContext';
import { useUserPlan } from "../../hooks/useUserPlan";

export default function AccountMenu() {
  const { restartTutorial } = useOnboarding();
  const { t } = useLocale();
  const { data: plan } = useUserPlan();
  const canUseTeam = plan?.plan_id === "family_qtr";
  const isFreePlan = plan?.plan_id === 'free';
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const menuId = "account-menu-popover";

  const close = () => setOpen(false);

  const goManageBilling = () => {
    window.location.assign("/choose-plan?manage=true");
    close();
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // sign-out failure is non-fatal; redirect regardless
    } finally {
      window.location.assign("/");
    }
  };

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!btnRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        close();
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        {t('account_menu.manage_account')}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5"
        >
          {canUseTeam && (
            <Link
              to="/caregiver/team-settings"
              onClick={close}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              role="menuitem"
            >
              <Users className="w-4 h-4 text-slate-500" aria-hidden="true" />
              {t('nav.family_circle')}
            </Link>
          )}

          {isFreePlan && (
            <Link
              to="/choose-plan"
              onClick={close}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors duration-150"
              role="menuitem"
            >
              <TrendingUp className="w-4 h-4 text-amber-500" aria-hidden="true" />
              {t('upgrade.menu_item')}
            </Link>
          )}

          <button
            type="button"
            onClick={goManageBilling}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            role="menuitem"
          >
            <CreditCard className="w-4 h-4 text-slate-500" aria-hidden="true" />
            {t('billing.manage_btn')}
          </button>

          <button
            type="button"
            onClick={() => { restartTutorial(); close(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            role="menuitem"
          >
            <GraduationCap className="w-4 h-4 text-slate-500" aria-hidden="true" />
            {t('account_menu.restart_tutorial')}
          </button>

          <div className="my-1.5 h-px bg-slate-100" />

          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            role="menuitem"
          >
            <LogOut className="w-4 h-4 text-slate-500" aria-hidden="true" />
            {t('nav.sign_out')}
          </button>
        </div>
      )}
    </div>
  );
}
