import React from "react";
import { supabase } from "../../lib/supabaseClient";
import { CreditCard, LogOut, ChevronDown, UserCog } from "lucide-react";

export default function AccountMenu() {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<"billing" | "signout" | null>(null);
  const ref = React.useRef<HTMLDivElement | null>(null);

  // Close on outside click / escape
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  async function goToBillingPortal() {
    try {
      setBusy("billing");
      const { data, error } = await supabase.functions.invoke("stripe-portal", {
        body: { return_to: "/caregiver" },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } catch (e: any) {
      alert(e?.message || "Failed to open billing portal.");
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  async function signOut() {
    try {
      setBusy("signout");
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (e: any) {
      alert(e?.message || "Sign out failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Manage Account
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-gray/20 bg-warm-white shadow-xl z-50 p-1"
        >
          <button
            onClick={goToBillingPortal}
            disabled={busy === "billing"}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-gray hover:bg-peach-blush/20 transition"
            role="menuitem"
          >
            <CreditCard className="w-4 h-4" />
            {busy === "billing" ? "Opening billing…" : "Manage billing"}
          </button>

          {/* Optional future item: profile/preferences */}
          <button
            disabled
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-gray/50 cursor-not-allowed"
            role="menuitem"
            title="Coming soon"
          >
            <UserCog className="w-4 h-4" />
            Profile & preferences
          </button>

          <div className="my-1 h-px bg-slate-gray/10" />

          <button
            onClick={signOut}
            disabled={busy === "signout"}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-gray hover:bg-peach-blush/20 transition"
            role="menuitem"
          >
            <LogOut className="w-4 h-4" />
            {busy === "signout" ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
