import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { ChevronDown, LogOut, CreditCard } from "lucide-react";

export default function AccountMenu() {
  const [open, setOpen] = React.useState(false);
  const nav = useNavigate();
  const close = () => setOpen(false);

  const goManageBilling = () => {
    // Re-use your ChoosePlan screen as the entry point to billing management.
    nav("/choose-plan?manage=true");
    close();
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Redirect to landing page
      window.location.assign("/");
    } catch (error) {
      console.error("Sign out error:", error);
      // Still redirect even if there's an error
      window.location.assign("/");
    }
  };

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest?.("[data-account-menu]")) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" data-account-menu>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Manage Account 
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1"
        >
          <button
            onClick={goManageBilling}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            role="menuitem"
          >
            <CreditCard className="w-4 h-4 text-slate-500" />
            Manage Billing
          </button>
          
          <div className="my-1 h-px bg-slate-200" />
          
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            role="menuitem"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}