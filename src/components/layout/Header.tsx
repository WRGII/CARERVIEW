import { Link, useNavigate } from "react-router-dom";
import { useBrandingLogo } from "../../hooks/useBrandingLogo";

export default function Header() {
  const { data: logoUrl } = useBrandingLogo();
  const navigate = useNavigate();

  return (
    <header
      role="navigation"
      aria-label="Global"
      className="w-full border-b border-slate-gray/20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Go to Landing Page"
            className="group inline-flex items-center"
          >
            <img
              src={logoUrl ?? "/CareView_logo_1_colored_highres.png"}
              alt="CarerView logo"
              className="h-9 w-9 rounded-xl border border-slate-gray/20 object-contain transition-transform group-hover:scale-95"
              loading="eager"
              fetchPriority="high"
            />
          </button>

          <Link
            to="/"
            className="text-xl font-semibold tracking-tight text-slate-gray hover:opacity-80"
            aria-label="CarerView Home"
          >
            CarerView
          </Link>
        </div>

        {/* Right: Log In */}
        <div className="flex items-center">
          <Link
            to="/#get-started"
            aria-label="Log In"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}