// src/components/caregiver/AccountMenu.tsx
import React from "react";
import { supabase } from "../../lib/supabaseClient";
import { ChevronDown, LogOut, CreditCard, GraduationCap } from "lucide-react";
import { useOnboarding } from "../../hooks/useOnboarding";

export default function AccountMenu() {
  const { restartTutorial } = useOnboarding();
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const menuId = "account-menu-popover";

  const close = () => setOpen(false);

  const goManageBilling = () => {
    // Force a full document navigation to avoid stale SPA chunk errors
    // after deployments (dynamic import chunk name changes).
    window.location.assign("/choose-plan?manage=true");
    close();
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      window.location.assign("/");
    }
  };

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (
        !btnRef.current?.contains(t) &&
        !menuRef.current?.contains(t)
      ) {
        close();
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        // Return focus to the trigger for keyboard users
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
        Manage Account
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
          className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1"
        >
          <button
            type="button"
            onClick={goManageBilling}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            role="menuitem"
          >
            <CreditCard className="w-4 h-4 text-slate-500" aria-hidden="true" />
            Manage Billing
          </button>

          <button
            type="button"
            onClick={() => { restartTutorial(); close(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            role="menuitem"
          >
            <GraduationCap className="w-4 h-4 text-slate-500" aria-hidden="true" />
            Restart Tutorial
          </button>

          <div className="my-1 h-px bg-slate-200" />

          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            role="menuitem"
          >
            <LogOut className="w-4 h-4 text-slate-500" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
