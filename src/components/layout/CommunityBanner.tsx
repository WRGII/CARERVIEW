import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useLocale } from "../../i18n/LocaleContext";

const COMMUNITY_PATHS = ["/community", "/caregiver-forum"];

function isCommunityPath(pathname: string): boolean {
  return COMMUNITY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export default function CommunityBanner() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { t } = useLocale();

  if (isCommunityPath(location.pathname)) return null;

  const isAuthed = !!user && !profile?.disabled;
  const ctaHref = isAuthed ? "/community" : "/caregiver-forum";

  return (
    <div
      role="region"
      aria-label={t("community_banner.aria_label")}
      className="bg-cyan-700 border-b border-cyan-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between gap-4">
        <p className="hidden sm:block text-xs text-cyan-100 truncate">
          Share experiences, ask questions, and find practical wisdom
        </p>
        <Link
          to={ctaHref}
          className="flex items-center gap-1.5 shrink-0 px-3 py-1 text-xs font-semibold text-cyan-700 bg-white rounded-full hover:bg-cyan-50 transition-colors leading-none"
        >
          <MessageCircle className="w-3 h-3" aria-hidden="true" />
          {t("community_banner.cta")}
        </Link>
      </div>
    </div>
  );
}
