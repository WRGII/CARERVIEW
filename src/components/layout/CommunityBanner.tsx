import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useLocale } from "../../i18n/LocaleContext";

export default function CommunityBanner() {
  const { user, profile } = useAuth();
  const { t } = useLocale();

  const isAuthed = !!user && !profile?.disabled;
  const ctaHref = isAuthed ? "/community" : "/caregiver-forum";

  return (
    <div
      role="region"
      aria-label={t("community_banner.aria_label")}
      className="sticky top-0 z-50 bg-cyan-700 border-b border-cyan-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-0 sm:h-8 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
        <p className="hidden sm:block text-xs text-cyan-100 whitespace-nowrap">
          {t("community_banner.tagline_before")}
        </p>
        <Link
          to={ctaHref}
          className="flex items-center gap-1.5 shrink-0 px-3 py-1 text-xs font-semibold text-cyan-700 bg-white rounded-full hover:bg-cyan-50 transition-colors leading-none"
        >
          <MessageCircle className="w-3 h-3" aria-hidden="true" />
          {t("community_banner.cta")}
        </Link>
        <p className="text-xs text-cyan-100 text-center sm:whitespace-nowrap">
          <span className="sm:hidden">{t("community_banner.tagline")}</span>
          <span className="hidden sm:inline">{t("community_banner.tagline_after")}</span>
        </p>
      </div>
    </div>
  );
}
