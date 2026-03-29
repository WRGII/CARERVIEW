import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserPlan, hasActivePlan } from "../../hooks/useUserPlan";
import { useLocale } from "../../i18n/LocaleContext";

type Props = { children: React.ReactNode };

export default function CaregiverGuard({ children }: Props) {
  const { user, profile, loading } = useAuth();
  const { data: userPlan, isLoading: planLoading } = useUserPlan();
  const { t } = useLocale();
  const location = useLocation();
  const [expired, setExpired] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setExpired(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (profile?.disabled) {
    return <Navigate to={{ pathname: "/", hash: "#get-started" }} replace />;
  }

  if ((loading || planLoading) && !expired) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-slate-gray mb-2">{t('guard.preparing_workspace')}</p>
        <p className="text-slate-gray/70 text-sm">
          {t('guard.loading_slow')}{" "}
          <a href="/#get-started" className="text-cyan-primary underline">
            {t('guard.sign_in_again')}
          </a>.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={{ pathname: "/", hash: "#get-started" }}
        replace
        state={{ from: location }}
      />
    );
  }

  if (!loading && !planLoading && user && !hasActivePlan(userPlan)) {
    return <Navigate to="/create-account?incomplete=1" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
