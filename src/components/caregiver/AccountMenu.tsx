import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { ChevronDown } from "lucide-react";

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
    await supabase.auth.signOut();
    window.location.assign("/");
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
        className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Manage Account <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-gray/20 bg-white shadow-lg z-50"
        >
          <button
            onClick={goManageBilling}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-gray hover:bg-peach-blush/20"
            role="menuitem"
          >
            Manage Billing
          </button>
          <div className="my-1 h-px bg-slate-gray/10" />
          <button
            onClick={signOut}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-gray hover:bg-peach-blush/20"
            role="menuitem"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
